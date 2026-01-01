// js/modules/editor.js
import { UI } from './ui.js';

export const Editor = {
    cropperInstance: null,

    loadImage(imageSource) {
        const imageEl = UI.elements.imageEl;
        imageEl.src = imageSource;
        
        UI.showEditor();

        if (this.cropperInstance) {
            this.cropperInstance.destroy();
        }

        this.cropperInstance = new Cropper(imageEl, {
            viewMode: 1, 
            dragMode: 'move',
            autoCropArea: 0.8,
            responsive: true,
            background: false // Tắt background grid mặc định để thấy trong suốt rõ hơn
        });
    },

    // --- CÁC HÀM MỚI HỖ TRỢ MAGIC TOOLS ---
    
    // Thay thế ảnh hiện tại bằng ảnh mới (sau khi xóa nền)
    replaceImage(newImageSource) {
        if (this.cropperInstance) {
            this.cropperInstance.replace(newImageSource);
        } else {
            this.loadImage(newImageSource);
        }
    },

    getImageElement() {
        return UI.elements.imageEl;
    },

    // Tắt kéo thả để dùng Magic Wand click
    disableDrag() {
        if (this.cropperInstance) {
            this.cropperInstance.setDragMode('none');
        }
    },

    enableDrag() {
        if (this.cropperInstance) {
            this.cropperInstance.setDragMode('move');
        }
    },
    // -------------------------------------

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