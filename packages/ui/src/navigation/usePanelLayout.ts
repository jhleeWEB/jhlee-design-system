import { useCallback, useMemo, useState } from "react";

/* 여러 패널의 접힘 상태를 한 곳에서 든다.
 *
 * 저장은 **선택**이다. `storageKey` 를 주면 브라우저에 남지만, 그것은 제품 결정이므로
 * 기본값은 저장하지 않는다 — 접기 상태가 화면마다 달라야 하는 제품도 있고, URL 에 실어
 * 공유해야 하는 제품도 있다(이 저장소의 범례 표시 상태가 후자다).
 *
 * localStorage 접근은 전부 try/catch 다. 사생활 보호 창·차단된 사이트 데이터·미리보기에서는
 * 읽기와 쓰기가 **던진다**. 거기서 화면이 통째로 죽으면 안 된다. */
export interface PanelLayout<K extends string> {
  collapsed: Readonly<Record<K, boolean>>;
  isCollapsed: (id: K) => boolean;
  setCollapsed: (id: K, value: boolean) => void;
  toggle: (id: K) => void;
  collapseAll: () => void;
  expandAll: () => void;
  /** 하나라도 접혀 있는가 — 「전부 펼치기」 버튼을 띄울지 판단하는 자리. */
  anyCollapsed: boolean;
  /** 토글 버튼에 그대로 펴 넣는다. */
  triggerProps: (id: K, title: string) => {
    "aria-expanded": boolean;
    "aria-label": string;
    onClick: () => void;
  };
}

export function usePanelLayout<K extends string>(
  ids: readonly K[],
  options?: { storageKey?: string; initial?: Partial<Record<K, boolean>> },
): PanelLayout<K> {
  const storageKey = options?.storageKey;
  const initial = options?.initial;

  const [collapsed, setState] = useState<Record<K, boolean>>(() => {
    const base = Object.fromEntries(ids.map(id => [id, initial?.[id] ?? false])) as Record<K, boolean>;
    if (!storageKey) return base;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return base;
      const saved = JSON.parse(raw) as Partial<Record<K, boolean>>;
      /* 저장본에 없는 id 는 기본값을 쓴다 — 패널이 추가된 뒤에도 저장본이 계속 유효해야 한다. */
      for (const id of ids) if (typeof saved[id] === "boolean") base[id] = saved[id];
      return base;
    } catch {
      return base;
    }
  });

  const persist = useCallback(
    (next: Record<K, boolean>) => {
      if (!storageKey) return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* 저장에 실패해도 화면은 계속 동작한다. 접힘 상태는 편의이지 데이터가 아니다. */
      }
    },
    [storageKey],
  );

  const apply = useCallback(
    (update: (prev: Record<K, boolean>) => Record<K, boolean>) => {
      setState(prev => {
        const next = update(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return useMemo<PanelLayout<K>>(() => {
    const isCollapsed = (id: K) => collapsed[id] === true;
    const setCollapsed = (id: K, value: boolean) => apply(prev => ({ ...prev, [id]: value }));
    return {
      collapsed,
      isCollapsed,
      setCollapsed,
      toggle: (id: K) => apply(prev => ({ ...prev, [id]: !prev[id] })),
      collapseAll: () => apply(() => Object.fromEntries(ids.map(id => [id, true])) as Record<K, boolean>),
      expandAll: () => apply(() => Object.fromEntries(ids.map(id => [id, false])) as Record<K, boolean>),
      anyCollapsed: ids.some(id => collapsed[id] === true),
      triggerProps: (id: K, title: string) => ({
        "aria-expanded": !isCollapsed(id),
        "aria-label": `${isCollapsed(id) ? "Expand" : "Collapse"} ${title}`,
        onClick: () => setCollapsed(id, !isCollapsed(id)),
      }),
    };
  }, [collapsed, apply, ids]);
}
