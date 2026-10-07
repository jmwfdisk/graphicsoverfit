# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**그래픽스오버핏(Graphics Overfit)** 의 정적 HTML 웹사이트. 빌드 시스템이나 프레임워크 없이 순수 HTML, CSS, JavaScript로 구성. 공통 셸·스타일은 `assets/site.css`·`assets/site.js`가 맡고, 페이지 고유 스타일·스크립트는 각 HTML 안에 인라인으로 작성.

- 도메인: graphicsoverfit.co.kr (`CNAME`), 원격: `github.com/jmwfdisk/graphicsoverfit`
- 브랜드 경험 사이트는 별도 저장소(graphicsoverfit.com, iCloud `홈페이지 제작/인터렉티브 그래픽스오버핏/`). 이 사이트는 카탈로그·스토어 담당.
- 이커머스: 자체 브랜드 스토어(`Shop/` + `api/`), 무신사, 네이버 스마트스토어(외부 링크)
- 루트에는 package.json, 번들러, 린터, 테스트 러너 없음 (`api/`만 npm 사용)
- `AGENTS.md`는 이 파일의 사본(Codex용, git 미추적). 이 파일을 고치면 `AGENTS.md`도 같이 갱신할 것 (첫 3줄의 제목·대상 도구만 다름).

## 개발 환경

```bash
python3 doc/dev_server.py        # http://localhost:8090 — 캐시 없는 미리보기 서버 (추천)
python3 -m http.server 8080       # 기본 서버. 캐시 지시를 안 보내 Safari가 예전 HTML을 다시 보여 줄 수 있음 (⌥⌘R 필요)
```

빌드, 린트, 테스트 명령어는 존재하지 않습니다. 인라인 JS 문법 검증은 `<script>` 블록을 추출해 `node --check`로, 공용 스크립트는 `node --check assets/site.js`로 확인.

배포: `main` 브랜치 push → GitHub Pages 자동 배포 (graphicsoverfit.co.kr, 1~2분 소요).

**화면 검증 방법** : 헤드리스 크롬 `--screenshot`은 가상 시간에서 CSS 전환이 멈춰 보이고 스크롤 연동·클릭 상태를 못 본다. 원격 디버깅(CDP)으로 실제 스크롤·클릭하며 캡처할 것(Node 24 내장 `WebSocket`으로 충분, 별도 패키지 불필요). 헤드리스 창은 500px보다 좁게 그리지 못하므로 실제 폰 폭은 실기기로 확인.

## 문서와 git 추적 정책

새 세션은 `doc/개발일지.md`를 먼저 읽고 시작할 것 (변경 이력·현재 상태·미해결 항목). 작업 후 개발일지에 항목을 추가.

**의도적으로 git 미추적 유지** (저장소가 공개 배포용이므로 iCloud로만 공유): `doc/`, `AGENTS.md`, `이미지소스/`, 디자인 소스(`.psd`/`.psb`/`.pxm`/`.ai`), 각 폴더의 `test*.html`. `.gitignore`에는 `.vscode/`, `.DS_Store`만 등록되어 있으므로 **`git add -A`/`git add .` 금지** — 변경한 파일만 명시적으로 add.

## 재디자인 (2026-10-04 배포, 커밋 `f1df78f`)

레이아웃 구성은 antimetal.com 참고, 색·글씨·버튼은 graphicsoverfit.com 기준, 푸터는 사이트맵형. 14개 페이지 적용 후 `main`에 합쳐 배포함(`redesign` 브랜치는 로컬에 남아 있음). 이력·결정은 `doc/재디자인_계획.md`·개발일지.

- 백업 : 태그 `backup-2026-10-04-pre-redesign` (재디자인 전 `main`, 검정 테마·사이드바 구조). 2차 샘플(사이드바 유지안)은 `doc/samples/v2-sidebar/`.
- 옛 구조 그대로 남은 페이지 : `Brand Culture/Brand Culture.html`, `Concept art/Concept art.html` (메뉴·사이트맵에서 연결하지 않음. 살릴 때 새 틀로 다시 만들 것).

## 사이트 구조

