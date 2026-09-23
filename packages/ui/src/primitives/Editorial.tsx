import { cn } from "../cn";

/* 편집형 장치 — 검사 패널의 들머리.
 *
 * 참고 화면에서 가장 성격이 뚜렷한 자리가 여기다. 「01 / PLANNING BRIEF」 라는 번호 붙은
 * 대문자 눈썹 아래 「Make room for work.」 가 크게 오고, 그 다음에야 컨트롤이 시작된다.
 * 도구 화면에 **읽는 줄**을 하나 두는 결정이고, 그것이 「설정 패널」과 「브리프」를 가른다.
 *
 * 번호는 장식이 아니어야 한다 — 실제로 순서가 있는 단계(01 브리프 → 02 배치 → 03 검토)에만
 * 붙인다. 순서가 없는 구획에 번호를 붙이면 그 순간 그냥 무늬가 된다. */
export function Eyebrow({
  step,
  className,
  children,
  ...rest
}: { step?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="eyebrow"
      className={cn(
        "flex items-baseline gap-2 font-mono text-micro uppercase tracking-caps text-muted select-none",
        className,
      )}
      {...rest}
    >
      {step ? (
        <>
          <span className="text-ink-2">{step}</span>
          <span aria-hidden="true" className="text-disabled">/</span>
        </>
      ) : null}
      <span>{children}</span>
    </div>
  );
}

/* 들머리 제목. 한 패널에 **하나만** 둔다 — 둘이 되는 순간 둘 다 제목이 아니게 된다. */
export function DisplayHeading({
  className,
  as: Tag = "h2",
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" }) {
  return (
    <Tag
      data-slot="display-heading"
      className={cn(
        "text-display font-semibold tracking-[-0.015em] text-balance text-ink",
        className,
      )}
      {...rest}
    />
  );
}

/* 들머리 아래 한 문단. 읽히라고 두는 줄이므로 폭을 제한한다 — 패널 폭을 꽉 채우면 안 읽힌다. */
export function Lede({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="lede"
      className={cn("max-w-[42ch] text-body leading-relaxed text-muted", className)}
      {...rest}
    />
  );
}
