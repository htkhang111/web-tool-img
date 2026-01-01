import { UI } from './ui.js';

export const Loader = {
    onImageLoaded: null, 

    init(callback) {
        this.onImageLoaded = callback;
        this.setupFileInput();
        this.setupDropZone(); // <--- MỚI: Gọi hàm xử lý kéo thả
        this.setupPasteEvent();
    },

    setupFileInput() {
        const input = document.getElementById('imageInput');
        if (input) {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.processFile(file);
            });
        }
    },

    // --- KHÔI PHỤC KÉO THẢ (DRAG & DROP) ---
    setupDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        // Chặn trình duyệt mở ảnh
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        // Hiệu ứng khi rê chuột
        dropZone.addEventListener('dragover', () => {
            dropZone.classList.add('bg-dark', 'border-white'); // Đổi màu
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('bg-dark', 'border-white'); // Trả màu
        });

        // Xử lý khi thả file
        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('bg-dark', 'border-white');
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files[0]) {
                this.processFile(files[0]);
            }
        });
    },

    setupPasteEvent() {
        document.addEventListener('paste', (e) => {
            const activeTab = document.querySelector('.nav-link.active');
            // Chỉ paste nếu đang ở Tab Cắt Ảnh
            if (activeTab && activeTab.id !== 'photo-tab') return; 

            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    const dummyFile = new File([file], `Pasted_${Date.now()}.png`, { type: file.type });
                    this.processFile(dummyFile);
                    break; 
                }
            }
        });
    },

    processFile(file) {
        UI.updateFileInfo(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.onImageLoaded) {
                this.onImageLoaded(e.target.result);
            }
        };
        reader.readAsDataURL(file);
    }
};