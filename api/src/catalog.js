// api/src/catalog.js — 서버 신뢰 원본 가격표.
// Shop/products.js 와 항상 동일하게 유지할 것 (id, price, colors, sizes, soldOut).

export const RETURN_SHIPPING_FEE = 6000;

export const CATALOG = {
  "brush-typography-logo-tee": {
    name: "[BASIC] Brush Typography Logo TEE",
    price: 25900,
    sizes: ["S", "M", "L"],
    colors: ["블랙"],
    soldOut: { "블랙": ["S", "M", "L"] },   // 전 사이즈 품절 (2026-10-07)
  },
  "essential-logo-tee": {
    name: "[BASIC] ESSENTIAL LOGO TEE",
    price: 31900,
    sizes: ["S", "M", "L"],
    colors: ["블랙", "화이트"],
    soldOut: { "블랙": [], "화이트": [] },
  },
  "spirit-art-tee": {
    name: "[ARTWORK] SPIRIT Art TEE",
    price: 48900,
    sizes: ["S", "M", "L"],
    colors: ["화이트"],
    soldOut: { "화이트": [] },
  },
  "golden-youth-art-tee": {
    name: "[ARTWORK] Golden Youth Art TEE",
    price: 48900,
    sizes: ["S", "M", "L"],
    colors: ["베이지"],
    soldOut: { "베이지": [] },
  },
  "pure-youth-art-tee": {
    name: "[ARTWORK] Pure Youth Art TEE",
    price: 48900,
    sizes: ["S", "M", "L"],
    colors: ["화이트"],
    soldOut: { "화이트": [] },
  },
};

export const MAX_QTY = 10;

/**
 * 장바구니 항목을 검증하고 서버 가격으로 합계를 계산한다.
 * @returns {{ok:true, items:[], amount:number, orderName:string} | {ok:false, error:string}}
 */
export function priceItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return { ok: false, error: "EMPTY_CART" };
  if (rawItems.length > 20) return { ok: false, error: "TOO_MANY_LINES" };

  const items = [];
  let amount = 0;
  for (const it of rawItems) {
    const p = CATALOG[it && it.id];
    if (!p) return { ok: false, error: "UNKNOWN_PRODUCT" };
    if (!p.colors.includes(it.color)) return { ok: false, error: "UNKNOWN_COLOR" };
    if (!p.sizes.includes(it.size)) return { ok: false, error: "UNKNOWN_SIZE" };
    const qty = Number(it.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return { ok: false, error: "BAD_QTY" };
    if ((p.soldOut[it.color] || []).includes(it.size)) return { ok: false, error: "SOLD_OUT" };
    items.push({ id: it.id, name: p.name, color: it.color, size: it.size, qty, unitPrice: p.price });
    amount += p.price * qty;
  }
  const first = items[0];
  const others = items.length - 1;
  const orderName = others > 0 ? `${shortName(first.name)} 외 ${others}건` : shortName(first.name);
  return { ok: true, items, amount, orderName };
}

function shortName(name) {
  return name.replace(/^\[[^\]]+\]\s*/, "").slice(0, 60);
}
