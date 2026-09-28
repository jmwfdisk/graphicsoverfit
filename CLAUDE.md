# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**그래픽스오버핏(Graphics Overfit)** 의 정적 HTML 웹사이트. 빌드 시스템이나 프레임워크 없이 순수 HTML, CSS, JavaScript로 구성. 모든 스타일과 스크립트는 각 HTML 파일 내에 인라인으로 작성.

- 도메인: graphicsoverfit.co.kr (`CNAME`), 원격: `github.com/jmwfdisk/graphicsoverfit`
- 이커머스: 네이버 스마트스토어, 무신사 (외부 링크)
- package.json, npm, 번들러, 린터, 테스트 러너 없음
- `AGENTS.md`는 이 파일의 사본(Codex용). 이 파일을 고치면 `AGENTS.md`도 같이 갱신할 것.

## 개발 환경

```bash
python3 -m http.server 8080   # 또는 npx serve .
```

빌드, 린트, 테스트 명령어는 존재하지 않습니다. 인라인 JS 문법 검증은 `<script>` 블록을 추출해 `node --check`로 확인.

배포: `main` 브랜치 push → GitHub Pages 자동 배포 (graphicsoverfit.co.kr, 1~2분 소요).

## 문서와 git 추적 정책

새 세션은 `doc/개발일지.md`를 먼저 읽고 시작할 것 (변경 이력·현재 상태·미해결 항목). 작업 후 개발일지에 항목을 추가.

**의도적으로 git 미추적 유지** (저장소가 공개 배포용이므로 iCloud로만 공유): `doc/`, `이미지소스/`, 디자인 소스(`.psd`/`.psb`/`.pxm`/`.ai`), 각 폴더의 `test*.html`(2026-09-29 삭제됨, 새로 만들면 여전히 미추적). `.gitignore`에는 `.vscode/`, `.DS_Store`만 등록되어 있으므로 **`git add -A`/`git add .` 금지** — 변경한 파일만 명시적으로 add.

## 사이트 구조

```
index.html                              # 메인 홈페이지 (슬라이더 + 프로모 팝업)
Brand Culture/Brand Culture.html        # 브랜드 소개 텍스트 (동영상 섹션은 제거됨)
Concept art/Concept art.html            # 썸네일 스트립 → 확대 모달 (데스크탑 전용)
look book/Model.html                    # Model Collection 룩북 (대부분 "coming soon" 플레이스홀더)
look book/Curator.html                  # Curator Collection 룩북 (실제 이미지, 스마트스토어 제품 링크)
NewTrending/new-arrivals.html           # 제품 그리드 + 상세 모달
NewTrending/limited-edition.html
NewTrending/Upcoming Collection.html
기본페이지.html                          # 최소 페이지 템플릿 (공통 변경 시 함께 갱신)
image/                                  # 루트 공용 이미지 (mainlogo2.png, 슬라이더, 팝업)
Shop/                                   # 자체 스토어 (2026-09-28 신설): Shop.html 목록+모달, checkout/success/fail/return.html
Shop/config.js, products.js, cart.js    # ★ 저장소 유일의 공유 스크립트 (설정·카탈로그·장바구니)
api/                                    # Cloudflare Worker + D1 (결제 승인·주문·반품 API). GitHub Pages가 서빙해도 무해
```

### Shop / api (자체 스토어)

- 계획·결정 이력: `doc/Shop_직접구매_토스페이먼츠_연동계획.md`. 결제는 토스페이먼츠 결제위젯 v2, 승인은 Worker(`api/src/index.js`)가 수행.
- **가격·품절은 두 곳 동시 수정**: `Shop/products.js`(표시용) ↔ `api/src/catalog.js`(서버 신뢰 원본). 서버는 클라이언트가 보낸 금액을 무시하고 카탈로그로 재계산.
- `Shop/config.js`: `API_BASE`는 localhost면 `http://localhost:8787`(wrangler dev), 아니면 배포된 workers.dev 주소. `TOSS_CLIENT_KEY`만 여기 둔다. **시크릿 키는 `api/.dev.vars`(git 미추적)·`wrangler secret`에만**.
- 장바구니: `localStorage["gof_cart"]` = `[{id,color,size,qty}]`. 모든 페이지가 `Shop/cart.js`를 로드해 `.cart-badge`를 채움.
- 로컬 실행: 터미널1 `python3 -m http.server 8080 --bind ::`, 터미널2 `cd api && npx wrangler dev` (포트 8787). 최초 1회 `npm install` + `npm run db:local`.
- 배포: `cd api && npx wrangler deploy` 후 `Shop/config.js`의 `API_BASE`를 발급된 주소로 교체, `wrangler secret put TOSS_SECRET_KEY` 등 시크릿 등록, 토스 개발자센터에 웹훅 `/webhooks/toss` 등록.
- 내비게이션 Shop 항목은 서브메뉴(Online Store / Cart / Musinsa)로 바뀜. 9개 페이지 + Shop 4페이지 모두 복붙 구조.

