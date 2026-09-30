/*
 * 토큰 정본 스키마(계획 §2.4 2층 «스키마», #15) — 실제 정본이 통과하는 것과, 검출기가 틀린 입력을 실제로 잡는 것 둘 다.
 * 후자가 없으면 스키마는 «아무것도 안 보는 초록» 이 될 수 있다(forbidden-patterns.spec 의 DETECTOR_CASES 와 같은 이유).
 */
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  CANVAS_FILE,
  CHROME_LIGHT_FILE,
  DARK_FILE,
  LEGACY_FILE,
  readTokenSources,
  sortSourcePaths,
  validateTokenSources,
} from "../../../tokens/schema";

const sources = readTokenSources(fileURLToPath(new URL("../../../tokens/", import.meta.url)));

/** 정본 위에 파일을 덮어(또는 지워) 검사한 오류 목록. */
function errorsWith(overrides: Record<string, unknown>): readonly string[] {
  const files: Record<string, unknown> = structuredClone(sources);
  for (const [file, json] of Object.entries(overrides)) {
    if (json === undefined) delete files[file];
    else files[file] = json;
  }
  return validateTokenSources(files).errors;
}

const rootScoped = (scope: string, body: Record<string, unknown>): Record<string, unknown> => ({
  $extensions: { sds: { scope } },
  ...body,
});

describe("정본", () => {
  it("전량이 스키마를 통과한다", () => {
    expect(validateTokenSources(sources).errors).toEqual([]);
  });

  it("정본 파일은 이것이 전부다 — 층 순(primitive → semantic → component → legacy)", () => {
    expect(sortSourcePaths(Object.keys(sources))).toMatchInlineSnapshot(`
      [
        "primitive/color.json",
        "primitive/dimension.json",
        "primitive/motion.json",
        "primitive/typography.json",
        "semantic/canvas.json",
        "semantic/chrome.dark.json",
        "semantic/chrome.light.json",
        "semantic/layer.json",
        "semantic/tailwind.json",
        "component/collapse.json",
        "component/control.json",
        "component/overlay.json",
        "component/scroll.json",
        "component/toast.json",
        "component/tooltip.json",
        "legacy.json",
      ]
    `);
  });

  it("다크는 크롬 파일 하나뿐이고 라이트와 같은 집합이다", () => {
    const { tokens, dark } = validateTokenSources(sources);
    // legacy.json 의 chrome.* 는 옛 이름 alias 라 다크 짝이 없다(#22) — 정본 파일의 것만 센다.
    const chrome = tokens
      .filter((t) => t.path[0] === "chrome" && t.file === CHROME_LIGHT_FILE)
      .map((t) => t.path.join("."));
    expect(chrome.length).toBeGreaterThan(20);
    expect(dark.map((t) => t.path.join(".")).sort()).toEqual([...chrome].sort());
    expect(Object.keys(sources).filter((f) => f.endsWith(".dark.json"))).toEqual([DARK_FILE]);
  });
});

