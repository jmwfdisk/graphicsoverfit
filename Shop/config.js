// Shop/config.js — 프론트 설정 (공개 가능한 값만)
// - API_BASE: 로컬(python http.server 8080 + wrangler dev 8787)이면 자동으로 localhost API 사용
// - TOSS_CLIENT_KEY: 결제위젯 클라이언트 키 (test_gck_ → 실서비스 live_gck_). 시크릿 키는 절대 여기 두지 말 것.
(function () {
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  window.GOF_CONFIG = {
    API_BASE: isLocal ? "http://localhost:8787" : "https://gof-shop-api.k-market-pages.workers.dev",
    TOSS_CLIENT_KEY: "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm",
    SUPPORT_EMAIL: "gomgomgirls@naver.com",
    INSTAGRAM: "https://www.instagram.com/graphicsoverfit/",
    RETURN_ADDRESS: "대전광역시 대덕구 오정로41번길 12, 2층 (그래픽스오버핏)",
  };

  // 사업자 정보 — 법정 표시 항목. 빈 문자열이면 페이지에 "[항목 입력]" 자리표시자가 분홍색으로 표시됨.
  // 채우면 이용약관·개인정보처리방침·푸터에 자동 반영.
  window.GOF_BUSINESS = {
    brand: "그래픽스오버핏 (GRAPHICS OVERFIT)",
    company: "곰곰소녀마켓",     // 상호 (사업자등록증 기준) — index.html 푸터 값
    ceo: "정민우",              // 대표자 성명 (통신판매업신고증 기준)
    address: "대전광역시 대덕구 오정로41번길 12, 2층 (오정동)",  // 통신판매업신고증(2024-12-30, 대전 대덕구) 소재지
    phone: "070-4759-5483",   // 대표 전화
    email: "gomgomgirls@naver.com",
    bizNo: "562-04-02746",    // 사업자등록번호
    mailOrderNo: "제2024-대전대덕-0620호", // 통신판매업 신고번호 (2024-12-30 대전광역시 대덕구청)
    privacyOfficer: "정민우",   // 개인정보보호책임자 성명
    privacyOfficerContact: "gomgomgirls@naver.com",
    hosting: "GitHub, Inc. (GitHub Pages)",
    effectiveDate: "2026-10-01", // 약관·방침 시행일
  };

  // 페이지 안의 <span data-biz="키"> 를 채운다. 값이 없으면 자리표시자.
  const LABELS = { company: "상호", ceo: "대표자", address: "사업장 주소", phone: "전화번호", email: "이메일", bizNo: "사업자등록번호",
    mailOrderNo: "통신판매업 신고번호", privacyOfficer: "개인정보보호책임자", privacyOfficerContact: "책임자 연락처", hosting: "호스팅 제공자", effectiveDate: "시행일", brand: "브랜드" };
  window.GOF_fillBusiness = function () {
    document.querySelectorAll("[data-biz]").forEach((el) => {
      const k = el.getAttribute("data-biz"); const v = (GOF_BUSINESS[k] || "").trim();
      if (v) { el.textContent = v; el.classList.remove("ph"); }
      else { el.textContent = "[" + (LABELS[k] || k) + " 입력]"; el.classList.add("ph"); }
    });
  };
  // 공통 법정 푸터 HTML
  window.GOF_legalFooterHTML = function (prefix) {
    prefix = prefix || "./";
    return `<div class="legal-links"><a href="${prefix}terms.html">이용약관</a> · <a href="${prefix}privacy.html"><b>개인정보처리방침</b></a> · <a href="${prefix}return.html">교환·반품 접수</a></div>
      <div class="legal-biz">
        <span data-biz="company"></span> · 대표 <span data-biz="ceo"></span> · <span data-biz="address"></span> · 전화 <span data-biz="phone"></span> · 이메일 <span data-biz="email"></span><br>
        사업자등록번호 <span data-biz="bizNo"></span> · 통신판매업신고 <span data-biz="mailOrderNo"></span> · 호스팅 <span data-biz="hosting"></span> · 개인정보보호책임자 <span data-biz="privacyOfficer"></span> (<span data-biz="privacyOfficerContact"></span>)
      </div>`;
  };
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-legal-footer]").forEach((el) => { el.innerHTML = GOF_legalFooterHTML(el.getAttribute("data-legal-footer") || "./"); });
    GOF_fillBusiness();
  });
})();
