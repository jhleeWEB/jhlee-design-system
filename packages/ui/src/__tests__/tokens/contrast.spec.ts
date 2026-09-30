/*
 * 대비 래칫(계획 §2.4 D-2, C2).
 *
 * 크롬 색 토큰의 «글자 / 면» 쌍(contrast-pairs.ts)을 라이트·다크 두 스코프에서 WCAG 2.x 상대 휘도로 계산한다. 값은 생성물 CSS 를
 * 해석한 것이라(model.ts) 정본 JSON 이 아니라 소비자가 받는 색으로 판정한다. 알파가 있는 색(`rgb(… / 0.94)`)은 `background` 위에 합성한다.
 *
 * 래칫이다 — 미달인데 KNOWN_FAILURES 에 없으면 새 위반, 목록에 있는데 통과하면 «지워라». 목록은 줄어들기만 한다.
 * APCA(apca-w3, Lc)는 정보 열이다 — WCAG 3 초안이라 판정에 쓰지 않고, 같은 쌍을 두 척도로 나란히 보려는 것뿐이다.
 * 표는 `console.table` 로 찍는다(vitest 출력에서 한 번에 읽으려고).
 */
import { APCAcontrast, sRGBtoY } from "apca-w3";
import { describe, expect, it } from "vitest";

import { CONTRAST_PAIRS, type ContrastPair } from "./contrast-pairs";
import { loadTokenModel, resolvedMap, type Mode } from "./model";

/**
 * 오늘 미달인 쌍 — `mode:fg/bg`. 첫 실행 실측(2026-09-30, C2). **줄어들기만 한다**: 토큰을 고쳐 통과하면 여기서 지워야 통과한다.
 * 값을 고치는 것은 B5 후속(#20 · #24)의 몫이라 여기서는 기록만 한다.
 */
const KNOWN_FAILURES: readonly string[] = [
  "dark:border-strong/card",
  "light:border-strong/card",
  "light:destructive/destructive-soft",
  "light:muted-foreground/background",
  "light:success/success-soft",
  "light:warning/card",
  "light:warning/warning-soft",
];

type Rgb = readonly [r: number, g: number, b: number];
interface Rgba {
  readonly rgb: Rgb;
  readonly alpha: number;
}

/** `#rgb` · `#rrggbb` · `#rrggbbaa` · `rgb(r g b / a)` · `rgb(r, g, b)` 만 — 생성물이 내는 표기가 이것뿐이다. */
function parseColor(value: string): Rgba {
  const hex = /^#([0-9a-f]{3,8})$/i.exec(value.trim());
  if (hex) {
    const h = hex[1]!;
    const digits = h.length <= 4 ? [...h].map((c) => c + c).join("") : h;
    const n = (i: number) => parseInt(digits.slice(i, i + 2), 16);
    return { rgb: [n(0), n(2), n(4)], alpha: digits.length === 8 ? n(6) / 255 : 1 };
  }
  const fn = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/i.exec(
    value.trim(),
  );
  if (fn) {
    const a = fn[4];
    const alpha = a === undefined ? 1 : a.endsWith("%") ? Number(a.slice(0, -1)) / 100 : Number(a);
    return { rgb: [Number(fn[1]), Number(fn[2]), Number(fn[3])], alpha };
  }
  throw new Error(`색으로 읽지 못했다: ${value}`);
}

/** 알파 색을 불투명한 면 위에 합성한다 — 브라우저가 그리는 것과 같다. */
function over(top: Rgba, under: Rgb): Rgb {
  const a = top.alpha;
  return [0, 1, 2].map((i) => Math.round(top.rgb[i]! * a + under[i]! * (1 - a))) as unknown as Rgb;
}

