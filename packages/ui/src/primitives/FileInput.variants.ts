import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 지시문·훅·Radix 가 없어야 한다(Input.variants.ts 와 같은 이유). */

/**
 * 파일 입력 상자의 변형 — `size` · `invalid` · `dragging`. 면은 `Input` 과 같다(같은 폼 줄에 나란히 선다): `bg-muted` · `border-border-strong` · `rounded-md`.
 * 포커스 링은 안쪽의 숨긴 `<input type="file">` 이 포커스를 받을 때 상자에 그린다.
 */
export const fileInputVariants = cva(
  [
    "relative flex w-full min-w-0 items-center gap-3 overflow-hidden border bg-muted pr-1 text-control text-foreground",
    "rounded-md transition-colors duration-fast",
    "has-[input:focus-visible]:focus-ring",
    "has-[input:disabled]:pointer-events-none has-[input:disabled]:opacity-45",
  ],
  {
    variants: {
      /**
       * 크기 — 컨트롤 높이 사다리(`h-ctl-*`). 값 글자는 세 단 모두 `text-control` 이다(#80 — 크기 축은 높이만 바꾼다).
       * - `sm` — 작은 컨트롤 높이
       * - `md` — 기본 컨트롤 높이
       * - `lg` — 큰 컨트롤 높이
       */
      size: {
        sm: "h-ctl-sm",
        md: "h-ctl",
        lg: "h-ctl-lg",
      },
      /** 검증 실패 — 파괴색 테두리. `Field` 안에서는 `aria-invalid` 로 켜진다. */
      invalid: {
        true: "border-destructive has-[input:focus-visible]:outline-destructive",
        false: "border-border-strong hover:border-foreground-2",
      },
      /** 파일을 끌어 상자 위에 올린 동안 — «여기에 놓으면 고른다» 를 primary 테두리와 옅은 면으로 말한다. */
      dragging: {
        true: "border-primary bg-accent",
        false: "",
      },
    },
    compoundVariants: [
      /* 끌어 올린 동안에는 실패 테두리보다 «놓을 수 있다» 가 먼저다 — 놓으면 값이 바뀐다. */
      { invalid: true, dragging: true, class: "border-primary" },
    ],
    defaultVariants: { size: "md", invalid: false, dragging: false },
  },
);

/**
 * 고르기 칸 — 상자 왼쪽에 붙은 구획이다(따로 뜬 버튼이 아니다). 상자 높이를 그대로 채우고 오른쪽 선 하나로 값 칸과 갈린다 — 안에 버튼 상자를 또 넣으면
 * 작은 크기(30px)에서 상자 테두리와 겹친다. 글자는 컨트롤 역할(`text-control font-medium`).
 * `border-y-0 border-l-0` 을 함께 든다 — preflight 가 없어 `border-solid` 만 두면 나머지 세 변이 UA 기본 굵기(medium = 3px)로 그려진다(첫 스냅샷 실측).
 */
export const fileInputChooseClassName =
  "inline-flex shrink-0 cursor-pointer items-center self-stretch border-y-0 border-r border-l-0 border-solid border-border-strong bg-card px-3 font-medium whitespace-nowrap select-none hover:bg-secondary";
