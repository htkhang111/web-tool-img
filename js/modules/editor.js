// js/modules/editor.js
import { UI } from './ui.js';

export const Editor = {
    cropperInstance: null,

    loadImage(imageSource) {
        const imageEl = UI.elements.imageEl;
        imageEl.src = imageSource;
        
        // Hiển thị vùng editor trước khi init cropper
        UI.showEditor();

        // Hủy instance cũ nếu có để tránh lỗi
        if (this.cropperInstance) {
            this.cropperInstance.destroy();
        }

        // Init Cropper mới
        this.cropperInstance = new Cropper(imageEl, {
            viewMode: 1, // Giới hạn vùng crop trong khung
            dragMode: 'move',
            autoCropArea: 0.8,
            responsive: true,
        });
    },

    rotate(deg) {
        if (this.cropperInstance) this.cropperInstance.rotate(deg);
    },

    flipHorizontal() {
        if (this.cropperInstance) {
            const data = this.cropperInstance.getData();
            this.cropperInstance.scaleX(data.scaleX * -1);
        }
    },

    reset() {
        if (this.cropperInstance) this.cropperInstance.reset();
    },

    getCanvas() {
        if (!this.cropperInstance) return null;
        return this.cropperInstance.getCroppedCanvas();
    }
};