// js/main.js
import { UI } from './modules/core/ui.js';
import { Loader } from './modules/core/loader.js';
import { FabricEditor } from './modules/editor/fabric-editor.js'; // Sửa path
import { Exporter } from './modules/core/exporter.js';
import { GifCore } from './modules/editor/gif-core.js'; // Sửa path
import { SpriteCore } from './modules/editor/sprite-core.js'; // Sửa path
import { Magic } from './modules/tools/magic.js';
import { BatchTool } from './modules/tools/batch.js'; 

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

// Events Download Studio
const btnDownload = document.getElementById('btnDownload');
if (btnDownload) {
    btnDownload.onclick = () => {
        const name = document.getElementById('outName').value;
        const format = document.getElementById('outFormat').value;
        const quality = document.getElementById('qualityRange').value;
        
        // Lấy data từ Fabric
        const dataURL = FabricEditor.exportImage(format, quality);
        Exporter.downloadBase64(dataURL, name, format);
    };
}

// Update Quality display
document.getElementById('qualityRange').oninput = (e) => UI.updateQualityDisplay(e.target.value);