/** WCAG 2.x 상대 휘도(sRGB 선형화 후 가중합) — https://www.w3.org/TR/WCAG21/#dfn-relative-luminance */
function relativeLuminance([r, g, b]: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG 2.x 대비 비율 (L1 + 0.05) / (L2 + 0.05), 밝은 쪽이 분자. */
function wcagRatio(fg: Rgb, bg: Rgb): number {
  const [l1, l2] = [relativeLuminance(fg), relativeLuminance(bg)].sort((a, b) => b - a) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

interface Row {
  readonly key: string;
  readonly mode: Mode;
  readonly pair: ContrastPair;
  readonly fgHex: string;
  readonly bgHex: string;
  readonly ratio: number;
  readonly apca: number;
  readonly pass: boolean;
}

const toHex = (rgb: Rgb): string => `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

function measure(mode: Mode, resolved: Record<string, string>): Row[] {
  const token = (name: string): string => {
    const value = resolved[`--chrome-${name}`];
    if (value === undefined) throw new Error(`토큰이 없다: --chrome-${name} (${mode})`);
    return value;
  };
  const page = over(parseColor(token("background")), [255, 255, 255]);
  return CONTRAST_PAIRS.map((pair) => {
    const bg = over(parseColor(token(pair.bg)), page);
    const fg = over(parseColor(token(pair.fg)), bg);
    const ratio = wcagRatio(fg, bg);
    const apca = Number(APCAcontrast(sRGBtoY([...fg]), sRGBtoY([...bg]), 1));
    return {
      key: `${mode}:${pair.fg}/${pair.bg}`,
      mode,
      pair,
      fgHex: toHex(fg),
      bgHex: toHex(bg),
      ratio,
      apca,
      pass: ratio >= pair.min,
    };
  });
}

describe("크롬 색 대비(WCAG 2.x 래칫)", () => {
  const model = loadTokenModel();
  const rows = (["light", "dark"] as const).flatMap((mode) => measure(mode, resolvedMap(model, mode)));

  it("표 — WCAG 비율(판정) · APCA Lc(정보)", () => {
    console.table(
      rows.map((r) => ({
        pair: r.key,
        fg: r.fgHex,
        bg: r.bgHex,
        min: r.pair.min,
        wcag: Number(r.ratio.toFixed(2)),
        apca: r.apca,
        pass: r.pass ? "ok" : "FAIL",
        where: r.pair.where,
      })),
    );
    expect(rows.length).toBe(CONTRAST_PAIRS.length * 2);
  });

  it("미달인 쌍은 KNOWN_FAILURES 에 적혀 있다 — 새 미달은 토큰 값을 고친다", () => {
    const fresh = rows
      .filter((r) => !r.pass && !KNOWN_FAILURES.includes(r.key))
      .map((r) => `${r.key} ${r.ratio.toFixed(2)} < ${r.pair.min} (${r.pair.where})`);
    expect(fresh).toEqual([]);
  });

  it("KNOWN_FAILURES 는 줄어들기만 한다 — 통과하게 된 쌍·없는 쌍은 지워라", () => {
    const keys = new Set(rows.map((r) => r.key));
    const stale = KNOWN_FAILURES.filter((k) => !keys.has(k) || rows.find((r) => r.key === k)!.pass);
    expect(stale, "통과하거나 사라진 쌍 — KNOWN_FAILURES 에서 지워라").toEqual([]);
    expect([...KNOWN_FAILURES]).toEqual([...KNOWN_FAILURES].sort());
    expect(new Set(KNOWN_FAILURES).size).toBe(KNOWN_FAILURES.length);
  });

  it("알파 색은 면 위에 합성해 판정한다 — popover 는 background 위에서 불투명 색이 된다", () => {
    const resolved = resolvedMap(model, "light");
    const popover = parseColor(resolved["--chrome-popover"]!);
    expect(popover.alpha).toBeLessThan(1);
    const composited = over(popover, over(parseColor(resolved["--chrome-background"]!), [255, 255, 255]));
    expect(composited.every((c) => Number.isInteger(c) && c >= 0 && c <= 255)).toBe(true);
  });
});
