/// <reference types="vite/client" />
/*
 * «DS 가 그리는 제목 · 문단 · 목록은 브라우저 기본(UA) 여백을 걷는다»(#100).
 *
 * 소비자 계약은 preflight 를 싣지 않는다(theme + utilities 만) — 그래서 `<h3>` · `<p>` · `<ul>` 을 그리는 부품이 여백을 걷지 않으면 카드 · 패널 안에
 * 1em 안팎의 빈 줄(목록은 40px 들여쓰기)이 그대로 남는다. #90 이 `FieldDescription` · `FieldError` 를, #100 이 `DisplayHeading` · `Lede` ·
 * `MediaCard` 제목 · `EmptyState` 설명을 고쳤다 — 같은 누락이 부품마다 한 번씩 따로 발견됐으므로 전수 검사로 막는다.
 *
 * 스토리 전부(컴포넌트 옆 + `stories/` 페이지)를 jsdom 에 그려, UA 여백을 가진 태그가 그 쪽의 여백 유틸을 **조건 없이** 달고 있는지 본다.
 * jsdom 은 Tailwind 를 계산하지 않아 클래스 토큰으로 본다 — 계산값(0px)은 스토리 play 가 Chromium 에서 확인한다(Editorial · MediaCard · EmptyState).
 * 스토리가 직접 쓴 `<p>` 도 대상이다: 카탈로그도 같은 진입 CSS 로 서고, 스토리의 여백이 어긋나면 VRT 기준선이 그 어긋남을 굳힌다.
 */
import { composeStories } from "@storybook/react-vite";
import { cleanup, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

type StoriesModule = Parameters<typeof composeStories>[0];

const modules = {
  ...import.meta.glob<StoriesModule>("../**/*.stories.tsx", { eager: true }),
  ...import.meta.glob<StoriesModule>("../../stories/**/*.stories.tsx", { eager: true }),
};

type Side = "top" | "bottom" | "start" | "end" | "list-indent";

/** 태그 → UA 스타일시트가 여백(목록은 들여쓰기 패딩)을 주는 쪽. */
const UA_SIDES: Readonly<Record<string, readonly Side[]>> = {
  ...Object.fromEntries(
    ["H1", "H2", "H3", "H4", "H5", "H6", "P", "PRE", "DL", "HR"].map((tag) => [tag, ["top", "bottom"]]),
  ),
  UL: ["top", "bottom", "list-indent"],
  OL: ["top", "bottom", "list-indent"],
  MENU: ["top", "bottom", "list-indent"],
  DD: ["start"],
  FIGURE: ["top", "bottom", "start", "end"],
  BLOCKQUOTE: ["top", "bottom", "start", "end"],
};

/** 그 쪽을 정하는 유틸 — 값은 무엇이든 좋다(`m-0` · `my-2` · `mt-1` …). 정했다는 것이 «UA 값이 남지 않는다» 는 뜻이다. */
const COVERS: Readonly<Record<Side, RegExp>> = {
  top: /^-?m[ty]?-/,
  bottom: /^-?m[by]?-/,
  start: /^-?m[xls]?-/,
  end: /^-?m[xre]?-/,
  "list-indent": /^p[xls]?-/,
};

/** 걷지 않은 쪽 — 변형 접두(`sm:` · `data-…:`)가 붙은 토큰은 세지 않는다. 조건이 꺼진 동안 UA 값이 돌아오기 때문이다. */
function uncovered(element: Element): Side[] {
  const sides = UA_SIDES[element.tagName];
  if (!sides) return [];
  const tokens = [...element.classList].filter((token) => !token.includes(":"));
  // `sr-only` 는 스스로 `margin: -1px` · `padding: 0` 을 정한다(Tailwind 의 화면 숨김 유틸) — 숨긴 제목(CommandDialog)의 UA 여백은 남지 않는다.
  if (tokens.includes("sr-only")) return [];
  return sides.filter((side) => !tokens.some((token) => COVERS[side].test(token)));
}

function offenders(root: ParentNode): string[] {
  return [...root.querySelectorAll(Object.keys(UA_SIDES).join(","))].flatMap((element) => {
    const sides = uncovered(element);
    if (sides.length === 0) return [];
    const slot = element.getAttribute("data-slot");
    return [
      `<${element.tagName.toLowerCase()}${slot ? ` data-slot="${slot}"` : ""} class="${element.className}"> — ${sides.join(" · ")}`,
    ];
  });
}

afterEach(cleanup);

describe("검사기", () => {
  it("쪽마다 그 쪽을 정하는 유틸을 알아본다 — 조건부 토큰은 세지 않는다", () => {
    const check = (html: string) => {
      const host = document.createElement("div");
      host.innerHTML = html;
      return offenders(host);
    };
    expect(check('<p class="m-0"></p><h3 class="my-2"></h3><p class="mt-1 mb-0"></p>')).toEqual([]);
    expect(check('<ul class="m-0 p-0"></ul><dd class="m-0"></dd><figure class="m-0"></figure>')).toEqual([]);
    expect(check('<p class="mt-1"></p>')).toEqual(['<p class="mt-1"> — bottom']);
    expect(check('<ul class="m-0"></ul>')).toEqual(['<ul class="m-0"> — list-indent']);
    expect(check('<dd class="my-0"></dd>')).toEqual(['<dd class="my-0"> — start']);
    expect(check('<h2 class="sm:m-0 text-title"></h2>')).toEqual([
      '<h2 class="sm:m-0 text-title"> — top · bottom',
    ]);
    // 여백 유틸이 아닌 것(`min-w-0` · `max-w-…`)을 여백으로 읽지 않는다.
    expect(check('<h2 class="sr-only"></h2>')).toEqual([]);
    expect(check('<p class="min-w-0 max-w-[46ch]"></p>')).toEqual([
      '<p class="min-w-0 max-w-[46ch]"> — top · bottom',
    ]);
  });
});

describe("스토리 전수 — UA 여백을 가진 태그는 그 쪽의 여백 유틸을 단다", () => {
  const files = Object.keys(modules).sort();

  it("스토리 파일을 찾는다", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it.each(files)("%s", (file) => {
    const stories = composeStories(modules[file]!) as Record<string, () => ReactElement>;
    const found: string[] = [];
    for (const [name, Story] of Object.entries(stories)) {
      render(<Story />);
      // 포털(Radix 오버레이)로 나간 것까지 — 열린 채 그려지는 스토리의 Content 도 같은 계약이다.
      found.push(...offenders(document.body).map((line) => `${name}: ${line}`));
      cleanup();
    }
    expect([...new Set(found)]).toEqual([]);
  });
});
