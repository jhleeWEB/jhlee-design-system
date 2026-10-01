"use client";
import { Dialog } from "radix-ui";

import { SlottedButton } from "../primitives/Button";

import { cn, type VariantProps } from "../cn";
import { IconX } from "../icons/icons";
import { drawerVariants } from "./Drawer.variants";
import { ScrollArea } from "../navigation/ScrollArea";

/* 서랍 — 화면 가장자리에서 들어온다. 모달과 달리 **캔버스를 덜 가린다**.
 * 긴 목록·설정처럼 보면서 캔버스를 참조해야 하는 것에 쓴다. */

/** 서랍의 루트 — 열림 상태와 모달성(`modal={false}` 면 비모달)을 든다. 자기 DOM 은 없다(Radix `Dialog.Root`). */
export const Drawer = Dialog.Root;

/**
 * 서랍을 여는 버튼. `asChild` 로 DS `Button` 을 트리거로 쓴다.
 * @slot dialog-trigger
 */
export function DrawerTrigger({ className, ...rest }: React.ComponentPropsWithRef<typeof Dialog.Trigger>) {
  // data-slot 은 {...rest} 뒤 — 소비자가 넘긴 data-slot 이 DS 의 손잡이를 덮지 못하게 한다(slot-locked, D3 #44).
  return <Dialog.Trigger className={cn(className)} {...rest} data-slot="dialog-trigger" />;
}

/**
 * 서랍을 닫는 버튼.
 * @slot dialog-close
 */
export function DrawerClose({ className, ...rest }: React.ComponentPropsWithRef<typeof Dialog.Close>) {
  return <Dialog.Close className={cn(className)} {...rest} data-slot="dialog-close" />;
}

/** 포털 수명은 DS가 소유한다. 비모달 동작은 Drawer의 modal={false} 한 곳에서 설정한다. */
export interface DrawerContentProps
  extends
    Omit<React.ComponentPropsWithRef<typeof Dialog.Content>, "forceMount">,
    VariantProps<typeof drawerVariants> {
  /**
   * 들어오는 가장자리.
   * - `right` — 오른쪽 전체 높이(기본). 검사·설정 패널
   * - `left` — 왼쪽 전체 높이. 탐색·목록
   * - `bottom` — 아래에서 올라오는 시트. 위 모서리만 둥글다
   * @default "right"
   */
  side?: VariantProps<typeof drawerVariants>["side"];
  /**
   * 크기 — 좌우 서랍은 폭 상한(`--container-drawer-*`), 아래 시트는 높이(`--size-sheet-*` · 70dvh)를 정한다.
   * - `sm` — 좁은 목록(폭 280px · 시트 280px)
   * - `md` — 기본(폭 400px · 시트 460px)
   * - `lg` — 넓은 표·폼(폭 620px · 시트 70dvh)
   * @default "md"
   */
  size?: VariantProps<typeof drawerVariants>["size"];
  /**
   * 모달성은 바꾸지 않고 스크림만 숨긴다. 비모달 Drawer에는 Radix가 스크림을 렌더하지 않는다.
   * @default true
   */
  showOverlay?: boolean;
}

/**
 * 서랍 패널 — 포털 · 스크림 · 포커스 트랩을 함께 그린다. `DrawerHeader` · `DrawerBody` 를 자식으로 둔다.
 * @slot drawer
 */
export function DrawerContent({
  className,
  side,
  size,
  showOverlay = true,
  children,
  ...rest
}: DrawerContentProps) {
  return (
    <Dialog.Portal>
      {showOverlay ? <Dialog.Overlay className="fixed inset-0 z-scrim animate-in-fade bg-scrim" /> : null}
      <Dialog.Content
        className={cn(drawerVariants({ side, size }), className)}
        {...rest}
        data-slot="drawer"
        // cva 축은 해석된 값(기본값 포함)으로 찍는다 — 스토리 격자·소비자 선택자·매니페스트가 같은 이름을 읽는다.
        data-side={side ?? "right"}
        data-size={size ?? "md"}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

/** `DrawerHeader` 의 props — 제목은 필수다(Radix 가 `Dialog.Title` 없는 대화상자를 경고한다). */
export interface DrawerHeaderProps extends Omit<React.ComponentPropsWithRef<"div">, "title"> {
  /** 서랍의 접근성 이름이 되는 제목. */
  title: React.ReactNode;
  /**
   * 제목 아래 한 줄 설명 — 서랍의 `aria-describedby` 가 된다.
   * @default undefined
   */
  description?: React.ReactNode;
}

/**
 * 머리줄 — 제목 · 설명 · 닫기 버튼. `children` 은 제목 블록과 닫기 사이에 놓인다.
 * description을 생략하고 별도 Description도 없으면 DrawerContent에 aria-describedby={undefined}를 지정한다.
 * @slot drawer-header
 */
export function DrawerHeader({ className, title, description, children, ...rest }: DrawerHeaderProps) {
  return (
    <div
      className={cn("flex shrink-0 items-start gap-4 border-b border-border px-6 py-5", className)}
      {...rest}
      data-slot="drawer-header"
    >
      <div className="min-w-0 flex-1">
        <Dialog.Title className="m-0 text-title leading-snug font-semibold text-foreground">
          {title}
        </Dialog.Title>
        {description ? (
          <Dialog.Description className="mt-1 leading-relaxed text-muted-foreground">
            {description}
          </Dialog.Description>
        ) : null}
      </div>
      {/* ModalHeader 와 같은 자리 — 제목 블록과 닫기 사이. 예전에는 children 을 구조분해하지 않아 `...rest` 에 섞여
          div 의 prop 으로 갔는데, JSX 의 명시적 자식이 그 prop 을 덮어 소비자 children 이 조용히 사라졌다(#10). */}
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
 * 본문 — 이것만 스크롤한다. `ref` 는 스크롤 뷰포트가 아니라 본문 div 다.
 * @slot drawer-body
 */
export function DrawerBody({
  className,
  onScroll,
  onScrollCapture,
  ...rest
}: React.ComponentPropsWithRef<"div">) {
  return (
    <ScrollArea className="min-h-0 min-w-0 flex-auto" viewportProps={{ onScroll, onScrollCapture }}>
      <div className={cn("px-6 py-5", className)} {...rest} data-slot="drawer-body" />
    </ScrollArea>
  );
}
