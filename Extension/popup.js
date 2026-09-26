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
  hostname.textContent = host || "Bu sayfada kullanılamıyor";
  siteToggle.disabled = !host;
  const updateStatus = async () => {
    if (!host) { status.textContent = "Safari iç sayfalarında eklentiler çalışmaz."; return; }
    try {
      const info = await api.tabs.sendMessage(tab.id, { type: "lumashade:status" });
      status.textContent = info.nativeDark ? "Bu site zaten koyu görünüyor; değiştirilmedi." : (!globalToggle.checked || !siteToggle.checked ? "Bu sitede kapalı." : "Bu sitede etkin.");
    } catch { status.textContent = "Bu sayfayı yenileyerek LumaShade’i başlatın."; }
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
