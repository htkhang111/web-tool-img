// js/modules/loader.js
import { UI } from './ui.js';

export const Loader = {
    // Callback sẽ được gọi khi tải ảnh thành công
    onImageLoaded: null, 

    init(callback) {
        this.onImageLoaded = callback;
        this.setupFileInput();
        this.setupPasteEvent();
    },

    // Xử lý nút chọn file truyền thống
    setupFileInput() {
        const input = document.getElementById('imageInput');
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.processFile(file);
        });
    },

    // Xử lý Ctrl + V
    setupPasteEvent() {
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                // Tìm item là ảnh
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    // Gán tên tạm vì ảnh clipboard thường không có tên
                    // "Pasted_timestamp.png"
                    const dummyFile = new File([file], `Pasted_${Date.now()}.png`, { type: file.type });
                    this.processFile(dummyFile);
                    break; 
                }
            }
        });
    },

    processFile(file) {
        // Cập nhật UI tên file
        UI.updateFileInfo(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            // Gọi callback để editor xử lý URL ảnh
            if (this.onImageLoaded) {
                this.onImageLoaded(e.target.result);
            }
        };
        reader.readAsDataURL(file);
    }
};