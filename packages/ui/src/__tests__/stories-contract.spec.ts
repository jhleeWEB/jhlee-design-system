/// <reference types="node" />
// @vitest-environment node
// 소스 «파일» 을 읽는 스펙이라 node 로 돈다(tokens.spec 과 같은 이유).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/* 스토리 계약(계획 §2.5-e).
 *  1. 배럴(index.ts)이 내보내는 컴포넌트 모듈마다 옆에 `Name.stories.tsx` 가 있다.
 *  2. 있는 stories 파일은 `Default` · `Variants` · `ThemeContrast` 세 export 를 가진다 — 이름이 고정이어야
 *     매니페스트·docs·jsdom 계약 테스트·VRT 가 같은 픽스처를 가리킨다.
 * 첫날부터 초록으로 시작하려고 아직 없는 것은 STORIES_MISSING 에 적어 둔다. 이 목록은 **줄어들기만 한다** —
 * 스토리를 만들면 여기서 지워야 통과하고(래칫), 새 컴포넌트는 여기 넣지 말고 stories 를 함께 만든다. */

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** 배럴 기준 모듈 경로(`src/` 상대, 확장자 없음). Phase D 가 소비처 많은 순으로 지운다.
 *  `legacy/*`(shell·controls·design-system)는 여기 없다 — 루트 배럴이 `@deprecated` const 별칭으로만 내보내
 *  스캐너(`export … from`)에 잡히지 않고, 격리·동결된 코드라 스토리 계약 밖이다(#10). */
const STORIES_MISSING: readonly string[] = [
  "CanvasScale",
  "data/DataTable",
  "data/DescriptionList",
  "data/Table",
  "feedback/Alert",
  "feedback/EmptyState",
  "feedback/Progress",
  "feedback/Skeleton",
  "feedback/Spinner",
  "feedback/Toast",
  "navigation/Accordion",
  "navigation/BackButton",
  "navigation/Breadcrumb",
  "navigation/ScrollArea",
  "navigation/SegmentedControl",
  "navigation/Sidebar",
  "navigation/Toolbar",
  "overlay/AlertDialog",
  "overlay/Drawer",
  "overlay/DropdownMenu",
  "overlay/Modal",
  "overlay/Popover",
  "overlay/Tooltip",
  "primitives/Badge",
  "primitives/Card",
  "primitives/Choice",
  "primitives/Editorial",
  "primitives/Input",
  "primitives/MediaCard",
  "primitives/Misc",
  "primitives/PanelToggleButton",
];

const REQUIRED_EXPORTS = ["Default", "Variants", "ThemeContrast"] as const;

/** 배럴을 따라가며 «컴포넌트를 내보내는 모듈» 을 모은다.
 *  컴포넌트 = PascalCase 값 export. 타입·`*Variants`·훅(camelCase)·`GRID_TARGET_PX` 같은 UPPER_CASE 상수는 아니다. */
function componentModules(barrel: string, out = new Set<string>()): Set<string> {
  const dir = dirname(barrel);
  const text = readFileSync(barrel, "utf8");
  for (const m of text.matchAll(/export\s+\*\s+from\s+"(\.[^"]+)"/g)) {
    componentModules(resolveModule(dir, m[1]!, true), out);
  }
  for (const m of text.matchAll(/export\s*\{([^}]*)\}\s*from\s*"(\.[^"]+)"/g)) {
    const names = m[1]!
      .split(",")
      .map(s => s.trim())
      .filter(s => s && !s.startsWith("type "));
    const hasComponent = names.some(n => /^[A-Z][a-z]/.test(n) && !n.endsWith("Variants"));
    if (hasComponent) out.add(relative(SRC, resolveModule(dir, m[2]!, false)).replace(/\.tsx?$/, ""));
  }
  return out;
}

function resolveModule(dir: string, spec: string, barrelOnly: boolean): string {
  const candidates = barrelOnly ? [`${spec}/index.ts`, `${spec}.ts`] : [`${spec}.tsx`, `${spec}.ts`, `${spec}/index.ts`];
  for (const c of candidates) {
    const p = resolve(dir, c);
    if (existsSync(p)) return p;
  }
  throw new Error(`배럴이 가리키는 모듈을 찾지 못했다: ${spec} (from ${dir})`);
}

function storyFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) storyFiles(p, out);
    else if (entry.name.endsWith(".stories.tsx")) out.push(p);
  }
  return out;
}

describe("스토리 계약", () => {
  const modules = [...componentModules(join(SRC, "index.ts"))].sort();

  it("배럴이 내보내는 컴포넌트 모듈을 찾는다", () => {
    expect(modules.length).toBeGreaterThan(20);
    expect(modules).toContain("primitives/Button");
  });

  it("컴포넌트 모듈마다 stories 가 있거나 STORIES_MISSING 에 적혀 있다", () => {
    const missing = modules.filter(m => !existsSync(join(SRC, `${m}.stories.tsx`)) && !STORIES_MISSING.includes(m));
    expect(missing, "새 컴포넌트는 stories 와 함께 만든다").toEqual([]);
  });

  it("STORIES_MISSING 은 줄어들기만 한다 — stories 가 생긴 항목·배럴에 없는 항목은 지운다", () => {
    const stale = STORIES_MISSING.filter(m => existsSync(join(SRC, `${m}.stories.tsx`)) || !modules.includes(m));
    expect(stale).toEqual([]);
    expect([...STORIES_MISSING]).toEqual([...STORIES_MISSING].sort());
  });

  it.each(storyFiles(SRC).map(f => [relative(SRC, f), f] as const))("%s 는 Default · Variants · ThemeContrast 를 내보낸다", (_name, file) => {
    const text = readFileSync(file, "utf8");
    for (const name of REQUIRED_EXPORTS) {
      expect(text, `export const ${name}`).toMatch(new RegExp(`export const ${name}\\b`));
    }
  });
});
