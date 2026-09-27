// api/src/index.js — Graphics Overfit Shop API (Cloudflare Worker + D1)
// 라우트:
//   POST /orders               장바구니 → 서버 가격으로 주문 생성 (READY)
//   POST /payments/confirm     토스 승인 (금액 대조, 멱등)
//   POST /webhooks/toss        PAYMENT_STATUS_CHANGED (가상계좌 입금·취소)
//   GET  /orders/lookup        주문번호+연락처 본인 확인 (반품용)
//   POST /returns              교환·반품 접수
//   POST /admin/cancel         관리자 취소 (전액/부분)  — Authorization: Bearer ADMIN_TOKEN
//   GET  /health

import { priceItems, RETURN_SHIPPING_FEE } from "./catalog.js";
import { notifyOrderPaid, notifyReturnReceived } from "./notify.js";

const TOSS_API = "https://api.tosspayments.com/v1";
const RETURN_WINDOW_DAYS = 14; // 폼 허용 기간 (승인일 기준). 실제 7일 규정은 관리자가 수령일로 판단
const LOOKUP_MAX_FAILS = 5;
const LOOKUP_BLOCK_MIN = 10;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(env, origin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    try {
      const route = `${request.method} ${url.pathname}`;
      let res;
      switch (route) {
        case "GET /health":               res = json({ ok: true, time: new Date().toISOString() }); break;
        case "POST /orders":              res = await createOrder(request, env); break;
        case "POST /payments/confirm":    res = await confirmPayment(request, env, ctx); break;
        case "POST /webhooks/toss":       res = await tossWebhook(request, env); break;
        case "GET /orders/lookup":        res = await lookupOrder(request, env, url); break;
        case "POST /returns":             res = await createReturn(request, env, ctx); break;
        case "POST /admin/cancel":        res = await adminCancel(request, env); break;
        default:                          res = json({ error: "NOT_FOUND" }, 404);
      }
      for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
      return res;
    } catch (e) {
      console.log("[api] unhandled", e && e.stack || e);
      const res = json({ error: "INTERNAL", message: String(e && e.message || e) }, 500);
      for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
      return res;
    }
  },
};

// ---------- helpers ----------

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });
}

function corsHeaders(env, origin) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const h = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
  // 로컬 개발 주소는 포트와 무관하게 허용 (python http.server 8080, Live Server 5501 등)
  const isLocalDev = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
  if (allowed.includes(origin) || isLocalDev) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

async function readJson(request) {
  try { return await request.json(); } catch (e) { return null; }
}

function nowIso() { return new Date().toISOString(); }

function randomCode(len) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => chars[b % chars.length]).join("");
}

function yymmdd() {
  const d = new Date(Date.now() + 9 * 3600 * 1000); // KST
  return d.toISOString().slice(2, 10).replace(/-/g, "");
}

function digits(s) { return String(s || "").replace(/\D/g, ""); }

function validBuyer(b) {
  return b && typeof b.name === "string" && b.name.trim().length >= 1 && b.name.length <= 40
    && /^\d{9,11}$/.test(digits(b.phone))
    && typeof b.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) && b.email.length <= 120;
}

function validShipping(s) {
  return s && /^\d{5}$/.test(String(s.zip || "")) && typeof s.addr1 === "string" && s.addr1.trim().length >= 3 && s.addr1.length <= 200
    && typeof s.addr2 === "string" && s.addr2.length <= 200 && (s.memo == null || (typeof s.memo === "string" && s.memo.length <= 200));
}

function tossAuth(env) {
  return "Basic " + btoa(env.TOSS_SECRET_KEY + ":");
}

