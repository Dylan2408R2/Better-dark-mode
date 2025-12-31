// --- VARIABLES GLOBALES ---
let isPickerActive = false;
let pickerWindow = null;

chrome.runtime.onMessage.addListener((request) => {
    if (request.command === "APPLY_DARK") applyBetterDark(request.color);
    if (request.command === "CANCEL_DARK") cancelBetterDark();
    if (request.command === "START_PICKER") startPickerMode();
    if (request.command === "STOP_PICKER") stopPickerMode();
});

// --- FUNCION 1: MODO OSCURO CON SONIDO Y NOTIFICACIÓN ---
function applyBetterDark(customColor) {
    const bgColor = customColor || "#121212";
    
    const audio = new Audio(chrome.runtime.getURL("notificacion sucess.m4a"));
    audio.play().catch(e => console.log("Sonido no encontrado"));

    showNotification("Modo oscuro activado");

    cancelBetterDark();
    const style = document.createElement("style");
    style.id = "better-dark-engine";
    style.innerHTML = `
        html, body { background-color: ${bgColor} !important; }
        *, *::before, *::after { background-image: none !important; box-shadow: none !important; }
        *:not(iframe):not(canvas):not(img):not(video) { color: #ffffff !important; border-color: #444 !important; }
        div, section, nav, header, footer, table, tr, td, main, article, form, input, button { background-color: ${bgColor} !important; }
        svg { fill: #ffffff !important; color: #ffffff !important; }
    `;
    document.head.appendChild(style);
}

function showNotification(text) {
    const notify = document.createElement("div");
    notify.innerText = text;
    notify.style = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: #00ff00; color: #000; padding: 12px 25px; border-radius: 30px;
        z-index: 10000001; font-family: sans-serif; font-weight: bold;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5); animation: fade 2s forwards;
        pointer-events: none;
    `;
    document.body.appendChild(notify);
    setTimeout(() => notify.remove(), 2500);
}

// --- FUNCION 2: MODO CÓDIGO ABIERTO CORREGIDO ---
function startPickerMode() {
    if (isPickerActive) return;
    isPickerActive = true;

    pickerWindow = document.createElement("div");
    pickerWindow.id = "bd-picker-ui";
    pickerWindow.innerHTML = `
        <div style="font-weight:bold; margin-bottom:8px; font-size:14px;">Selector Activo</div>
        <button id="bd-stop-btn" style="background:#ff4444; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; width:100%; font-weight:bold;">DETENER</button>
    `;
    pickerWindow.style = `
        position: fixed; bottom: 20px; right: 20px; width: 160px;
        background: #1a1a1a; color: white; padding: 15px; border-radius: 12px;
        z-index: 10000000; border: 2px solid #00ff00; box-shadow: 0 5px 20px rgba(0,0,0,0.8);
        font-family: sans-serif; text-align: center;
    `;
    document.body.appendChild(pickerWindow);

    // Detener el selector al hacer clic en el botón rojo
    document.getElementById("bd-stop-btn").onclick = (e) => {
        e.stopPropagation();
        stopPickerMode();
    };

    document.addEventListener('mouseover', overlay);
    document.addEventListener('mouseout', removeOverlay);
    document.addEventListener('click', pick, true);
}

function stopPickerMode() {
    isPickerActive = false;
    if (pickerWindow) {
        pickerWindow.remove();
        pickerWindow = null;
    }
    document.removeEventListener('mouseover', overlay);
    document.removeEventListener('mouseout', removeOverlay);
    document.removeEventListener('click', pick, true);
    console.log("Selector desactivado");
}

// Lógica de selección con EXCLUSIÓN de la ventana del selector
const overlay = (e) => { 
    if(!isPickerActive || e.target.closest('#bd-picker-ui')) return;
    e.target.style.outline = "3px solid #00ff00"; 
};

const removeOverlay = (e) => { 
    if(e.target.closest('#bd-picker-ui')) return;
    e.target.style.outline = ""; 
};

const pick = (e) => {
    if(!isPickerActive) return;

    // SI EL CLIC ES DENTRO DE LA VENTANA DEL SELECTOR, NO HACER NADA
    if (e.target.closest('#bd-picker-ui')) {
        return; // Permitir que el botón de "Detener" funcione normalmente
    }

    e.preventDefault(); 
    e.stopPropagation();
    
    const el = e.target;
    if (['IFRAME', 'CANVAS', 'EMBED'].includes(el.tagName)) {
        alert("Error 404: lamentablemente no podemos cambiar el color de lo que nos indicaste");
    } else {
        el.style.setProperty('background-color', '#121212', 'important');
        el.style.setProperty('color', '#ffffff', 'important');
        el.setAttribute('data-bd-manual', 'true');
    }
};

function cancelBetterDark() {
    const engine = document.getElementById("better-dark-engine");
    if (engine) engine.remove();
    stopPickerMode();
}

// Animación
const styleAnim = document.createElement("style");
styleAnim.innerHTML = `@keyframes fade { 0% { opacity:0; top:0; } 20% { opacity:1; top:20px; } 80% { opacity:1; } 100% { opacity:0; } }`;
document.head.appendChild(styleAnim);