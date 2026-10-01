"use client";
import { createContext, useContext, type ReactNode } from "react";
import { ToggleGroup as Radix } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { toggleGroupItemVariants, toggleGroupVariants } from "./ToggleGroup.variants";

/* 토글 묶음 — 칸마다 켬/끔이 있는 버튼 줄. `type="single"` 이면 하나만(radiogroup · radio), `"multiple"` 이면 여럿을(toolbar · aria-pressed) 켠다.
 *
 * SegmentedControl 과의 구분: SegmentedControl 은 «언제나 값 하나가 골라져 있는» 제어 컴포넌트이고(빈 선택이 없다), 이쪽은 Radix ToggleGroup 이라
 * 단일에서도 켠 칸을 다시 눌러 끌 수 있고(빈 값 `""`), 다중 선택과 비제어(`defaultValue`)를 지원한다. 2.x 의 레거시 `Segmented` · `Toggle`
 * (`./legacy`, 3.0.0 에서 삭제 #49)이 각각 하던 «값 고르기» · «켬/끔» 을 도구 막대 한 줄에서 함께 하는 자리다(#59).
 * roving tabindex · 화살표 · Home/End 는 Radix 의 것이다.
 *
 * 부품마다 `data-slot` 을 `{...rest}` **뒤**에 둔다(slot-locked, D3 #44). */

type ToggleGroupVariant = NonNullable<VariantProps<typeof toggleGroupVariants>["variant"]>;
type ToggleGroupSize = NonNullable<VariantProps<typeof toggleGroupVariants>["size"]>;

/* 칸의 모양은 묶음이 정한다 — 칸마다 적게 두면 한 줄 안에서 모양이 갈린다(Tabs 와 같은 이유). */
const ToggleGroupStyleContext = createContext<{ variant: ToggleGroupVariant; size: ToggleGroupSize }>({
  variant: "segmented",
  size: "md",
});

/** `ToggleGroup` 의 props — Radix `ToggleGroup.Root` 속성(ref 포함, `asChild` 제외 — `type` 이 단일/다중을 가른다) + `variant` · `size`. */
export type ToggleGroupProps = Omit<React.ComponentPropsWithRef<typeof Radix.Root>, "asChild"> &
  VariantProps<typeof toggleGroupVariants>;

/**
 * 토글 묶음 — `type="single"`(값 하나, 다시 누르면 끈다) · `type="multiple"`(값 배열). 스크린리더가 읽을 묶음 이름을 `aria-label` 로 준다.
 * `variant` · `size` 는 안의 칸 모양까지 함께 정한다.
 * @slot toggle-group
 */
export function ToggleGroup({ className, variant, size, ...rest }: ToggleGroupProps) {
  const resolved = { variant: variant ?? "segmented", size: size ?? "md" } as const;
  return (
    <ToggleGroupStyleContext.Provider value={resolved}>
      <Radix.Root
        className={cn(toggleGroupVariants(resolved), className)}
        // 구조 분해가 `type` 과 `value` 의 짝(단일 ↔ 문자열, 다중 ↔ 배열)을 잃는다 — 나머지는 받은 그대로라 짝은 유지된다.
        {...(rest as React.ComponentPropsWithRef<typeof Radix.Root>)}
        data-slot="toggle-group"
        // `satisfies` — 문자열 축이지 불리언이 아니다(boolean-string-data-attr 래칫이 식별자 하나짜리 값을 불리언으로 의심한다).
        data-variant={resolved.variant satisfies ToggleGroupVariant}
        data-size={resolved.size satisfies ToggleGroupSize}
      />
    </ToggleGroupStyleContext.Provider>
  );
}

type ToggleGroupItemBaseProps = Omit<React.ComponentPropsWithRef<typeof Radix.Item>, "asChild" | "children">;

/**
 * `ToggleGroupItem` 의 props — Radix `ToggleGroup.Item` 속성(ref 포함, `asChild` 제외) + `icon`.
 * 아이콘만 든 칸(`icon` 만, 글자 없음)은 **`aria-label` 이 타입에서 필수다** — 이름 없는 아이콘 버튼은 스크린리더에 «button» 으로만 읽힌다.
 */
export type ToggleGroupItemProps = ToggleGroupItemBaseProps &
  (
    | {
        /** 칸 앞의 아이콘(16px). 글자 없이 아이콘만 두면 `aria-label` 이 필수다. */
        icon: ReactNode;
        /**
         * 칸의 접근 가능한 이름 — 아이콘 전용 칸(`icon` 만)에서는 필수, 글자 칸에서는 글자가 이름이라 생략한다.
         * @default undefined
         */
        "aria-label": string;
        /**
         * 칸의 글자 — 아이콘 전용 칸에는 없다.
         * @default undefined
         */
        children?: undefined;
      }
    | {
        /**
         * 칸 앞의 아이콘(16px). 글자 없이 아이콘만 두면 `aria-label` 이 필수다.
         * @default undefined
         */
        icon?: ReactNode;
        /**
         * 칸의 접근 가능한 이름 — 아이콘 전용 칸(`icon` 만)에서는 필수, 글자 칸에서는 글자가 이름이라 생략한다.
         * @default undefined
         */
        "aria-label"?: string;
        /**
         * 칸의 글자 — 아이콘 전용 칸에는 없다.
         * @default undefined
         */
        children: ReactNode;
      }
  );

/**
 * 토글 한 칸 — `value` 가 묶음의 값(단일이면 문자열, 다중이면 배열의 원소)이 된다. 모양은 감싼 `ToggleGroup` 의 `variant` · `size` 를 따른다.
 * @slot toggle-group-item
 */
export function ToggleGroupItem({ className, icon, children, ...rest }: ToggleGroupItemProps) {
  const { variant, size } = useContext(ToggleGroupStyleContext);
  return (
    <Radix.Item
      className={cn(
        toggleGroupItemVariants({ variant, size }),
        // 아이콘만 든 칸은 가로 여백을 걷어 정사각(min-w = 높이)으로 선다.
        children == null && "px-0",
        className,
      )}
      {...rest}
      data-slot="toggle-group-item"
      data-variant={variant satisfies ToggleGroupVariant}
      data-size={size satisfies ToggleGroupSize}
    >
      {icon}
      {children}
    </Radix.Item>
  );
}
