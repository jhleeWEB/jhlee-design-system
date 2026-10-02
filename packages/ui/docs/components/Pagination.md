# Pagination

`import { Pagination, PaginationLink } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Pagination

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Pagination.tsx`

페이지 나눔 — 이전 · 쪽 번호(생략 포함) · 다음. `nav` 랜드마크이고 지금 쪽에 `aria-current="page"` 가 선다.
같은 화면 목록은 `onPageChange`(버튼), 주소가 있는 목록은 `renderLink`(링크)로 쓴다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"nav">, "children">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `page` | `number` | 예 |  | 지금 쪽(1 부터). 상태는 부르는 쪽이 든다 — `onPageChange` 에서 바꿔 다시 넘긴다. |
| `pageCount` | `number` | 예 |  | 전체 쪽 수. 1 보다 작으면 1 로 본다. |
| `onPageChange` | `((page: number) => void)` |  | `undefined` | 쪽을 옮길 때 — 새 쪽 번호. 링크 모드(`renderLink`)에서도 누를 때 함께 불린다. |
| `siblingCount` | `number` |  | `1` | 지금 쪽 양옆에 늘 보일 이웃 쪽 수 — 그 밖은 첫 쪽 · 끝 쪽만 남기고 생략(…)한다. |
| `renderLink` | `((page: number, children: ReactNode) => ReactElement<unknown, string \| JSXElementConstructor<any>>)` |  | `undefined` | 쪽마다 칸을 얹을 링크 요소 — `(page, children) => <a href={`?page=${page}`}>{children}</a>` 나 라우터의 `<Link>`. `children`(번호 · 이전 · 다음)을 그대로 넣는다. 모양 · `aria-current` · 이름은 칸이 얹는다. 주지 않으면 칸은 `<button>` 이다. |
| `size` | `"sm" \| "md" \| null` |  | `"md"` | 값: `sm` — 작은 컨트롤 높이. 표 아래 · 패널 안 · `md` — 기본 컨트롤 높이. 페이지 아래 |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### PaginationLink

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Pagination.tsx`

페이지 칸 하나 — 번호 · 이전 · 다음이 같은 모양이다. 기본은 `<button>`, `asChild` 면 자식 링크에 얹힌다. 크기는 감싼 `Pagination` 의 `size` 를 따른다.
`Pagination` 이 칸을 다 그리므로 직접 쓸 일은 쪽 줄을 손으로 짤 때뿐이다.

물려받는 props: `React.ComponentPropsWithRef<"button">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `asChild` | `boolean` |  | `false` | 칸을 자식 요소(`<a href>` · 라우터 `<Link>`)에 얹는다 — 모양 · `aria-current` · 핸들러가 그 요소로 간다. |
| `isActive` | `boolean` |  | `false` | 지금 쪽 — `aria-current="page"` 를 달고 주색으로 선다. |
