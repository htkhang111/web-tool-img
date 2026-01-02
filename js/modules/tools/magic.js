// js/main.js
import { UI } from './modules/core/ui.js';
import { Loader } from './modules/core/loader.js';
import { FabricEditor } from './modules/editor/fabric-editor.js'; 
import { Exporter } from './modules/core/exporter.js';
import { GifCore } from './modules/editor/gif-core.js'; 
import { SpriteCore } from './modules/editor/sprite-core.js'; 
import { Magic } from './modules/tools/magic.js';
import { BatchTool } from './modules/tools/batch.js'; 
import { Auth } from './modules/core/auth.js'; // Import module mới

// --- KHIÊN CHẮN ---
['dragenter', 'dragover', 'drop'].forEach(eventName => {
    window.addEventListener(eventName, (e) => { e.preventDefault(); }, false);
});

// Init
Loader.init();
FabricEditor.init();
GifCore.init();
SpriteCore.init();
Magic.init();
BatchTool.init();
Auth.init(); // Khởi chạy Auth

// Expose Auth ra window để nút HTML gọi được (onclick="window.Auth.logout()")
window.Auth = Auth;

// --- AUTH EVENTS ---
const btnLogin = document.getElementById('btnLogin');
if (btnLogin) {
    btnLogin.addEventListener('click', () => {
        const user = document.getElementById('authUsername').value.trim();
        Auth.login(user);
    });
}

const btnRegister = document.getElementById('btnRegister');
if (btnRegister) {
    btnRegister.addEventListener('click', () => {
        const user = document.getElementById('authUsername').value.trim();
        Auth.register(user);
    });
}

const btnSaveKey = document.getElementById('btnSaveKey');
if (btnSaveKey) {
    btnSaveKey.addEventListener('click', () => {
        const provider = document.getElementById('keyProvider').value;
        const name = document.getElementById('keyName').value.trim();
        const key = document.getElementById('keyValue').value.trim();
        
        if(!key) return alert("Chưa nhập Key mà lưu gì bro?");
        
        Auth.addKey(provider, key, name);
        
        // Reset form
        document.getElementById('keyName').value = '';
        document.getElementById('keyValue').value = '';
    });
}

// Events Download Studio (Giữ nguyên)
const btnDownload = document.getElementById('btnDownload');
if (btnDownload) {
    btnDownload.onclick = () => {
        const name = document.getElementById('outName').value;
        const format = document.getElementById('outFormat').value;
        const quality = document.getElementById('qualityRange').value;
        const dataURL = FabricEditor.exportImage(format, quality);
        Exporter.downloadBase64(dataURL, name, format);
    };
}
document.getElementById('qualityRange').oninput = (e) => UI.updateQualityDisplay(e.target.value);