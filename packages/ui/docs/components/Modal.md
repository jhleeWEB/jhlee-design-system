# Modal

`import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTrigger } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Modal

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

모달의 루트 — 열림 상태(`open` · `defaultOpen` · `onOpenChange`)와 모달성만 든다. 자기 DOM 은 없다(Radix `Dialog.Root`).

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### ModalBody

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

본문 — 이것만 스크롤한다. 머리와 바닥은 붙어 있어야 긴 목록에서 버튼을 찾아 내려가지 않는다.
본문 div는 유지해 소비자의 grid·gap·자식 선택자가 Radix 내부 래퍼에 끊기지 않게 한다. `ref` 는 스크롤 뷰포트가 아니라 본문 div 다.

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ModalClose

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

모달을 닫는 버튼 — 푸터의 「Cancel」 처럼 닫기만 하는 동작에 쓴다.

물려받는 props: `DialogCloseProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ModalContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

모달 상자 — 포털 · 스크림 · 포커스 트랩을 함께 그린다. `ModalHeader` · `ModalBody` · `ModalFooter` 를 자식으로 둔다.

물려받는 props: `ContentProps`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full" \| null` |  | `"md"` | 값: `sm` — 확인 대화: 문장 하나와 버튼 둘(380px) · `md` — 폼 모달의 기본(560px) · `lg` — 설정처럼 두 단이 들어가는 것(880px) · `xl` — 표·비교 화면(1180px) · `full` — 뷰포트 여백까지 가득(높이도 채운다) |
| `dismissible` | `boolean` |  | `true` | 스크림을 눌러도 닫히지 않게 하려면 `false` — 되돌릴 수 없는 작업의 확인창에 쓴다. |

### ModalFooter

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

바닥줄 — 동작 버튼을 오른쪽 끝에 모은다. 주된 동작을 맨 오른쪽에 둔다.

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ModalHeader

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

머리줄 — 제목 · 설명 · 닫기 버튼. `children` 은 제목 블록과 닫기 사이에 놓인다.
description을 생략하고 별도 Description도 없으면 ModalContent에 aria-describedby={undefined}를 지정한다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"div">, "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `ReactNode` | 예 |  | 대화상자의 접근성 이름이 되는 제목. |
| `description` | `ReactNode` |  | `undefined` | 제목 아래 한 줄 설명 — 대화상자의 `aria-describedby` 가 된다. |

### ModalTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Modal.tsx`

모달을 여는 버튼. `asChild` 로 DS `Button` 을 트리거로 쓴다.

물려받는 props: `DialogTriggerProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
