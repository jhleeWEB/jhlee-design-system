"use client";
import {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
  type RefObject,
} from "react";
import { Accordion as Radix } from "radix-ui";

import { cn } from "../cn";

/**
 * 접이식 구획의 뿌리 — Radix Accordion 의 `type="single" | "multiple"` 유니언을 그대로 받는다. 접은 본문도 DOM 에 남아(`forceMount`)
 * 입력 초안이 보존된다.
 */
export type AccordionProps = ComponentPropsWithoutRef<typeof Radix.Root> & RefAttributes<HTMLDivElement>;
const Values = createContext<readonly string[] | null>(null);
const ItemState = createContext<{ open: boolean; trigger: RefObject<HTMLButtonElement | null> } | null>(null);

function useItemState() {
  const item = useContext(ItemState);
  if (!item) throw new Error("Accordion parts must be inside AccordionItem");
  return item;
}

/* ref 하나에 노드를 넣는다 — 콜백 ref 면 부르고(React 19 의 정리 함수를 돌려준다), 객체 ref 면 `.current` 에 쓴다.
 * 훅 밖의 평범한 함수로 둔 이유: 훅 안에서 인자의 `.current` 에 직접 쓰면 react-hooks/immutability 가 «훅 인자 변경» 으로 잡는다(#45). */
function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void | (() => void) {
  if (typeof ref === "function") return ref(node);
  if (ref) ref.current = node;
}

/* React 19 콜백 ref의 정리 함수도 보존한다. Radix가 DOM을 바꿔도 외부 ref와 포커스 대상은 같다. */
function usePartRef<T>(externalRef: Ref<T> | undefined, internalRef: RefObject<T | null>) {
  return useCallback(
    (node: T | null) => {
      assignRef(internalRef, node);
      const cleanup = assignRef(externalRef, node);
      return () => {
        assignRef(internalRef, null);
        if (typeof cleanup === "function") cleanup();
        else assignRef(externalRef, null);
      };
    },
    [externalRef, internalRef],
  );
}

/* 값의 정본은 제어 prop 또는 이 한 상태뿐이다. Radix에도 같은 값을 전달해 키보드 동작과
 * 보존된 본문의 inert 상태가 서로 다른 열림 상태를 읽지 않게 한다. */
/** 접이식 구획 묶음 — `type="single"` 은 하나만, `"multiple"` 은 여럿을 연다. 제어(`value`)·비제어(`defaultValue`) 모두 받는다. */
export function Accordion({ ref, ...props }: AccordionProps) {
  const [uncontrolled, setUncontrolled] = useState<string | string[]>(
    () => props.defaultValue ?? (props.type === "single" ? "" : []),
  );
  if (props.type === "single") {
    // defaultValue 는 rest 에 남아도 무해하다 — 아래에서 value 를 늘 넘겨 Radix 가 제어 모드로 돌고 defaultValue 를 읽지 않는다.
    const { value, onValueChange, className, ...rest } = props;
    const current = value ?? (typeof uncontrolled === "string" ? uncontrolled : "");
    return (
      <Values.Provider value={current ? [current] : []}>
        <Radix.Root
          {...rest}
          ref={ref}
          data-slot="accordion"
          className={cn("ds-accordion", className)}
          value={current}
          onValueChange={(next: string) => {
            if (value === undefined) setUncontrolled(next);
            onValueChange?.(next);
          }}
        />
      </Values.Provider>
    );
  }
  const { value, onValueChange, className, ...rest } = props;
  const current = value ?? (Array.isArray(uncontrolled) ? uncontrolled : []);
  return (
    <Values.Provider value={current}>
      <Radix.Root
        {...rest}
        ref={ref}
        data-slot="accordion"
        className={cn("ds-accordion", className)}
        value={current}
        onValueChange={(next: string[]) => {
          if (value === undefined) setUncontrolled(next);
          onValueChange?.(next);
        }}
      />
    </Values.Provider>
  );
}

