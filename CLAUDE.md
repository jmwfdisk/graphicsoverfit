# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**그래픽스오버핏(Graphics Overfit)** 의 정적 HTML 웹사이트. 빌드 시스템이나 프레임워크 없이 순수 HTML, CSS, JavaScript로 구성. 모든 스타일과 스크립트는 각 HTML 파일 내에 인라인으로 작성.

- 도메인: graphicsoverfit.co.kr
- 이커머스: 네이버 스마트스토어, 무신사 (외부 링크)
- package.json, npm, 번들러, 테스트 러너 없음

## 개발 환경

```bash
python3 -m http.server 8080   # 또는 npx serve .
```

빌드, 린트, 테스트 명령어는 존재하지 않습니다.

## 사이트 구조

```
index.html                              # 메인 홈페이지 (진입점)
Brand Culture/Brand Culture.html
Concept art/Concept art.html
look book/Model.html                    # Model Collection 룩북
look book/Curator.html                  # Curator Collection 룩북
NewTrending/new-arrivals.html
NewTrending/limited-edition.html
NewTrending/Upcoming Collection.html
이미지소스/                              # 컨셉아트 등 디자인 소스 이미지 (.psd, 번호 PNG)
doc/                                    # 기획 문서·개발일지 (git 미추적, iCloud로만 공유)
```

새 세션은 `doc/개발일지.md`를 먼저 읽고 시작할 것 (변경 이력·현재 상태·미해결 항목).

각 섹션은 자체 `image/` 하위 디렉토리와 인라인 CSS/JS를 포함하는 독립적인 폴더로 구성.

## 아키텍처

### 내비게이션 (모든 페이지 공통)

고정 왼쪽 사이드바 (180px, `z-index: 1000`). 768px 이하에서 햄버거 메뉴로 전환. **내비게이션 HTML은 모든 페이지에 중복 작성**되어 있으므로, 메뉴를 수정할 때는 모든 HTML 파일을 각각 수동으로 업데이트해야 합니다.

메뉴 구조:
- Brand Culture
- Concept art
- Design Studio (coming soon)
- Look Book → Model Collection, Curator Collection
- New & Trending → New Arrivals, Limited Edition, Upcoming Collection
- Shop (무신사 외부 링크)

### 로고 (모든 페이지 공통, 2026-07-07 개편)

로고는 페이지당 2개이며 HTML·CSS가 모든 페이지에 중복 작성됨:
- **`.floating-logo`** (사이드바 상단): 검정 박스 로고 `image/mainlogo.png`(각 폴더 사본), `position: fixed; top: 4px; left: 90px` + `translateX(-50%)`, 83px. 모바일에서는 `display: none`.
- **`.top-center-logo`** (페이지 상단 중앙): 크레용 로고 — **루트 `image/mainlogo2.png` 한 파일**을 전 페이지가 상대 경로로 참조. `position: absolute; top: -20px; left: 50%`, 데스크탑 130px / 모바일 90px. 클릭 시 메인 이동.

### 페이지 간 링크 경로 규칙

**상대 경로(relative path)** 를 사용합니다. 페이지의 디렉토리 깊이에 따라 경로가 달라집니다:
- `index.html`에서: `./Brand Culture/Brand Culture.html`, `./NewTrending/new-arrivals.html`
- 하위 폴더 페이지에서: `../index.html`, `../look book/Model.html`

### 반응형 디자인

- 단일 브레이크포인트: **768px**
- 데스크탑: 사이드바 내비게이션 + 4열 그리드 (`repeat(4, 1fr)`)
- 모바일: 햄버거 메뉴 + 2열 그리드

### 주요 JS 동작

| 기능 | 위치 | 핵심 로직 |
|------|------|-----------|
| 이미지 슬라이더 | `index.html` | `setInterval(5000)`, `.active` 클래스 토글, CSS opacity 트랜지션 |
| 팝업 모달 | `index.html` | `localStorage` 키 `gof_popup_ts` (24시간 비표시), 600ms 후 표시 |
| 룩북 갤러리 모달 | `look book/*.html` | `galleryMap` 객체로 이미지 그룹 관리, 스와이프(50px 임계값, `swipeStarted` 가드), 키보드(ESC), 썸네일 |
| 룩북 그리드 페이지네이션 | `look book/*.html` | IIFE로 파싱 즉시 실행 (인라인 `onclick` 화살표가 참조하므로 DOMContentLoaded로 감싸지 말 것) |
| 모바일 메뉴 | 모든 페이지 | `toggleMenu()`, 768px 초과 시 리턴, 외부 클릭으로 닫기 |

## 주요 패턴

**제품 이미지 파일명 규칙:** `{type}-{num}-{face}[-{variant}].png`
- `new-01-f.png` (앞면), `new-01-b.png` (뒷면)
- 모바일 변형 포함 시: `new-01-b-m1.png`, `new-01-f-m2.png`
- FACE: `f` (앞면) / `b` (뒷면), VARIANT: `w` (화이트), `m1`–`m5` (모바일 크롭)

## 디자인 토큰 (인라인 CSS)

| 토큰 | 값 |
|------|-----|
| 배경색 | `#000` |
| 텍스트 | `#fff` |
| 강조 (Brand Culture) | `#feacac` |
| 오버레이 | `rgba(0,0,0,0.3)` ~ `rgba(0,0,0,0.95)` |
| 시안 틴트 | `rgba(199,248,255,0.5)` |
| 사이드바 너비 | `180px` |
| 폰트 | Google Fonts Noto Sans KR (페이지별 개별 import) |

## 외부 링크 (HTML에 하드코딩)

- Instagram: https://www.instagram.com/graphicsoverfit/
- 무신사 KR: https://www.musinsa.com/brand/graphicsoverfit/products
- 무신사 Global JP: https://global.musinsa.com/jp/brands/graphicsoverfit
- 무신사 Global US: https://global.musinsa.com/us/brands/graphicsoverfit
- 네이버 스마트스토어: https://smartstore.naver.com/gomgomgirl

## 참고 사항

- `look book/Model.html`의 배경은 `./image/stbg.png` 이미지로 설정됨 (`#000` 아님).
- 디자인 소스 파일(`.psd`, `.ai` 등)은 저장소에 포함되어 있으나 서버에서 제공되지 않음.
- 각 하위 디렉토리의 `test.html` 파일은 개발 중 생성된 임시 파일.
- `기본페이지.html`은 최소한의 페이지 템플릿 (전 페이지 공통 변경 시 여기도 함께 갱신).
- 모든 콘텐츠(제품, 룩북 이미지, 텍스트)는 하드코딩되어 있으며 CMS나 데이터 레이어가 없음.
- Brand Culture의 동영상 섹션은 2026-07-07 제거됨. `Brand Culture/image/`의 mp4 2개는 미참조 상태로 잔존.
- **한글 파일명·경로는 NFD(자모 분해)로 저장됨** — 도구로 한글 문자열을 검색/치환하면 NFC와 매칭 실패할 수 있으니 라인 기반 편집이나 스크립트로 우회.
- 배포: main 브랜치 push → GitHub Pages 자동 배포 (graphicsoverfit.co.kr, 1~2분 소요).
