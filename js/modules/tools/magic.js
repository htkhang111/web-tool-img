// js/modules/tools/magic.js
import { FabricEditor } from '../editor/fabric-editor.js';

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
            alert("⚠️ Vui lòng click chọn vào tấm ảnh trên Workspace trước!");
            return;
        }

        const btn = document.getElementById('btnAiRemove');
        const originalText = btn.innerHTML;
        
        // Hiệu ứng loading
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải AI...';
        btn.disabled = true;

        try {
            console.log("Magic: Đang tải thư viện AI từ CDN esm.sh...");
            
            // Tải thư viện từ esm.sh
            const module = await import("https://esm.sh/@imgly/background-removal@1.5.5");
            
            // FIX: Thư viện này dùng Named Export 'removeBackground', không phải Default
            // Ta ưu tiên lấy module.removeBackground, nếu không có mới tìm default
            const imglyRemoveBackground = module.removeBackground || module.default;

            if (typeof imglyRemoveBackground !== 'function') {
                throw new Error("Không tìm thấy hàm xử lý trong thư viện đã tải!");
            }

            btn.innerHTML = '<i class="fas fa-magic fa-spin"></i> Đang tách nền...';
            
            // Lấy source gốc của ảnh đang chọn
            const imgSrc = activeObj.getSrc();
            console.log("Magic: Bắt đầu xử lý ảnh...", imgSrc);

            const config = {
                progress: (key, current, total) => {
                    const percent = Math.round((current / total) * 100);
                    if(total > 0) btn.innerHTML = `<i class="fas fa-cog fa-spin"></i> ${percent}%`;
                }
            };
            
            // Gọi AI
            const blob = await imglyRemoveBackground(imgSrc, config);
            const url = URL.createObjectURL(blob);
            
            console.log("Magic: Tách nền thành công!", url);

            // Thay thế ảnh cũ bằng ảnh mới đã tách
            FabricEditor.replaceActiveImage(url);
            
        } catch (error) {
            console.error("Magic Error:", error);
            alert(`❌ Lỗi AI: ${error.message}\n(Hãy thử Hard Refresh: Ctrl + Shift + R)`);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};