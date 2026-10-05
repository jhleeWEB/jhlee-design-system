"use client";
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

/* 테마 전환 — `html[data-theme]` 한 줄을 켜고 끄는 훅(#112).
 *
 * **정본은 DOM 이다.** theme.css 의 규약은 `html[data-theme="dark"]`(토글 다크) · `html[data-theme="light"]`(토글 라이트) · 속성 없음(OS 설정을 따른다 —
 * `:root:not([data-theme="light"])` 의 prefers-color-scheme 블록)이다. 훅은 그 속성을 **구독**한다(useSyncExternalStore + MutationObserver) —
 * 상태를 훅 안에 따로 들면 훅을 쓰는 두 자리(상단바 토글 · 설정 화면)가 어긋나고, 첫 페인트 전에 속성을 쓰는 인라인 스니펫 · Storybook 의
 * 테마 애드온처럼 바깥에서 속성을 바꾸는 것과도 어긋난다. 서버 스냅샷은 `system` · 라이트다 — 하이드레이션 뒤 실제 값으로 다시 그린다.
 *
 * 저장은 **선택**이다(usePanelLayout 과 같다). `storageKey` 를 주면 고른 값이 localStorage 에 남고 마운트 때 되읽어 속성에 쓴다.
 * localStorage · matchMedia 접근은 전부 지킨다 — 사생활 보호 창 · 차단된 사이트 데이터에서는 던지고, jsdom 에는 matchMedia 가 없다.
 *
 * 캔버스는 다크가 없다 — 이 속성이 뒤집는 것은 크롬뿐이다. */

/** 고른 테마 — `system` 은 OS 설정을 따른다(속성 없음). */
export type Theme = "light" | "dark" | "system";
/** 실제로 그려지는 테마 — `system` 을 OS 설정으로 푼 값. */
export type ResolvedTheme = "light" | "dark";

/** `useTheme` 이 돌려주는 상태와 조작 함수. */
export interface ThemeState {
  /** 고른 테마 — `html[data-theme]` 의 값. 속성이 없으면 `system`. */
  theme: Theme;
  /** 실제로 그려지는 테마 — `system` 이면 OS 의 prefers-color-scheme. */
  resolved: ResolvedTheme;
  /** 테마를 고른다 — `light` · `dark` 는 속성을 쓰고 `system` 은 속성을 지운다. `storageKey` 가 있으면 저장한다. */
  setTheme: (theme: Theme) => void;
}

const ATTRIBUTE = "data-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function readTheme(): Theme {
  const value = document.documentElement.getAttribute(ATTRIBUTE);
  return value === "light" || value === "dark" ? value : "system";
}

function writeTheme(theme: Theme) {
  if (theme === "system") document.documentElement.removeAttribute(ATTRIBUTE);
  else document.documentElement.setAttribute(ATTRIBUTE, theme);
}

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [ATTRIBUTE] });
  return () => observer.disconnect();
}

function darkQuery(): MediaQueryList | undefined {
  return typeof window.matchMedia === "function" ? window.matchMedia(DARK_QUERY) : undefined;
}

function subscribeSystem(onChange: () => void) {
  const query = darkQuery();
  query?.addEventListener("change", onChange);
  return () => query?.removeEventListener("change", onChange);
}

function readSystemDark() {
  return darkQuery()?.matches ?? false;
}

function serverTheme(): Theme {
  return "system";
}

function serverSystemDark() {
  return false;
}

/**
 * 테마 전환 훅 — `html[data-theme]` 을 읽고 쓴다. 뒤집히는 것은 크롬뿐이다(캔버스는 다크가 없다).
 * 같은 문서의 모든 `useTheme` 이 같은 값을 본다. 첫 페인트의 깜빡임은 훅이 막지 못한다 — 저장한 값을 `<head>` 의 인라인 스크립트로 먼저 쓴다(README «테마 전환»).
 */
export function useTheme(options?: {
  /** 저장 키 — 주면 고른 테마가 localStorage 에 남고 마운트 때 되읽는다. 스토리 · 테스트에서는 주지 않는다(결정적 렌더). */
  storageKey?: string;
}): ThemeState {
  const storageKey = options?.storageKey;
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const systemDark = useSyncExternalStore(subscribeSystem, readSystemDark, serverSystemDark);

  /* 저장본을 속성에 되쓴다 — 인라인 스니펫이 이미 썼다면 같은 값이라 아무 일도 없다. 저장본이 없으면 지금 속성을 그대로 둔다. */
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (isTheme(saved)) writeTheme(saved);
    } catch {
      /* 읽지 못해도 화면은 지금 속성대로 선다. */
    }
  }, [storageKey]);

  const setTheme = useCallback(
    (next: Theme) => {
      writeTheme(next);
      if (!storageKey) return;
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        /* 저장에 실패해도 테마는 바뀐다 — 저장은 편의다. */
      }
    },
    [storageKey],
  );

  return useMemo<ThemeState>(() => {
    const resolved: ResolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;
    return { theme, resolved, setTheme };
  }, [theme, systemDark, setTheme]);
}
