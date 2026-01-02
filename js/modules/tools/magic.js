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
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải AI & Model xịn...';
        btn.disabled = true;

        try {
            console.log("Magic: Đang tải thư viện AI...");
            
            // Tải thư viện từ esm.sh
            const module = await import("https://esm.sh/@imgly/background-removal@1.5.5");
            const imglyRemoveBackground = module.removeBackground || module.default;

            if (typeof imglyRemoveBackground !== 'function') {
                throw new Error("Không tìm thấy hàm xử lý trong thư viện đã tải!");
            }

            btn.innerHTML = '<i class="fas fa-magic fa-spin"></i> AI đang xử lý kỹ...';
            
            const imgSrc = activeObj.getSrc();
            console.log("Magic: Bắt đầu xử lý ảnh...", imgSrc);

            // --- CẤU HÌNH NÂNG CAO CHẤT LƯỢNG ---
            const config = {
                // Bật debug để xem nó có tải model full không
                debug: true, 
                // Cấu hình đầu ra chất lượng cao nhất
                output: {
                    format: 'image/png', // Bắt buộc PNG để có nền trong suốt xịn
                    quality: 1.0,        // Chất lượng tối đa (không nén)
                    type: 'foreground'   // Chỉ lấy chủ thể
                },
                // Hàm hiển thị phần trăm tải
                progress: (key, current, total) => {
                     // Chỉ hiện khi đang tải file model nặng
                    if (typeof total === 'number' && total > 100000) {
                        const percent = Math.round((current / total) * 100);
                        btn.innerHTML = `<i class="fas fa-download fa-spin"></i> Tải Model: ${percent}%`;
                    }
                }
            };
            
            // Gọi AI với cấu hình xịn
            // Lưu ý: Lần đầu chạy có thể hơi lâu do tải model khoảng 30-40MB
            const blob = await imglyRemoveBackground(imgSrc, config);
            const url = URL.createObjectURL(blob);
            
            console.log("Magic: Tách nền thành công!", url);

            // Thay thế ảnh cũ bằng ảnh mới
            FabricEditor.replaceActiveImage(url);
            
        } catch (error) {
            console.error("Magic Error:", error);
            // Chi tiết lỗi hơn để dễ debug
            alert(`❌ Lỗi AI: ${error.message}\n\nTip: Nếu thấy báo lỗi bộ nhớ (memory), hãy thử ảnh nhỏ hơn.`);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};