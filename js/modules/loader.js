import { UI } from './ui.js';

export const Loader = {
    onImageLoaded: null, 

    init(callback) {
        this.onImageLoaded = callback;
        this.setupFileInput();
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

    setupPasteEvent() {
        document.addEventListener('paste', (e) => {
            // FIX: Nếu không ở tab Ảnh thì return
            const activeTab = document.querySelector('.nav-link.active');
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
            if (this.onImageLoaded) this.onImageLoaded(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};