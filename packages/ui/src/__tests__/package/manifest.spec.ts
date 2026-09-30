/*
 * 매니페스트 게이트(계획 §2.5-c `manifest.spec`, #31) — `scripts/build-manifest.ts` 를 메모리에서 돌려 검사한다(dist 불필요).
 *
 * 네 가지: ① index 의 런타임 export 가 전부 실린다(컴포넌트 ∪ 유틸리티 == `Object.keys(import(index))`) ② optional prop 의 `default` 가 비어 있지 않다
 * ③ 유니언 `values[].doc` 이 비어 있지 않다 ④ `client` 가 실제 `"use client"` 와 같다. ②·③ 은 오늘 JSDoc 이 거의 없어(공개 144 중 `/**` 23,
 * `@default` 0) **KNOWN_GAPS 래칫**이다 — 실제 빈자리 목록이 기준선과 같아야 통과한다. 줄이면 같은 PR 에서 기준선을 낮춘다(Phase D 끝 0).
 * ①·④ 는 래칫이 아니라 불변식이다.
 */
import { describe, expect, it } from "vitest";

import { sourceGraph } from "../../__arch__/source-graph";
import {
  buildManifest,
  docForValue,
  orderValues,
  readCva,
  type Manifest,
} from "../../../scripts/build-manifest.ts";

let cached: Manifest | null = null;
const manifest = (): Manifest => (cached ??= buildManifest());

/** 오늘의 빈자리 — `Component.prop` · `Component.prop=value`. 경로 오름차순. 줄어들기만 한다. 첫 실측(2026-09-30, #31). */
const KNOWN_GAPS = {
  // optional prop 인데 `@default` 도 cva defaultVariants 도 없다(139).
  default: [
    "AccordionContent.contentClassName",
    "AppShell.inspect",
    "AppShell.inspectCollapseTo",
    "AppShell.inspectId",
    "AppShell.inspectOpen",
    "BackButton.size",
    "BackButton.variant",
    "Field.children",
    "Field.path",
    "Field.value",
    "HudCell.u",
    "HudCell.verdict",
    "Panel.actions",
    "Panel.eyebrow",
    "Panel.scrollable",
    "Panel.titleHidden",
    "Panel.variant",
    "PanelGroup.echo",
    "PanelGroup.open",
    "ScrollArea.orientation",
    "ScrollArea.viewportClassName",
    "ScrollArea.viewportProps",
    "ScrollArea.viewportRef",
    "Segmented.disabled",
    "SegmentedControl.className",
    "SegmentedControl.disabled",
    "SegmentedControl.size",
    "Select.aria-describedby",
    "Select.className",
    "Select.disabled",
    "Select.invalid",
    "Sidebar.collapsed",
    "Sidebar.label",
    "Sidebar.side",
    "SidebarItem.active",
    "SidebarItem.badge",
    "SidebarItem.shortcut",
    "Slider.className",
    "Slider.disabled",
    "Slider.onChange",
    "Slider.onCommit",
    "Slider.step",
    "Toggle.disabled",
    "Toggle.hideText",
    "Toggle.hint",
    "Toolbar.onCanvas",
    "ToolbarDivider.className",
    "TopBar.children",
    "TopBar.eyebrow",
    "ViewerPanel.head",
  ],
  // 유니언 값인데 «`값` — 설명» 줄이 없다(109).
  values: [
    "AppShell.inspectCollapseTo=hidden",
    "AppShell.inspectCollapseTo=strip",
    "Panel.variant=control",
    "Panel.variant=inspect",
    "ScrollArea.orientation=both",
    "ScrollArea.orientation=horizontal",
    "ScrollArea.orientation=vertical",
    "SegmentedControl.size=md",
    "SegmentedControl.size=sm",
    "Sidebar.side=left",
    "Sidebar.side=right",
  ],
};

