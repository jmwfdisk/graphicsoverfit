// api/src/notify.js — 이메일(Resend) + 카카오 알림톡(솔라피) 발송.
// 키가 없으면 발송하지 않고 console.log 만 남긴다 (로컬·초기 테스트 대비).

const won = (n) => "₩" + new Intl.NumberFormat("ko-KR").format(n);

function itemLines(items) {
  return items.map((it) => `- ${it.name} / ${it.color} / ${it.size} × ${it.qty}`).join("\n");
}

async function sendEmail(env, { to, subject, text, replyTo }) {
  if (!env.RESEND_API_KEY) {
    console.log("[notify] RESEND_API_KEY 없음 → 이메일 생략:", subject, "→", to);
    return { skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, to: Array.isArray(to) ? to : [to], subject, text, reply_to: replyTo || env.REPLY_TO }),
  });
  if (!res.ok) console.log("[notify] Resend 실패", res.status, await res.text());
  return { ok: res.ok };
}

// 솔라피 알림톡 — 서명 방식(HMAC-SHA256) 인증
async function sendKakao(env, { templateId, to, variables }) {
  if (!env.SOLAPI_API_KEY || !env.SOLAPI_API_SECRET || !env.KAKAO_PF_ID || !templateId || !to) {
    console.log("[notify] 솔라피 설정 없음 → 알림톡 생략:", templateId, "→", to);
    return { skipped: true };
  }
  const date = new Date().toISOString();
  const salt = crypto.randomUUID().replace(/-/g, "");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.SOLAPI_API_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(date + salt));
  const signature = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const res = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: {
      Authorization: `HMAC-SHA256 apiKey=${env.SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        to: to.replace(/-/g, ""),
        from: env.SOLAPI_SENDER,
        kakaoOptions: { pfId: env.KAKAO_PF_ID, templateId, variables },
      },
    }),
  });
  if (!res.ok) console.log("[notify] 솔라피 실패", res.status, await res.text());
  return { ok: res.ok };
}

export async function notifyOrderPaid(env, order, items, buyer, shipping) {
  const subject = `[GOF 주문] ${order.order_id} ${won(order.amount)} ${order.method || ""}`;
  const text = `새 주문이 결제되었습니다.

주문번호 : ${order.order_id}
결제금액 : ${won(order.amount)} (${order.method || "-"})
승인시각 : ${order.approved_at || "-"}

[품목] ※ 무신사 파트너센터에서 같은 수량 재고 차감
${itemLines(items)}

[주문자]
${buyer.name} / ${buyer.phone} / ${buyer.email}

[배송지]
(${shipping.zip}) ${shipping.addr1} ${shipping.addr2}
메모 : ${shipping.memo || "-"}
`;
  const results = await Promise.allSettled([
    sendEmail(env, { to: env.ADMIN_EMAIL, subject, text }),
    sendEmail(env, {
      to: buyer.email,
      subject: `[그래픽스오버핏] 주문이 완료되었습니다 (${order.order_id})`,
      text: `${buyer.name}님, 주문해 주셔서 감사합니다.

주문번호 : ${order.order_id}
결제금액 : ${won(order.amount)}
${itemLines(items)}

배송지 : (${shipping.zip}) ${shipping.addr1} ${shipping.addr2}
결제 완료 후 2~3영업일 내 발송되며, 배송비는 무료입니다.

교환·반품 : ${env.SITE_URL}/Shop/return.html (수령 후 7일 이내, 단순 변심 시 왕복 배송비 6,000원 고객 부담)
문의 : ${env.REPLY_TO}
`,
    }),
    sendKakao(env, {
      templateId: env.KAKAO_TEMPLATE_ORDER,
      to: env.ADMIN_PHONE,
      variables: { "#{주문번호}": order.order_id, "#{금액}": won(order.amount), "#{품목}": itemLines(items) },
    }),
  ]);
  results.forEach((r) => { if (r.status === "rejected") console.log("[notify] 오류", r.reason); });
}

export async function notifyReturnReceived(env, ret, order, buyer) {
  const items = JSON.parse(ret.items_json);
  const subject = `[GOF 반품접수] ${ret.return_id} (${ret.type}/${ret.reason}) 주문 ${order.order_id}`;
  const text = `교환·반품 접수가 들어왔습니다.

접수번호 : ${ret.return_id}
주문번호 : ${order.order_id} (${order.method || "-"}, ${won(order.amount)})
유형/사유 : ${ret.type} / ${ret.reason}
품목:
${items.map((it) => `- ${it.name} / ${it.color} / ${it.size} × ${it.qty}${it.exchangeSize ? " → 교환 " + it.exchangeSize : ""}`).join("\n")}
상세 : ${ret.detail || "-"}
환불계좌 : ${ret.refund_account_json || "-"}

주문자 : ${buyer.name} / ${buyer.phone} / ${buyer.email}
`;
  const results = await Promise.allSettled([
    sendEmail(env, { to: env.ADMIN_EMAIL, subject, text }),
    sendEmail(env, {
      to: buyer.email,
      subject: `[그래픽스오버핏] 교환·반품 접수 확인 (${ret.return_id})`,
      text: `${buyer.name}님, 접수가 완료되었습니다.

접수번호 : ${ret.return_id}
확인 후 1영업일 내 이메일로 안내드립니다.

반품 주소 : 대전광역시 대덕구 오정로41번길 12, 2층 (그래픽스오버핏)
단순 변심 : 왕복 배송비 6,000원 차감 / 불량·오배송 : 판매자 부담
불량·오배송은 사진을 ${env.REPLY_TO} 로 접수번호와 함께 보내주세요.
`,
    }),
    sendKakao(env, {
      templateId: env.KAKAO_TEMPLATE_RETURN,
      to: env.ADMIN_PHONE,
      variables: { "#{접수번호}": ret.return_id, "#{주문번호}": order.order_id, "#{유형}": `${ret.type}/${ret.reason}` },
    }),
  ]);
  results.forEach((r) => { if (r.status === "rejected") console.log("[notify] 오류", r.reason); });
}
