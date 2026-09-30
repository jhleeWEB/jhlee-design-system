# ConfirmDialog

`import { ConfirmDialog } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ConfirmDialog

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/AlertDialog.tsx`

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "title" | "children" | "forceMount" | "asChild">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `open` | `boolean` | 예 |  |  |
| `onOpenChange` | `(open: boolean) => void` | 예 |  |  |
| `title` | `ReactNode` | 예 |  |  |
| `description` | `ReactNode` |  |  |  |
| `confirmLabel` | `string` | 예 |  | 실행 버튼의 문구. 「OK」가 아니라 **무슨 일이 일어나는지**를 적는다 — "Delete parcel". |
| `cancelLabel` | `string` |  |  |  |
| `tone` | `ToneInput<ButtonTone> \| null` |  |  | 값: `destructive` · `neutral` · `primary` · `accent` — deprecated alias of "primary" · `current` — deprecated alias of "neutral" · `danger` — deprecated alias of "destructive" · `default` — deprecated alias of "neutral" |
| `busy` | `boolean` |  |  |  |
| `secondaryAction` | `{ label: string; onSelect: () => void; }` |  |  | 세 번째 갈림길. 「저장하지 않고 나간다」처럼 **취소도 실행도 아닌** 결과가 있을 때만 쓴다. 두 갈래로 억지로 접으면 사용자가 원하지 않는 쪽을 고르게 된다 — 저장하지 않고 나가려는 사람에게 「취소」와 「저장」만 주면 취소를 눌러 다시 갇힌다. 미저장 이탈 확인은 세 결과가 표준이고(저장 · 버리기 · 머무르기), 그래서 축을 하나 더 두는 쪽이 옳다. 자리는 취소와 실행 **사이**다. 파괴적인 쪽(버리기)이 실행 버튼에서 멀수록 오폭이 준다. |
| `onConfirm` | `() => void` | 예 |  |  |
| `children` | `ReactNode` |  |  |  |