/** 구획 하나 — `value` 가 뿌리의 열린 값과 맞으면 열린다. `AccordionHeader` · `AccordionContent` 를 담는다. */
export function AccordionItem({ className, ref, ...props }: ComponentProps<typeof Radix.Item>) {
  const values = useContext(Values);
  if (!values) throw new Error("AccordionItem must be inside Accordion");
  const trigger = useRef<HTMLButtonElement>(null);
  const open = values.includes(props.value);
  const context = useMemo(() => ({ open, trigger }), [open]);
  return (
    <ItemState.Provider value={context}>
      <Radix.Item
        {...props}
        ref={ref}
        data-slot="accordion-item"
        className={cn("ds-accordion-item", className)}
      />
    </ItemState.Provider>
  );
}

/** 구획의 제목 줄 — 제목 요소(기본 `h3`)로 렌더되어 문서 개요에 실린다. `AccordionTrigger` 를 담는다. */
export function AccordionHeader({ className, ref, ...props }: ComponentProps<typeof Radix.Header>) {
  return (
    <Radix.Header
      {...props}
      ref={ref}
      data-slot="accordion-header"
      className={cn("ds-accordion-header", className)}
    />
  );
}

/** 여닫는 버튼 — 라벨 뒤에 방향 표시(chevron)를 스스로 단다. `asChild` 면 자식 요소를 그대로 쓴다. */
export function AccordionTrigger({
  className,
  children,
  asChild = false,
  ref,
  ...props
}: ComponentProps<typeof Radix.Trigger>) {
  const item = useItemState();
  const composedRef = usePartRef(ref, item.trigger);
  return (
    <Radix.Trigger
      {...props}
      asChild={asChild}
      ref={composedRef}
      data-slot="accordion-trigger"
      className={cn("ds-accordion-trigger", className)}
    >
      {asChild ? (
        children
      ) : (
        <>
          <span className="ds-accordion-trigger-label">{children}</span>
          <svg className="ds-accordion-chevron" viewBox="0 0 16 16" aria-hidden="true" fill="none">
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

/** `AccordionContent` 의 props — Radix Content 에 안쪽 본문의 className 을 더한다. */
export interface AccordionContentProps extends ComponentProps<typeof Radix.Content> {
  /**
   * 본문의 패딩·grid·gap은 안쪽에 둔다. 바깥 className은 접기 애니메이션 구획이다.
   * @default undefined
   */
  contentClassName?: string;
}

/** 구획의 본문 — 접혀도 DOM 에 남고(`inert` · `aria-hidden`) 접힐 때 안의 포커스를 트리거로 돌려보낸다. */
export function AccordionContent({
  className,
  contentClassName,
  children,
  asChild = false,
  ref,
  ...props
}: AccordionContentProps) {
  const item = useItemState();
  const node = useRef<HTMLDivElement>(null);
  const composedRef = usePartRef(ref, node);
  useLayoutEffect(() => {
    if (!item.open && node.current?.contains(document.activeElement)) item.trigger.current?.focus();
  }, [item.open, item.trigger]);
  // Radix는 자기 요소의 transition을 잠시 끄고 치수를 잰다. 실제 모션은 안쪽에 두어 그 측정에 끊기지 않는다.
  const body = (content: ReactNode) => (
    <div className="ds-accordion-motion">
      <div className="ds-accordion-content-clip">
        <div className={cn("ds-accordion-content-body", contentClassName)}>{content}</div>
      </div>
    </div>
  );
  const child = asChild ? (Children.only(children) as ReactElement<{ children?: ReactNode }>) : null;
  return (
    <Radix.Content
      {...props}
      asChild={asChild}
      forceMount
      ref={composedRef}
      data-slot="accordion-content"
      className={cn("ds-accordion-content", className)}
      aria-hidden={item.open ? undefined : true}
      inert={!item.open}
    >
      {child ? cloneElement(child, {}, body(child.props.children)) : body(children)}
    </Radix.Content>
  );
}