```
index.html                              # 메인 : 히어로(한 번 재생 후 멈추는 GIF) · 제품 4칸 · 컬렉션 스크롤 연동 · 2027 Summer 띠 · 룩북 · FAQ · 프로모 팝업
기본페이지.html                          # 최소 페이지 템플릿 (새 페이지는 이걸 복사)
NewTrending/new-arrivals.html           # 제품 그리드 + 상세 모달
NewTrending/limited-edition.html
NewTrending/Upcoming Collection.html    # 2027 Summer 배너 + 출시 예정 카드 + 안내 문구
look book/Curator.html                  # 큐레이터 사진 그리드 + 확대 모달(착용 제품 링크)
look book/Model.html                    # "COMING SOON" 안내만
Shop/Shop.html                          # 스토어 목록 + 상세 모달(옵션·장바구니). ?p=상품id 로 바로 열림
Shop/checkout.html                      # 주문서 + 토스 결제위젯
Shop/success.html, fail.html            # 결제 결과
Shop/return.html                        # 교환·반품 접수 (주문 조회 → 접수 → 완료)
Shop/terms.html, privacy.html           # 약관·개인정보처리방침
assets/site.css, site.js                # ★ 공용 스타일·셸 (전 페이지)
Shop/config.js, products.js, cart.js    # ★ 공용 스크립트 (설정·사업자 정보 / 카탈로그 / 장바구니)
image/                                  # 루트 공용 이미지 (mainlogo2.png = 메뉴 로고, 슬라이더, 팝업)
api/                                    # Cloudflare Worker + D1 (결제 승인·주문·반품 API). GitHub Pages가 서빙해도 무해
```

각 섹션 폴더는 자체 `image/` 디렉토리를 가짐.

## 아키텍처

### 공통 셸 (`assets/site.js`가 주입)

페이지에는 빈 자리만 두고 site.js가 채운다. **메뉴·사이트맵 링크는 `assets/site.js` 한 곳에서만 수정**하고, 링크·로고 경로는 스크립트 위치 기준으로 자동 계산되므로 페이지 깊이에 맞춰 고칠 필요가 없다.

```html
<link rel="stylesheet" href="…/assets/site.css" />
…
<div id="site-header"></div>
<main id="main"><section class="section section--first"> … </section></main>
<div id="site-footer"></div>
<script src="…/Shop/config.js"></script>
<script src="…/Shop/cart.js"></script>
<script src="…/assets/site.js"></script>   <!-- 반드시 마지막, 동기 로드 -->
```

- **로드 순서가 중요** : site.js가 동기 실행으로 푸터(`[data-legal-footer]`)와 `.cart-badge` 자리를 만든 뒤, config.js·cart.js의 `DOMContentLoaded` 핸들러가 그 자리를 채운다. site.js를 `defer`/`async`로 바꾸거나 앞에 두면 사업자 정보·뱃지가 비게 된다.
- **상단 메뉴** `.top-nav` : 떠 있는 캡슐 3개 — 왼쪽 드롭다운(Look Book / New & Trending / Shop, `MENU` 배열), 가운데 로고(`.nav-brand`, 스크롤 60px 넘으면 `.scrolled`로 로고만 남김 — `--spring` 곡선으로 폭 전환), 오른쪽 Cart 뱃지 + Brand store. 768px 이하는 `☰ Menu` → `.mobile-menu` 패널.
- **구역 이동 버튼** `.jump` : `main` 바로 아래 `<section>` 단위로 위·아래 이동 → 본문 구역은 `main > section`으로 둘 것.
- **푸터** : 큰 브랜드 글씨 + 사이트맵 4칸(Shop / Explore / Brand / Coming soon) + 법정 표시(`GOF_legalFooterHTML`) + © 줄. Brand Culture는 graphicsoverfit.com 새 탭, Concept art·Design Studio는 "Coming soon" 칸(링크 없음).

### 공용 스타일 (`assets/site.css`)

| 토큰 | 값 |
|---|---|
| `--paper` / `--ink` | `#f3f1e9` 배경 / `#20231e` 글자·테두리 |
| `--green` / `--orange` | `#d3ef7a` 포인트 / `#f26b38` 강조·포커스·오류 |
| `--line` / `--muted` / `--soft` | `#c9cbc1` 구분선 / `#54584c` 보조 글자 / `#8d8d83` 비활성 |
| 글씨 | Arial + Apple SD Gothic Neo. 제목은 굵기 950·좁은 자간(`.display`, `--md`, `--sm`), 작은 라벨은 고정폭 대문자(`.label`) |
| `--spring` | 스프링 곡선(`linear()`, 미지원 브라우저는 `cubic-bezier`) |

부품 : `.wrap`(가운데 1240px) · `.section`(`--first`는 상단 메뉴만큼 여백) · `.rule`(점선 구분) · `.section-head`(번호 라벨 + 왼쪽 제목/오른쪽 설명, `--action`은 오른쪽에 버튼) · `.pill`(`--solid`, `--sm`) · `.bracket`(모서리 괄호 점선 상자)·`.btn-bracket` · `.chip`(이미지 위 캡션) · `.log-grid`/`.log-card` · `.product-grid`/`.product` · `.modal`(+ `#productModal` 전용 배치) · `.band`(어두운 띠)·`.window` · `.faq` · `.shop-form`(폼)·`.card-box`·`.btn-full` · `.doc`(약관 문서).