async function tossFetch(env, path, body) {
  const headers = { Authorization: tossAuth(env), "Content-Type": "application/json" };
  // 테스트 환경 에러 재현: .dev.vars 에 TOSS_TEST_CODE=REJECT_CARD_PAYMENT 등 (테스트 키에서만 동작, 라이브 키는 무시됨)
  if (env.TOSS_TEST_CODE && String(env.TOSS_SECRET_KEY || "").startsWith("test_")) headers["TossPayments-Test-Code"] = env.TOSS_TEST_CODE;
  const res = await fetch(TOSS_API + path, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function statusFromToss(p) {
  if (p.status === "DONE") return "PAID";
  if (p.status === "WAITING_FOR_DEPOSIT") return "WAITING_DEPOSIT";
  if (p.status === "CANCELED" || p.status === "PARTIAL_CANCELED") return "CANCELED";
  if (p.status === "ABORTED" || p.status === "EXPIRED") return "FAILED";
  return "READY";
}

// ---------- POST /orders ----------

async function createOrder(request, env) {
  const body = await readJson(request);
  if (!body) return json({ error: "BAD_JSON" }, 400);
  if (!validBuyer(body.buyer)) return json({ error: "BAD_BUYER" }, 400);
  if (!validShipping(body.shipping)) return json({ error: "BAD_SHIPPING" }, 400);

  const priced = priceItems(body.items);
  if (!priced.ok) return json({ error: priced.error }, 400);

  const buyer = { name: body.buyer.name.trim(), phone: digits(body.buyer.phone), email: body.buyer.email.trim() };
  const shipping = { zip: String(body.shipping.zip), addr1: body.shipping.addr1.trim(), addr2: body.shipping.addr2.trim(), memo: (body.shipping.memo || "").trim() };

  let orderId;
  for (let i = 0; i < 5; i++) {
    orderId = `GOF-${yymmdd()}-${randomCode(6)}`;
    try {
      await env.DB.prepare(
        `INSERT INTO orders (order_id, status, amount, order_name, items_json, buyer_json, shipping_json) VALUES (?, 'READY', ?, ?, ?, ?, ?)`
      ).bind(orderId, priced.amount, priced.orderName, JSON.stringify(priced.items), JSON.stringify(buyer), JSON.stringify(shipping)).run();
      break;
    } catch (e) {
      if (i === 4) throw e; // 충돌 5회면 포기
    }
  }
  return json({ orderId, amount: priced.amount, orderName: priced.orderName });
}

// ---------- POST /payments/confirm ----------

async function confirmPayment(request, env, ctx) {
  const body = await readJson(request);
  if (!body || typeof body.paymentKey !== "string" || typeof body.orderId !== "string") return json({ error: "BAD_REQUEST" }, 400);
  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount <= 0) return json({ error: "BAD_AMOUNT" }, 400);

  const order = await env.DB.prepare(`SELECT * FROM orders WHERE order_id = ?`).bind(body.orderId).first();
  if (!order) return json({ error: "ORDER_NOT_FOUND" }, 404);

  // 멱등: 이미 승인된 주문은 저장값 반환
  if (order.status === "PAID" || order.status === "WAITING_DEPOSIT") {
    return json(orderSummary(order));
  }
  if (order.status !== "READY") return json({ error: "ORDER_NOT_PAYABLE", status: order.status }, 409);

  // 금액 위변조 방지: 서버 금액과 완전히 같을 때만
  if (order.amount !== amount) {
    console.log("[confirm] amount mismatch", order.order_id, order.amount, amount);
    return json({ error: "AMOUNT_MISMATCH" }, 400);
  }

  const t = await tossFetch(env, "/payments/confirm", { paymentKey: body.paymentKey, orderId: body.orderId, amount });
  if (!t.ok) {
    await env.DB.prepare(`UPDATE orders SET status = 'FAILED', payment_json = ?, updated_at = ? WHERE order_id = ? AND status = 'READY'`)
      .bind(JSON.stringify(t.data), nowIso(), order.order_id).run();
    return json({ error: t.data.code || "TOSS_CONFIRM_FAILED", message: t.data.message || "" }, 402);
  }

  const p = t.data;
  const status = statusFromToss(p);
  await env.DB.prepare(
    `UPDATE orders SET status = ?, payment_key = ?, method = ?, approved_at = ?, payment_json = ?, updated_at = ? WHERE order_id = ?`
  ).bind(status, p.paymentKey, p.method || null, p.approvedAt || null, JSON.stringify(p), nowIso(), order.order_id).run();

  const updated = { ...order, status, payment_key: p.paymentKey, method: p.method, approved_at: p.approvedAt, payment_json: JSON.stringify(p) };
  if (status === "PAID") {
    ctx.waitUntil(notifyOrderPaid(env, updated, JSON.parse(order.items_json), JSON.parse(order.buyer_json), JSON.parse(order.shipping_json)));
  }
  return json(orderSummary(updated));
}

function orderSummary(order) {
  const p = order.payment_json ? JSON.parse(order.payment_json) : {};
  const out = {
    ok: true,
    orderId: order.order_id,
    status: order.status,
    amount: order.amount,
    orderName: order.order_name,
    method: order.method,
    approvedAt: order.approved_at,
    items: JSON.parse(order.items_json),
  };
  if (p.virtualAccount) {
    out.virtualAccount = {
      bank: p.virtualAccount.bankCode, accountNumber: p.virtualAccount.accountNumber,
      customerName: p.virtualAccount.customerName, dueDate: p.virtualAccount.dueDate,
    };
  }
  return out;
}

// ---------- POST /webhooks/toss ----------

async function tossWebhook(request, env) {
  const body = await readJson(request);
  if (!body) return json({ error: "BAD_JSON" }, 400);
  // v2 웹훅: { eventType: "PAYMENT_STATUS_CHANGED", data: { paymentKey, orderId, status, ... } }
  const data = body.data || body;
  const paymentKey = data.paymentKey;
  if (!paymentKey) return json({ ok: true, ignored: true });

  // 웹훅 본문을 믿지 않고 토스에 재조회
  const t = await tossFetch(env, `/payments/${encodeURIComponent(paymentKey)}`);
  if (!t.ok) return json({ ok: false }, 502);
  const p = t.data;
  const status = statusFromToss(p);

  const order = await env.DB.prepare(`SELECT * FROM orders WHERE order_id = ?`).bind(p.orderId).first();
  if (!order) return json({ ok: true, ignored: true });

  const wasPaid = order.status === "PAID";
  await env.DB.prepare(
    `UPDATE orders SET status = ?, payment_key = ?, method = ?, approved_at = ?, payment_json = ?, updated_at = ? WHERE order_id = ?`
  ).bind(status, p.paymentKey, p.method || order.method, p.approvedAt || order.approved_at, JSON.stringify(p), nowIso(), order.order_id).run();

  if (status === "PAID" && !wasPaid) {
    await notifyOrderPaid(env, { ...order, status, method: p.method, approved_at: p.approvedAt, amount: order.amount },
      JSON.parse(order.items_json), JSON.parse(order.buyer_json), JSON.parse(order.shipping_json));
  }
  if (status === "CANCELED") {
    await env.DB.prepare(`UPDATE returns SET status = 'REFUNDED', updated_at = ? WHERE order_id = ? AND status IN ('RECEIVED','APPROVED')`)
      .bind(nowIso(), order.order_id).run();
  }
  return json({ ok: true });
}

// ---------- GET /orders/lookup ----------

function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "local";
}

