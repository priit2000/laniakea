import "@testing-library/jest-dom/vitest";

HTMLCanvasElement.prototype.getContext = function getContext() {
  return {
    arc: () => {},
    beginPath: () => {},
    clearRect: () => {},
    createRadialGradient: () => ({
      addColorStop: () => {},
    }),
    fill: () => {},
    fillRect: () => {},
    fillText: () => {},
    lineTo: () => {},
    moveTo: () => {},
    restore: () => {},
    save: () => {},
    setTransform: () => {},
    stroke: () => {},
    measureText: () => ({ width: 0 }),
  };
};

window.requestAnimationFrame = (callback) => window.setTimeout(() => callback(Date.now()), 16);
window.cancelAnimationFrame = (id) => window.clearTimeout(id);
