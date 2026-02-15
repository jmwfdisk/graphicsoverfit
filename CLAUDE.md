# CLAUDE.md

## 프로젝트 개요

**Graphics Overfit**은 한국 스트리트 패션 브랜드의 정적 웹사이트입니다. GitHub Pages를 통해 `graphicsoverfit.co.kr`에서 호스팅되며, 포트폴리오 및 무신사/네이버 스마트스토어로 연결되는 이커머스 게이트웨이 역할을 합니다.

빌드 시스템, 백엔드, JavaScript 프레임워크가 없습니다. 모든 페이지는 인라인 CSS와 인라인 JavaScript가 포함된 독립적인 HTML 파일입니다.

## 저장소 구조

```
/
├── index.html                          # 홈페이지 (메인 진입점)
├── CNAME                               # GitHub Pages 커스텀 도메인 (graphicsoverfit.co.kr)
├── robots.txt                          # SEO 설정
├── favicon.ico / favicon.png           # 사이트 아이콘
├── 시퀀스 01.mp4                        # 홈페이지 영상
├── image/                              # 홈페이지 에셋 (GIF, PNG, MP4)
├── Brand Culture/
│   ├── Brand Culture.html              # 브랜드 컬처 페이지
│   └── image/                          # 브랜드 컬처 미디어
├── Concept art/
│   ├── Concept art.html                # 컨셉 아트 갤러리
│   └── image/                          # 아트 썸네일 및 배경
├── look book/
│   ├── look book.html                  # 룩북 랜딩 페이지
│   ├── Model.html                      # 모델 페이지
│   ├── Curator.html                    # 큐레이터 페이지
│   └── image/                          # 룩북 사진 (큐레이터별 정리)
└── NewTrending/
    ├── new-arrivals.html               # 신상품 페이지
    ├── limited-edition.html            # 한정판 페이지
    ├── Upcoming Collection.html        # 출시 예정 컬렉션 페이지
    └── image/                          # 제품 이미지 (new/, limit/, up/ 하위 디렉토리)
```

## 기술 스택

- **HTML/CSS/JS만 사용** — 프레임워크, 라이브러리, 빌드 도구 없음
- **패키지 매니저 없음** — `package.json`, `node_modules` 없음
- **빌드 단계 없음** — GitHub Pages를 통해 파일이 그대로 제공됨
- **외부 폰트**: Google Fonts `Noto Sans KR` (일부 페이지에서 로드)
- **반응형**: 768px 모바일 브레이크포인트의 미디어 쿼리 적용

## 개발 워크플로우

### 로컬 실행

HTML 파일을 브라우저에서 직접 열거나 로컬 서버를 사용합니다:

```bash
python3 -m http.server 8000
```

이후 `http://localhost:8000`에 접속합니다.

### 배포

사이트는 `main` 브랜치에서 **GitHub Pages**를 통해 배포됩니다. `main`에 푸시하면 자동으로 배포가 진행됩니다. 커스텀 도메인은 `CNAME` 파일에서 설정됩니다.

### 테스트, 린팅, CI/CD 없음

자동화된 테스트, 린터, 포매터, CI 파이프라인이 설정되어 있지 않습니다.

## 코드 컨벤션

### 파일 구성

- 사이트의 각 섹션은 HTML 파일과 `image/` 하위 폴더가 있는 자체 디렉토리를 가짐
- 디렉토리 및 파일 이름에 공백과 대소문자 혼용 사용 (예: `Brand Culture/Brand Culture.html`, `look book/look book.html`)
- 모든 CSS는 각 HTML 파일 내 `<style>` 태그에 포함 (외부 스타일시트 없음)
- 모든 JavaScript는 각 HTML 파일 내 `<script>` 태그에 포함 (외부 스크립트 없음)

### 디자인 패턴

- **다크 테마**: 검정 배경 (`#000`, `#111`), 흰색 텍스트
- **공유 내비게이션**: 각 페이지에 일관된 사이드바 내비게이션과 로고/SNS 링크 (Instagram, 무신사)가 포함된 고정 헤더
- **햄버거 메뉴**: 모든 페이지에 모바일 내비게이션 토글
- **인터랙티브 요소**: 도트 인디케이터가 있는 이미지 슬라이더, 드롭다운 메뉴, localStorage "다시 보지 않기" 기능이 있는 모달
- **Flexbox 레이아웃**으로 반응형 콘텐츠 배치

### 언어

- HTML 주석과 UI 텍스트는 **한국어**
- 코드 식별자 (CSS 클래스, JS 변수)는 영어

## 주요 페이지

| 페이지 | 파일 | 설명 |
|--------|------|------|
| 홈페이지 | `index.html` | 슬라이더, 팝업, 브랜드 링크가 있는 메인 랜딩 |
| 브랜드 컬처 | `Brand Culture/Brand Culture.html` | 영상 콘텐츠가 포함된 브랜드 스토리 |
| 컨셉 아트 | `Concept art/Concept art.html` | 썸네일이 있는 아트 갤러리 |
| 룩북 | `look book/look book.html` | 컬렉션 개요 |
| 모델 | `look book/Model.html` | 모델 사진 갤러리 |
| 큐레이터 | `look book/Curator.html` | 큐레이터 사진 갤러리 |
| 신상품 | `NewTrending/new-arrivals.html` | 최신 제품 |
| 한정판 | `NewTrending/limited-edition.html` | 한정 아이템 |
| 출시 예정 | `NewTrending/Upcoming Collection.html` | 향후 출시 예정 제품 |

## AI 어시스턴트를 위한 중요 사항

- **미디어 파일이 많은 저장소**: 저장소에 대용량 GIF 및 이미지 파일이 포함되어 있습니다 (일부 20MB 이상). 이러한 에셋을 다시 추가하거나 복제하지 마세요.
- **`.gitignore` 없음**: 대용량 미디어를 포함한 모든 파일이 추적됩니다. 변경 사항을 스테이징할 때 주의하세요.
- **빌드/테스트 명령어 없음**: 빌드하거나 테스트할 것이 없습니다. 브라우저에서 HTML 파일을 열어 변경 사항을 검증하세요.
- **모든 것이 인라인**: CSS와 JS는 HTML 파일 내부에 있습니다. 명시적으로 요청하지 않는 한 별도의 `.css` 또는 `.js` 파일을 생성하지 마세요 — 기존 패턴이 깨집니다.
- **공백이 포함된 파일 경로**: 많은 디렉토리와 파일에 공백이 포함되어 있습니다. 셸 명령에서 항상 경로를 따옴표로 감싸세요.
- **페이지 간 일관성**: 내비게이션, 헤더, 푸터 패턴이 페이지 간에 중복됩니다. 공유 UI 요소를 변경할 경우 9개의 HTML 파일 모두에 적용해야 합니다.
- **한국어 콘텐츠**: 사이트 콘텐츠는 한국어입니다. 편집 시 기존 한국어 텍스트를 보존하세요.