async function checkLookupBlock(env, ip) {
  const row = await env.DB.prepare(`SELECT * FROM lookup_attempts WHERE ip = ?`).bind(ip).first();
  if (row && row.blocked_until && new Date(row.blocked_until) > new Date()) return { blocked: true, until: row.blocked_until };
  return { blocked: false, fails: row ? row.fails : 0 };
}

async function recordLookupFail(env, ip) {
  const row = await env.DB.prepare(`SELECT * FROM lookup_attempts WHERE ip = ?`).bind(ip).first();
  const fails = (row && row.blocked_until && new Date(row.blocked_until) > new Date() ? 0 : (row ? row.fails : 0)) + 1;
  const blockedUntil = fails >= LOOKUP_MAX_FAILS ? new Date(Date.now() + LOOKUP_BLOCK_MIN * 60000).toISOString() : null;
  await env.DB.prepare(
    `INSERT INTO lookup_attempts (ip, fails, blocked_until, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(ip) DO UPDATE SET fails = excluded.fails, blocked_until = excluded.blocked_until, updated_at = excluded.updated_at`
  ).bind(ip, fails >= LOOKUP_MAX_FAILS ? 0 : fails, blockedUntil, nowIso()).run();
  return blockedUntil;
}

async function clearLookupFails(env, ip) {
  await env.DB.prepare(`DELETE FROM lookup_attempts WHERE ip = ?`).bind(ip).run();
}

