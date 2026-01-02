// js/modules/core/loader.js
import { UI } from './ui.js';
import { FabricEditor } from '../editor/fabric-editor.js';
import { GifCore } from '../editor/gif-core.js';
import { SpriteCore } from '../editor/sprite-core.js';

export const Loader = {
    init() {
        console.log("Loader: Starting initialization...");
        this.setupFileInput();
        this.setupDropZone();
        this.setupPasteEvent();
        console.log("Loader: Ready!");
    },

    setupFileInput() {
        const input = document.getElementById('imageInput');
        if (input) {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log("Loader: File input changed", file.name);
                    this.processFile(file);
                }
                e.target.value = ''; 
            });
        }

        const addBtn = document.getElementById('addImageBtn');
        if (addBtn) {
            addBtn.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log("Loader: Add Image input changed", file.name);
                    this.processFile(file, true); 
                }
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
        console.log("Loader: Paste Event Listener Activated");
    },

    handlePaste(e) {
        const items = e.clipboardData.items;
        let file = null;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                file = items[i].getAsFile();
                break; 
            }
        }

        if (!file) return; // Không có ảnh thì thôi, không log spam

        console.log("Loader: Paste detected!", file.name);
        e.preventDefault();

        const activeTab = document.querySelector('.nav-link.active');
        const tabId = activeTab ? activeTab.id : 'photo-tab';

        switch (tabId) {
            case 'photo-tab':
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
            if (!isAppend) UI.showEditor();
            // Đẩy vào Fabric Canvas
            FabricEditor.addImage(e.target.result, isAppend);
        };
        reader.readAsDataURL(file);
    }
};