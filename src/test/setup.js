import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

export const canvasCalls = {
  fillText: [],
  arcs: [],
};

HTMLCanvasElement.prototype.getContext = function getContext() {
  return {
    arc: (...args) => canvasCalls.arcs.push(args),
    beginPath: () => {},
    clearRect: () => {},
    createRadialGradient: () => ({
      addColorStop: () => {},
    }),
    fill: () => {},
    fillRect: () => {},
    lineTo: () => {},
    moveTo: () => {},
    restore: () => {},
    save: () => {},
    setTransform: () => {},
    stroke: () => {},
    fillText: (...args) => canvasCalls.fillText.push(args),
    measureText: () => ({ width: 80 }),
  };
};

Object.defineProperties(HTMLCanvasElement.prototype, {
  clientWidth: {
    configurable: true,
    value: 720,
  },
  clientHeight: {
    configurable: true,
    value: 440,
  },
});

HTMLCanvasElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return {
    left: 0,
    top: 0,
    right: 720,
    bottom: 440,
    width: 720,
    height: 440,
  };
};

window.requestAnimationFrame = vi.fn((callback) => window.setTimeout(() => callback(0), 16));
window.cancelAnimationFrame = (id) => window.clearTimeout(id);
