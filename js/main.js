// js/main.js
import { UI } from './modules/core/ui.js';
import { Loader } from './modules/core/loader.js';
import { FabricEditor } from './modules/editor/fabric-editor.js';
import { Exporter } from './modules/core/exporter.js';
import { GifCore } from './modules/editor/gif-core.js';
import { SpriteCore } from './modules/editor/sprite-core.js';
import { Magic } from './modules/tools/magic.js';
import { BatchTool } from './modules/tools/batch.js';
import { Auth } from './modules/core/auth.js'; // Module mới

// Chặn drop mặc định
['dragenter', 'dragover', 'drop'].forEach(e => window.addEventListener(e, ev => ev.preventDefault()));

// Khởi tạo toàn bộ
Loader.init();
FabricEditor.init();
GifCore.init();
SpriteCore.init();
Magic.init();
BatchTool.init();
Auth.init();

// Expose Auth để HTML gọi được (nút Logout)
window.Auth = Auth;

// --- Sự kiện Auth ---
document.getElementById('btnLogin')?.addEventListener('click', () => {
    Auth.login(document.getElementById('authUsername').value.trim());
});

document.getElementById('btnRegister')?.addEventListener('click', () => {
    Auth.register(document.getElementById('authUsername').value.trim());
});

document.getElementById('btnSaveKey')?.addEventListener('click', () => {
    const p = document.getElementById('keyProvider').value;
    const n = document.getElementById('keyName').value.trim();
    const k = document.getElementById('keyValue').value.trim();
    if(k) {
        Auth.addKey(p, k, n);
        document.getElementById('keyValue').value = '';
    } else {
        alert("Chưa nhập Key!");
    }
});

// --- Sự kiện Download ---
document.getElementById('btnDownload')?.addEventListener('click', () => {
    const data = FabricEditor.exportImage(
        document.getElementById('outFormat').value,
        document.getElementById('qualityRange').value
    );
    Exporter.downloadBase64(data, document.getElementById('outName').value, document.getElementById('outFormat').value);
});

document.getElementById('qualityRange').oninput = (e) => UI.updateQualityDisplay(e.target.value);