브레이크포인트 : **768px**(메뉴·여백·모달), 900px(메인 2단 → 1단, 주문서, 푸터), 1000px(`.log-grid` 4 → 2칸).

**클래스 이름 충돌 주의** : `.chip`은 공용(이미지 캡션)이라 `Shop.html`의 옵션 버튼은 `.chips .chip`으로 되돌려 쓴다. 제품 모달 전용 규칙은 `#productModal`로 한정되어 있고, 룩북 모달은 `.lb-*` 클래스를 쓴다. 새 클래스를 만들 때 site.css와 겹치는지 확인할 것.

### 링크 경로 규칙

본문 안의 링크·이미지는 상대 경로(`./`, `../`). 하위 폴더 페이지는 `../assets/site.css`, `../Shop/config.js` 형태. 메뉴·푸터·로고 경로는 site.js가 처리.

### 페이지별 JS

| 기능 | 위치 | 핵심 로직 |
|---|---|---|
| 목록 ↔ 그림 전환 | `index.html` | `[data-switcher]` 안의 `a[data-key]`를 켜면 같은 key의 `figure`/`img`가 보임. `scroll`은 IntersectionObserver(화면 가운데, 900px 초과만)+마우스·포커스, `hover`는 마우스·포커스만. 컬렉션(`.story`)·큐레이터(`.roster`) 둘 다 `scroll` |
| 프로모 팝업 | `index.html` | `#promo-popup`, `localStorage` `gof_popup_ts`(24시간 비표시), `POPUP_ENABLED` 스위치(현재 false), `showGofPopup()` 전역 헬퍼 |
| 제품 상세 모달 | `NewTrending/*.html` | 인라인 `onclick="showModal([이미지경로...], 제목, 설명HTML)"`. 이미지 배열은 모바일 크롭(`-m*`)을 앞에, 원본 `-f`/`-b`를 뒤에. 제목이 `SHOP_MAP`에 있으면 "브랜드 스토어에서 구매" 버튼 표시 |
| 제품 카드 hover | `.product` 공용 | `img.back`이 있으면 hover 시 앞면 ↔ 뒷면 |
| 룩북 갤러리 모달 | `look book/Curator.html` | `galleryMap[key]`·`productInfo[key]` ↔ `img.gallery-item[data-gallery=key]`. 스와이프(50px, `swipeStarted` 가드), ESC |
| 룩북 그리드 페이지네이션 | `look book/Curator.html` | **IIFE로 즉시 실행** — 인라인 `onclick`이 `window.prevGridSlide/nextGridSlide`를 참조하므로 DOMContentLoaded로 감싸지 말 것. 8개씩, 한 묶음뿐이면 CSS가 화살표·도트를 숨김 |

### Shop / api (자체 스토어)

- 계획·결정 이력: `doc/Shop_직접구매_토스페이먼츠_연동계획.md`. 결제는 토스페이먼츠 결제위젯 v2, 승인은 Worker(`api/src/index.js`)가 수행.
- API 라우트 : `POST /orders`, `/payments/confirm`, `/webhooks/toss`, `GET /orders/lookup`, `POST /returns`, `/admin/cancel`(Bearer `ADMIN_TOKEN`), `GET /health`. D1 테이블 `orders`·`returns`·`lookup_attempts`(조회 5회 실패 → 10분 차단). 알림은 `api/src/notify.js`(Resend 메일, 솔라피 알림톡 — 키 없으면 로그만).
- **가격·품절은 두 곳 동시 수정 후 Worker 재배포**: `Shop/products.js`(표시용) ↔ `api/src/catalog.js`(서버 신뢰 원본, `cd api && npx wrangler deploy`). 서버는 클라이언트가 보낸 금액을 무시하고 카탈로그로 재계산. 메인 `index.html`의 제품 4칸에도 가격이 하드코딩되어 있으니 함께 수정. 품절은 `soldOut[색상]`에 사이즈 배열 — 전 색상 품절이면 카드에 SOLD OUT 덮개, 선택 색상이 전 사이즈 품절이면 모달의 장바구니·바로 구매 비활성(`updateBuyButtons`), 모달은 품절이 아닌 첫 색상을 기본 선택. `limitedUntil: "2026. 12. 25"`가 있으면 카드 이미지 상자 하단 중앙·모달 가격 아래에 한정 판매 종료 알약. `musinsaNo`가 없으면 모달의 무신사 링크 숨김.
- `Shop/config.js`: `API_BASE`는 localhost면 `http://localhost:8787`(wrangler dev), 아니면 배포된 workers.dev 주소. `TOSS_CLIENT_KEY`만 여기 둔다. **시크릿 키는 `api/.dev.vars`(git 미추적)·`wrangler secret`에만**.
- 장바구니: `localStorage["gof_cart"]` = `[{id,color,size,qty}]`. 전 페이지가 `Shop/cart.js`를 로드해 상단 메뉴의 `.cart-badge`를 채움.
- `products.js`의 설명 HTML은 옛 검정 테마용 인라인 색(`#fff`)과 밝은 선 사이즈표 이미지를 쓴다 → 모달 CSS에서 보정 중(`.buy-desc [style*="color"]`, 사이즈표는 어두운 판 위). 설명을 고칠 때 인라인 색을 빼면 보정 규칙도 필요 없어진다.
- 로컬 실행: 터미널1 `python3 -m http.server 8080`, 터미널2 `cd api && npx wrangler dev` (포트 8787). 최초 1회 `npm install` + `npm run db:local`.
- 배포: `cd api && npx wrangler deploy` 후 `wrangler secret put TOSS_SECRET_KEY` 등 시크릿 등록, 토스 개발자센터에 웹훅 `/webhooks/toss` 등록.
- `.com` 사이트가 `Shop/Shop.html`, `Shop/Shop.html?p=essential-logo-tee`로 링크하므로 이 주소 체계를 바꾸지 말 것.

