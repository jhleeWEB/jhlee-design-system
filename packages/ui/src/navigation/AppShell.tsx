"use client";
import { useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "../cn";
import {
  appShellBodyVariants,
  appShellHandleVariants,
  appShellInspectorVariants,
  appShellMainVariants,
  appShellVariants,
} from "./AppShell.variants";
import { ScrollArea } from "./ScrollArea";
import { ResizableHandle, ResizablePanel, ResizablePanels } from "./ResizablePanels";

/* 작업대 셸 — 상단바 · 왼쪽 사이드바 · 가운데 본문(캔버스) · 오른쪽 인스펙터 · 바닥줄(#60).
 *
 * 3.0.0 이 지운 3열 셸(#49)의 의도를 잇는다: 설계 도구를 쓰는 사람은 왼쪽에서 다이얼을 돌리고, 가운데서 결과를 보고, 오른쪽에서 왜 그렇게 됐는지
 * 캔다. 셋이 동시에 보여야 한 번의 조작이 무엇을 바꿨는지 읽힌다. 달라진 것:
 *  - 옛 셸은 `.app-shell` CSS 와 `DesignSystemProvider` 분기를 들고 있었다. 이것은 토큰 유틸만 쓰는 슬롯 하나다 — 무엇을 넣을지는 앱이 정한다.
 *  - 인스펙터는 ResizablePanels 의 패널이다. `resizable` 이면 손잡이가 생기고, 아니어도 접기(`inspectorOpen`)는 같은 패널이 맡는다.
 *  - 접기 상태는 호출처가 든다 — `usePanelLayout` 의 `isCollapsed` · `setCollapsed` 를 그대로 잇는다(«상태는 한 곳에서 소유한다»).
 *    인스펙터를 접으면 패널이 마운트를 유지한 채 `inert` 가 되고, 포커스가 안에 있었다면 `aria-controls` 로 이 칸을 가리키는 버튼으로 돌아간다.
 *
 * 인스펙터에만 있는 정보를 두지 않는다 — 접히고, 좁은 화면에서는 앱이 숨긴다. 판정은 캔버스 위(HUD)에도 나와야 한다(옛 셸의 같은 주석). */

/** `AppShell` 의 props — `<div>` 속성에 다섯 슬롯과 인스펙터의 열림 · 크기를 더한다. `children` 이 가운데 본문이다. */
export interface AppShellProps extends ComponentProps<"div"> {
  /**
   * 맨 위 줄 — `TopBar` 를 그대로 넣는다.
   * @default undefined
   */
  topBar?: ReactNode;
  /**
   * 왼쪽 칸 — `Sidebar`(레일 · 패널). 폭은 사이드바가 정한다.
   * @default undefined
   */
  sidebar?: ReactNode;
  /**
   * 오른쪽 인스펙터 — 선택한 것의 수치와 판정. 없으면 칸 자체가 없다.
   * @default undefined
   */
  inspector?: ReactNode;
  /**
   * 맨 아래 줄 — 상태 줄 · 규칙 팩 정보.
   * @default undefined
   */
  footer?: ReactNode;
  /**
   * 인스펙터가 열려 있는가(제어). 닫히면 폭이 0 으로 접히고 본문이 `inert` 가 된다.
   * @default true
   */
  inspectorOpen?: boolean;
  /**
   * 인스펙터를 여닫으려 할 때 — 손잡이의 Enter · 더블클릭 · 끌어 접기. 상단바의 토글 버튼은 호출처가 직접 상태를 바꾼다.
   * @default undefined
   */
  onInspectorOpenChange?: (open: boolean) => void;
  /**
   * 인스펙터 칸의 id — 토글 버튼의 `aria-controls` 가 가리킬 자리. 주지 않으면 만들어 쓴다.
   * @default undefined
   */
  inspectorId?: string;
  /**
   * 인스펙터 칸(complementary 랜드마크)의 이름.
   * @default "Inspector"
   */
  inspectorLabel?: string;
  /**
   * 인스펙터 폭을 끌어 바꾼다 — 본문과 인스펙터 사이에 손잡이(separator)가 생긴다.
   * @default false
   */
  resizable?: boolean;
  /**
   * 인스펙터의 처음 폭(px). 없으면 토큰 폭(`--size-inspector`, 340px)이다.
   * @default undefined
   */
  inspectorDefaultSize?: number;
  /**
   * 끌어서 줄일 수 있는 인스펙터 폭의 하한(px). 절반 아래로 끌면 접힌다.
   * @default 0
   */
  inspectorMinSize?: number;
  /**
   * 끌어서 늘릴 수 있는 인스펙터 폭의 상한(px). 없으면 본문이 0 이 될 때까지다.
   * @default undefined
   */
  inspectorMaxSize?: number;
  /**
   * 끌어서 정한 인스펙터 폭을 localStorage 에 남기는 키. 스토리 · 테스트에서는 주지 않는다.
   * @default undefined
   */
  storageKey?: string;
  /**
   * 칸을 가르는 것 — `flush` — 칸이 맞붙고 헤어라인이 가른다(옛 3열 셸) · `inset` — 옅은 바닥 위에 카드가 12px 간격으로 뜬다(참고 화면)
   * @default "flush"
   */
  variant?: "flush" | "inset";
  /**
   * 본문 요소 — `main` — 화면의 주 랜드마크(한 문서에 하나) · `div` — 이미 `<main>` 이 있는 곳(문서 미리보기 · 셸 안의 셸)
   * @default "main"
   */
  mainAs?: "main" | "div";
}

/** 작업대 셸 — 상단바 · 사이드바 · 본문 · 인스펙터(접기 · 선택적 폭 조절) · 바닥줄. */
export function AppShell({
  className,
  topBar,
  sidebar,
  inspector,
  footer,
  inspectorOpen = true,
  onInspectorOpenChange,
  inspectorId,
  inspectorLabel = "Inspector",
  resizable = false,
  inspectorDefaultSize,
  inspectorMinSize,
  inspectorMaxSize,
  storageKey,
  variant,
  mainAs = "main",
  children,
  ...rest
}: AppShellProps) {
  const generated = useId();
  const id = inspectorId ?? `inspector-${generated}`;
  const Main = mainAs;
  return (
    <div
      className={cn(appShellVariants({ variant }), className)}
      {...rest}
      data-slot="app-shell"
      data-variant={variant ?? "flush"}
    >
      {topBar}
      <ResizablePanels
        orientation="horizontal"
        className={appShellBodyVariants({ variant })}
        {...(storageKey === undefined ? {} : { storageKey })}
      >
        {sidebar}
        <Main className={appShellMainVariants({ variant })} data-slot="app-shell-main">
          {children}
        </Main>
        {inspector !== undefined && resizable ? (
          <ResizableHandle
            controls={id}
            label={`Resize ${inspectorLabel.toLowerCase()}`}
            className={appShellHandleVariants({ variant })}
          />
        ) : null}
        {inspector === undefined ? null : (
          <ResizablePanel
            id={id}
            role="complementary"
            aria-label={inspectorLabel}
            collapsible
            collapsed={!inspectorOpen}
            {...(onInspectorOpenChange === undefined
              ? {}
              : { onCollapsedChange: (collapsed: boolean) => onInspectorOpenChange(!collapsed) })}
            {...(inspectorDefaultSize === undefined ? {} : { defaultSize: inspectorDefaultSize })}
            {...(inspectorMinSize === undefined ? {} : { minSize: inspectorMinSize })}
            {...(inspectorMaxSize === undefined ? {} : { maxSize: inspectorMaxSize })}
            className={appShellInspectorVariants({ variant })}
          >
            {/* 인스펙터는 넘치면 DS 스크롤바로 스크롤한다 — 소비자가 `overflow-y-auto` 로 브라우저 기본 막대를 그리던 자리(#87).
                내용은 자연 높이로 두면 된다(h-full · overflow 를 적지 않는다). */}
            <ScrollArea
              orientation="vertical"
              className="h-full"
              viewportProps={{ "data-slot": "app-shell-inspector-viewport" }}
            >
              {inspector}
            </ScrollArea>
          </ResizablePanel>
        )}
      </ResizablePanels>
      {footer}
    </div>
  );
}
