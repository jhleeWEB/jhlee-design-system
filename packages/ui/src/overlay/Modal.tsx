"use client";
import { Dialog } from "radix-ui";
import { LuX } from "react-icons/lu";

import { Button } from "../primitives/Button";

import { cn, type VariantProps } from "../cn";
import { modalVariants } from "./Modal.variants";
import { ScrollArea } from "../navigation/ScrollArea";

/* 모달 — 이 저장소에 손으로 쓴 백드롭이 **다섯 계열** 있었고(#1198 게이트 실측),
 * 앞의 셋은 `z-index`(30/20/21)와 내부 폭만 다른 같은 네 줄이었다. 넷째는 토큰 대신 생 hex 와
 * `box-shadow` 를 써서 base 의 원칙 1 을 어겼고, 다섯째(`.composition-modal`)는 **어느 CSS 에도
 * 정의가 없어** 스크림도 고정 위치도 없이 렌더되고 있었다. 그 다섯이 여기로 모인다.
 *
 * 폭은 `size` 축이 정한다 — 호출처가 `w-[1180px]` 을 직접 적기 시작하면 다섯 계열이 다시 생긴다.
 *
 * 포커스 트랩 · 스크롤 락 · Escape · 포커스 복귀는 Radix 가 맡는다. 이 저장소에는 그중 어느
 * 것도 없었다(`createPortal` 호출 0건, Escape 는 다이얼로그마다 손으로, 갤러리는 아예 없음). */


type ContentProps = Omit<React.ComponentPropsWithRef<typeof Dialog.Content>, "forceMount">;

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

/** 포털의 열림·닫힘 수명은 DS가 소유한다. forceMount로 닫힌 모달의 포커스·스크롤 잠금을 남기지 않는다. */
export interface ModalContentProps
  extends ContentProps,
    VariantProps<typeof modalVariants> {
  /** 스크림을 눌러도 닫히지 않게 한다 — 되돌릴 수 없는 작업의 확인창에 쓴다. */
  dismissible?: boolean;
}

export function ModalContent({
  className,
  size,
  dismissible = true,
  children,
  onPointerDownOutside,
  onInteractOutside,
  ...rest
}: ModalContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        data-slot="modal-scrim"
        className="fixed inset-0 z-scrim bg-scrim animate-in-fade"
      />
      <Dialog.Content
        data-slot="modal"
        className={cn(modalVariants({ size }), className)}
        {...rest}
        // 호출자의 관찰·취소 핸들러는 유지하되 닫기 금지 계약을 덮어쓰지는 못하게 한다.
        onPointerDownOutside={event => {
          onPointerDownOutside?.(event);
          if (!dismissible) event.preventDefault();
        }}
        onInteractOutside={event => {
          onInteractOutside?.(event);
          if (!dismissible) event.preventDefault();
        }}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

/** description을 생략하고 별도 Description도 없으면 ModalContent에 aria-describedby={undefined}를 지정한다. */
export function ModalHeader({
  className,
  title,
  description,
  children,
  ...rest
}: Omit<React.ComponentPropsWithRef<"div">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div
      data-slot="modal-header"
      className={cn(
        "flex shrink-0 items-start gap-4 border-b border-line px-6 py-5",
        className,
      )}
      {...rest}
    >
      <div className="min-w-0 flex-1">
        <Dialog.Title className="m-0 text-title font-semibold leading-snug text-ink">
          {title}
        </Dialog.Title>
        {description ? (
          <Dialog.Description className="mt-1 text-body leading-relaxed text-muted">
            {description}
          </Dialog.Description>
        ) : null}
      </div>
      {children}
      <Dialog.Close asChild>
        <Button data-slot="dialog-close" type="button" variant="ghost" size="icon-sm" aria-label="Close" className="-mr-2 -mt-1 shrink-0 [&_svg]:size-4">
          <LuX size={16} strokeWidth={2} aria-hidden="true" focusable={false} />
        </Button>
      </Dialog.Close>
    </div>
  );
}

/* 본문만 스크롤한다 — 머리와 바닥은 붙어 있어야 긴 목록에서 버튼을 찾아 내려가지 않는다.
 * 본문 div는 유지해 소비자의 grid·gap·자식 선택자가 Radix 내부 래퍼에 끊기지 않게 한다. */
export function ModalBody({ className, onScroll, onScrollCapture, ...rest }: React.ComponentPropsWithRef<"div">) {
  return (
    <ScrollArea className="min-h-0 min-w-0 flex-auto" viewportProps={{ onScroll, onScrollCapture }}>
      <div data-slot="modal-body" className={cn("px-6 py-5", className)} {...rest} />
    </ScrollArea>
  );
}

export function ModalFooter({ className, ...rest }: React.ComponentPropsWithRef<"div">) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-line bg-surface-2 px-6 py-4",
        className,
      )}
      {...rest}
    />
  );
}
