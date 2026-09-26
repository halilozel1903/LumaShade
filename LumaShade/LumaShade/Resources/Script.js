function show(enabled, useSettingsInsteadOfPreferences) {
    if (useSettingsInsteadOfPreferences) {
        document.getElementsByClassName('state-on')[0].innerText = "Eklenti etkin. Safari araç çubuğundaki simgeden siteleri yönetebilirsiniz.";
        document.getElementsByClassName('state-off')[0].innerText = "Safari Ayarları → Eklentiler bölümünden LumaShade’i etkinleştirin.";
        document.getElementsByClassName('state-unknown')[0].innerText = "Safari Ayarları → Eklentiler bölümünden LumaShade’i etkinleştirin.";
        document.getElementsByClassName('open-preferences')[0].innerText = "Safari Eklenti Ayarlarını Aç";
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
