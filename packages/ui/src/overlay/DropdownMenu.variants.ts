import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/**
 * 메뉴 상자의 면 — 카드 바탕 · `rounded-lg` · `shadow-pop` · 진입 애니메이션. 축은 없다.
 * DropdownMenu 의 상자 · 하위 상자와 ContextMenu 의 상자가 **같은 객체**를 부른다 — 두 메뉴의 면이 따로 자라지 않게 한 곳에 둔다(#61).
 */
export const dropdownMenuContentVariants = cva([
  "z-popover min-w-menu overflow-hidden rounded-lg border border-border bg-card p-2",
  "animate-in-pop text-body text-foreground shadow-pop focus-visible:outline-none",
]);

/**
 * 메뉴 항목의 변형 — `tone`. 체크·라디오·하위 메뉴 항목도 같은 바탕(기본 톤)을 쓴다.
 * 예전에는 `tone === "destructive" && …` 로 컴포넌트 안에서 갈랐다 — 축은 cva 하나가 소유한다(D3, #44).
 */
export const dropdownMenuItemVariants = cva(
  [
    "relative flex cursor-default items-center gap-3 rounded-md px-3 py-2 select-none",
    "outline-none data-highlighted:bg-muted data-highlighted:text-foreground",
    "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
    "[&_svg]:size-7 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
  ],
  {
    variants: {
      tone: {
        neutral: "",
        destructive:
          "text-destructive data-highlighted:bg-destructive-soft data-highlighted:text-destructive",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);
