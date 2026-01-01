// js/modules/loader.js
import { UI } from './ui.js';

export const Loader = {
    onImageLoaded: null, 
    boundHandlePaste: null, // Biến lưu trữ hàm đã bind để remove chính xác

    init(callback) {
        this.onImageLoaded = callback;
        this.setupFileInput();
        
        // Chờ 1 chút để DOM ổn định rồi mới gán sự kiện
        setTimeout(() => {
            this.setupDropZone();
            this.setupPasteEvent();
        }, 100);
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

    setupDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) {
            console.error("Lỗi: Không tìm thấy ID 'dropZone'");
            return;
        }

        // Bắt buộc chặn Dragover thì Drop mới hoạt động
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            e.stopPropagation();
            dropZone.classList.add('bg-dark', 'border-white');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('bg-dark', 'border-white');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('bg-dark', 'border-white');
            
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files[0]) {
                if (files[0].type.startsWith('image/')) {
                    this.processFile(files[0]);
                } else {
                    alert("Chỉ hỗ trợ file ảnh!");
                }
            }
        });
    },

    setupPasteEvent() {
        // FIX: Xóa sự kiện cũ bằng tham chiếu đã lưu (boundHandlePaste)
        if (this.boundHandlePaste) {
            document.removeEventListener('paste', this.boundHandlePaste);
        }

        // Tạo tham chiếu mới và lưu lại
        this.boundHandlePaste = this.handlePaste.bind(this);

        // Gán sự kiện mới
        document.addEventListener('paste', this.boundHandlePaste);
    },

    handlePaste(e) {
        // Kiểm tra xem đang đứng ở Tab Cắt Ảnh hay không
        // Logic: Tab Active phải có ID là 'photo-tab'
        const activeTab = document.querySelector('.nav-link.active');
        if (!activeTab || activeTab.id !== 'photo-tab') return;

        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                // Tạo tên file giả để hiển thị
                const dummyFile = new File([file], `Pasted_Image.png`, { type: file.type });
                this.processFile(dummyFile);
                e.preventDefault(); // Chặn hành vi paste mặc định
                break; 
            }
        }
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