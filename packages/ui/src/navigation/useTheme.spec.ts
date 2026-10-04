import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useTheme } from "./useTheme";

/* 테마 훅의 동작 계약(#112) — 정본은 html[data-theme] 이고, 저장은 선택이며, 저장소가 던져도 화면은 산다. */
const root = document.documentElement;

function mockSystemDark(matches: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  };
  vi.stubGlobal("matchMedia", () => query);
  return {
    set(next: boolean) {
      query.matches = next;
      for (const listener of listeners) listener();
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  root.removeAttribute("data-theme");
  window.localStorage.clear();
});

describe("useTheme", () => {
  it("속성이 없으면 system 이고 OS 설정으로 푼다", () => {
    const system = mockSystemDark(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
    expect(result.current.resolved).toBe("dark");
    act(() => system.set(false));
    expect(result.current.resolved).toBe("light");
  });

  it("matchMedia 가 없어도(jsdom) 던지지 않고 라이트로 푼다", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toMatchObject({ theme: "system", resolved: "light" });
  });

  it("setTheme 이 html[data-theme] 을 쓰고 system 은 속성을 지운다", async () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("dark"));
    expect(root).toHaveAttribute("data-theme", "dark");
    await waitFor(() => expect(result.current).toMatchObject({ theme: "dark", resolved: "dark" }));
    act(() => result.current.setTheme("system"));
    expect(root).not.toHaveAttribute("data-theme");
    await waitFor(() => expect(result.current.theme).toBe("system"));
  });

  it("이미 있는 속성을 읽고, 바깥에서 바꾼 속성도 따라간다 — 정본은 DOM 이다", async () => {
    root.setAttribute("data-theme", "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    act(() => root.setAttribute("data-theme", "light"));
    await waitFor(() => expect(result.current).toMatchObject({ theme: "light", resolved: "light" }));
  });

  it("훅을 쓰는 두 자리가 같은 값을 본다", async () => {
    const a = renderHook(() => useTheme());
    const b = renderHook(() => useTheme());
    act(() => a.result.current.setTheme("dark"));
    await waitFor(() => expect(b.result.current.theme).toBe("dark"));
  });

  it("storageKey 가 있으면 저장하고 마운트 때 되읽는다", async () => {
    window.localStorage.setItem("jds-theme", "dark");
    const { result } = renderHook(() => useTheme({ storageKey: "jds-theme" }));
    await waitFor(() => expect(result.current.theme).toBe("dark"));
    expect(root).toHaveAttribute("data-theme", "dark");
    act(() => result.current.setTheme("light"));
    expect(window.localStorage.getItem("jds-theme")).toBe("light");
  });

  it("저장본이 테마가 아니면 무시한다", () => {
    window.localStorage.setItem("jds-theme", "sepia");
    renderHook(() => useTheme({ storageKey: "jds-theme" }));
    expect(root).not.toHaveAttribute("data-theme");
  });

  it("storageKey 가 없으면 저장하지 않는다", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("dark"));
    expect(window.localStorage.length).toBe(0);
  });

  it("저장소가 던져도 테마는 바뀐다", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => useTheme({ storageKey: "jds-theme" }));
    expect(() => act(() => result.current.setTheme("dark"))).not.toThrow();
    expect(root).toHaveAttribute("data-theme", "dark");
  });
});
