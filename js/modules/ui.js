// js/modules/ui.js
export const UI = {
    elements: {
        editorArea: document.getElementById('editorArea'),
        fileNameDisplay: document.getElementById('fileNameDisplay'),
        qualityDisplay: document.getElementById('qualityDisplay'),
        outNameInput: document.getElementById('outName'),
        imageEl: document.getElementById('image')
    },

    showEditor() {
        this.elements.editorArea.style.display = 'flex';
        // Scroll nhẹ xuống vùng editor
        this.elements.editorArea.scrollIntoView({ behavior: 'smooth' });
    },

    updateFileInfo(filename) {
        this.elements.fileNameDisplay.innerText = `Đang xử lý: ${filename}`;
        this.elements.fileNameDisplay.className = "small text-info fw-bold";
        
        // Tự động điền tên output (bỏ đuôi cũ)
        const nameWithoutExt = filename.split('.').slice(0, -1).join('.') || filename;
        this.elements.outNameInput.value = `${nameWithoutExt}_edited`;
    },

    updateQualityDisplay(value) {
        this.elements.qualityDisplay.innerText = `${Math.round(value * 100)}%`;
    }
};