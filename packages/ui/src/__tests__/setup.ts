/* jsdom에는 레이아웃 관찰 API가 없다. 실측은 브라우저가 맡고 DOM 테스트는 수명 연결만 제공한다. */
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
