"use client";
import { createContext, useContext } from "react";
import { Tabs as Radix } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { tabsListVariants, tabsTriggerVariants } from "./Tabs.variants";

/* 탭 — **보이는 패널을 바꾼다**(tablist · tab · tabpanel). 값 하나를 고르는 것은 `SegmentedControl`(radiogroup)이다.
 * 둘이 같은 트랙 모양(`variant="segmented"`)을 쓰는 것은 의도다 — 눈에는 같은 «전환» 이고, 스크린리더에는 다른 의미로 읽힌다.
 *
 * 레거시 `Tabs`(src/legacy/shell.tsx)는 `options` 배열을 받아 탭 줄만 그렸고 패널 연결(aria-controls · tabpanel)이 없었다.
 * 여기서는 Radix Tabs 로 목록 · 칸 · 패널을 합성한다 — roving tabindex · 화살표 · Home/End · 자동/수동 활성화는 Radix 의 것이다(#47).
 *
 * 부품마다 `data-slot` 을 `{...rest}` **뒤**에 둔다(slot-locked, D3 #44). */

type TabsVariant = NonNullable<VariantProps<typeof tabsListVariants>["variant"]>;

/* 칸의 모양은 목록이 정한다 — 칸마다 variant 를 적게 두면 한 줄 안에서 모양이 갈린다. */
const TabsVariantContext = createContext<TabsVariant>("segmented");

/**
 * 탭의 루트 — 값(`value` · `defaultValue` · `onValueChange`)과 방향(`orientation`) · 활성화 방식(`activationMode`)을 든다.
 * @slot tabs
 */
export function Tabs({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Root>) {
  return (
    <Radix.Root
      className={cn("flex flex-col gap-4 data-[orientation=vertical]:flex-row", className)}
      {...rest}
      data-slot="tabs"
    />
  );
}

/** `TabsList` 의 props — Radix `Tabs.List` 속성(ref 포함) + `variant`. */
export interface TabsListProps
  extends React.ComponentPropsWithRef<typeof Radix.List>, VariantProps<typeof tabsListVariants> {}

/**
 * 탭 칸의 줄 — `variant` 가 줄과 그 안의 칸 모양을 함께 정한다. 스크린리더가 읽을 이름을 `aria-label` 로 준다.
 * @slot tabs-list
 */
export function TabsList({ className, variant, ...rest }: TabsListProps) {
  const resolved: TabsVariant = variant ?? "segmented";
  return (
    <TabsVariantContext.Provider value={resolved}>
      <Radix.List
        className={cn(tabsListVariants({ variant: resolved }), className)}
        {...rest}
        data-slot="tabs-list"
        // `satisfies` — 문자열 축이지 불리언이 아니다(boolean-string-data-attr 래칫이 식별자 하나짜리 값을 불리언으로 의심한다).
        data-variant={resolved satisfies TabsVariant}
      />
    </TabsVariantContext.Provider>
  );
}

/**
 * 탭 한 칸 — `value` 가 같은 `TabsContent` 를 보인다. 모양은 감싼 `TabsList` 의 `variant` 를 따른다.
 * @slot tabs-trigger
 */
export function TabsTrigger({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Trigger>) {
  const variant = useContext(TabsVariantContext);
  return (
    <Radix.Trigger
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...rest}
      data-slot="tabs-trigger"
      data-variant={variant satisfies TabsVariant}
    />
  );
}

/**
 * 탭 패널 — `value` 가 활성 칸과 같을 때만 보인다. 키보드로 패널에 들어올 수 있게 포커스 링을 둔다.
 * @slot tabs-content
 */
export function TabsContent({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Content>) {
  return (
    <Radix.Content
      className={cn("min-w-0 flex-1 focus-visible:focus-ring focus-visible:outline-none", className)}
      {...rest}
      data-slot="tabs-content"
    />
  );
}
