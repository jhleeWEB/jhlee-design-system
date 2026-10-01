import { cva } from "../cn";

/* 서버에서도 호출 가능한 변형 모듈(Button.variants.ts 와 같은 이유). 축은 `variant` 하나 — 칸 사이를 무엇이 가르는가.
 *   flush  선이 구조를 만든다(옛 3열 셸의 «여백이 아니라 선» — 헤어라인). 칸이 맞붙고 인스펙터는 왼쪽 테두리 하나로 갈린다
 *   inset  옅은 바닥 위에 카드가 뜬다(Pages/Workbench 의 참고 화면 실측 — 카드 사이 12px, --space-card-gap)
 * 인스펙터의 열림은 축이 아니라 상태다 — ResizablePanel 의 `data-state` 로 드러난다. */

/** 셸 뿌리의 변형 — `variant`(칸을 가르는 것: 선 · 간격). */
export const appShellVariants = cva(
  "flex h-full min-h-0 w-full min-w-0 flex-col font-sans text-body text-foreground",
  {
    variants: {
      variant: {
        flush: "bg-card",
        inset: "bg-background",
      },
    },
    defaultVariants: { variant: "flush" },
  },
);

/** 셸 몸통(상단바와 바닥줄 사이의 줄) — 사이드바 · 본문 · 인스펙터가 늘어선다. */
export const appShellBodyVariants = cva("min-h-0 flex-1", {
  variants: {
    variant: {
      flush: "",
      inset: "gap-shell p-3",
    },
  },
  defaultVariants: { variant: "flush" },
});

/** 가운데 본문 — inset 에서는 본문도 카드다(모서리 · 그림자). 안의 캔버스 웰이 모서리 밖으로 새지 않게 자른다. */
export const appShellMainVariants = cva("flex min-h-0 min-w-0 flex-1 flex-col", {
  variants: {
    variant: {
      flush: "",
      inset: "overflow-hidden rounded-lg bg-card shadow-card",
    },
  },
  defaultVariants: { variant: "flush" },
});

/** 인스펙터 칸. 폭은 토큰(--size-inspector)이 기본이고, 끌어서 정한 크기가 생기면 ResizablePanel 의 인라인 폭이 이긴다.
 *  inset 에서 접히면 몸통의 간격(gap-shell)이 빈 홈통으로 남지 않게 음수 여백으로 거둔다. */
export const appShellInspectorVariants = cva("w-(--size-inspector) bg-card", {
  variants: {
    variant: {
      flush: "border-l border-border data-[state=closed]:border-l-0",
      inset: "rounded-lg shadow-card data-[state=closed]:-ml-3",
    },
  },
  defaultVariants: { variant: "flush" },
});

/** 인스펙터 손잡이 — flush 에서는 인스펙터의 왼쪽 테두리 위에 겹쳐 앉는다(선이 두 줄로 서지 않게, 손잡이가 위 층이다). inset 에서는 카드 사이 홈통 안에 앉고(양쪽 간격 12+12 에서 8 · 4 를 거둬 홈통이 다시 12 + 1 이 된다 — 반반인 6 은 4px 격자 밖이다) 선은 잡을 때만 보인다. 홈통이 이미 칸을 가른다. */
export const appShellHandleVariants = cva("", {
  variants: {
    variant: {
      flush: "-mr-px",
      inset: "-mr-1 -ml-2 bg-transparent",
    },
  },
  defaultVariants: { variant: "flush" },
});
