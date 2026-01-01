// js/main.js
import { UI } from './modules/ui.js';
import { Loader } from './modules/loader.js';
import { Editor } from './modules/editor.js';
import { Exporter } from './modules/exporter.js';
import { GifCore } from './modules/gif-core.js'; // <-- MỚI

// Init Phase 1
Loader.init((imageSource) => Editor.loadImage(imageSource));

// Events cũ (giữ nguyên)
document.getElementById('btnRotateLeft').onclick = () => Editor.rotate(-90);
document.getElementById('btnRotateRight').onclick = () => Editor.rotate(90);
document.getElementById('btnFlipH').onclick = () => Editor.flipHorizontal();
document.getElementById('btnReset').onclick = () => Editor.reset();
document.getElementById('qualityRange').oninput = (e) => UI.updateQualityDisplay(e.target.value);
document.getElementById('btnDownload').onclick = () => {
    const canvas = Editor.getCanvas();
    const name = document.getElementById('outName').value;
    const format = document.getElementById('outFormat').value;
    const quality = document.getElementById('qualityRange').value;
    Exporter.download(canvas, name, format, quality);
};

// Init Phase 2 (GIF) <-- MỚI
GifCore.init();