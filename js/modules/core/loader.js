// js/modules/core/loader.js
import { UI } from './ui.js';
import { FabricEditor } from '../editors/fabric-editor.js';

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
                e.target.value = ''; // Reset input
            });
        }

        // Input thêm ảnh phụ vào Studio
        const addBtn = document.getElementById('addImageBtn');
        if (addBtn) {
            addBtn.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.processFile(file, true); // true = append mode
                e.target.value = '';
            });
        }
    },

    setupDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault(); e.stopPropagation();
            dropZone.classList.add('bg-dark', 'border-white');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault(); e.stopPropagation();
            dropZone.classList.remove('bg-dark', 'border-white');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault(); e.stopPropagation();
            dropZone.classList.remove('bg-dark', 'border-white');
            
            const dt = e.dataTransfer;
            if (dt.files && dt.files[0]) this.processFile(dt.files[0]);
        });
    },

    setupPasteEvent() {
        document.addEventListener('paste', (e) => {
            const activeTab = document.querySelector('.nav-link.active');
            if (!activeTab || activeTab.id !== 'photo-tab') return;

            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    // Paste thì luôn coi là thêm ảnh mới nếu editor đã mở
                    const isAppend = document.getElementById('editorArea').style.display !== 'none';
                    this.processFile(file, isAppend);
                    break; 
                }
            }
        });
    },

    processFile(file, isAppend = false) {
        if(!isAppend) UI.updateFileInfo(file.name);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            FabricEditor.addImage(e.target.result, isAppend);
            if (!isAppend) UI.showEditor();
        };
        reader.readAsDataURL(file);
    }
};