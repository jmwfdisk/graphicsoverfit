// assets/site.js — 전 페이지 공통 셸 주입 (상단 캡슐 메뉴 · 모바일 메뉴 · 구역 이동 버튼 · 사이트맵 푸터).
// 페이지에는 <div id="site-header"></div> 와 <div id="site-footer"></div> 만 두고,
// </body> 직전에 Shop/config.js → Shop/cart.js → 이 파일 순서로 로드한다.
// (config.js·cart.js가 DOMContentLoaded에서 법정 푸터와 장바구니 뱃지를 채우므로, 이 파일은 그 전에 동기 실행되어야 함)

(function () {
  // 이 스크립트 위치(assets/) 기준으로 사이트 루트를 계산 → 페이지가 어느 폴더에 있든 같은 링크를 쓴다
  const ROOT = new URL("../", document.currentScript.src).href;
  const MUSINSA = "https://www.musinsa.com/brand/graphicsoverfit/products?categoryCode=001001&gf=A";
  const STORY = "https://graphicsoverfit.com";
  const INSTAGRAM = "https://www.instagram.com/graphicsoverfit/";

  // 왼쪽 캡슐의 드롭다운 메뉴. 모바일 메뉴도 같은 목록을 쓴다
  const MENU = [
    { name: "Look Book", sub: [
      ["Model Collection", "look book/Model.html"],
      ["Curator Collection", "look book/Curator.html"],
    ] },
    { name: "New & Trending", sub: [
      ["New Arrivals", "NewTrending/new-arrivals.html"],
      ["Limited Edition", "NewTrending/limited-edition.html"],
      ["Upcoming Collection", "NewTrending/Upcoming Collection.html"],
    ] },
    { name: "Shop", sub: [
      ["BRAND Store", "Shop/Shop.html"],
      ["MUSINSA Store", MUSINSA],
    ] },
  ];

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const isExternal = (p) => /^https?:/.test(p);
  const url = (p) => (isExternal(p) ? p : ROOT + encodeURI(p));
  const here = decodeURI(location.pathname);
  const isCurrent = (p) => !isExternal(p) && here.endsWith("/" + p);
  const a = (name, path) => (isExternal(path)
    ? `<a href="${path}" target="_blank" rel="noopener">${esc(name)} <span aria-hidden="true">↗</span></a>`
    : `<a href="${url(path)}"${isCurrent(path) ? ' aria-current="page"' : ""}>${esc(name)}</a>`);

  const headerSlot = document.getElementById("site-header");
  const footerSlot = document.getElementById("site-footer");

  if (headerSlot) {
    const dropdowns = MENU.map((g) =>
      `<div class="nav-item"><button type="button" aria-expanded="false">${esc(g.name)}</button><div class="nav-sub">${g.sub.map(([n, p]) => a(n, p)).join("")}</div></div>`
    ).join("");
    const mobile = MENU.map((g) => `<p class="label">${esc(g.name)}</p>${g.sub.map(([n, p]) => a(n, p)).join("")}`).join("");
    headerSlot.innerHTML = `<div class="top-nav">
  <div class="capsule nav-left">
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobile-menu">☰ Menu</button>
    ${dropdowns}
  </div>
  <a class="capsule nav-brand" href="${ROOT}" aria-label="Graphics Overfit 홈"><img src="${url("image/mainlogo2.png")}" alt=""><span>GRAPHICS OVERFIT</span></a>
  <div class="capsule nav-right">
    <a class="nav-link" href="${url("Shop/checkout.html")}" aria-label="장바구니">Cart <span class="cart-badge"></span></a>
    <a class="pill pill--solid pill--sm" href="${url("Shop/Shop.html")}">Brand store</a>
  </div>
</div>
<nav class="mobile-menu" id="mobile-menu" aria-label="모바일 메뉴" hidden>${mobile}<p class="label">Brand</p>${a("Brand Culture", STORY)}${a("Instagram", INSTAGRAM)}<p class="label">Coming soon</p><span class="soon">Concept art</span><span class="soon">Design Studio</span></nav>
<div class="capsule jump" role="group" aria-label="구역 이동"><button type="button" data-jump="1" aria-label="다음 구역">↓</button><button type="button" data-jump="-1" aria-label="이전 구역">↑</button></div>`;
  }

  if (footerSlot) {
    footerSlot.className = "site-footer-wrap";
    footerSlot.innerHTML = `<footer class="site-footer">
  <div class="footer-top">
    <p class="footer-brand">GRAPHICS<br>OVERFIT<span class="title-dot">.</span></p>
    <div class="footer-cols">
      <div><p class="label">Shop</p>${a("BRAND Store", "Shop/Shop.html")}${a("MUSINSA Store", MUSINSA)}${a("교환·반품 접수", "Shop/return.html")}</div>
      <div><p class="label">Explore</p>${a("New Arrivals", "NewTrending/new-arrivals.html")}${a("Limited Edition", "NewTrending/limited-edition.html")}${a("Upcoming Collection", "NewTrending/Upcoming Collection.html")}${a("Model Collection", "look book/Model.html")}${a("Curator Collection", "look book/Curator.html")}</div>
      <div><p class="label">Brand</p>${a("Brand Culture", STORY)}${a("Instagram", INSTAGRAM)}</div>
      <div><p class="label">Coming soon</p><span>Concept art</span><span>Design Studio</span></div>
    </div>
  </div>
  <div class="footer-legal" data-legal-footer="${url("Shop/")}"></div>
  <div class="footer-bottom label"><span>© ${new Date().getFullYear()} Graphics Overfit</span><span>Wear your graphics.</span></div>
</footer>`;
  }

  if (!headerSlot) return;

  const topNav = headerSlot.querySelector(".top-nav");
  const toggle = headerSlot.querySelector(".menu-toggle");
  const mobileMenu = headerSlot.querySelector(".mobile-menu");
  const items = Array.from(headerSlot.querySelectorAll(".nav-item"));

  // 스크롤하면 가운데 캡슐을 로고만 남기고 줄인다
  const onScroll = () => topNav.classList.toggle("scrolled", window.scrollY > 60);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 모바일 메뉴
  function setMobile(open) {
    mobileMenu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "✕ Close" : "☰ Menu";
  }
  toggle.addEventListener("click", (e) => { e.stopPropagation(); setMobile(mobileMenu.hidden); });
  mobileMenu.addEventListener("click", (e) => { e.stopPropagation(); if (e.target.closest("a")) setMobile(false); });

  // 드롭다운 — hover·포커스는 CSS, 터치는 눌러서 .open 토글
  function closeDropdowns(except) {
    items.forEach((it) => {
      if (it === except) return;
      it.classList.remove("open");
      it.firstElementChild.setAttribute("aria-expanded", "false");
    });
  }
  items.forEach((it) => {
    const btn = it.firstElementChild;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeDropdowns(it);
      btn.setAttribute("aria-expanded", String(it.classList.toggle("open")));
    });
  });

  // 바깥을 누르면 닫기 (iOS는 click이 안 올 수 있어 touchstart도 처리)
  function closeAll(e) {
    if (e && headerSlot.contains(e.target) && e.target.closest(".nav-item, .mobile-menu, .menu-toggle")) return;
    closeDropdowns();
    if (!mobileMenu.hidden) setMobile(false);
  }
  document.addEventListener("click", closeAll);
  document.addEventListener("touchstart", closeAll, { passive: true });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeAll();
    if (topNav.contains(document.activeElement)) document.activeElement.blur(); // :focus-within 으로 열린 드롭다운도 닫히게
  });

  // 구역 이동 버튼 — main 바로 아래 section 단위로 위·아래 이동
  headerSlot.querySelector(".jump").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-jump]");
    if (!btn) return;
    const tops = Array.from(document.querySelectorAll("main > section")).map((s) => Math.round(s.getBoundingClientRect().top + window.scrollY));
    const y = window.scrollY;
    const target = btn.dataset.jump === "1"
      ? tops.find((t) => t > y + 10)
      : tops.slice().reverse().find((t) => t < y - 10);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: target === undefined ? (btn.dataset.jump === "1" ? document.documentElement.scrollHeight : 0) : target, behavior: reduce ? "auto" : "smooth" });
  });
})();
