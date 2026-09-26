(async function () {
  "use strict";
  const api = typeof browser !== "undefined" ? browser : chrome;
  const globalToggle = document.querySelector("#enabled");
  const siteToggle = document.querySelector("#site");
  const hostname = document.querySelector("#hostname");
  const status = document.querySelector("#status");
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  const host = (() => { try { return new URL(tab?.url).hostname; } catch { return ""; } })();
  const settings = await api.storage.local.get({ enabled: true, sites: {} });
  globalToggle.checked = settings.enabled !== false;
  siteToggle.checked = settings.sites[host] !== false;
  hostname.textContent = host || "Unavailable on this page";
  siteToggle.disabled = !host;
  const updateStatus = async () => {
    if (!host) { status.textContent = "Extensions cannot run on Safari's internal pages."; return; }
    try {
      const info = await api.tabs.sendMessage(tab.id, { type: "lumashade:status" });
      status.textContent = info.nativeDark ? "This site is already dark, so it was left unchanged." : (!globalToggle.checked || !siteToggle.checked ? "Turned off for this site." : "Active on this site.");
    } catch { status.textContent = "Refresh this page to start LumaShade."; }
  };
  globalToggle.addEventListener("change", async () => { await api.storage.local.set({ enabled: globalToggle.checked }); updateStatus(); });
  siteToggle.addEventListener("change", async () => {
    const sites = { ...(await api.storage.local.get({ sites: {} })).sites };
    if (siteToggle.checked) delete sites[host]; else sites[host] = false;
    await api.storage.local.set({ sites });
    updateStatus();
  });
  updateStatus();
})();
