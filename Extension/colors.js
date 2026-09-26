/* Pure color helpers, also exercised by the Node test suite. */
(function (scope) {
  "use strict";
  function parse(value) {
    const match = /^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i.exec(value || "");
    return match ? { r: +match[1], g: +match[2], b: +match[3], a: match[4] === undefined ? 1 : +match[4] } : null;
  }
  function css(c) { return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`; }
  function blend(fore, back) {
    const a = Math.min(1, Math.max(0, fore.a));
    return { r: fore.r * a + back.r * (1 - a), g: fore.g * a + back.g * (1 - a), b: fore.b * a + back.b * (1 - a), a: 1 };
  }
  function luminance(c) {
    const linear = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
    return .2126 * linear(c.r) + .7152 * linear(c.g) + .0722 * linear(c.b);
  }
  function contrast(a, b) {
    const x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
  }
  function darkBackground(c) {
    const mean = (c.r + c.g + c.b) / 3;
    const base = 20 + (1 - luminance(c)) * 32;
    return { r: Math.max(12, base + (c.r - mean) * .08), g: Math.max(12, base + 5 + (c.g - mean) * .08), b: Math.max(12, base + 14 + (c.b - mean) * .08), a: 1 };
  }
  function readableForeground(c, background) {
    const spread = Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
    let result = spread < 38 && luminance(c) < .35 ? { r: 228, g: 232, b: 240, a: 1 } : { ...c, a: 1 };
    if (contrast(result, background) >= 4.5) return result;
    const white = { r: 250, g: 251, b: 255, a: 1 };
    for (let step = 1; step <= 100; step++) {
      const t = step / 100;
      const candidate = { r: result.r * (1 - t) + white.r * t, g: result.g * (1 - t) + white.g * t, b: result.b * (1 - t) + white.b * t, a: 1 };
      if (contrast(candidate, background) >= 4.5) return candidate;
    }
    return white;
  }
  function isSingleColor(colors) {
    if (!colors.length) return false;
    const first = colors[0];
    return colors.every(color => Math.max(
      Math.abs(color.r - first.r), Math.abs(color.g - first.g), Math.abs(color.b - first.b)
    ) <= 36);
  }
  const api = { parse, css, blend, luminance, contrast, darkBackground, readableForeground, isSingleColor };
  scope.LumaColors = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
