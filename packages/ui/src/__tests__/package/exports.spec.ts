/*
 * 패키지 계약 — exports(계획 §2.4 5층 `exports.spec` · §2.6 A3, #11).
 *
 * 워크스페이스는 `exports`(src)를, 발행물은 `publishConfig.exports`(dist)를 본다 — pnpm 이 발행 시 바꿔 끼운다. 두 표가 갈리면 Storybook 에서
 * 되는 서브패스가 소비자에게는 없고, 와일드카드(`"./*"`)가 다시 생기면 attw 가 타입 해석을 못 한다(계획 «`"./*"` 닫기»). CI 의 셸 grep 이
 * 하던 pack 내용 검사도 여기로 옮겨 실패 메시지가 어느 파일이 왜 실렸는지 말하게 한다.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const PKG_DIR = fileURLToPath(new URL("../../../", import.meta.url));
const pkg = JSON.parse(readFileSync(`${PKG_DIR}package.json`, "utf8")) as {
  files: string[];
  bin: Record<string, string>;
  exports: Record<string, string>;
  publishConfig: { exports: Record<string, string | Record<string, string>> };
};

const flatten = (target: string | Record<string, string>): string[] =>
  typeof target === "string" ? [target] : Object.values(target);

describe("exports", () => {
  it("서브패스는 명시된 것뿐이다 — 이 표가 공개 표면이다", () => {
    expect(Object.keys(pkg.exports)).toMatchInlineSnapshot(`
      [
        ".",
        "./canvas-metrics",
        "./testing",
        "./eslint",
        "./theme.css",
        "./corner.css",
        "./tokens.css",
        "./canvas.css",
        "./package.json",
      ]
    `);
  });

  it("publishConfig.exports 는 같은 서브패스를 dist 로 가리킨다", () => {
    expect(Object.keys(pkg.publishConfig.exports)).toEqual(Object.keys(pkg.exports));
    for (const [key, target] of Object.entries(pkg.publishConfig.exports)) {
      for (const path of flatten(target))
        expect(path, key).toMatch(key === "./package.json" ? /^\.\/package\.json$/ : /^\.\/dist\//);
    }
    expect(pkg.publishConfig.exports).toMatchInlineSnapshot(`
      {
        ".": {
          "default": "./dist/index.js",
          "import": "./dist/index.js",
          "types": "./dist/index.d.ts",
        },
        "./canvas-metrics": {
          "default": "./dist/canvas-metrics.js",
          "import": "./dist/canvas-metrics.js",
          "types": "./dist/canvas-metrics.d.ts",
        },
        "./canvas.css": "./dist/canvas.css",
        "./corner.css": "./dist/corner.css",
        "./eslint": {
          "default": "./dist/eslint/index.js",
          "import": "./dist/eslint/index.js",
          "types": "./dist/eslint/index.d.ts",
        },
        "./package.json": "./package.json",
        "./testing": {
          "default": "./dist/testing/index.js",
          "import": "./dist/testing/index.js",
          "types": "./dist/testing/index.d.ts",
        },
        "./theme.css": "./dist/theme.css",
        "./tokens.css": "./dist/tokens.css",
      }
    `);
  });

  it("와일드카드가 없다 — attw 가 타입을 해석하지 못하는 유일한 모양이다", () => {
    for (const [key, target] of [
      ...Object.entries(pkg.exports),
      ...Object.entries(pkg.publishConfig.exports),
    ]) {
      expect(key).not.toContain("*");
      for (const path of flatten(target)) expect(path).not.toContain("*");
    }
  });

  it("exports 대상 파일이 존재한다", () => {
    for (const [key, target] of Object.entries(pkg.exports))
      expect(existsSync(`${PKG_DIR}${target}`), `${key} → ${target}`).toBe(true);
  });

  it("dist 가 있으면 publishConfig.exports 대상 파일도 존재한다", () => {
    /* dist 는 커밋하지 않는다 — 로컬·unit job 은 build 없이 돌고, package job 이 build 뒤 이 분기를 탄다.
       로컬에서 여기가 빨가면 대개 dist 가 낡은 것이다(서브패스를 더한 뒤 build 를 안 돌렸다) — `pnpm build` 뒤 다시 본다. */
    if (!existsSync(`${PKG_DIR}dist/index.js`)) return;
    for (const [key, target] of Object.entries(pkg.publishConfig.exports))
      for (const path of flatten(target))
        expect(existsSync(`${PKG_DIR}${path}`), `${key} → ${path} (dist 가 낡았으면 pnpm build)`).toBe(true);
  });

  it("files 는 dist · 에이전트 산출물(agent · docs · llms.txt) · 문서뿐이다", () => {
    expect(pkg.files).toEqual(["dist", "agent", "docs", "llms.txt", "README.md", "CHANGELOG.md"]);
  });

  it("bin 은 sds-agent 하나이고 dist 의 별도 entry 다(#31)", () => {
    expect(pkg.bin).toEqual({ "sds-agent": "./dist/agent/cli.js" });
  });
});

describe("pack 내용", () => {
  /* pnpm 10 의 `pack` 에는 --dry-run 이 없다(실측 «Unknown option: 'dry-run'») — npm 의 것을 쓴다. `--ignore-scripts` 가 없으면 prepack 이
     build 를 돌려 dist 를 지우고 다시 만드는데, 그 사이 다른 워커의 dist 검사가 빈 폴더를 본다. 목록은 `files` 필드가 정하므로 npm 으로 충분하다. */
  const out = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: PKG_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const files = (JSON.parse(out) as { files: { path: string }[] }[])[0]!.files.map((f) => f.path);

  it("스펙·소스·스토리는 실리지 않는다", () => {
    expect(
      files.filter(
        (f) =>
          f.startsWith("src/") ||
          f.includes("__tests__") ||
          f.includes("__arch__") ||
          f.includes(".stories."),
      ),
    ).toEqual([]);
  });

  it("package.json 과 README 는 실린다", () => {
    expect(files).toContain("package.json");
    expect(files).toContain("README.md");
  });

  it("에이전트 산출물이 실린다 — AGENTS 블록 · 스킬 · llms.txt · 컴포넌트 문서(#31)", () => {
    expect(files).toContain("agent/AGENTS.block.md");
    expect(files).toContain("agent/skills/squircle-ds/SKILL.md");
    expect(files).toContain("llms.txt");
    expect(files).toContain("docs/components/README.md");
    expect(files).toContain("docs/components/Button.md");
  });

  it("dist 가 있으면 bin · 매니페스트도 실린다", () => {
    if (!existsSync(`${PKG_DIR}dist/index.js`)) return;
    expect(files).toContain("dist/agent/cli.js");
    expect(files).toContain("dist/components.manifest.json");
  });

  it("dist 가 있으면 publishConfig.exports 대상이 전부 실린다", () => {
    if (!existsSync(`${PKG_DIR}dist/index.js`)) return;
    for (const target of Object.values(pkg.publishConfig.exports))
      for (const path of flatten(target))
        expect(files, `${path} (dist 가 낡았으면 pnpm build)`).toContain(path.replace(/^\.\//, ""));
  });
});
