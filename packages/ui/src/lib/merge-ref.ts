"use client";
import { useCallback, type Ref, type RefObject } from "react";

/* 외부 ref(소비자)와 내부 ref(DS 가 포커스·측정에 쓰는 것)를 같은 DOM 에 — Collapsible · Command 가 함께 쓴다(#61).
 * Accordion 의 usePartRef 와 같은 모양이다(그쪽은 동작이 굳은 파일이라 옮기지 않았다). */

/* ref 하나에 노드를 넣는다 — 훅 밖의 평범한 함수로 둔다: 훅 안에서 인자의 `.current` 에 직접 쓰면 react-hooks/immutability 가
 * «훅 인자 변경» 으로 잡는다(Accordion 의 assignRef 와 같은 이유, #45). */
function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void | (() => void) {
  if (typeof ref === "function") return ref(node);
  if (ref) ref.current = node;
}

/** 외부 ref 와 내부 ref 를 하나의 콜백 ref 로 — React 19 콜백 ref 의 정리 함수도 보존한다. */
export function useMergedRef<T>(external: Ref<T> | undefined, internal: RefObject<T | null>) {
  return useCallback(
    (node: T | null) => {
      assignRef(internal, node);
      const cleanup = assignRef(external, node);
      return () => {
        assignRef(internal, null);
        if (typeof cleanup === "function") cleanup();
        else assignRef(external, null);
      };
    },
    [external, internal],
  );
}
