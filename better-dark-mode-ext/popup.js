// Referencia al input de color
const colorInput = document.getElementById('colorInput');

// 1. Al abrir el popup, cargar el color guardado para este sitio
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0] && tabs[0].url) {
        try {
            const url = new URL(tabs[0].url);
            const domain = url.hostname;
            chrome.storage.local.get([domain], (result) => {
                if (result[domain]) {
                    colorInput.value = result[domain];
                }
            });
        } catch (e) {
            console.log("No se puede obtener dominio en esta página");
        }
    }
});

// 2. Función principal para enviar órdenes a la página
async function sendAction(command, extra = {}) {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    
    // Evitar que funcione en páginas internas de Chrome
    if (tab.url.startsWith("chrome://")) {
        alert("Por seguridad, las extensiones no funcionan en páginas de Chrome.");
        return;
    }

    const url = new URL(tab.url);
    const domain = url.hostname;

    // Si la orden es aplicar modo oscuro, guardamos el color elegido para este dominio
    if (command === "APPLY_DARK") {
        const selectedColor = colorInput.value;
        let obj = {};
        obj[domain] = selectedColor;
        chrome.storage.local.set(obj);
        extra.color = selectedColor;
    }

    try {
        // Intentamos enviar el mensaje al content.js
        await chrome.tabs.sendMessage(tab.id, { command, ...extra });
    } catch (e) {
        // Si falla (porque no hay content.js), lo inyectamos y reintentamos
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });
        setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { command, ...extra });
        }, 100);
    }
}

// 3. Configurar los botones
document.getElementById('btnDark').addEventListener('click', () => {
    sendAction("APPLY_DARK");
});

document.getElementById('btnPick').addEventListener('click', () => {
    sendAction("START_PICKER");
});

document.getElementById('btnCancel').addEventListener('click', () => {
    sendAction("CANCEL_DARK");
});