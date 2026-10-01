import { cn } from "../cn";

/* 편집형 장치 — 검사 패널의 들머리.
 *
 * 참고 화면에서 가장 성격이 뚜렷한 자리가 여기다. 「01 / PLANNING BRIEF」 라는 번호 붙은
 * 대문자 눈썹 아래 「Make room for work.」 가 크게 오고, 그 다음에야 컨트롤이 시작된다.
 * 도구 화면에 **읽는 줄**을 하나 두는 결정이고, 그것이 「설정 패널」과 「브리프」를 가른다.
 *
 * 번호는 장식이 아니어야 한다 — 실제로 순서가 있는 단계(01 브리프 → 02 배치 → 03 검토)에만
 * 붙인다. 순서가 없는 구획에 번호를 붙이면 그 순간 그냥 무늬가 된다. */
/** 들머리 눈썹 — 대문자 mono 한 줄. 순서가 있는 단계에서만 `step` 번호를 붙인다. */
export function Eyebrow({
  step,
  className,
  children,
  ...rest
}: {
  /**
   * 단계 번호 — «01 / BRIEF» 의 `01`. 순서가 실제로 있는 단계에만 준다.
   * @default undefined
   */
  step?: string | undefined;
} & React.ComponentPropsWithRef<"div">) {
  return (
    <div
      {...rest}
      data-slot="eyebrow"
      className={cn(
        "flex items-baseline gap-2 font-mono text-micro tracking-caps text-muted-foreground uppercase select-none",
        className,
      )}
    >
      {step ? (
        <>
          <span className="text-foreground-2">{step}</span>
          <span aria-hidden="true" className="text-foreground-disabled">
            /
          </span>
        </>
      ) : null}
      <span>{children}</span>
    </div>
  );
}

/* 들머리 제목. 한 패널에 **하나만** 둔다 — 둘이 되는 순간 둘 다 제목이 아니게 된다. */
/** 들머리 제목 — 한 패널에 하나만. */
export function DisplayHeading({
  className,
  as: Tag = "h2",
  ...rest
}: React.ComponentPropsWithRef<"h2"> & {
  /**
   * 제목 요소 — 문서 개요에서의 수준. 크기는 같다.
   * - `h1` — 페이지의 첫 제목
   * - `h2` — 패널의 들머리. 기본값
   * - `h3` — 패널 안 구획의 들머리
   * @default "h2"
   */
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      {...rest}
      data-slot="display-heading"
      className={cn("text-display font-semibold tracking-[-0.015em] text-balance text-foreground", className)}
    />
  );
}

/* 들머리 아래 한 문단. 읽히라고 두는 줄이므로 폭을 제한한다 — 패널 폭을 꽉 채우면 안 읽힌다. */
/** 들머리 아래 한 문단 — 읽히도록 폭을 제한한다. */
export function Lede({ className, ...rest }: React.ComponentPropsWithRef<"p">) {
  return (
    <p
      {...rest}
      data-slot="lede"
      className={cn("max-w-[42ch] text-body leading-relaxed text-muted-foreground", className)}
    />
  );
}