## 주요 패턴

**제품 이미지 파일명:** `NewTrending/image/{new|limit|up}/{type}-{num}-{face}[-{variant}].png`
- `new-01-f.png` (앞면), `new-01-b.png` (뒷면)
- FACE: `f` / `b`, VARIANT: `w` (화이트), `m1`–`m5` (모바일 크롭)
- 제품 사진은 흰 배경으로 맞춘다 (`up/up-01-f.jpg`·`-b.jpg`는 투명 PNG 원본을 흰 배경 1000×1000으로 내보낸 것).
- 사이즈표: `NewTrending/image/size-sp.png`, `size-youth.png` — 투명 바탕에 밝은 선이라 어두운 판 위에 올려야 보임.

**룩북 이미지:** `look book/image/{모델명}/{n}.jpg` 폴더 단위. 폴더명은 ASCII만 사용 (과거 한글·콜론 포함 폴더명이 GitHub Pages에서 깨져 변경한 이력 있음).

## 외부 링크 (HTML·site.js에 하드코딩)

- Instagram: https://www.instagram.com/graphicsoverfit/
- 브랜드 사이트 (Brand Culture): https://graphicsoverfit.com
- 무신사 KR: https://www.musinsa.com/brand/graphicsoverfit/products?categoryCode=001001&gf=A
- 무신사 Global JP/US (index FAQ·팝업): https://global.musinsa.com/{jp|us}/brands/graphicsoverfit
- 네이버 스마트스토어 제품 링크 (Curator 룩북): https://smartstore.naver.com/gomgomgirl/products/{id}

## 문구 작성 규칙 (사용자 지시, 2026-09-28)

- **콜론은 앞뒤 모두 띄어쓴다**: `시행일 : 2026-10-01`, `주문번호 : GOF-…`. 화면 문구, 약관·방침, 알림 메일·알림톡 본문 등 사용자에게 보이는 모든 텍스트에 적용. CSS·JS 코드와 URL은 제외.
- 사업자 정보(상호·대표·주소·전화·사업자등록번호·통신판매업신고·책임자·시행일)는 `Shop/config.js`의 `GOF_BUSINESS` 한 곳에서만 관리. 페이지에는 `<span data-biz="키">`로 참조.
- 배송·교환 정책 문구는 여러 곳에 있다 : `index.html` FAQ, `Shop/Shop.html` 모달의 "배송 · 교환/반품 안내", `Shop/checkout.html` 동의 문구, `Shop/return.html`, `Shop/success.html`. 정책이 바뀌면 전부 함께 고칠 것.

## 참고 사항

- **한글 파일명·경로는 NFD(자모 분해)로 저장됨** — 도구로 한글 문자열을 검색/치환하면 NFC와 매칭 실패할 수 있으니 라인 번호 기반 편집이나 python 스크립트로 우회. `grep`도 한글 패턴은 실패할 수 있음.
- iCloud 폴더라 `git status`·`git grep` 같은 전체 탐색 명령이 느리거나 멈출 수 있다. 파일을 지정해서 실행.
- 모든 콘텐츠(제품, 룩북, 텍스트)는 하드코딩. CMS나 데이터 레이어 없음.
- Shop 결제·반품 정책: 배송비 무료, 단순 변심 교환·반품 왕복 6,000원 고객 부담(`RETURN_SHIPPING_FEE`), 무신사와 재고 공유(품절은 `soldOut` 수동).
- 디자인 소스(`.psd` 등)는 일부 저장소에 포함되어 있으나 HTML에서 참조하지 않음.
