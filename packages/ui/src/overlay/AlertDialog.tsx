"use client";
import { useId } from "react";
import { AlertDialog as Radix } from "radix-ui";

import { Button, type ButtonProps } from "../primitives/Button";
import { cn } from "../cn";
import { ModalBody, ModalFooter } from "./Modal";

/* 확인 대화 — **되돌릴 수 없는 것**에만 쓴다. 그 밖은 `Modal`.
 *
 * `Modal` 과 나눠 둔 이유는 외형이 아니라 행동이다: `AlertDialog` 는 스크림 클릭으로 닫히지 않고,
 * 포커스가 기본으로 취소 쪽에 간다. 원 저장소에 있던 `role="alertdialog"` 네 자리(삭제 ·
 * 저장 확인 · 닫히지 않은 편집 · 비우기)가 전부 이 경우였다. */

/** `ConfirmDialog` 의 props — `className` · `ref` · 나머지 속성은 대화상자 상자(`AlertDialog.Content`)에 닿는다. */
export interface ConfirmDialogProps extends Omit<
  React.ComponentPropsWithRef<typeof Radix.Content>,
  "title" | "children" | "forceMount" | "asChild"
> {
  /** 열림 — 확인 대화는 언제나 제어 모드다(호출처가 실행 결과를 보고 닫는다). */
  open: boolean;
  /** 열림이 바뀔 때 — 취소 · Escape 가 `false` 로 부른다. 실행 버튼은 부르지 않는다. */
  onOpenChange: (open: boolean) => void;
  /** 질문 — 대화상자의 접근성 이름. "Delete this layer?" */
  title: React.ReactNode;
  /**
   * 결과 설명 — 무엇이 사라지고 되돌릴 수 있는지. 있으면 `aria-describedby` 로 연결된다.
   * @default undefined
   */
  description?: React.ReactNode;
  /** 실행 버튼의 문구. 「OK」가 아니라 **무슨 일이 일어나는지**를 적는다 — "Delete layer". */
  confirmLabel: string;
  /**
   * 취소 버튼의 문구 — 포커스가 처음 가는 자리다.
   * @default "Cancel"
   */
  cancelLabel?: string;
  /**
   * 실행 버튼의 톤. 기본값이 `destructive` 인 이유는 이 컴포넌트의 용도 자체가 그렇기 때문이다.
   * - `destructive` — 되돌릴 수 없는 실행(기본)
   * - `primary` — 되돌릴 수 없지만 파괴적이지 않은 실행(발행 · 제출)
   * - `neutral` — 강조 없는 실행
   * @default "destructive"
   */
  tone?: ButtonProps["tone"];
  /**
   * 실행 중 — 실행 버튼이 스피너를 달고 두 버튼이 잠긴다. 대화는 열린 채로 남는다.
   * @default false
   */
  busy?: boolean | undefined;
  /**
   * 세 번째 갈림길. 「저장하지 않고 나간다」처럼 **취소도 실행도 아닌** 결과가 있을 때만 쓴다.
   *
   * 두 갈래로 억지로 접으면 사용자가 원하지 않는 쪽을 고르게 된다 — 저장하지 않고 나가려는
   * 사람에게 「취소」와 「저장」만 주면 취소를 눌러 다시 갇힌다. 미저장 이탈 확인은 세 결과가
   * 표준이고(저장 · 버리기 · 머무르기), 그래서 축을 하나 더 두는 쪽이 옳다.
   *
   * 자리는 취소와 실행 **사이**다. 파괴적인 쪽(버리기)이 실행 버튼에서 멀수록 오폭이 준다.
   * @default undefined
   */
  secondaryAction?: { label: string; onSelect: () => void } | undefined;
  /** 실행 버튼을 눌렀을 때 — 닫기는 하지 않는다. 성공하면 호출처가 `onOpenChange(false)` 로 닫는다. */
  onConfirm: () => void;
  /**
   * 설명 아래에 덧붙는 내용 — 지워질 항목 목록처럼.
   * @default undefined
   */
  children?: React.ReactNode;
}

/**
 * 확인 대화 — 되돌릴 수 없는 동작 앞에서 묻는다. 스크림으로 닫히지 않고 첫 포커스는 취소다.
 * @slot confirm-dialog
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "destructive",
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
        <Radix.Overlay className="fixed inset-0 z-scrim animate-in-fade bg-scrim" />
        <Radix.Content
          // 설명을 소유하므로 없는 ID를 만들지 않는다. 호출자가 지정한 ARIA 연결은 그대로 우선한다.
          aria-describedby={description ? descriptionId : undefined}
          {...contentProps}
          data-slot="confirm-dialog"
          className={cn(
            "fixed top-1/2 left-1/2 z-modal -translate-x-1/2 -translate-y-1/2",
            "flex max-h-dialog-fluid flex-col overflow-hidden [overflow-wrap:anywhere]",
            // 세 갈래 확인은 일반 모달 폭을 쓰고, 좁은 화면의 줄바꿈은 공용 바닥이 맡는다. 유동 폭 + 상한 = 옛 min(폭, 100vw-24px).
            "w-dialog-fluid",
            secondaryAction ? "max-w-dialog-md" : "max-w-dialog-sm",
            "rounded-xl border border-border bg-card shadow-modal",
            "animate-in-pop text-body text-foreground focus-visible:outline-none",
            className,
          )}
        >
          <ModalBody className="pt-5 pb-4">
            <Radix.Title className="text-title leading-snug font-semibold text-foreground">
              {title}
            </Radix.Title>
            {description ? (
              <Radix.Description id={descriptionId} className="mt-2 leading-relaxed text-muted-foreground">
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