describe("검출기", () => {
  it("이름은 kebab-case", () => {
    expect(
      errorsWith({
        "primitive/x.json": rootScoped("root", { Bad_Name: { $type: "color", $value: "#000000" } }),
      }).join("\n"),
    ).toMatch(/kebab-case/);
  });

  it("$type 은 허용 목록 안", () => {
    expect(
      errorsWith({
        "primitive/x.json": rootScoped("root", { x: { $type: "gradient", $value: "#000000" } }),
      }).join("\n"),
    ).toMatch(/\$type «gradient»/);
  });

  it("$type 없는 토큰", () => {
    expect(
      errorsWith({ "primitive/x.json": rootScoped("root", { x: { $value: "#000000" } }) }).join("\n"),
    ).toMatch(/\$type 이 없다/);
  });

  it("값은 $type 의 모양 — 대문자 hex 는 color 가 아니다", () => {
    expect(
      errorsWith({
        "primitive/x.json": rootScoped("root", { x: { $type: "color", $value: "#FFFFFF" } }),
      }).join("\n"),
    ).toMatch(/color 값/);
    expect(
      errorsWith({
        "primitive/x.json": rootScoped("root", { x: { $type: "duration", $value: "200" } }),
      }).join("\n"),
    ).toMatch(/duration 값/);
  });

  it("alias 는 정의돼 있어야 한다", () => {
    expect(
      errorsWith({
        "primitive/x.json": rootScoped("root", { x: { $type: "color", $value: "{palette.cool.9999}" } }),
      }).join("\n"),
    ).toMatch(/\{palette\.cool\.9999\} 정의가 없다/);
  });

  it("순환 참조", () => {
    const out = errorsWith({
      "primitive/x.json": rootScoped("root", { $type: "color", a: { $value: "{b}" }, b: { $value: "{a}" } }),
    }).join("\n");
    expect(out).toMatch(/순환 참조: a → b → a/);
  });

  it("파일 머리에 scope 가 없으면 실패", () => {
    expect(
      errorsWith({ "primitive/x.json": { x: { $type: "color", $value: "#000000" } } }).join("\n"),
    ).toMatch(/\$extensions\.sds\.scope/);
  });

  it("같은 토큰을 두 파일에 두면 실패", () => {
    expect(
      errorsWith({
        "primitive/x.json": rootScoped("root", { canvas: { bg: { $type: "color", $value: "#000000" } } }),
      }).join("\n"),
    ).toMatch(/canvas\.bg 가 .* 에도 있다 — 토큰은 한 파일에서 한 번 정의한다/);
  });

  it("canvas.dark.json 은 존재 자체가 실패 — 캔버스에 다크는 없다", () => {
    expect(
      errorsWith({
        "semantic/canvas.dark.json": rootScoped("root", {
          canvas: { bg: { $type: "color", $value: "#000000" } },
        }),
      }).join("\n"),
    ).toMatch(/다크 파일은 semantic\/chrome\.dark\.json 하나뿐/);
  });

  it("canvas.* 는 캔버스 파일에만, 크롬 파일에는 chrome.* 만", () => {
    expect(
      errorsWith({
        "primitive/x.json": rootScoped("root", { canvas: { x: { $type: "color", $value: "#000000" } } }),
      }).join("\n"),
    ).toMatch(new RegExp(`canvas\\.\\* 는 ${CANVAS_FILE.replace(/[./]/g, "\\$&")} 에만`));
    const dark = structuredClone(sources[DARK_FILE]) as { chrome: Record<string, unknown> };
    dark.chrome.zzz = undefined;
    (dark as unknown as Record<string, unknown>).canvas = { bg: { $type: "color", $value: "#000000" } };
    expect(errorsWith({ [DARK_FILE]: dark }).join("\n")).toMatch(/다크는 크롬만 갈린다/);
  });

  it("크롬 토큰마다 다크 값이 있어야 한다 — 빠지면 다크에서 라이트 색으로 남는다", () => {
    const dark = structuredClone(sources[DARK_FILE]) as { chrome: Record<string, unknown> };
    delete dark.chrome.background;
    expect(errorsWith({ [DARK_FILE]: dark }).join("\n")).toMatch(/chrome\.background 의 다크 값이 없다/);
    expect(errorsWith({ [DARK_FILE]: undefined }).join("\n")).toMatch(/chrome\.dark\.json 이 없다/);
  });

  it("다크에만 있는 크롬 토큰도 실패", () => {
    const dark = structuredClone(sources[DARK_FILE]) as { chrome: Record<string, unknown> };
    dark.chrome.extra = { $value: "#000000" };
    expect(errorsWith({ [DARK_FILE]: dark }).join("\n")).toMatch(/chrome\.extra 가 라이트에 없다/);
  });

  it("sds.ts 는 duration 에만, MOTION 키는 한 번, reset · utility 는 그룹에만", () => {
    expect(
      errorsWith({
        "component/x.json": rootScoped("root", {
          x: { $type: "color", $value: "#000000", $extensions: { sds: { ts: "xMs" } } },
        }),
      }).join("\n"),
    ).toMatch(/sds\.ts 는 duration 에만/);
    expect(
      errorsWith({
        "component/x.json": rootScoped("root", {
          x: { $type: "duration", $value: "1ms", $extensions: { sds: { ts: "collapseMs" } } },
        }),
      }).join("\n"),
    ).toMatch(/MOTION\.collapseMs 가 .* 에도 있다/);
    expect(
      errorsWith({
        "component/x.json": rootScoped("theme", {
          x: { $type: "duration", $value: "1ms", $extensions: { sds: { reset: true } } },
        }),
      }).join("\n"),
    ).toMatch(/reset 은 그룹에만/);
    expect(
      errorsWith({
        "component/x.json": rootScoped("root", {
          x: {
            $type: "number",
            $value: 1,
            $extensions: { sds: { utility: { prefix: "z", properties: ["z-index"] } } },
          },
        }),
      }).join("\n"),
    ).toMatch(/utility 는 그룹에만/);
  });

  it("legacy 는 $deprecated 만 살고, 새 정본은 옛 이름을 참조하지 않는다", () => {
    /* alias 는 밖으로만 향한다 — 새 토큰이 `{ink}` 를 가리키면 옛 이름을 지울 때(major) 그 토큰이 함께 죽는다. */
    const legacy = structuredClone(sources[LEGACY_FILE]) as Record<string, unknown>;
    legacy.fresh = { $type: "color", $value: "{palette.gray.0}", $deprecated: false };
    expect(errorsWith({ [LEGACY_FILE]: legacy }).join("\n")).toMatch(/fresh 는 \$deprecated 여야 한다/);
    expect(
      errorsWith({ "primitive/x.json": rootScoped("root", { x: { $type: "color", $value: "{ink}" } }) }).join(
        "\n",
      ),
    ).toMatch(/x → \{ink\} 는 옛 이름이다/);
    expect(
      errorsWith({
        "primitive/x.json": rootScoped("legacy", {
          x: { $type: "color", $value: "#000000", $deprecated: true },
        }),
      }).join("\n"),
    ).toMatch(/legacy 스코프는 legacy\.json 만 쓴다/);
    expect(
      errorsWith({
        [LEGACY_FILE]: {
          ...legacy,
          fresh: undefined,
          "z-thing": {
            $type: "number",
            $value: 1,
            $extensions: { sds: { utility: { prefix: "z", properties: ["z-index"] } } },
          },
        },
      }).join("\n"),
    ).toMatch(/utility 는 그룹에만/);
  });

  it("음수 치수(tracking-tight)는 dimension 이다", () => {
    expect(
      errorsWith({
        "primitive/x.json": rootScoped("theme", { x: { $type: "dimension", $value: "-0.025em" } }),
      }).filter((e) => e.includes("x.json")),
    ).toEqual([]);
  });
});
