import { useId } from "react";
import { AlertDialog as Radix } from "radix-ui";

import { Button, type ButtonProps } from "../primitives/Button";
import { cn } from "../cn";
import { ModalBody, ModalFooter } from "./Modal";

/* 확인 대화 — **되돌릴 수 없는 것**에만 쓴다. 그 밖은 `Modal`.
 *
 * `Modal` 과 나눠 둔 이유는 외형이 아니라 행동이다: `AlertDialog` 는 스크림 클릭으로 닫히지 않고,
 * 포커스가 기본으로 취소 쪽에 간다. 저장소에 있던 `role="alertdialog"` 네 자리(필지 삭제 ·
 * 저장 확인 ·닫히지 않은 필지 · 필지 비우기)가 전부 이 경우였다. */
export interface ConfirmDialogProps extends Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "title" | "children" | "forceMount" | "asChild"> {
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
  /**
   * 세 번째 갈림길. 「저장하지 않고 나간다」처럼 **취소도 실행도 아닌** 결과가 있을 때만 쓴다.
   *
   * 두 갈래로 억지로 접으면 사용자가 원하지 않는 쪽을 고르게 된다 — 저장하지 않고 나가려는
   * 사람에게 「취소」와 「저장」만 주면 취소를 눌러 다시 갇힌다. 미저장 이탈 확인은 세 결과가
   * 표준이고(저장 · 버리기 · 머무르기), 그래서 축을 하나 더 두는 쪽이 옳다.
   *
   * 자리는 취소와 실행 **사이**다. 파괴적인 쪽(버리기)이 실행 버튼에서 멀수록 오폭이 준다.
   */
  secondaryAction?: { label: string; onSelect: () => void } | undefined;
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
  secondaryAction,
  onConfirm,
  children,
  className,
  ...contentProps
}: ConfirmDialogProps) {
  const descriptionId = useId();
  return (
    <Radix.Root open={open} onOpenChange={onOpenChange}>
      <Radix.Portal>
        <Radix.Overlay className="fixed inset-0 z-50 bg-scrim animate-in-fade" />
        <Radix.Content
          // 설명을 소유하므로 없는 ID를 만들지 않는다. 호출자가 지정한 ARIA 연결은 그대로 우선한다.
          aria-describedby={description ? descriptionId : undefined}
          {...contentProps}
          data-slot="confirm-dialog"
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "flex max-h-[calc(100dvh-32px)] flex-col overflow-hidden [overflow-wrap:anywhere]",
            // 세 갈래 확인은 일반 모달 폭을 쓰고, 좁은 화면의 줄바꿈은 공용 바닥이 맡는다.
            secondaryAction ? "w-[min(560px,calc(100vw-24px))]" : "w-[min(380px,calc(100vw-24px))]",
            "rounded-modal border border-line bg-surface shadow-modal",
            "text-body text-ink animate-in-pop focus-visible:outline-none",
            className,
          )}
        >
          <ModalBody className="pb-4 pt-5">
            <Radix.Title className="text-title font-semibold leading-snug text-ink">
              {title}
            </Radix.Title>
            {description ? (
              <Radix.Description id={descriptionId} className="mt-2 leading-relaxed text-muted">
                {description}
              </Radix.Description>
            ) : null}
            {children}
          </ModalBody>
          <ModalFooter>
            <Radix.Cancel asChild>
              <Button variant="ghost" disabled={busy}>
                {cancelLabel}
              </Button>
            </Radix.Cancel>
            {secondaryAction ? (
              <Button variant="outline" disabled={busy} onClick={secondaryAction.onSelect}>
                {secondaryAction.label}
              </Button>
            ) : null}
            {/* `asChild` 없이 둔다 — Radix.Action 은 누르면 무조건 닫는데, 실패할 수 있는
                작업은 닫지 않고 결과를 보여줘야 한다. 닫기는 호출처가 onOpenChange 로 한다. */}
            <Button tone={tone} variant="solid" loading={busy} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </ModalFooter>
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
