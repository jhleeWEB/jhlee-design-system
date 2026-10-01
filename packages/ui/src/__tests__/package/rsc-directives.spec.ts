/*
 * 클라이언트 경계 — "use client"(계획 §2.5-f `rsc-directives.spec`, Phase A 필수, #11).
 *
 * 훅·핸들러·컨텍스트·Radix 를 쓰는 파일은 첫 줄에 `"use client"` 가 있어야 Next 의 서버 컴포넌트 트리에서 그 모듈이 클라이언트로 넘어간다.
 * 지시문이 빠지면 «useState is not defined in Server Components» 로 소비자 빌드가 죽고, 지시문이 있는 파일에 `export *` 가 있으면 재수출이
 * 서버에서 `undefined` 가 된다(CLAUDE.md «클라이언트 경계»). tsdown 은 unbundle 모드라 파일별 지시문을 보존한다 — 그것도 dist 로 확인한다.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { SRC_ROOT, sourceGraph, type SourceFileInfo } from "../../__arch__/source-graph";

const DIRECTIVE = '"use client";';
const DIST = join(SRC_ROOT, "..", "dist");

const sources = [...sourceGraph().values()].filter((f) => !f.excluded && f.kind !== "css");

/** 첫 줄이 지시문인가 — 주석보다 앞, 따옴표는 큰따옴표. tsdown 이 그대로 옮기는 형태다. */
const hasDirective = (file: SourceFileInfo): boolean => (file.text.split("\n")[0] ?? "").trim() === DIRECTIVE;

/**
 * 클라이언트여야 하는 근거 — 이 넷 가운데 하나라도 본문에 있으면 서버에서 실행할 수 없다.
 * 프로퍼티 타입 선언(`onClick?: …`)은 근거가 아니다 — JSX 속성 `onX={…}` 만 센다. 훅은 정의든 호출이든 `useX(` 다(훅 파일 자체도 클라이언트다).
 */
function clientReasons(file: SourceFileInfo): string[] {
  const reasons: string[] = [];
  if (/\buse[A-Z]\w*\s*\(/.test(file.code)) reasons.push("hook");
  if (/\bon[A-Z]\w*=\{/.test(file.code)) reasons.push("handler");
  if (/\b(?:createContext|useContext)\b/.test(file.code)) reasons.push("context");
  if (/from\s+["']radix-ui["']/.test(file.code)) reasons.push("radix-ui");
  return reasons;
}

const shouldBeClient = sources
  .filter((f) => clientReasons(f).length > 0)
  .map((f) => f.path)
  .sort();
const isClient = sources
  .filter(hasDirective)
  .map((f) => f.path)
  .sort();

describe('"use client"', () => {
  it("훅·핸들러·컨텍스트·radix-ui 를 쓰는 파일 집합이 지시문 파일 집합과 같다", () => {
    const missing = shouldBeClient
      .filter((p) => !isClient.includes(p))
      .map((p) => `${p}: ${clientReasons(sourceGraph().get(p)!).join("·")} 인데 "use client" 가 없다`);
    const spurious = isClient
      .filter((p) => !shouldBeClient.includes(p))
      .map((p) => `${p}: 클라이언트 근거가 없는데 "use client" 가 있다`);
    expect(missing).toEqual([]);
    expect(spurious).toEqual([]);
  });

  it("지시문 파일은 이것이 전부다", () => {
    expect(isClient).toMatchInlineSnapshot(`
      [
        "data/DataTable.tsx",
        "feedback/Progress.tsx",
        "feedback/Toast.tsx",
        "lib/merge-ref.ts",
        "navigation/Accordion.tsx",
        "navigation/AppShell.tsx",
        "navigation/Breadcrumb.tsx",
        "navigation/Collapsible.tsx",
        "navigation/Pagination.tsx",
        "navigation/ResizablePanels.tsx",
        "navigation/ScrollArea.tsx",
        "navigation/SegmentedControl.tsx",
        "navigation/Sidebar.tsx",
        "navigation/Tabs.tsx",
        "navigation/usePanelLayout.ts",
        "overlay/AlertDialog.tsx",
        "overlay/Command.tsx",
        "overlay/ContextMenu.tsx",
        "overlay/Drawer.tsx",
        "overlay/DropdownMenu.tsx",
        "overlay/HoverCard.tsx",
        "overlay/Modal.tsx",
        "overlay/Popover.tsx",
        "overlay/Tooltip.tsx",
        "primitives/Avatar.tsx",
        "primitives/Button.tsx",
        "primitives/Calendar.tsx",
        "primitives/Card.tsx",
        "primitives/Choice.tsx",
        "primitives/Combobox.tsx",
        "primitives/DatePicker.tsx",
        "primitives/Field.tsx",
        "primitives/Input.tsx",
        "primitives/MediaCard.tsx",
        "primitives/Misc.tsx",
        "primitives/NumberInput.tsx",
        "primitives/PanelToggleButton.tsx",
        "primitives/Select.tsx",
        "primitives/Slider.tsx",
        "primitives/ToggleGroup.tsx",
      ]
    `);
  });

  it("배럴 · cn · canvas-metrics · *.variants.ts 에는 지시문이 없다", () => {
    for (const file of sources) {
      const pure =
        /(^|\/)index\.ts$/.test(file.path) ||
        file.path === "cn.ts" ||
        file.path === "canvas-metrics.ts" ||
        file.path.endsWith(".variants.ts");
      if (pure) expect(hasDirective(file), file.path).toBe(false);
    }
  });

  it("지시문 파일에는 export * 가 없다", () => {
    for (const file of sources)
      if (hasDirective(file)) expect(file.code, file.path).not.toMatch(/^\s*export\s+\*\s+from/m);
  });

  it("dist 가 있으면 같은 경로의 첫 줄에 지시문이 남아 있다", () => {
    /* tsdown unbundle 이 지시문을 보존하는지는 빌드 산출물로만 알 수 있다 — package job 이 build 뒤 이 분기를 탄다. */
    if (!existsSync(join(DIST, "index.js"))) return;
    for (const file of sources) {
      const out = join(DIST, file.path.replace(/\.tsx?$/, ".js"));
      if (!existsSync(out)) continue; // 배럴에 닿지 않는 파일은 산출물이 없다
      const first = (readFileSync(out, "utf8").split("\n")[0] ?? "").trim();
      expect(
        first === DIRECTIVE,
        `${out}: ${hasDirective(file) ? "지시문이 사라졌다" : "지시문이 생겼다"}`,
      ).toBe(hasDirective(file));
    }
  });
});
