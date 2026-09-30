import { describe, expect, it } from "vitest";

import { cn } from "../cn";

/* 클래스 합성 회귀 검사 (#1202).
 *
 * twMerge 는 **모르는 클래스를 충돌로 보지 않는다** — 그냥 둘 다 남긴다. 그래서 `theme.css` 가
 * `@utility` 로 손수 낸 것들(`h-ctl` · `w-rail` · `gap-shell`)을 사다리에 등록하지 않으면
 * `cn("h-ctl", "h-auto")` 가 둘을 다 남기고, 승자가 **생성 CSS 의 소스 순서**에 달린다.
 * 호출처는 높이를 풀었다고 믿는데 안 풀리는, 타입도 테스트도 통과하는 조용한 실패다.
 * #1202 의 적대적 검토가 실제로 이 모양을 두 건(SiteList 의 줄 버튼·Edit/Delete 묶음) 잡았다.
 */
describe("cn — 사다리가 충돌을 해소한다", () => {
  it("커스텀 높이·폭·간격 유틸리티가 표준 것에 진다", () => {
    expect(cn("h-ctl", "h-auto")).toBe("h-auto");
    expect(cn("h-ctl-sm", "h-auto")).toBe("h-auto");
    expect(cn("w-ctl", "w-full")).toBe("w-full");
    expect(cn("gap-shell", "gap-0")).toBe("gap-0");
  });

  it("커스텀 유틸리티끼리도 뒤엣것이 이긴다", () => {
    expect(cn("h-ctl", "h-ctl-lg")).toBe("h-ctl-lg");
    expect(cn("w-ctl-sm", "w-ctl-lg")).toBe("w-ctl-lg");
  });

  it("leading-* 은 text-* 사다리 앞에 와도 살아남는다 — v4 의 --tw-leading 이 순서와 무관하게 이기므로 지우면 그림이 바뀐다(C4)", () => {
    /* twMerge 는 남긴 클래스의 순서를 약속하지 않는다 — 집합으로 비교한다.
       leading-* 은 Tailwind 기본 테마의 사다리라 theme.css 만 보는 린트 진입점은 모른다(소비자는 tailwindcss/theme.css 를 먼저 싣는다). */
    /* eslint-disable better-tailwindcss/no-unknown-classes */
    const set = (s: string) => s.split(" ").sort();
    expect(set(cn("leading-snug text-title"))).toEqual(["leading-snug", "text-title"]);
    expect(set(cn("leading-snug text-title"))).toEqual(["leading-snug", "text-title"]);
    expect(set(cn("leading-relaxed", "text-body"))).toEqual(["leading-relaxed", "text-body"]);
    /* leading 끼리는 여전히 뒤엣것이 이긴다. */
    expect(cn("leading-snug", "leading-relaxed")).toBe("leading-relaxed");
    /* eslint-enable better-tailwindcss/no-unknown-classes */
  });

  it("역할 이름 사다리(radius · shadow · text)가 해소된다", () => {
    expect(cn("rounded-md", "rounded-xl")).toBe("rounded-xl");
    expect(cn("shadow-card", "shadow-pop")).toBe("shadow-pop");
    /* 조밀한 레거시 표가 DS 기본 13px 를 11px 로 되돌리는 실제 경로다. */
    expect(cn("text-body", "text-label")).toBe("text-label");
    expect(cn("text-control", "text-micro")).toBe("text-micro");
  });

  it("표준 유틸리티는 원래대로 해소된다", () => {
    expect(cn("px-3", "p-0")).toBe("p-0");
    expect(cn("inline-flex", "grid")).toBe("grid");
  });
});

describe("Button — link 변형은 상자가 없다", () => {
  it("size 가 주는 높이·가로 패딩을 되돌린다", async () => {
    const { buttonVariants } = await import("../primitives/Button.variants");
    const cls = buttonVariants({ variant: "link", size: "sm" });
    /* `size="sm"` 의 `h-ctl-sm px-3` 이 살아 있으면 글자여야 할 것이 칩이 된다. */
    expect(cls).toContain("h-auto");
    expect(cls).toContain("px-0");
    /* 진짜 계약은 **합성 뒤의 결과**다 — cva 문자열에는 `link` 변형의 h-auto 와 `size` 의
       h-ctl-sm 이 둘 다 들어 있고, 그것을 푸는 것은 `cn` 의 twMerge 다. */
    const merged = cn(cls);
    expect(merged).toContain("h-auto");
    expect(merged).not.toContain("h-ctl-sm");
    expect(merged).not.toContain("px-3");
  });
});
