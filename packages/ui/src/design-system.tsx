import { createContext, useContext, type ReactNode } from "react";

/* Tailwind를 아직 쓰지 않는 스튜디오는 기존 셸을 유지한다. 제품이 명시적으로 선택하면
   기존 공개 API도 DS 프리미티브로 그려져 두 종류의 컨트롤이 한 화면에 섞이지 않는다. */
const DesignSystemContext = createContext(false);

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  return <DesignSystemContext.Provider value>{children}</DesignSystemContext.Provider>;
}

export function useDesignSystem() {
  return useContext(DesignSystemContext);
}
