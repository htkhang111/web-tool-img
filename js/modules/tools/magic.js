// js/modules/tools/magic.js
import { FabricEditor } from '../editor/fabric-editor.js';
import imglyRemoveBackground from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.3.0/+esm";

export const Magic = {
    init() {
        const btnAI = document.getElementById('btnAiRemove');
        if (btnAI) {
            btnAI.addEventListener('click', () => this.processAiRemove());
        }
    },

    async processAiRemove() {
        const activeObj = FabricEditor.getActiveObject();
        if (!activeObj || activeObj.type !== 'image') {
            alert("Vui lòng chọn một tấm ảnh trên Workspace để tách nền!");
            return;
        }

        const btn = document.getElementById('btnAiRemove');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tách nền...';
        btn.disabled = true;

        try {
            // Lấy source gốc của ảnh đang chọn
            const imgSrc = activeObj.getSrc();
            
            // Gọi AI
            const blob = await imglyRemoveBackground(imgSrc);
            const url = URL.createObjectURL(blob);
            
            // Thay thế ảnh cũ bằng ảnh mới đã tách
            FabricEditor.replaceActiveImage(url);
            
        } catch (error) {
            console.error(error);
            alert("Lỗi AI: " + error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};