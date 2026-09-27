// Shop/cart.js — 장바구니 (localStorage "gof_cart")
// 항목: { id, color, size, qty }. 합계는 표시용이며 결제 금액의 신뢰 원본은 서버.
// products.js 가 먼저 로드되어야 total() 이 동작한다 (뱃지만 쓰는 페이지는 없어도 됨).

(function () {
  const KEY = "gof_cart";
  const MAX_QTY = 10;

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter(validItem) : [];
    } catch (e) {
      return [];
    }
  }

  function validItem(it) {
    return it && typeof it.id === "string" && typeof it.color === "string" && typeof it.size === "string" && Number.isInteger(it.qty) && it.qty > 0;
  }

  function write(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {
      /* 사파리 프라이빗 모드 등 — 메모리에만 유지 */
    }
    renderBadge(items);
    document.dispatchEvent(new CustomEvent("gof:cart-changed", { detail: { items } }));
  }

  function keyOf(it) {
    return it.id + "|" + it.color + "|" + it.size;
  }

  const Cart = {
    get: read,

    count() {
      return read().reduce((n, it) => n + it.qty, 0);
    },

    add(id, color, size, qty) {
      qty = Math.max(1, parseInt(qty, 10) || 1);
      const items = read();
      const k = id + "|" + color + "|" + size;
      const found = items.find((it) => keyOf(it) === k);
      if (found) found.qty = Math.min(MAX_QTY, found.qty + qty);
      else items.push({ id, color, size, qty: Math.min(MAX_QTY, qty) });
      write(items);
      return items;
    },

    setQty(id, color, size, qty) {
      qty = parseInt(qty, 10);
      let items = read();
      const k = id + "|" + color + "|" + size;
      if (!qty || qty < 1) items = items.filter((it) => keyOf(it) !== k);
      else items.forEach((it) => { if (keyOf(it) === k) it.qty = Math.min(MAX_QTY, qty); });
      write(items);
      return items;
    },

    remove(id, color, size) {
      return Cart.setQty(id, color, size, 0);
    },

    clear() {
      write([]);
    },

    // 표시용 합계. products.js 없으면 0.
    total() {
      const items = read();
      let subtotal = 0;
      const lines = items.map((it) => {
        const p = window.GOF && GOF.findProduct ? GOF.findProduct(it.id) : null;
        const unit = p ? p.price : 0;
        subtotal += unit * it.qty;
        return { ...it, name: p ? p.name : it.id, unitPrice: unit, lineTotal: unit * it.qty, product: p };
      });
      return { items: lines, subtotal, shipping: 0, grand: subtotal };
    },

    renderBadge(items) {
      renderBadge(items || read());
    },
  };

  function renderBadge(items) {
    const n = items.reduce((s, it) => s + it.qty, 0);
    document.querySelectorAll(".cart-badge").forEach((el) => {
      el.textContent = n > 0 ? String(n) : "";
    });
  }

  window.Cart = Cart;

  document.addEventListener("DOMContentLoaded", () => renderBadge(read()));
  window.addEventListener("storage", (e) => { if (e.key === KEY) renderBadge(read()); });
})();