async function verifyOrderOwner(env, request, orderId, phone) {
  const ip = clientIp(request);
  const block = await checkLookupBlock(env, ip);
  if (block.blocked) return { error: json({ error: "TOO_MANY_ATTEMPTS", until: block.until }, 429) };

  const order = orderId && /^GOF-\d{6}-[A-Z0-9]{6}$/.test(orderId)
    ? await env.DB.prepare(`SELECT * FROM orders WHERE order_id = ?`).bind(orderId).first()
    : null;
  const buyer = order ? JSON.parse(order.buyer_json) : null;
  if (!order || !buyer || buyer.phone !== digits(phone)) {
    const until = await recordLookupFail(env, ip);
    return { error: json({ error: "ORDER_NOT_FOUND", blockedUntil: until }, 404) };
  }
  await clearLookupFails(env, ip);
  return { order, buyer };
}

function returnableInfo(order) {
  if (order.status !== "PAID" || !order.approved_at) return { returnable: false, reason: "NOT_PAID" };
  const days = (Date.now() - new Date(order.approved_at).getTime()) / 86400000;
  if (days > RETURN_WINDOW_DAYS) return { returnable: false, reason: "WINDOW_EXPIRED" };
  return { returnable: true };
}

async function lookupOrder(request, env, url) {
  const v = await verifyOrderOwner(env, request, url.searchParams.get("orderId"), url.searchParams.get("phone"));
  if (v.error) return v.error;
  const { order } = v;
  const existing = await env.DB.prepare(`SELECT return_id, status, created_at FROM returns WHERE order_id = ? ORDER BY created_at DESC LIMIT 1`).bind(order.order_id).first();
  const info = returnableInfo(order);
  return json({
    orderId: order.order_id,
    status: order.status,
    approvedAt: order.approved_at,
    method: order.method,
    amount: order.amount,
    items: JSON.parse(order.items_json),
    needsRefundAccount: ["가상계좌", "계좌이체"].includes(order.method),
    returnable: info.returnable && !existing,
    reason: existing ? "ALREADY_REQUESTED" : info.reason,
    existingReturn: existing || null,
    returnShippingFee: RETURN_SHIPPING_FEE,
  });
}

// ---------- POST /returns ----------

