"use client";
import { Dialog } from "radix-ui";

import { SlottedButton } from "../primitives/Button";

import { cn, type VariantProps } from "../cn";
import { IconX } from "../icons/icons";
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

/** 모달의 루트 — 열림 상태(`open` · `defaultOpen` · `onOpenChange`)와 모달성만 든다. 자기 DOM 은 없다(Radix `Dialog.Root`). */
export const Modal = Dialog.Root;

/**
 * 모달을 여는 버튼. `asChild` 로 DS `Button` 을 트리거로 쓴다.
 * @slot dialog-trigger
 */
export function ModalTrigger({ className, ...rest }: React.ComponentPropsWithRef<typeof Dialog.Trigger>) {
  // data-slot 은 {...rest} 뒤 — 소비자가 넘긴 data-slot 이 DS 의 손잡이를 덮지 못하게 한다(slot-locked, D3 #44).
  return <Dialog.Trigger className={cn(className)} {...rest} data-slot="dialog-trigger" />;
}

/**
 * 모달을 닫는 버튼 — 푸터의 「Cancel」 처럼 닫기만 하는 동작에 쓴다.
 * @slot dialog-close
 */
export function ModalClose({ className, ...rest }: React.ComponentPropsWithRef<typeof Dialog.Close>) {
  return <Dialog.Close className={cn(className)} {...rest} data-slot="dialog-close" />;
}

/** 포털의 열림·닫힘 수명은 DS가 소유한다. forceMount로 닫힌 모달의 포커스·스크롤 잠금을 남기지 않는다. */
export interface ModalContentProps extends ContentProps, VariantProps<typeof modalVariants> {
  /**
   * 폭 — 뷰포트 여백 안의 유동 폭에 상한(`--container-dialog-*`)을 건다.
   * - `sm` — 확인 대화: 문장 하나와 버튼 둘(380px)
   * - `md` — 폼 모달의 기본(560px)
   * - `lg` — 설정처럼 두 단이 들어가는 것(880px)
   * - `xl` — 표·비교 화면(1180px)
   * - `full` — 뷰포트 여백까지 가득(높이도 채운다)
   * @default "md"
   */
  size?: VariantProps<typeof modalVariants>["size"];
  /**
   * 스크림을 눌러도 닫히지 않게 하려면 `false` — 되돌릴 수 없는 작업의 확인창에 쓴다.
   * @default true
   */
  dismissible?: boolean;
}

/**
 * 모달 상자 — 포털 · 스크림 · 포커스 트랩을 함께 그린다. `ModalHeader` · `ModalBody` · `ModalFooter` 를 자식으로 둔다.
 * @slot modal
 */
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
      <Dialog.Overlay data-slot="modal-scrim" className="fixed inset-0 z-scrim animate-in-fade bg-scrim" />
      <Dialog.Content
        className={cn(modalVariants({ size }), className)}
        {...rest}
        data-slot="modal"
        // cva 축은 해석된 값(기본값 포함)으로 찍는다 — 스토리 격자·소비자 선택자·매니페스트가 같은 이름을 읽는다.
        data-size={size ?? "md"}
        // 호출자의 관찰·취소 핸들러는 유지하되 닫기 금지 계약을 덮어쓰지는 못하게 한다.
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event);
          if (!dismissible) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          if (!dismissible) event.preventDefault();
        }}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

/** `ModalHeader` 의 props — 제목은 필수다(Radix 가 `Dialog.Title` 없는 대화상자를 경고한다). */
export interface ModalHeaderProps extends Omit<React.ComponentPropsWithRef<"div">, "title"> {
  /** 대화상자의 접근성 이름이 되는 제목. */
  title: React.ReactNode;
  /**
   * 제목 아래 한 줄 설명 — 대화상자의 `aria-describedby` 가 된다.
   * @default undefined
   */
  description?: React.ReactNode;
}

/**
 * 머리줄 — 제목 · 설명 · 닫기 버튼. `children` 은 제목 블록과 닫기 사이에 놓인다.
 * description을 생략하고 별도 Description도 없으면 ModalContent에 aria-describedby={undefined}를 지정한다.
 * @slot modal-header
 */
export function ModalHeader({ className, title, description, children, ...rest }: ModalHeaderProps) {
  return (
    <div
      className={cn("flex shrink-0 items-start gap-4 border-b border-border px-6 py-5", className)}
      {...rest}
      data-slot="modal-header"
    >
      <div className="min-w-0 flex-1">
        <Dialog.Title className="m-0 text-title font-semibold text-foreground">{title}</Dialog.Title>
        {description ? (
          <Dialog.Description className="mt-1 text-body text-muted-foreground">
            {description}
          </Dialog.Description>
        ) : null}
      </div>
      {children}
      <Dialog.Close asChild>
        <SlottedButton
          slot="dialog-close"
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close"
          className="-mt-1 -mr-2 shrink-0 [&_svg]:size-4"
        >
          {/* 크기·굵기는 적지 않는다 — 버튼의 `[&_svg]:size-4`(16px) 가 16 기본 속성을 이기고, 아이콘 기본 획이 2 다(jsx-size-number 0). */}
          <IconX />
        </SlottedButton>
      </Dialog.Close>
    </div>
  );
}

/**
 * 본문 — 이것만 스크롤한다. 머리와 바닥은 붙어 있어야 긴 목록에서 버튼을 찾아 내려가지 않는다.
 * 본문 div는 유지해 소비자의 grid·gap·자식 선택자가 Radix 내부 래퍼에 끊기지 않게 한다. `ref` 는 스크롤 뷰포트가 아니라 본문 div 다.
 * @slot modal-body
 */
export function ModalBody({
  className,
  onScroll,
  onScrollCapture,
  ...rest
}: React.ComponentPropsWithRef<"div">) {
  return (
    <ScrollArea className="min-h-0 min-w-0 flex-auto" viewportProps={{ onScroll, onScrollCapture }}>
      <div className={cn("px-6 py-5", className)} {...rest} data-slot="modal-body" />
    </ScrollArea>
  );
}

/**
 * 바닥줄 — 동작 버튼을 오른쪽 끝에 모은다. 주된 동작을 맨 오른쪽에 둔다.
 * @slot modal-footer
 */
export function ModalFooter({ className, ...rest }: React.ComponentPropsWithRef<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border bg-muted px-6 py-4",
        className,
      )}
      {...rest}
      data-slot="modal-footer"
    />
  );
}
