// js/main.js
import { UI } from './modules/ui.js';
import { Loader } from './modules/loader.js';
import { Editor } from './modules/editor.js';
import { Exporter } from './modules/exporter.js';

// 1. Khởi tạo Loader: Khi có ảnh (từ upload hoặc paste) -> Ném cho Editor hiển thị
Loader.init((imageSource) => {
    Editor.loadImage(imageSource);
});

// 2. Gắn sự kiện cho các nút Toolbar
document.getElementById('btnRotateLeft').onclick = () => Editor.rotate(-90);
document.getElementById('btnRotateRight').onclick = () => Editor.rotate(90);
document.getElementById('btnFlipH').onclick = () => Editor.flipHorizontal();
document.getElementById('btnReset').onclick = () => Editor.reset();

// 3. Gắn sự kiện UI (thanh trượt quality)
document.getElementById('qualityRange').oninput = (e) => {
    UI.updateQualityDisplay(e.target.value);
};

// 4. Sự kiện Download
document.getElementById('btnDownload').onclick = () => {
    const canvas = Editor.getCanvas();
    const name = document.getElementById('outName').value || 'image_processed';
    const format = document.getElementById('outFormat').value;
    const quality = document.getElementById('qualityRange').value;

    Exporter.download(canvas, name, format, quality);
};