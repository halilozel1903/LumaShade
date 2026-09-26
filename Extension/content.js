(function () {
  "use strict";
  const api = typeof browser !== "undefined" ? browser : chrome;
  const C = globalThis.LumaColors;
  const BASE = { r: 20, g: 25, b: 34, a: 1 };
  const excluded = new Set(["SCRIPT", "STYLE", "LINK", "META", "CANVAS", "VIDEO", "IMG", "PICTURE", "SOURCE", "IFRAME", "NOSCRIPT"]);
  const painted = new Map();
  let active = false;
  let settings = { enabled: true, sites: {} };
  let observer;
  let pending = new Set();
  let scheduled = false;
  let siteIsDark = false;

  function remember(element, property) {
    let originals = painted.get(element);
    if (!originals) { originals = new Map(); painted.set(element, originals); }
    if (!originals.has(property)) originals.set(property, [element.style.getPropertyValue(property), element.style.getPropertyPriority(property)]);
  }
  function set(element, property, value) {
    remember(element, property);
    element.style.setProperty(property, value, "important");
  }
  function restore() {
    for (const [element, properties] of painted) {
      for (const [name, [value, priority]] of properties) {
        if (value) element.style.setProperty(name, value, priority);
        else element.style.removeProperty(name);
      }
    }
    painted.clear();
  }
  function effectiveBackground(element) {
    for (let current = element; current; current = current.parentElement) {
      const value = C.parse(getComputedStyle(current).backgroundColor);
      if (value && value.a > .01) return value.a < 1 ? C.blend(value, BASE) : value;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }
  function detectDark() {
    const root = effectiveBackground(document.body || document.documentElement);
    const text = C.parse(getComputedStyle(document.body || document.documentElement).color);
    return C.luminance(root) < .16 && (!text || C.contrast(text, root) >= 4.5);
  }
  function isSmallAccent(element, computed, color) {
    const box = element.getBoundingClientRect();
    if (!box.width || !box.height || box.width > 16 || box.height > 16 || Math.abs(box.width - box.height) > 3) return false;
    if (element.textContent.trim() || element.children.length) return false;
    const radius = computed.borderTopLeftRadius;
    const round = radius.includes("%") ? parseFloat(radius) >= 35 : parseFloat(radius) >= box.width * .35;
    const spread = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b);
    return round && spread >= 28;
  }
  function paintVector(svg) {
    const box = svg.getBoundingClientRect();
    if (!box.width || !box.height || box.width > 440 || box.height > 140 || box.width * box.height > 40000) return;
    if (svg.querySelector("image, foreignObject, linearGradient, radialGradient, pattern, filter")) return;
    const shapes = svg.querySelectorAll("path, rect, circle, ellipse, line, polyline, polygon, text, tspan, use");
    if (!shapes.length || shapes.length > 120) return;
    const entries = [];
    for (const shape of shapes) {
      const style = getComputedStyle(shape);
      if (style.visibility === "hidden" || style.display === "none") continue;
      for (const property of ["fill", "stroke"]) {
        if (property === "fill" && (shape.tagName.toLowerCase() === "line" || shape.tagName.toLowerCase() === "polyline")) continue;
        const value = style.getPropertyValue(property);
        if (value === "none" || value === "transparent") continue;
        const color = C.parse(value);
        if (!color) return;
        if (color.a > .01) entries.push({ shape, property, color });
      }
    }
    if (!C.isSingleColor(entries.map(entry => entry.color))) return;
    const background = effectiveBackground(svg.parentElement);
    for (const { shape, property, color } of entries) {
      const visible = color.a < 1 ? C.blend(color, background) : color;
      if (C.contrast(visible, background) < 4.5) {
        set(shape, property, C.css(C.readableForeground(visible, background)));
      }
    }
  }
  function paint(element) {
    if (element instanceof SVGElement) {
      if (element.tagName.toLowerCase() === "svg" && !element.closest("[data-lumashade-ignore]")) paintVector(element);
      return;
    }
    if (excluded.has(element.tagName) || element.closest("[data-lumashade-ignore]")) return;
    const computed = getComputedStyle(element);
    if (computed.display === "none" || computed.visibility === "hidden") return;
    const own = C.parse(computed.backgroundColor);
    const inherited = element.parentElement ? effectiveBackground(element.parentElement) : BASE;
    let target = inherited;
    if (own && own.a > .01) {
      const source = own.a < 1 ? C.blend(own, inherited) : own;
      if (isSmallAccent(element, computed, source)) {
        target = inherited;
        if (C.contrast(source, inherited) < 6) set(element, "background-color", C.css(C.readableForeground(source, inherited, 6)));
      } else if (C.luminance(source) > .18) {
        target = C.darkBackground(source);
        set(element, "background-color", C.css(target));
      } else target = source;
    } else if (element === document.documentElement || element === document.body) {
      target = BASE;
      set(element, "background-color", C.css(BASE));
    }
    const foreground = C.parse(computed.color);
    if (foreground && foreground.a > .01) {
      const visible = foreground.a < 1 ? C.blend(foreground, target) : foreground;
      if (C.contrast(visible, target) < 4.5) set(element, "color", C.css(C.readableForeground(visible, target)));
    }
    const border = C.parse(computed.borderTopColor);
    if (border && C.luminance(border) > .3 && computed.borderTopStyle !== "none") set(element, "border-color", "#647084");
  }
  function processRoots() {
    scheduled = false;
    if (!active) { pending.clear(); return; }
    if (observer) observer.disconnect();
    for (const root of pending) {
      if (!root.isConnected || !(root instanceof Element)) continue;
      paint(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let item;
      while ((item = walker.nextNode())) paint(item);
    }
    pending.clear();
    observe();
    document.documentElement.setAttribute("data-lumashade-ready", "");
  }
  function schedule(root) {
    if (!active || !(root instanceof Element)) return;
    pending.add(root);
    if (!scheduled) { scheduled = true; setTimeout(processRoots, 0); }
  }
  function observe() {
    if (!observer) observer = new MutationObserver(changes => {
      for (const change of changes) {
        if (change.type === "attributes") schedule(change.target);
        else for (const node of change.addedNodes) if (node.nodeType === Node.ELEMENT_NODE) schedule(node);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
  function siteEnabled() { return settings.sites[location.hostname] !== false; }
  function apply() {
    const shouldEnable = settings.enabled !== false && siteEnabled() && !siteIsDark;
    if (shouldEnable && !active) {
      active = true;
      document.documentElement.removeAttribute("data-lumashade-ready");
      document.documentElement.setAttribute("data-lumashade-active", "");
      schedule(document.documentElement);
    } else if (!shouldEnable && active) {
      active = false;
      if (observer) observer.disconnect();
      pending.clear();
      restore();
      document.documentElement.removeAttribute("data-lumashade-active");
      document.documentElement.setAttribute("data-lumashade-ready", "");
    } else if (!shouldEnable) {
      document.documentElement.setAttribute("data-lumashade-ready", "");
    }
  }
  api.storage.local.get({ enabled: true, sites: {} }).then(value => {
    settings = value;
    siteIsDark = detectDark();
    apply();
  }).catch(() => document.documentElement.setAttribute("data-lumashade-ready", ""));
  api.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.enabled) settings.enabled = changes.enabled.newValue;
    if (changes.sites) settings.sites = changes.sites.newValue || {};
    apply();
  });
  api.runtime.onMessage.addListener(message => {
    if (message?.type === "lumashade:status") return Promise.resolve({ active, nativeDark: siteIsDark, hostname: location.hostname });
  });
})();
