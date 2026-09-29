"use client";
import { cn, cva, type VariantProps } from "../cn";

/* 내용 카드 — 썸네일 + 제목 + 메타 + 조치.
 *
 * `Card` 는 **구획**(패널)이고 이것은 **항목**이다. 이 제품에서 항목은 대개 «고를 수 있는
 * 후보» 다 — 생성된 설계안, 필지 풀의 필지, 저장된 리비전. 그래서 셋을 기본으로 갖는다:
 * 도면 썸네일 · 판정 배지가 들어갈 메타 줄 · 선택 상태.
 *
 * ── 전체를 누르게 만드는 방법 ─────────────────────────────────────────────────
 * 카드 전체를 `<button>` 으로 감싸면 그 안의 조치 버튼이 **버튼 안의 버튼**이 되어 무효한
 * HTML 이 되고, 스크린리더가 카드 내용을 전부 버튼 이름으로 읽는다. 그래서 제목에 붙는
 * 얇은 버튼 하나를 카드 전체로 늘리는 방식(stretched link)을 쓴다 — 접근 이름은 제목이고,
 * `actions` 는 그 위(z-1)에 떠서 자기 클릭을 유지한다.
 *
 * ── 썸네일이 없을 때 ─────────────────────────────────────────────────────────
 * 자리를 회색 네모로 채우지 않는다. 빈 썸네일은 「아직 안 불러왔다」로 읽혀서
 * 「원래 없다」와 구별되지 않는다. `media` 가 없으면 그 칸 자체가 사라진다. */

const cardVariants = cva(
  [
    "group relative flex min-w-0 bg-surface text-left",
    "transition-[box-shadow,border-color] duration-120 motion-reduce:transition-none",
  ],
  {
    variants: {
      orientation: {
        vertical: "flex-col",
        horizontal: "flex-row items-stretch",
      },
      elevation: {
        raised: "rounded-card shadow-card hover:shadow-pop",
        flat: "rounded-card border border-line hover:border-line-strong",
        flush: "rounded-none border border-line",
      },
      selected: {
        true: "",
        false: "",
      },
      interactive: { true: "cursor-pointer", false: "" },
    },
    compoundVariants: [
      /* 선택은 **테두리 두께가 아니라 색**으로 말한다. 두께를 바꾸면 선택될 때 카드가
         1px 씩 움직여 격자 전체가 흔들린다. */
      { elevation: "raised", selected: true, class: "shadow-[0_0_0_2px_var(--chrome-accent),var(--shadow-card)]" },
      { elevation: "flat", selected: true, class: "border-accent ring-1 ring-accent" },
      { elevation: "flush", selected: true, class: "border-accent ring-1 ring-accent" },
    ],
    defaultVariants: { orientation: "vertical", elevation: "raised", selected: false, interactive: false },
  },
);

const mediaVariants = cva("relative shrink-0 overflow-hidden bg-surface-2", {
  variants: {
    orientation: {
      vertical: "w-full rounded-t-card",
      horizontal: "rounded-l-card",
    },
    ratio: {
      "16/9": "aspect-[16/9]",
      "4/3": "aspect-[4/3]",
      "1/1": "aspect-square",
      /* 도면 썸네일. 필지는 대개 가로로 길다. */
      plan: "aspect-[3/2]",
      none: "",
    },
  },
  defaultVariants: { orientation: "vertical", ratio: "plan" },
});

export interface MediaCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onSelect">,
    VariantProps<typeof cardVariants> {
  title: React.ReactNode;
  /** 제목 위 작은 라벨 — "Candidate 03" · "Dahisar". */
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  /** 썸네일. 없으면 그 칸 자체가 사라진다. */
  media?: React.ReactNode;
  mediaRatio?: VariantProps<typeof mediaVariants>["ratio"];
  /** 가로 배치일 때 썸네일 폭. 세로 배치에서는 무시된다. */
  mediaWidth?: string;
  /** 썸네일 위 좌상단에 얹히는 것 — 순번 · 상태 점. */
  mediaOverlay?: React.ReactNode;
  /** 제목 아래 줄 — 배지 · KPI. */
  meta?: React.ReactNode;
  /** 오른쪽 아래(세로) 또는 오른쪽 끝(가로)에 붙는 조치. 카드 클릭과 독립적으로 동작한다. */
  actions?: React.ReactNode;
  /** 주면 카드 전체가 눌린다. 접근 이름은 `title`. */
  onSelect?: (() => void) | undefined;
}

export function MediaCard({
  className,
  orientation = "vertical",
  elevation,
  selected,
  title,
  eyebrow,
  description,
  media,
  mediaRatio,
  mediaWidth = "132px",
  mediaOverlay,
  meta,
  actions,
  onSelect,
  ...rest
}: MediaCardProps) {
  const horizontal = orientation === "horizontal";
  return (
    <div
      data-slot="media-card"
      data-selected={selected || undefined}
      className={cn(
        cardVariants({ orientation, elevation, selected: selected ?? false, interactive: !!onSelect }),
        className,
      )}
      {...rest}
    >
      {media ? (
        <div
          className={cn(
            mediaVariants({ orientation, ratio: horizontal ? "none" : (mediaRatio ?? "plan") }),
            horizontal && "self-stretch",
          )}
          style={horizontal ? { width: mediaWidth } : undefined}
        >
          {media}
          {mediaOverlay ? <div className="absolute left-2 top-2 z-1">{mediaOverlay}</div> : null}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        {eyebrow ? (
          <div className="font-mono text-micro uppercase tracking-caps text-muted">{eyebrow}</div>
        ) : null}

        <div className="min-w-0">
          <h3 className="truncate text-control font-semibold text-ink">
            {onSelect ? (
              <button
                data-slot="media-card-select"
                type="button"
                onClick={onSelect}
                /* 카드 전체로 늘어나는 얇은 버튼. 조치들은 z-1 로 그 위에 뜬다. */
                className={cn(
                  "appearance-none border-0 bg-transparent p-0 font-inherit text-inherit",
                  "cursor-pointer text-left after:absolute after:inset-0 after:content-['']",
                  "focus-visible:outline-none",
                  "focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus",
                )}
              >
                {title}
              </button>
            ) : (
              title
            )}
          </h3>
          {description ? (
            <p className="mt-1 line-clamp-2 text-body leading-relaxed text-muted">{description}</p>
          ) : null}
        </div>

        {meta ? <div className="flex flex-wrap items-center gap-1.5">{meta}</div> : null}

        {actions ? (
          <div className={cn("relative z-1 flex items-center gap-2", horizontal ? "mt-auto" : "mt-1")}>
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* 카드 격자 — 「항목이 채우는 열 수를 고른다」는 규칙을 한 곳에 둔다.
 * `auto-fill` 이 아니라 `auto-fit` 인 이유: 항목이 적을 때 빈 트랙을 남기지 않고 남은 폭을
 * 나눠 갖는다. 카드 하나가 줄에 혼자 남아 한 뼘만 차지하는 모양을 막는다. */
export function CardGrid({
  min = "240px",
  className,
  ...rest
}: { min?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-grid"
      className={cn("grid gap-3", className)}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${min}, 1fr))` }}
      {...rest}
    />
  );
}
