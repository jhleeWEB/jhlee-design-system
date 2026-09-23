import { AlertDialog as Radix } from "radix-ui";

import { Button, type ButtonProps } from "../primitives/Button";
import { cn } from "../cn";

/* 확인 대화 — **되돌릴 수 없는 것**에만 쓴다. 그 밖은 `Modal`.
 *
 * `Modal` 과 나눠 둔 이유는 외형이 아니라 행동이다: `AlertDialog` 는 스크림 클릭으로 닫히지 않고,
 * 포커스가 기본으로 취소 쪽에 간다. 저장소에 있던 `role="alertdialog"` 네 자리(필지 삭제 ·
 * 저장 확인 ·닫히지 않은 필지 · 필지 비우기)가 전부 이 경우였다. */
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 실행 버튼의 문구. 「OK」가 아니라 **무슨 일이 일어나는지**를 적는다 — "Delete parcel". */
  confirmLabel: string;
  cancelLabel?: string;
  /** 파괴적이면 `danger`. 기본값이 그것인 이유는 이 컴포넌트의 용도 자체가 그렇기 때문이다. */
  tone?: ButtonProps["tone"];
  busy?: boolean | undefined;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "danger",
  busy,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <Radix.Root open={open} onOpenChange={onOpenChange}>
      <Radix.Portal>
        <Radix.Overlay className="fixed inset-0 z-50 bg-scrim animate-in-fade" />
        <Radix.Content
          data-slot="confirm-dialog"
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(380px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2",
            "rounded-modal border border-line bg-surface shadow-modal",
            "text-body text-ink animate-in-pop focus-visible:outline-none",
          )}
        >
          <div className="px-6 pb-4 pt-5">
            <Radix.Title className="text-title font-semibold leading-snug text-ink">
              {title}
            </Radix.Title>
            {description ? (
              <Radix.Description className="mt-2 leading-relaxed text-muted">
                {description}
              </Radix.Description>
            ) : null}
            {children}
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-line bg-surface-2 px-6 py-4">
            <Radix.Cancel asChild>
              <Button variant="ghost" disabled={busy}>
                {cancelLabel}
              </Button>
            </Radix.Cancel>
            {/* `asChild` 없이 둔다 — Radix.Action 은 누르면 무조건 닫는데, 실패할 수 있는
                작업은 닫지 않고 결과를 보여줘야 한다. 닫기는 호출처가 onOpenChange 로 한다. */}
            <Button tone={tone} variant="solid" loading={busy} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
