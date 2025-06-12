import '@testing-library/jest-dom';

// jsdom に WebGL コンテキストを追加する簡易モック
HTMLCanvasElement.prototype.getContext =
  HTMLCanvasElement.prototype.getContext ||
  (() => null as unknown as ReturnType<typeof HTMLCanvasElement.prototype.getContext>);

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
  ResizeObserver;
