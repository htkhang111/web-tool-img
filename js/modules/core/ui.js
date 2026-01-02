// js/modules/core/ui.js
export const UI = {
    elements: {
        editorArea: document.getElementById('editorArea'),
        dropZone: document.getElementById('dropZone'),
        qualityDisplay: document.getElementById('qualityDisplay'),
        outNameInput: document.getElementById('outName')
    },

    showEditor() {
        this.elements.editorArea.style.display = 'flex';
        this.elements.dropZone.style.display = 'none';
    },

    updateFileInfo(filename) {
        // Tự động điền tên output
        const nameWithoutExt = filename.split('.').slice(0, -1).join('.') || filename;
        this.elements.outNameInput.value = `${nameWithoutExt}_studio`;
    },

    updateQualityDisplay(value) {
        this.elements.qualityDisplay.innerText = `${Math.round(value * 100)}%`;
    }
};