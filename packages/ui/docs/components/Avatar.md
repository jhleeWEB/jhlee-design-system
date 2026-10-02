# Avatar

`import { Avatar, AvatarGroup } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Avatar

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Avatar.tsx`

아바타 — 이미지가 그려지면 이미지, 아니면 이름의 이니셜. 지름은 `size`(묶음 안에서는 `AvatarGroup` 의 것)를 따른다.

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Radix.Root>, "children">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `name` | `string` | 예 |  | 누구인가 — 이미지의 `alt` 이자 폴백(이니셜)의 접근 가능한 이름이다. 이니셜도 여기서 만든다. |
| `src` | `string` |  | `undefined` | 이미지 주소. 없거나 불러오지 못하면 이니셜을 보인다. |
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 24px · 표 칸 · 목록의 한 줄 · `md` — 32px · 머리줄 · 댓글 · `lg` — 40px · 프로필 카드 |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### AvatarGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Avatar.tsx`

아바타 묶음 — 이웃이 겹쳐 선다. `max` 를 넘으면 나머지를 `+N` 원 하나로 접고, 그 원은 «N more» 로 읽힌다.
크기는 묶음이 정하고 안의 아바타가 따른다.

물려받는 props: `React.ComponentPropsWithRef<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `max` | `number` |  | `undefined` | 보일 아바타의 최대 수 — 넘치는 만큼은 `+N` 하나로 접는다. 주지 않으면 전부 보인다. |
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 24px, 4px 겹침 · `md` — 32px, 8px 겹침 · `lg` — 40px, 8px 겹침 |
