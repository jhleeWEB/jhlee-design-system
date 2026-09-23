import { Dialog } from "radix-ui";

import { cn, cva, type VariantProps } from "../cn";

/* 모달 — 이 저장소에 손으로 쓴 백드롭이 **다섯 계열** 있었고(#1198 게이트 실측),
 * 앞의 셋은 `z-index`(30/20/21)와 내부 폭만 다른 같은 네 줄이었다. 넷째는 토큰 대신 생 hex 와
 * `box-shadow` 를 써서 base 의 원칙 1 을 어겼고, 다섯째(`.composition-modal`)는 **어느 CSS 에도
 * 정의가 없어** 스크림도 고정 위치도 없이 렌더되고 있었다. 그 다섯이 여기로 모인다.
 *
 * 폭은 `size` 축이 정한다 — 호출처가 `w-[1180px]` 을 직접 적기 시작하면 다섯 계열이 다시 생긴다.
 *
 * 포커스 트랩 · 스크롤 락 · Escape · 포커스 복귀는 Radix 가 맡는다. 이 저장소에는 그중 어느
 * 것도 없었다(`createPortal` 호출 0건, Escape 는 다이얼로그마다 손으로, 갤러리는 아예 없음). */

const contentVariants = cva(
  [
    "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
    "flex max-h-[calc(100dvh-32px)] flex-col overflow-hidden",
    "rounded-modal border border-line bg-surface shadow-modal",
    "text-body text-ink animate-in-pop",
    "focus-visible:outline-none",
  ],
  {
    variants: {
      size: {
        /* 확인 대화 — 문장 하나와 버튼 둘. 이 저장소의 `.confirm` 이 380px 였다. */
        sm: "w-[min(380px,calc(100vw-24px))]",
        md: "w-[min(560px,calc(100vw-24px))]",
        /* 설정 — `.setup` 이 1240px 였다. */
        lg: "w-[min(880px,calc(100vw-24px))]",
        /* 갤러리처럼 화면을 거의 채우는 것. `.gallery` 가 1180px 였다. */
        xl: "w-[min(1180px,calc(100vw-24px))]",
        full: "h-[calc(100dvh-32px)] w-[calc(100vw-24px)]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/* 스크림 클릭·바깥 상호작용으로 닫히지 않게 한다. Radix 의 prop 은 필수 시그니처라
   `undefined` 를 넘길 수 없어, «끄는» 대신 **prop 자체를 빼는** 모양이어야 한다. */
type ContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content>;
const DISMISS_GUARD: Pick<ContentProps, "onPointerDownOutside" | "onInteractOutside"> = {
  onPointerDownOutside: event => event.preventDefault(),
  onInteractOutside: event => event.preventDefault(),
};

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

export interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Content>,
    VariantProps<typeof contentVariants> {
  /** 스크림을 눌러도 닫히지 않게 한다 — 되돌릴 수 없는 작업의 확인창에 쓴다. */
  dismissible?: boolean;
}

export function ModalContent({
  className,
  size,
  dismissible = true,
  children,
  ...rest
}: ModalContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        data-slot="modal-scrim"
        className="fixed inset-0 z-50 bg-scrim animate-in-fade"
      />
      <Dialog.Content
        data-slot="modal"
        className={cn(contentVariants({ size }), className)}
        {...(dismissible ? {} : DISMISS_GUARD)}
        {...rest}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function ModalHeader({
  className,
  title,
  description,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
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
        <Dialog.Title className="text-title font-semibold leading-snug text-ink">
          {title}
        </Dialog.Title>
        {description ? (
          <Dialog.Description className="mt-1 text-body leading-relaxed text-muted">
            {description}
          </Dialog.Description>
        ) : null}
      </div>
      {children}
      <Dialog.Close
        aria-label="Close"
        className="appearance-none border-0 bg-transparent p-0 font-inherit text-inherit -mr-2 -mt-1 shrink-0 cursor-pointer rounded-control p-2 text-muted hover:bg-surface-2 hover:text-ink focus-visible:focus-ring focus-visible:outline-none"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-7">
          <path
            d="M4.4 4.4l7.2 7.2M11.6 4.4l-7.2 7.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </Dialog.Close>
    </div>
  );
}

/* 본문만 스크롤한다 — 머리와 바닥은 붙어 있어야 긴 목록에서 버튼을 찾아 내려가지 않는다. */
export function ModalBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="modal-body"
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5", className)}
      {...rest}
    />
  );
}

export function ModalFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
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