각 섹션 폴더는 자체 `image/` 디렉토리를 가짐. 공통 아이콘(`mainlogo.png`, `insta.png`, `musinsa.png`)은 폴더마다 사본으로 존재.

## 아키텍처

### 공통 셸 (모든 페이지에 중복 작성)

내비게이션·로고·모바일 메뉴 HTML/CSS/JS가 **9개 HTML 파일 각각에 복붙**되어 있음. 공통 요소를 수정하면 index, Brand Culture, Concept art, Model, Curator, NewTrending 3종, `기본페이지.html` 전부를 손으로 갱신해야 한다.

- **`.side-nav`**: 고정 왼쪽 사이드바 180px, `z-index: 1000`. 768px 이하에서 숨김 → `.hamburger`(`onclick="toggleMenu()"`)로 `.active` 토글.
- **모바일 메뉴 JS**: `toggleMenu()` + 메뉴 링크 클릭 시 닫기(DOMContentLoaded) + 외부 클릭 시 닫기(document click). index.html만 touchstart도 처리.
- **`.floating-logo`** (사이드바 상단): 검정 박스 로고 `./image/mainlogo.png`(각 폴더 사본). `position: fixed; top: 4px; left: 90px; translateX(-50%)`, 83px. 모바일 `display: none`.
- **`.top-center-logo`** (상단 중앙): 크레용 로고 — **루트 `image/mainlogo2.png` 한 파일**을 전 페이지가 참조(하위 폴더에서는 `../image/mainlogo2.png`). `position: absolute; top: -20px; left: 50%`, 데스크탑 130px / 모바일 90px. 클릭 시 메인 이동.

메뉴 구조: Brand Culture / Concept art / Design Studio (coming soon, `href="#"`) / Look Book → Model, Curator / New & Trending → New Arrivals, Limited Edition, Upcoming Collection / Shop (무신사 외부 링크).

### 링크 경로 규칙

상대 경로 사용. 하위 폴더 페이지에서는 `../index.html`, `../look book/Model.html` 형태.

주의할 현재 상태:
- `index.html`은 루트에 있으면서도 Brand Culture·Concept art·Look Book 링크에 `../`를 씀 (브라우저가 루트 위로 못 올라가서 우연히 동작). NewTrending 링크만 `./`. 새 링크 추가 시 `./` 사용.
- `기본페이지.html`의 메뉴 링크는 전부 `href="#"` 플레이스홀더이고 로고 링크는 `../index.html`(하위 폴더 배치 전제). 복사해 쓸 때 링크·이미지 경로를 깊이에 맞게 수정.

### 반응형

단일 브레이크포인트 **768px** (`@media (max-width: 768px)`, JS는 `window.innerWidth`). 페이지별 그리드가 다름:

| 페이지 | 데스크탑 | 모바일 |
|---|---|---|
| 룩북 `.lookbook-grid` | `repeat(4, 1fr)`, 8개씩 페이지네이션 | `flex-direction: column` (1열) |
| NewTrending `.product-grid` | `repeat(auto-fit, minmax(250px, 1fr))` | `1fr` |

### 페이지별 JS

