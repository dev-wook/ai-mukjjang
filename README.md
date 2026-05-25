# 먹짱

먹짱은 네이버 블로그 후기를 AI로 분석해 맛집 선택을 도와주는 웹 앱입니다.  
광고성 표현, 협찬 의심 신호, 실제 방문 후기의 구체성을 함께 살펴보고 믿고 가볼 만한 맛집 후보를 정리합니다.

## 주요 기능

- 지역/메뉴 키워드 기반 맛집 검색
- 네이버 블로그 후기 수집 및 본문 크롤링
- Gemini 기반 후기 신뢰도 분석
- 광고성 문구, 협찬 의심, 내돈내산 가능성 분류
- 대표 메뉴, 후기 요약, 방문 전 참고 포인트 제공
- Gemini API가 없을 때도 확인 가능한 mock 분석 모드 지원

## 사용 흐름

1. `영등포 맛집`, `성수 삼겹살`처럼 지역과 메뉴를 입력합니다.
2. 먹짱이 관련 블로그 후기를 수집하고 본문을 확인합니다.
3. AI가 후기의 신뢰도와 광고성 신호를 분석합니다.
4. 맛집 후보, 대표 메뉴, 후기 특징, 참고할 점을 카드 형태로 보여줍니다.

## 기술 스택

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Gemini API
- Naver Search API
- Cheerio

## 실행 방법

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 환경 변수

`.env.example`을 참고해 `.env.local`을 설정합니다.

```bash
GEMINI_API_KEY=
GEMINI_TEXT_MODEL=gemini-3.5-flash
GEMINI_FALLBACK_TEXT_MODEL=gemini-2.5-flash
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
BLOG_SEARCH_LIMIT=10
```

`GEMINI_API_KEY`가 없으면 실제 AI 분석 대신 mock 분석 결과로 동작합니다.
