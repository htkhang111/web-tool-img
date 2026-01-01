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
        if (input) {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.processFile(file);
            });
        }
    },

    // Xử lý Ctrl + V (Đã Fix xung đột)
    setupPasteEvent() {
        document.addEventListener('paste', (e) => {
            // --- ĐOẠN FIX QUAN TRỌNG NHẤT ---
            // Kiểm tra xem người dùng đang đứng ở Tab nào?
            const activeTab = document.querySelector('.nav-link.active');
            
            // Nếu KHÔNG PHẢI là "Tab Cắt Ảnh" (id="photo-tab") 
            // thì file này KHÔNG ĐƯỢC PHÉP xử lý sự kiện Paste.
            // Để nhường quyền cho GifCore hoặc SpriteCore xử lý.
            if (activeTab && activeTab.id !== 'photo-tab') return; 
            // --------------------------------

            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                // Tìm item là ảnh
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    // Tạo tên giả cho file paste
                    const dummyFile = new File([file], `Pasted_${Date.now()}.png`, { type: file.type });
                    this.processFile(dummyFile);
                    break; 
                }
            }
        });
    },

    processFile(file) {
        // Cập nhật UI
        UI.updateFileInfo(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            // Gửi dữ liệu ảnh sang Editor
            if (this.onImageLoaded) {
                this.onImageLoaded(e.target.result);
            }
        };
        reader.readAsDataURL(file);
    }
};