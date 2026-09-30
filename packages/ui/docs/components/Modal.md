# Modal

`import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTrigger } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Modal

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### ModalBody

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ModalClose

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

물려받는 props: `DialogCloseProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ModalContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

물려받는 props: `ContentProps`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `dismissible` | `boolean` |  |  | 스크림을 눌러도 닫히지 않게 한다 — 되돌릴 수 없는 작업의 확인창에 쓴다. |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full" \| null` |  | `"md"` | 값: `sm` · `md` · `lg` · `xl` · `full` |

### ModalFooter

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ModalHeader

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

description을 생략하고 별도 Description도 없으면 ModalContent에 aria-describedby={undefined}를 지정한다.

물려받는 props: `Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `ReactNode` | 예 |  |  |
| `description` | `ReactNode` |  |  |  |

### ModalTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

물려받는 props: `DialogTriggerProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
