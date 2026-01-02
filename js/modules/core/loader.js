// js/modules/core/loader.js
import { UI } from './ui.js';
import { FabricEditor } from '../editor/fabric-editor.js';
import { GifCore } from '../editor/gif-core.js';
import { SpriteCore } from '../editor/sprite-core.js';

export const Loader = {
    init() {
        this.setupFileInput();
        this.setupDropZone();
        this.setupPasteEvent();
    },

    setupFileInput() {
        const input = document.getElementById('imageInput');
        if (input) {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.processFile(file);
                e.target.value = ''; 
            });
        }

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
        // Gỡ bỏ sự kiện cũ nếu có
        document.removeEventListener('paste', this.handlePaste);
        this.handlePaste = this.handlePaste.bind(this);
        document.addEventListener('paste', this.handlePaste);
        console.log("Studio: Paste Event Listener Activated");
    },

    handlePaste(e) {
        console.log("Studio: Paste detected!"); // Kiểm tra xem console có hiện dòng này không
        
        const items = e.clipboardData.items;
        let file = null;

        for (let i = 0; i < items.length; i++) {
            // Chỉ tìm ảnh (image/png, image/jpeg...)
            if (items[i].type.indexOf('image') !== -1) {
                file = items[i].getAsFile();
                break; 
            }
        }

        if (!file) {
            console.log("Studio: No image found in clipboard");
            return;
        }

        // Chặn hành vi paste mặc định của trình duyệt
        e.preventDefault();

        // Xác định tab đang mở
        const activeTab = document.querySelector('.nav-link.active');
        const tabId = activeTab ? activeTab.id : 'photo-tab'; // Mặc định là photo-tab nếu không tìm thấy

        console.log(`Studio: Processing paste for tab ${tabId}`);

        switch (tabId) {
            case 'photo-tab':
                // Nếu editor đang ẩn (chưa có ảnh nào) -> Load mới
                // Nếu editor đang hiện -> Thêm ảnh (Append)
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
                alert("Batch Tool không hỗ trợ Paste từng ảnh. Vui lòng chọn file từ máy!");
                break;
        }
    },

    processFile(file, isAppend = false) {
        if(!isAppend) UI.updateFileInfo(file.name);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            // Đẩy vào Fabric Canvas
            FabricEditor.addImage(e.target.result, isAppend);
            if (!isAppend) UI.showEditor();
        };
        reader.readAsDataURL(file);
    }
};