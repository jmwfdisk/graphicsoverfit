// Shop/products.js — 상품 카탈로그 (클라이언트 표시용)
// 가격·품절의 신뢰 원본은 서버(api/src/catalog.js). 두 파일을 항상 같이 수정할 것.
// 가격은 무신사 브랜드숍 판매가와 동일 (2026-09-27 기준).

window.GOF_RETURN_SHIPPING_FEE = 6000; // 단순 변심 교환·반품 왕복 배송비 (고객 부담)

const GOF_DESC_COMMON = `
    <span style='color: #fff; font-weight: bold;'>- DESC.</span><br>
    &nbsp;&nbsp;• 200G 이상 중량의 20수 싱글원단 사용<br>
    &nbsp;&nbsp;• 덴타, 덤블 가공으로 원단 수축 최소화<br>
    &nbsp;&nbsp;• 넥 라인 늘어남 방지를 위한 테이핑 처리<br>
    &nbsp;&nbsp;• 그래픽스 오버핏의 고품질 전사 / 나염 프린팅<br>`;

function gofDesc(identityLines, sizeChart) {
  return `
    <span style='color: #fff; font-weight: bold;'>- Design Identity</span><br>
    &nbsp;&nbsp;• 오버핏 실루엣과 감각적인 그래픽 디자인<br>
    &nbsp;&nbsp;• Unisex 디자인으로 누구나 편하게 착용<br>
    ${identityLines}<br>
    ${GOF_DESC_COMMON}<br>
    <img src='${sizeChart}' alt='사이즈' style='width: 100%; margin-top: 10px;' />`;
}

window.GOF_PRODUCTS = [
  {
    id: "essential-logo-tee",
    musinsaNo: 5225317,
    name: "[BASIC] ESSENTIAL LOGO TEE",
    subtitle: "ESSENTIAL logo가 디자인된 티셔츠",
    price: 31900,
    category: "basic",
    badge: "NEW",
    sizes: ["S", "M", "L"],
    colors: {
      "블랙":   ["./image/new-02-b-m1.png", "./image/new-02-f-m2.png", "./image/new-02-b-m5.png", "./image/new-02-f.png", "./image/new-02-b.png"],
      "화이트": ["./image/new-02-b-m3.png", "./image/new-02-f-m4.png", "./image/new-02-f-w.png", "./image/new-02-b-w.png"],
    },
    // 카드에 보일 앞/뒤 이미지 (기본 색상 기준)
    front: "./image/new-02-f.png",
    back: "./image/new-02-b.png",
    soldOut: { "블랙": [], "화이트": [] },
    description: {
      "블랙":   gofDesc("&nbsp;&nbsp;• 차콜그레이 색상의 ESSENTIAL LOGO가<br>&nbsp;&nbsp;&nbsp;&nbsp;디자인된 티셔츠<br>&nbsp;&nbsp;• 어디서든 돋보이는 유니크한 디자인<br>", "./image/size-sp.png"),
      "화이트": gofDesc("&nbsp;&nbsp;• 아이스그레이 색상의 ESSENTIAL LOGO가<br>&nbsp;&nbsp;&nbsp;&nbsp;디자인된 티셔츠<br>&nbsp;&nbsp;• 어디서든 돋보이는 유니크한 디자인<br>", "./image/size-sp.png"),
    },
  },
  {
    id: "spirit-art-tee",
    musinsaNo: 4867826,
    name: "[ARTWORK] SPIRIT Art TEE",
    subtitle: "레드 포인트와 SPIRIT 그래픽이 디자인된 티셔츠",
    price: 48900,
    category: "artwork",
    badge: "LIMITED",
    sizes: ["S", "M", "L"],
    colors: {
      "화이트": ["./image/limit-03-f-m1.png", "./image/limit-03-f-m3.png", "./image/limit-03-b-m4.png", "./image/limit-03-f.png", "./image/limit-03-b.png"],
    },
    front: "./image/limit-03-f.png",
    back: "./image/limit-03-b.png",
    soldOut: { "화이트": [] },
    description: gofDesc("&nbsp;&nbsp;• 레드 포인트 라벨과 스피릿 그래픽이 디자인된<br>&nbsp;&nbsp;&nbsp;&nbsp;한정판 컬렉션<br>", "./image/size-sp.png"),
  },
  {
    id: "golden-youth-art-tee",
    musinsaNo: 4685719,
    name: "[ARTWORK] Golden Youth Art TEE",
    subtitle: "시그니처 캐릭터 그래픽이 디자인된 티셔츠",
    price: 48900,
    category: "artwork",
    badge: "LIMITED",
    sizes: ["S", "M", "L"],
    colors: {
      "베이지": ["./image/limit-01-b-m1.png", "./image/limit-01-f.png", "./image/limit-01-b.png"],
    },
    front: "./image/limit-01-f.png",
    back: "./image/limit-01-b.png",
    soldOut: { "베이지": [] },
    description: gofDesc("&nbsp;&nbsp;• 시그니처 캐릭터 그래픽이 디자인된 한정판<br>&nbsp;&nbsp;&nbsp;&nbsp;컬렉션<br>", "./image/size-youth.png"),
  },
  {
    id: "pure-youth-art-tee",
    musinsaNo: 4684766,
    name: "[ARTWORK] Pure Youth Art TEE",
    subtitle: "시그니처 캐릭터 그래픽이 디자인된 티셔츠",
    price: 48900,
    category: "artwork",
    badge: "LIMITED",
    sizes: ["S", "M", "L"],
    colors: {
      "화이트": ["./image/limit-02-f-m1.png", "./image/limit-02-b-m2.png", "./image/limit-02-f.png", "./image/limit-02-b.png"],
    },
    front: "./image/limit-02-f.png",
    back: "./image/limit-02-b.png",
    soldOut: { "화이트": [] },
    description: gofDesc("&nbsp;&nbsp;• 시그니처 캐릭터 그래픽이 디자인된 한정판<br>&nbsp;&nbsp;&nbsp;&nbsp;컬렉션<br>", "./image/size-youth.png"),
  },
];

// 편의 함수
window.GOF = window.GOF || {};
GOF.findProduct = (id) => GOF_PRODUCTS.find((p) => p.id === id) || null;
GOF.colorsOf = (p) => Object.keys(p.colors);
GOF.imagesOf = (p, color) => p.colors[color] || p.colors[GOF.colorsOf(p)[0]];
GOF.descOf = (p, color) => (typeof p.description === "string" ? p.description : (p.description[color] || Object.values(p.description)[0]));
GOF.isSoldOut = (p, color, size) => {
  if (!p.colors[color]) return true;
  const list = p.soldOut[color] || [];
  return size ? list.includes(size) : p.sizes.every((s) => list.includes(s));
};
GOF.isAllSoldOut = (p) => GOF.colorsOf(p).every((c) => GOF.isSoldOut(p, c));
GOF.won = (n) => "₩" + new Intl.NumberFormat("ko-KR").format(n);
