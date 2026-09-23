import { Children, cloneElement, createContext, forwardRef, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef, type ReactElement, type ReactNode, type Ref, type RefObject } from "react";
import { Accordion as Radix } from "radix-ui";

import { cn } from "../cn";

export type AccordionProps = ComponentPropsWithoutRef<typeof Radix.Root>;
const Values = createContext<readonly string[] | null>(null);
const ItemState = createContext<{ open: boolean; trigger: RefObject<HTMLButtonElement | null> } | null>(null);

function useItemState() {
  const item = useContext(ItemState);
  if (!item) throw new Error("Accordion parts must be inside AccordionItem");
  return item;
}

/* React 19 콜백 ref의 정리 함수도 보존한다. Radix가 DOM을 바꿔도 외부 ref와 포커스 대상은 같다. */
function usePartRef<T>(external: Ref<T>, internal: RefObject<T | null>) {
  return useCallback((node: T | null) => {
    internal.current = node;
    const cleanup = typeof external === "function" ? external(node) : undefined;
    if (external && typeof external !== "function") external.current = node;
    return () => {
      internal.current = null;
      if (typeof cleanup === "function") cleanup();
      else if (typeof external === "function") external(null);
      else if (external) external.current = null;
    };
  }, [external, internal]);
}

/* 값의 정본은 제어 prop 또는 이 한 상태뿐이다. Radix에도 같은 값을 전달해 키보드 동작과
 * 보존된 본문의 inert 상태가 서로 다른 열림 상태를 읽지 않게 한다. */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(props, ref) {
  const [uncontrolled, setUncontrolled] = useState<string | string[]>(() => props.defaultValue ?? (props.type === "single" ? "" : []));
  if (props.type === "single") {
    const { value, defaultValue: _defaultValue, onValueChange, className, ...rest } = props;
    const current = value ?? (typeof uncontrolled === "string" ? uncontrolled : "");
    return <Values.Provider value={current ? [current] : []}>
      <Radix.Root {...rest} ref={ref} data-slot="accordion" className={cn("ds-accordion", className)} value={current} onValueChange={(next: string) => {
        if (value === undefined) setUncontrolled(next);
        onValueChange?.(next);
      }} />
    </Values.Provider>;
  }
  const { value, defaultValue: _defaultValue, onValueChange, className, ...rest } = props;
  const current = value ?? (Array.isArray(uncontrolled) ? uncontrolled : []);
  return <Values.Provider value={current}>
    <Radix.Root {...rest} ref={ref} data-slot="accordion" className={cn("ds-accordion", className)} value={current} onValueChange={(next: string[]) => {
      if (value === undefined) setUncontrolled(next);
      onValueChange?.(next);
    }} />
  </Values.Provider>;
});

export const AccordionItem = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Radix.Item>>(function AccordionItem({ className, ...props }, ref) {
  const values = useContext(Values);
  if (!values) throw new Error("AccordionItem must be inside Accordion");
  const trigger = useRef<HTMLButtonElement>(null);
  const open = values.includes(props.value);
  const context = useMemo(() => ({ open, trigger }), [open]);
  return <ItemState.Provider value={context}><Radix.Item {...props} ref={ref} data-slot="accordion-item" className={cn("ds-accordion-item", className)} /></ItemState.Provider>;
});

export const AccordionHeader = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<typeof Radix.Header>>(function AccordionHeader({ className, ...props }, ref) {
  return <Radix.Header {...props} ref={ref} data-slot="accordion-header" className={cn("ds-accordion-header", className)} />;
});

export const AccordionTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Radix.Trigger>>(function AccordionTrigger({ className, children, asChild = false, ...props }, ref) {
  const item = useItemState();
  const composedRef = usePartRef(ref, item.trigger);
  return <Radix.Trigger {...props} asChild={asChild} ref={composedRef} data-slot="accordion-trigger" className={cn("ds-accordion-trigger", className)}>
    {asChild ? children : <>
      <span className="ds-accordion-trigger-label">{children}</span>
      <svg className="ds-accordion-chevron" viewBox="0 0 16 16" aria-hidden="true" fill="none">
        <path d="m3.5 6 4.5 4.5L12.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>}
  </Radix.Trigger>;
});

export interface AccordionContentProps extends ComponentPropsWithoutRef<typeof Radix.Content> {
  /** 본문의 패딩·grid·gap은 안쪽에 둔다. 바깥 className은 접기 애니메이션 구획이다. */
  contentClassName?: string;
}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(function AccordionContent({ className, contentClassName, children, asChild = false, ...props }, ref) {
  const item = useItemState();
  const node = useRef<HTMLDivElement>(null);
  const composedRef = usePartRef(ref, node);
  useLayoutEffect(() => {
    if (!item.open && node.current?.contains(document.activeElement)) item.trigger.current?.focus();
  }, [item.open, item.trigger]);
  // Radix는 자기 요소의 transition을 잠시 끄고 치수를 잰다. 실제 모션은 안쪽에 두어 그 측정에 끊기지 않는다.
  const body = (content: ReactNode) => <div className="ds-accordion-motion"><div className="ds-accordion-content-clip"><div className={cn("ds-accordion-content-body", contentClassName)}>{content}</div></div></div>;
  const child = asChild ? Children.only(children) as ReactElement<{ children?: ReactNode }> : null;
  return <Radix.Content {...props} asChild={asChild} forceMount ref={composedRef} data-slot="accordion-content" className={cn("ds-accordion-content", className)} aria-hidden={item.open ? undefined : true} inert={!item.open}>
    {child ? cloneElement(child, {}, body(child.props.children)) : body(children)}
  </Radix.Content>;
});
