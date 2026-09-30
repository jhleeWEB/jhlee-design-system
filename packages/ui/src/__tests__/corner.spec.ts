/*
 * 모서리의 정적 불변식(#26 → #36) — 배포되는 CSS 와 소스가 «일반 border-radius 원호 사다리» 계약을 지키는가.
 *
 * 스쿼클(`corner-shape: squircle` 진행형 향상 + 보정 계수 1.5)은 2026-09-30 사용자 결정으로 폐기했다(#36) — Chromium 에서 초타원의
 * 안쪽 윤곽 간격 특성 때문에 1px 테두리가 모서리에서 두꺼워 보였다. 되살아나는 길은 정해져 있다: 누가 `corner-shape` 를 CSS 에 다시 적거나,
 * 생성기가 사다리를 `calc(… * var(--corner-k))` 로 감싸거나, `@supports` 재정의를 다시 낸다. 아래 검사가 그 자리를 붙든다.
 * 토큰 규율(원시 반경 래칫 · 임의값 rounded-[…] 은 동심원만)은 스쿼클과 무관해 그대로 둔다. 검출기 자체는 의도적 위반으로 증명한다
 * (forbidden-patterns 의 DETECTOR_CASES 와 같은 이유).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import postcss from "postcss";
import { describe, expect, it } from "vitest";

import { sourceGraph } from "../__arch__/source-graph";
import { auditCorners, CONCENTRIC_PREFIX, countByFile, type CornerSource } from "../testing/corner-audit";
import { loadTokenModel, TOKEN_FILES } from "./tokens/model";

const read = (file: string): string =>
  readFileSync(fileURLToPath(new URL(`../${file}`, import.meta.url)), "utf8");
const model = loadTokenModel();

/** src/ 의 제품 CSS·TSX(legacy 포함, 스펙·스토리·생성물 제외) — 소비자 검사기에 넘기는 모양. */
const sources: CornerSource[] = [...sourceGraph().values()]
  .filter((f) => !f.excluded)
  .map((f) => ({ path: f.path, text: f.text }));

describe("스쿼클 없음", () => {
  it("배포 CSS(theme.css 의 @import 사슬) 어디에도 corner-shape 선언과 @supports (corner-shape…) 가 없다", () => {
    const found: string[] = [];
    for (const file of TOKEN_FILES) {
      const root = postcss.parse(read(file), { from: file });
      root.walkDecls("corner-shape", (decl) => {
        found.push(`${file}: corner-shape: ${decl.value}`);
      });
      root.walkAtRules("supports", (at) => {
        if (at.params.includes("corner-shape")) found.push(`${file}: @supports ${at.params}`);
      });
    }
    expect(found).toEqual([]);
  });

  it("제품 소스(CSS·TSX)에 corner-shape 가 없다 — 소비자 검사기와 같은 규칙", () => {
    expect(auditCorners(sources).filter((f) => f.rule === "corner-shape")).toEqual([]);
  });

  it("corner.css 는 규칙 없는 호환 파일이다 — 서브패스 ./corner.css 와 theme.css 의 @import 만 살린다", () => {
    expect(postcss.parse(read("corner.css")).nodes.filter((n) => n.type !== "comment")).toEqual([]);
  });

  it("--corner-shape · --corner-k 는 호환 alias 로 round · 1 한 값뿐이다", () => {
    expect(model.tokens.filter((t) => t.name === "--corner-shape").map((t) => t.value)).toEqual(["round"]);
    expect(model.tokens.filter((t) => t.name === "--corner-k").map((t) => t.value)).toEqual(["1"]);
  });
});

