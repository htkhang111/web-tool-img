// js/main.js
import { UI } from './modules/ui.js';
import { Loader } from './modules/loader.js';
import { Editor } from './modules/editor.js';
import { Exporter } from './modules/exporter.js';
import { GifCore } from './modules/gif-core.js';
import { SpriteCore } from './modules/sprite-core.js'; 
import { Magic } from './modules/magic.js';

// --- KHIÊN CHẮN: Chặn trình duyệt tự mở file khi kéo trượt ra ngoài ---
// Fix: Thêm dragenter để chặn triệt để hơn trên một số trình duyệt
['dragenter', 'dragover', 'drop'].forEach(eventName => {
    window.addEventListener(eventName, (e) => {
        // Chỉ preventDefault ở window level để không reload trang
        // Các vùng dropZone cụ thể sẽ handle việc stopPropagation
        e.preventDefault();
    }, false);
});
// ---------------------------------------------------------------------

// Init Phase 1
Loader.init((imageSource) => Editor.loadImage(imageSource));

// Events UI
const el = (id) => document.getElementById(id);
if(el('btnRotateLeft')) el('btnRotateLeft').onclick = () => Editor.rotate(-90);
if(el('btnRotateRight')) el('btnRotateRight').onclick = () => Editor.rotate(90);
if(el('btnFlipH')) el('btnFlipH').onclick = () => Editor.flipHorizontal();
if(el('btnReset')) el('btnReset').onclick = () => Editor.reset();
if(el('qualityRange')) el('qualityRange').oninput = (e) => UI.updateQualityDisplay(e.target.value);

if(el('btnDownload')) el('btnDownload').onclick = () => {
    const canvas = Editor.getCanvas();
    const name = el('outName').value;
    const format = el('outFormat').value;
    const quality = el('qualityRange').value;
    Exporter.download(canvas, name, format, quality);
};

// Init Modules
GifCore.init();
SpriteCore.init();
Magic.init();