| 기능 | 위치 | 핵심 로직 |
|---|---|---|
| 메인 슬라이더 | `index.html` | `.main-image-slider img` + `.slide-text` 쌍을 `.active` 토글, `setInterval(5000)`, 도트 동적 생성 |
| 프로모 팝업 | `index.html` | `#promo-popup`, `localStorage` 키 `gof_popup_ts`(24시간 비표시), 600ms 후 표시, ESC 닫기, `showGofPopup()` 전역 헬퍼 |
| 제품 상세 모달 | `NewTrending/*.html` | 인라인 `onclick="showModal([이미지경로...], 제목, 설명HTML)"`. 이미지 배열은 모바일 크롭(`-m*`)을 앞에, 원본 `-f`/`-b`를 뒤에 배치. 썸네일·도트·스와이프(50px)·바깥 클릭 닫기 |
| 제품 카드 hover | `NewTrending/*.html` | `.product img.front` / `img.back`을 `:hover`로 opacity 교체 (앞면↔뒷면) |
| 룩북 갤러리 모달 | `look book/*.html` | `galleryMap[key]` ↔ `img.gallery-item[data-gallery=key]`. 스와이프(50px, `swipeStarted` 가드), ESC, 썸네일 |
| 룩북 그리드 페이지네이션 | `look book/*.html` | **IIFE로 즉시 실행** — 인라인 `onclick`이 `window.prevGridSlide/nextGridSlide`를 참조하므로 DOMContentLoaded로 감싸지 말 것 |
| 컨셉아트 확대 모달 | `Concept art/Concept art.html` | `.thumbnail-strip img[data-large-src]` 클릭 → `#image-modal`. `innerWidth <= 768`이면 리턴(모바일 비활성). 리스너를 clone-replace로 제거하지 말 것(비가역) |

## 주요 패턴

**제품 이미지 파일명:** `NewTrending/image/{new|limit|up}/{type}-{num}-{face}[-{variant}].png`
- `new-01-f.png` (앞면), `new-01-b.png` (뒷면)
- FACE: `f` / `b`, VARIANT: `w` (화이트), `m1`–`m5` (모바일 크롭)
- 사이즈표: `NewTrending/image/size-sp.png`, `size-youth.png` (설명 HTML 안에 `<img>`로 삽입)

**룩북 이미지:** `look book/image/{모델명}/{n}.jpg` 폴더 단위. 폴더명은 ASCII만 사용 (과거 한글·콜론 포함 폴더명이 GitHub Pages에서 깨져 변경한 이력 있음).

## 디자인 토큰 (인라인 CSS)

| 토큰 | 값 |
|---|---|
| 배경 | `#000` (예외: `look book/Model.html`은 `./image/stbg.png` 배경 이미지) |
| 텍스트 | `#fff` |
| 강조 / 시안 틴트 (Brand Culture 전용) | `#feacac` / `rgba(199, 248, 255, 0.5)` |
| 오버레이 | `rgba(0,0,0,0.3)` ~ `rgba(0,0,0,0.95)` |
| 사이드바 너비 | `180px` |
| 폰트 | 기본 `Arial, sans-serif`. 룩북은 `"Helvetica Neue", Arial`. **Noto Sans KR(Google Fonts)은 Brand Culture만 import** |

## 외부 링크 (HTML에 하드코딩)

- Instagram: https://www.instagram.com/graphicsoverfit/
- 무신사 KR (Shop 메뉴, 전 페이지): https://www.musinsa.com/brand/graphicsoverfit/products?categoryCode=001001&gf=A
- 무신사 Global JP/US (index): https://global.musinsa.com/{jp|us}/brands/graphicsoverfit
- 네이버 스마트스토어 제품 링크 (Curator 룩북): https://smartstore.naver.com/gomgomgirl/products/{id}

## 문구 작성 규칙 (사용자 지시, 2026-09-28)

- **콜론은 앞뒤 모두 띄어쓴다**: `시행일 : 2026-10-01`, `주문번호 : GOF-…`. 화면 문구, 약관·방침, 알림 메일·알림톡 본문 등 사용자에게 보이는 모든 텍스트에 적용. CSS·JS 코드와 URL은 제외.
- 사업자 정보(상호·대표·주소·전화·사업자등록번호·통신판매업신고·책임자·시행일)는 `Shop/config.js`의 `GOF_BUSINESS` 한 곳에서만 관리. 페이지에는 `<span data-biz="키">`로 참조.

## 참고 사항

- **한글 파일명·경로는 NFD(자모 분해)로 저장됨** — 도구로 한글 문자열을 검색/치환하면 NFC와 매칭 실패할 수 있으니 라인 번호 기반 편집이나 python 스크립트로 우회. `grep`도 한글 패턴은 실패할 수 있음.
- 모든 콘텐츠(제품, 룩북, 텍스트)는 하드코딩. CMS나 데이터 레이어 없음.
- Shop 결제·반품 정책: 배송비 무료, 단순 변심 교환·반품 왕복 6,000원 고객 부담(`RETURN_SHIPPING_FEE`), 무신사와 재고 공유(품절은 `soldOut` 수동).
- 디자인 소스(`.psd` 등)는 일부 저장소에 포함되어 있으나 HTML에서 참조하지 않음.