describe("components.manifest.json", { timeout: 120_000 }, () => {
  it("index 의 런타임 export 가 전부 실린다 — 빠진 이름도, 없는 이름도 없다", async () => {
    const runtime = Object.keys(await import("../../index")).sort();
    const m = manifest();
    const listed = [...m.components.map((c) => c.name), ...m.utilities.map((u) => u.name)].sort();
    expect(listed).toEqual(runtime);
  });

  it("kind 는 component · compound · hook 이고 부품은 루트의 parts 에만 있다", () => {
    const m = manifest();
    const byName = new Map(m.components.map((c) => [c.name, c]));
    for (const c of m.components) {
      expect(["component", "compound", "hook"]).toContain(c.kind);
      if (c.kind === "compound") expect(c.parts, `${c.name} 은 부품인데 parts 가 있다`).toEqual([]);
      for (const part of c.parts) {
        expect(byName.get(part)?.kind, `${c.name}.parts 의 ${part}`).toBe("compound");
        expect(part.startsWith(c.name)).toBe(true);
      }
      expect(c.importPath).toBe("@jhleeweb/squircle-design-system");
      expect(c.sugar).toEqual([]);
    }
    expect(byName.get("DropdownMenu")?.parts).toContain("DropdownMenuSubContent"); // 부품의 부품이 아니라 루트의 부품
    expect(byName.get("SegmentedControl")?.kind).toBe("component"); // 다른 파일의 `Segmented` 는 우연한 접두
  });

  it('client 가 선언 파일의 첫 줄 "use client" 와 같다', () => {
    const graph = sourceGraph();
    for (const entry of [...manifest().components, ...manifest().utilities]) {
      const file = graph.get(entry.source.replace(/^src\//, ""));
      expect(file, `${entry.name}: ${entry.source} 를 소스 그래프에서 못 찾았다`).toBeDefined();
      const hasDirective = (file!.text.split("\n")[0] ?? "").trim() === '"use client";';
      expect(entry.client, `${entry.name} (${entry.source})`).toBe(hasDirective);
    }
  });

  it("optional prop 의 default 빈자리는 KNOWN_GAPS 와 같다(래칫)", () => {
    const gaps = manifest()
      .components.filter((c) => c.kind !== "hook")
      .flatMap((c) =>
        c.props.filter((p) => !p.required && p.default === "").map((p) => `${c.name}.${p.name}`),
      )
      .sort();
    expect(gaps).toEqual([...KNOWN_GAPS.default].sort());
  });

  it("유니언 values[].doc 빈자리는 KNOWN_GAPS 와 같다(래칫)", () => {
    const gaps = manifest()
      .components.flatMap((c) =>
        c.props.flatMap((p) =>
          p.values.filter((v) => v.doc === "").map((v) => `${c.name}.${p.name}=${v.value}`),
        ),
      )
      .sort();
    expect(gaps).toEqual([...KNOWN_GAPS.values].sort());
  });

  it("옛 tone 키는 deprecated alias 로 자동 설명되고 새 키가 앞에 온다", () => {
    const tone = manifest()
      .components.find((c) => c.name === "Button")
      ?.props.find((p) => p.name === "tone");
    expect(tone?.values.map((v) => v.value)).toEqual([
      "neutral",
      "primary",
      "destructive",
      "accent",
      "current",
      "danger",
      "default",
    ]);
    expect(tone?.values.find((v) => v.value === "accent")?.doc).toBe('deprecated alias of "primary"');
    expect(tone?.default).toBe('"neutral"'); // @default 가 없어도 같은 파일의 cva defaultVariants 에서 온다
  });

  it("cva 유틸리티는 축과 기본값을 AST 에서 읽는다", () => {
    const button = manifest().utilities.find((u) => u.name === "buttonVariants");
    expect(button?.kind).toBe("variants");
    expect(button?.axes).toEqual({
      variant: ["solid", "outline", "ghost", "link"],
      tone: ["neutral", "primary", "destructive"],
      size: ["sm", "md", "lg", "icon-sm", "icon", "icon-lg"],
    });
    expect(button?.defaults).toEqual({ variant: "outline", tone: "neutral", size: "md" });
    expect(button?.client).toBe(false);
  });

  it("토큰 색인은 legacy 를 뺀 정본 이름이다", () => {
    const t = manifest().tokens;
    expect(t.colors).toContain("primary");
    expect(t.colors).not.toContain("ink");
    expect(t.radius).toEqual(["none", "sm", "md", "lg", "xl", "full"]);
    expect(t.text).toEqual(["micro", "label", "body", "control", "title", "readout", "display"]);
    expect(t.spacingSteps).toEqual([0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]);
  });
});

describe("생성기 조각", () => {
  it("docForValue — «`값` — 설명» 과 «`값`(설명)» 을 읽고 다음 항목 앞에서 멈춘다", () => {
    const bullets =
      "시각 무게.\n- `solid` — 채움. 화면에 하나뿐인 주된 동작   - `outline` — 외곽선. 기본값\n- `ghost` — 상자 없음";
    expect(docForValue(bullets, "solid")).toBe("채움. 화면에 하나뿐인 주된 동작");
    expect(docForValue(bullets, "outline")).toBe("외곽선. 기본값");
    expect(docForValue(bullets, "ghost")).toBe("상자 없음");
    expect(docForValue("톤 — `neutral`(기본) · `primary`(주된 동작).", "primary")).toBe("주된 동작");
    expect(docForValue("아무 설명", "solid")).toBe("");
  });

  it("orderValues — cva 축 순서 → 나머지 알파벳 → 옛 tone 키", () => {
    expect(orderValues(["danger", "b", "primary", "a", "neutral"], ["neutral", "primary"])).toEqual([
      "neutral",
      "primary",
      "a",
      "b",
      "danger",
    ]);
  });

  it("readCva — cva 가 아닌 선언은 null", () => {
    expect(readCva({ kind: 0 } as never)).toBeNull();
  });
});
