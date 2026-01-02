// js/modules/core/loader.js
import { UI } from './ui.js';
import { FabricEditor } from '../editor/fabric-editor.js';
// Import thêm 2 ông thần này để Loader phân phối hàng
import { GifCore } from '../editor/gif-core.js';
import { SpriteCore } from '../editor/sprite-core.js';

export const Loader = {
    init() {
        this.setupFileInput();
        this.setupDropZone();
        this.setupPasteEvent();
    },

    setupFileInput() {
        // Input cho Studio chính
        const input = document.getElementById('imageInput');
        if (input) {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.processFile(file);
                e.target.value = ''; 
            });
        }

        // Input thêm ảnh phụ vào Studio
        const addBtn = document.getElementById('addImageBtn');
        if (addBtn) {
            addBtn.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.processFile(file, true); 
                e.target.value = '';
            });
        }
    },

    setupDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault(); 
                e.stopPropagation();
            });
        });

        dropZone.addEventListener('dragover', () => dropZone.classList.add('bg-dark', 'border-white'));
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('bg-dark', 'border-white'));

        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('bg-dark', 'border-white');
            const dt = e.dataTransfer;
            if (dt.files && dt.files[0]) this.processFile(dt.files[0]);
        });
    },

    setupPasteEvent() {
        // Xóa sự kiện cũ nếu có để tránh duplicate (cho chắc ăn)
        document.removeEventListener('paste', this.handlePaste);
        
        // Bind this để dùng được trong hàm handlePaste
        this.handlePaste = this.handlePaste.bind(this);
        document.addEventListener('paste', this.handlePaste);
    },

    handlePaste(e) {
        const items = e.clipboardData.items;
        let file = null;

        // 1. Tìm ảnh trong clipboard
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                file = items[i].getAsFile();
                break; 
            }
        }

        // Nếu không có ảnh thì kệ (để trình duyệt paste text nếu user muốn)
        if (!file) return;

        // 2. Xác định đang đứng ở Tab nào
        const activeTab = document.querySelector('.nav-link.active');
        if (!activeTab) return;

        // 3. Chặn hành vi mặc định (QUAN TRỌNG: Để không bị paste 2 lần hoặc paste lỗi)
        e.preventDefault();

        // 4. Phân phối hàng về đúng kho
        switch (activeTab.id) {
            case 'photo-tab':
                // Nếu Studio đang mở thì paste là thêm ảnh (Append), chưa mở thì là load mới
                const isAppend = document.getElementById('editorArea').style.display !== 'none';
                this.processFile(file, isAppend);
                break;
            
            case 'gif-tab':
                if (file.type === 'image/gif') {
                    GifCore.loadGif(file);
                } else {
                    alert('Tab này chỉ nhận file GIF động!');
                }
                break;

            case 'sprite-tab':
                SpriteCore.loadSprite(file);
                break;
            
            case 'batch-tab':
                alert("Batch Tool không hỗ trợ Paste từng ảnh. Vui lòng chọn file!");
                break;
        }
    },

    processFile(file, isAppend = false) {
        if(!isAppend) UI.updateFileInfo(file.name);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            // Đẩy DataURL sang cho Fabric xử lý
            FabricEditor.addImage(e.target.result, isAppend);
            if (!isAppend) UI.showEditor();
        };
        reader.readAsDataURL(file);
    }
};