async function createReturn(request, env, ctx) {
  const body = await readJson(request);
  if (!body) return json({ error: "BAD_JSON" }, 400);
  const v = await verifyOrderOwner(env, request, body.orderId, body.phone);
  if (v.error) return v.error;
  const { order, buyer } = v;

  const info = returnableInfo(order);
  if (!info.returnable) return json({ error: info.reason }, 409);
  const existing = await env.DB.prepare(`SELECT return_id FROM returns WHERE order_id = ? LIMIT 1`).bind(order.order_id).first();
  if (existing) return json({ error: "ALREADY_REQUESTED", returnId: existing.return_id }, 409);

  if (!["RETURN", "EXCHANGE"].includes(body.type)) return json({ error: "BAD_TYPE" }, 400);
  if (!["CHANGE_OF_MIND", "DEFECT", "WRONG_ITEM"].includes(body.reason)) return json({ error: "BAD_REASON" }, 400);

  const orderItems = JSON.parse(order.items_json);
  if (!Array.isArray(body.items) || body.items.length === 0) return json({ error: "NO_ITEMS" }, 400);
  const items = [];
  for (const sel of body.items) {
    const match = orderItems.find((it) => it.id === sel.id && it.color === sel.color && it.size === sel.size);
    const qty = Number(sel.qty);
    if (!match || !Number.isInteger(qty) || qty < 1 || qty > match.qty) return json({ error: "BAD_ITEM" }, 400);
    const line = { id: match.id, name: match.name, color: match.color, size: match.size, qty, unitPrice: match.unitPrice };
    if (body.type === "EXCHANGE") {
      if (!["S", "M", "L"].includes(sel.exchangeSize)) return json({ error: "BAD_EXCHANGE_SIZE" }, 400);
      line.exchangeSize = sel.exchangeSize;
    }
    items.push(line);
  }

  const needsAccount = ["가상계좌", "계좌이체"].includes(order.method) && body.type === "RETURN";
  let refundAccount = null;
  if (needsAccount) {
    const a = body.refundAccount || {};
    if (!a.bank || !a.number || !a.holder || String(a.number).length > 30 || String(a.bank).length > 30 || String(a.holder).length > 30) {
      return json({ error: "REFUND_ACCOUNT_REQUIRED" }, 400);
    }
    refundAccount = { bank: String(a.bank).trim(), number: digits(a.number), holder: String(a.holder).trim() };
  }
  const detail = typeof body.detail === "string" ? body.detail.trim().slice(0, 1000) : "";

  let returnId;
  for (let i = 0; i < 5; i++) {
    returnId = `RT-${yymmdd()}-${randomCode(4)}`;
    try {
      await env.DB.prepare(
        `INSERT INTO returns (return_id, order_id, type, reason, items_json, detail, refund_account_json, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'RECEIVED')`
      ).bind(returnId, order.order_id, body.type, body.reason, JSON.stringify(items), detail, refundAccount ? JSON.stringify(refundAccount) : null).run();
      break;
    } catch (e) { if (i === 4) throw e; }
  }

  const ret = { return_id: returnId, type: body.type, reason: body.reason, items_json: JSON.stringify(items), detail, refund_account_json: refundAccount ? JSON.stringify(refundAccount) : null };
  ctx.waitUntil(notifyReturnReceived(env, ret, order, buyer));
  return json({ ok: true, returnId });
}

// ---------- POST /admin/cancel ----------

async function adminCancel(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) return json({ error: "UNAUTHORIZED" }, 401);
  const body = await readJson(request);
  if (!body || typeof body.orderId !== "string") return json({ error: "BAD_REQUEST" }, 400);

  const order = await env.DB.prepare(`SELECT * FROM orders WHERE order_id = ?`).bind(body.orderId).first();
  if (!order || !order.payment_key) return json({ error: "ORDER_NOT_FOUND" }, 404);
  if (!["PAID", "WAITING_DEPOSIT"].includes(order.status)) return json({ error: "NOT_CANCELABLE", status: order.status }, 409);

  const payload = { cancelReason: (body.reason || "관리자 취소").slice(0, 200) };
  if (body.cancelAmount != null) {
    const ca = Number(body.cancelAmount);
    if (!Number.isInteger(ca) || ca <= 0 || ca > order.amount) return json({ error: "BAD_CANCEL_AMOUNT" }, 400);
    payload.cancelAmount = ca;
  }
  if (body.refundReceiveAccount) payload.refundReceiveAccount = body.refundReceiveAccount; // {bank, accountNumber, holderName}

  const t = await tossFetch(env, `/payments/${encodeURIComponent(order.payment_key)}/cancel`, payload);
  if (!t.ok) return json({ error: t.data.code || "TOSS_CANCEL_FAILED", message: t.data.message || "" }, 502);

  const p = t.data;
  const status = statusFromToss(p);
  await env.DB.prepare(`UPDATE orders SET status = ?, payment_json = ?, updated_at = ? WHERE order_id = ?`)
    .bind(status, JSON.stringify(p), nowIso(), order.order_id).run();
  if (body.returnId) {
    await env.DB.prepare(`UPDATE returns SET status = 'REFUNDED', updated_at = ? WHERE return_id = ?`).bind(nowIso(), body.returnId).run();
  }
  const canceled = (p.cancels || []).reduce((s, c) => s + (c.cancelAmount || 0), 0);
  return json({ ok: true, status, canceledAmount: canceled, balanceAmount: p.balanceAmount });
}
