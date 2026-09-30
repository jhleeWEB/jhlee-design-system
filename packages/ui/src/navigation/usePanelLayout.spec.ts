import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useSidebarCollapse } from "./Sidebar";
import { usePanelLayout } from "./usePanelLayout";

/* 접힘 상태 훅 두 벌의 동작 계약 — 저장은 선택이고(storageKey), 저장소가 던져도 화면은 산다(#45 에서 처음 덮는다). */
const IDS = ["params", "inspect"] as const;

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("usePanelLayout", () => {
  it("initial 을 따르고 없는 id 는 펼침에서 시작한다", () => {
    const { result } = renderHook(() => usePanelLayout(IDS, { initial: { inspect: true } }));
    expect(result.current.collapsed).toEqual({ params: false, inspect: true });
    expect(result.current.anyCollapsed).toBe(true);
  });

  it("toggle · setCollapsed · collapseAll · expandAll 이 상태를 바꾼다", () => {
    const { result } = renderHook(() => usePanelLayout(IDS));
    act(() => result.current.toggle("params"));
    expect(result.current.isCollapsed("params")).toBe(true);
    act(() => result.current.setCollapsed("params", false));
    expect(result.current.isCollapsed("params")).toBe(false);
    act(() => result.current.collapseAll());
    expect(result.current.collapsed).toEqual({ params: true, inspect: true });
    act(() => result.current.expandAll());
    expect(result.current.anyCollapsed).toBe(false);
  });

  it("triggerProps 가 aria-expanded · 영어 aria-label · onClick 을 준다", () => {
    const { result } = renderHook(() => usePanelLayout(IDS));
    expect(result.current.triggerProps("params", "Parameters")).toMatchObject({
      "aria-expanded": true,
      "aria-label": "Collapse Parameters",
    });
    act(() => result.current.triggerProps("params", "Parameters").onClick());
    expect(result.current.triggerProps("params", "Parameters")).toMatchObject({
      "aria-expanded": false,
      "aria-label": "Expand Parameters",
    });
  });

  it("storageKey 가 있으면 저장본을 읽고 바뀔 때마다 쓴다 — 저장본에 없는 id 는 기본값", () => {
    window.localStorage.setItem("layout", JSON.stringify({ inspect: true, stale: true }));
    const { result } = renderHook(() => usePanelLayout(IDS, { storageKey: "layout" }));
    expect(result.current.collapsed).toEqual({ params: false, inspect: true });
    act(() => result.current.toggle("params"));
    expect(JSON.parse(window.localStorage.getItem("layout") ?? "{}")).toEqual({
      params: true,
      inspect: true,
    });
  });

  it("storageKey 가 없으면 저장하지 않는다", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => usePanelLayout(IDS));
    act(() => result.current.toggle("params"));
    expect(setItem).not.toHaveBeenCalled();
  });

  it("localStorage 가 던져도(사생활 보호 창) 기본값으로 동작한다", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => usePanelLayout(IDS, { storageKey: "layout" }));
    expect(result.current.anyCollapsed).toBe(false);
    act(() => result.current.toggle("inspect"));
    expect(result.current.isCollapsed("inspect")).toBe(true);
  });
});

describe("useSidebarCollapse", () => {
  it("toggle 과 triggerProps 가 같은 상태를 뒤집는다", () => {
    const { result } = renderHook(() => useSidebarCollapse());
    expect(result.current.triggerProps["aria-label"]).toBe("Collapse sidebar");
    act(() => result.current.toggle());
    expect(result.current.collapsed).toBe(true);
    expect(result.current.triggerProps["aria-expanded"]).toBe(false);
    act(() => result.current.triggerProps.onClick());
    expect(result.current.collapsed).toBe(false);
  });
});