describe("반경 사다리", () => {
  const theme = (name: string): string | undefined =>
    model.tokens.find((t) => t.name === name && t.scope === "theme")?.value;

  it("sm · md · lg · xl 은 6 · 8 · 12 · 16px 고정이고 full 9999px · none 0 이다 — calc 로 감싸지 않는다", () => {
    expect(theme("--radius-sm")).toBe("6px");
    expect(theme("--radius-md")).toBe("8px");
    expect(theme("--radius-lg")).toBe("12px");
    expect(theme("--radius-xl")).toBe("16px");
    expect(theme("--radius-full")).toBe("9999px");
    expect(theme("--radius-none")).toBe("0");
    expect(
      model.tokens.filter((t) => t.name.startsWith("--radius-") && t.value.includes("--corner-k")),
    ).toEqual([]);
  });

  it("border-radius 원시값 래칫 — legacy shell.css 의 스위치 2 뿐이다", () => {
    /* 원형(999px · 50%)이라 토큰(--radius-full)으로 바꿔도 그림은 같다 — 옮기면 여기서 줄인다. 줄어들기만 한다.
     * theme.css 의 스크롤 썸(999px)은 C4 에서 var(--radius-full) 로 옮겼다(stylelint 가 반경 리터럴을 막는다). */
    const raw = auditCorners(sources).filter((f) => f.rule === "raw-radius");
    expect(countByFile(raw)).toEqual({ "legacy/shell.css": 2 });
    expect(raw.map((f) => f.text).sort()).toEqual(["border-radius: 50%", "border-radius: 999px"]);
  });

  it("TSX 의 rounded-[…] 는 동심원 calc(var(--radius-…) − 패딩) 뿐이다", () => {
    expect(auditCorners(sources).filter((f) => f.rule === "arbitrary-rounded")).toEqual([]);
    /* 컴포넌트(.tsx)만 — testing/corner-audit.ts 는 규칙 설명 문자열에 그 글자를 든다. */
    const concentric = sources
      .filter((s) => s.path.endsWith(".tsx"))
      .flatMap((s) => [...s.text.matchAll(/rounded-\[[^\]\n]*\]/g)].map((m) => `${s.path}: ${m[0]}`))
      .sort();
    expect(concentric).toMatchInlineSnapshot(`
      [
        "navigation/SegmentedControl.tsx: rounded-[calc(var(--radius-md)-var(--spacing)*0.5)]",
        "primitives/MediaCard.tsx: rounded-[calc(var(--radius-lg)-var(--space-hairline))]",
      ]
    `);
    expect(
      sources.filter(
        (s) =>
          /\.tsx?$/.test(s.path) && /\brounded-(?:\[|\()/.test(s.text) && !s.text.includes(CONCENTRIC_PREFIX),
      ),
    ).toEqual([]);
  });
});

describe("검출기 — 의도적 위반", () => {
  it("원시 반경 · 임의값 rounded-[7px] · 값에 관계없는 corner-shape 를 잡는다", () => {
    const probe: CornerSource[] = [
      {
        path: "app/widget.css",
        text: [
          ":root { --radius-chip: 6px; }",
          ".a { border-radius: 4px; }",
          ".b { border-radius: 50%; }",
          ".c { border-radius: var(--radius-full); }",
          ".rounded-full { border-radius: 9999px; }",
          ".d { border-radius: var(--radius-md); }",
          ".e { border-radius: calc(var(--radius-md) - 2px); }",
          "@media (min-width: 0) { .f { corner-shape: squircle; } .g { corner-shape: round; } }",
        ].join("\n"),
      },
      {
        path: "app/Widget.tsx",
        text: [
          'const a = cn("rounded-[7px] rounded-md");',
          'const b = "rounded-[calc(var(--radius-md)-2px)] rounded-full";',
          "// rounded-[8px] in a comment",
        ].join("\n"),
      },
    ];
    expect(auditCorners(probe).map((f) => `${f.rule} ${f.path}:${f.line} ${f.text}`)).toEqual([
      "raw-radius app/widget.css:2 border-radius: 4px",
      "raw-radius app/widget.css:3 border-radius: 50%",
      "raw-radius app/widget.css:5 border-radius: 9999px",
      "corner-shape app/widget.css:8 corner-shape: squircle",
      "corner-shape app/widget.css:8 corner-shape: round",
      "arbitrary-rounded app/Widget.tsx:1 rounded-[7px]",
    ]);
    expect(countByFile(auditCorners(probe), "raw-radius")).toEqual({ "app/widget.css": 3 });
  });
});
