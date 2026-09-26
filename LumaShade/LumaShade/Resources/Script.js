function show(enabled, useSettingsInsteadOfPreferences) {
    if (useSettingsInsteadOfPreferences) {
        document.getElementsByClassName('state-on')[0].innerText = "The extension is on. Manage websites from its Safari toolbar icon.";
        document.getElementsByClassName('state-off')[0].innerText = "Enable LumaShade in Safari Settings → Extensions.";
        document.getElementsByClassName('state-unknown')[0].innerText = "Enable LumaShade in Safari Settings → Extensions.";
        document.getElementsByClassName('open-preferences')[0].innerText = "Open Safari Extension Settings";
    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

function openPreferences() {
    webkit.messageHandlers.controller.postMessage("open-preferences");
}

document.querySelector("button.open-preferences").addEventListener("click", openPreferences);
