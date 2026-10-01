"use client";
import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Collapsible as Radix } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { useMergedRef } from "../lib/merge-ref";
import { collapsibleTriggerVariants } from "./Collapsible.variants";

/* 접기 — 구획 **하나**를 여닫는다. 여럿을 묶어 «하나만 열기» 가 필요하면 `Accordion` 이다(#61).
 *
 * 본문 계약은 Accordion 과 같다: 접혀도 DOM 에 남아(`forceMount`) 입력 초안·스크롤이 보존되고, 접힌 동안 `inert` · `aria-hidden` 으로
 * 입력을 막으며, 접힐 때 본문 안의 포커스를 트리거로 돌려보낸다. 조건부 렌더링으로 지우면 사용자 초안이 사라진다(design-system-patterns «상태는 한 곳»).
 * 접기 모션도 Accordion 의 것(`.ds-accordion-motion` — grid-rows 1fr↔0fr · `--motion-collapse-*`)을 그대로 쓴다 — 한 화면의 두 접기가 같은 박자로 움직인다.
 *
 * 부품마다 `data-slot` 을 `{...rest}` **뒤**에 둔다(slot-locked, D3 #44). */

interface CollapsibleState {
  readonly open: boolean;
  readonly trigger: React.RefObject<HTMLButtonElement | null>;
}

const CollapsibleContext = createContext<CollapsibleState | null>(null);

function useCollapsibleState(part: string): CollapsibleState {
  const state = useContext(CollapsibleContext);
  if (!state) throw new Error(`${part} 은 <Collapsible> 안에서만 쓴다`);
  return state;
}

/** `Collapsible` 의 props — Radix `Collapsible.Root` 속성(ref 포함). 제어(`open` · `onOpenChange`)·비제어(`defaultOpen`) 모두 받는다. */
export type CollapsibleProps = React.ComponentPropsWithRef<typeof Radix.Root>;

/**
 * 접기의 루트 — 열림 상태를 들고 `CollapsibleTrigger` · `CollapsibleContent` 를 담는다.
 * @slot collapsible
 */
export function Collapsible(props: CollapsibleProps) {
  // onOpenChange 는 Radix 타입에서 메서드 시그니처라 구조 분해하면 unbound-method 다 — props 에서 부른다(rest 의 것은 아래 핸들러가 덮는다).
  const { className, open, defaultOpen = false, ...rest } = props;
  // 열림의 정본은 제어 prop 또는 이 한 상태뿐이다 — Radix 에도 같은 값을 넘겨 본문의 inert 와 Radix 의 data-state 가 다른 값을 읽지 않게 한다(Accordion 과 같은 이유).
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const current = open ?? uncontrolled;
  const trigger = useRef<HTMLButtonElement>(null);
  const state = useMemo<CollapsibleState>(() => ({ open: current, trigger }), [current]);
  return (
    <CollapsibleContext.Provider value={state}>
      <Radix.Root
        className={cn("min-w-0", className)}
        {...rest}
        open={current}
        onOpenChange={(next) => {
          if (open === undefined) setUncontrolled(next);
          props.onOpenChange?.(next);
        }}
        data-slot="collapsible"
      />
    </CollapsibleContext.Provider>
  );
}

/** `CollapsibleTrigger` 의 props — Radix `Collapsible.Trigger` 속성(ref 포함) + `variant`. */
export interface CollapsibleTriggerProps
  extends
    React.ComponentPropsWithRef<typeof Radix.Trigger>,
    VariantProps<typeof collapsibleTriggerVariants> {}

/**
 * 여닫는 버튼 — 라벨 뒤에 셰브론을 스스로 단다(열리면 뒤집힌다). `asChild` 면 자식 요소(DS `Button` 등)를 그대로 쓰고 장식·모양을 붙이지 않는다.
 * @slot collapsible-trigger
 */
export function CollapsibleTrigger({
  className,
  variant,
  asChild = false,
  children,
  ref,
  ...rest
}: CollapsibleTriggerProps) {
  const state = useCollapsibleState("CollapsibleTrigger");
  const composedRef = useMergedRef(ref, state.trigger);
  const resolved = variant ?? "row";
  return (
    <Radix.Trigger
      asChild={asChild}
      ref={composedRef}
      className={asChild ? cn(className) : cn(collapsibleTriggerVariants({ variant: resolved }), className)}
      {...rest}
      data-slot="collapsible-trigger"
      data-variant={asChild ? undefined : resolved}
    >
      {asChild ? (
        children
      ) : (
        <>
          <span className="min-w-0 truncate">{children}</span>
          <svg viewBox="0 0 16 16" aria-hidden="true" fill="none">
            <path
              d="m3.5 6 4.5 4.5L12.5 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </>
      )}
    </Radix.Trigger>
  );
}

/** `CollapsibleContent` 의 props — Radix `Collapsible.Content` 속성(ref 포함, `forceMount` · `asChild` 제외 — 본문 수명과 모션 상자는 DS 가 소유한다). */
export type CollapsibleContentProps = Omit<
  React.ComponentPropsWithRef<typeof Radix.Content>,
  "forceMount" | "asChild"
>;

/**
 * 접히는 본문 — 접혀도 DOM 에 남고(`inert` · `aria-hidden`) 접힐 때 안의 포커스를 트리거로 돌려보낸다. `className` 은 본문 상자(안쪽)로 간다.
 * @slot collapsible-content
 */
export function CollapsibleContent({ className, children, ref, ...rest }: CollapsibleContentProps) {
  const state = useCollapsibleState("CollapsibleContent");
  const node = useRef<HTMLDivElement>(null);
  const composedRef = useMergedRef(ref, node);
  const { open, trigger } = state;
  useLayoutEffect(() => {
    if (!open && node.current?.contains(document.activeElement)) trigger.current?.focus();
  }, [open, trigger]);
  return (
    <Radix.Content
      forceMount
      ref={composedRef}
      // `.ds-accordion-content[data-state=closed] > .ds-accordion-motion` 이 접기 모션의 정본이다(theme.css) — Collapsible 은 Accordion 본문의 단일 버전이다.
      className="ds-accordion-content"
      {...rest}
      // 접힌 본문의 입력 차단은 DS 의 계약이다 — 소비자 속성이 덮지 못하게 rest 뒤에 둔다.
      aria-hidden={open ? undefined : true}
      inert={!open}
      data-slot="collapsible-content"
    >
      <div className="ds-accordion-motion">
        <div className="ds-accordion-content-clip">
          <div className={cn("min-w-0 pt-2", className)}>{children}</div>
        </div>
      </div>
    </Radix.Content>
  );
}
