# ConfirmDialog

`import { ConfirmDialog } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ConfirmDialog

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/AlertDialog.tsx`

확인 대화 — 되돌릴 수 없는 동작 앞에서 묻는다. 스크림으로 닫히지 않고 첫 포커스는 취소다.

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "title" | "children" | "forceMount" | "asChild">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `open` | `boolean` | 예 |  | 열림 — 확인 대화는 언제나 제어 모드다(호출처가 실행 결과를 보고 닫는다). |
| `onOpenChange` | `(open: boolean) => void` | 예 |  | 열림이 바뀔 때 — 취소 · Escape 가 `false` 로 부른다. 실행 버튼은 부르지 않는다. |
| `title` | `ReactNode` | 예 |  | 질문 — 대화상자의 접근성 이름. "Delete this layer?" |
| `description` | `ReactNode` |  | `undefined` | 결과 설명 — 무엇이 사라지고 되돌릴 수 있는지. 있으면 `aria-describedby` 로 연결된다. |
| `confirmLabel` | `string` | 예 |  | 실행 버튼의 문구. 「OK」가 아니라 **무슨 일이 일어나는지**를 적는다 — "Delete layer". |
| `cancelLabel` | `string` |  | `"Cancel"` | 취소 버튼의 문구 — 포커스가 처음 가는 자리다. |
| `tone` | `ButtonTone \| null` |  | `"destructive"` | 값: `destructive` — 되돌릴 수 없는 실행(기본) · `neutral` — 강조 없는 실행 · `primary` — 되돌릴 수 없지만 파괴적이지 않은 실행(발행 · 제출) |
| `busy` | `boolean` |  | `false` | 실행 중 — 실행 버튼이 스피너를 달고 두 버튼이 잠긴다. 대화는 열린 채로 남는다. |
| `secondaryAction` | `{ label: string; onSelect: () => void; }` |  | `undefined` | 세 번째 갈림길. 「저장하지 않고 나간다」처럼 **취소도 실행도 아닌** 결과가 있을 때만 쓴다. 두 갈래로 억지로 접으면 사용자가 원하지 않는 쪽을 고르게 된다 — 저장하지 않고 나가려는 사람에게 「취소」와 「저장」만 주면 취소를 눌러 다시 갇힌다. 미저장 이탈 확인은 세 결과가 표준이고(저장 · 버리기 · 머무르기), 그래서 축을 하나 더 두는 쪽이 옳다. 자리는 취소와 실행 **사이**다. 파괴적인 쪽(버리기)이 실행 버튼에서 멀수록 오폭이 준다. |
| `onConfirm` | `() => void` | 예 |  | 실행 버튼을 눌렀을 때 — 닫기는 하지 않는다. 성공하면 호출처가 `onOpenChange(false)` 로 닫는다. |
| `children` | `ReactNode` |  | `undefined` | 설명 아래에 덧붙는 내용 — 지워질 항목 목록처럼. |
