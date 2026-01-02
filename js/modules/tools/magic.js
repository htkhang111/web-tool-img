// js/modules/magic.js
import { Editor } from '../editor.js';
// Import thư viện AI xịn xò (chạy trực tiếp trên browser)
import imglyRemoveBackground from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.3.0/+esm";

export const Magic = {
    isWandActive: false,

    init() {
        this.setupEvents();
    },

    setupEvents() {
        const btnWand = document.getElementById('btnMagicWand');
        const btnAI = document.getElementById('btnAiRemove');

        // 1. Nút Magic Wand
        if (btnWand) {
            btnWand.addEventListener('click', () => {
                this.isWandActive = !this.isWandActive;
                this.toggleWandMode(this.isWandActive);
            });
        }

        // 2. Sự kiện Click Magic Wand (Bắt sự kiện chuẩn hơn)
        document.addEventListener('click', (e) => {
            if (!this.isWandActive) return;
            
            // Tìm ảnh trong vùng crop
            // CropperJS tạo cấu trúc: .cropper-canvas > img
            if (e.target.tagName === 'IMG' && e.target.closest('.cropper-canvas')) {
                this.handleWandClick(e);
            }
        });

        // 3. Nút AI Remove Background (MỚI)
        if (btnAI) {
            btnAI.addEventListener('click', () => this.processAiRemove());
        }
    },

    toggleWandMode(active) {
        const btn = document.getElementById('btnMagicWand');
        const container = document.querySelector('.img-container');
        
        if (active) {
            btn.classList.add('btn-warning');
            btn.classList.remove('btn-outline-warning');
            btn.innerHTML = '<i class="fas fa-magic"></i> Đang chọn vùng...';
            if (container) container.style.cursor = 'crosshair';
            Editor.disableDrag(); 
        } else {
            btn.classList.remove('btn-warning');
            btn.classList.add('btn-outline-warning');
            btn.innerHTML = '<i class="fas fa-magic"></i> Magic Wand';
            if (container) container.style.cursor = 'default';
            Editor.enableDrag();
        }
    },

    handleWandClick(e) {
        // e.target chính là thẻ <img> đang hiển thị
        // Lấy tọa độ click tương đối trên ảnh hiển thị
        const clickX = e.offsetX;
        const clickY = e.offsetY;
        
        const displayedW = e.target.clientWidth;
        const displayedH = e.target.clientHeight;

        const originalImage = Editor.getImageElement();
        
        // Tính tỷ lệ scale giữa ảnh hiển thị và ảnh gốc
        const scaleX = originalImage.naturalWidth / displayedW;
        const scaleY = originalImage.naturalHeight / displayedH;

        const trueX = Math.floor(clickX * scaleX);
        const trueY = Math.floor(clickY * scaleY);

        // Vẽ ảnh lên canvas ẩn để xử lý pixel
        const canvas = document.createElement('canvas');
        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(originalImage, 0, 0);

        // Xóa màu
        this.floodFill(canvas, trueX, trueY, 30); // Tolerance 30

        // Cập nhật lại
        Editor.replaceImage(canvas.toDataURL('image/png'));
    },

    floodFill(canvas, startX, startY, tolerance) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        const startPos = (startY * width + startX) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];

        if (startA === 0) return; // Đã trong suốt rồi

        const stack = [[startX, startY]];
        const visited = new Uint8Array(width * height);

        const match = (pos) => {
            const r = data[pos], g = data[pos+1], b = data[pos+2], a = data[pos+3];
            if (a === 0) return false;
            return Math.abs(r - startR) <= tolerance &&
                   Math.abs(g - startG) <= tolerance &&
                   Math.abs(b - startB) <= tolerance;
        };

        while (stack.length) {
            const [x, y] = stack.pop();
            const pos = (y * width + x) * 4;
            const vPos = y * width + x;

            if (visited[vPos]) continue;
            
            // Tìm lên trên
            let y1 = y;
            while (y1 >= 0 && match((y1 * width + x) * 4) && !visited[y1 * width + x]) y1--;
            y1++;
            
            let spanLeft = false, spanRight = false;

            while (y1 < height && match((y1 * width + x) * 4) && !visited[y1 * width + x]) {
                const currPos = (y1 * width + x) * 4;
                data[currPos + 3] = 0; // XÓA
                visited[y1 * width + x] = 1;

                if (x > 0) {
                    if (match((y1 * width + x - 1) * 4) && !visited[y1 * width + x - 1]) {
                        if (!spanLeft) { stack.push([x - 1, y1]); spanLeft = true; }
                    } else spanLeft = false;
                }
                if (x < width - 1) {
                    if (match((y1 * width + x + 1) * 4) && !visited[y1 * width + x + 1]) {
                        if (!spanRight) { stack.push([x + 1, y1]); spanRight = true; }
                    } else spanRight = false;
                }
                y1++;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    },

    // --- AI REMOVE BACKGROUND (Dùng @imgly/background-removal) ---
    async processAiRemove() {
        const btn = document.getElementById('btnAiRemove');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải Model AI (lần đầu hơi lâu)...';
        btn.disabled = true;

        try {
            // Lấy ảnh gốc
            const imgElement = Editor.getImageElement();
            if (!imgElement.src) throw new Error("Chưa có ảnh!");

            // Gọi thư viện AI xóa nền
            // Lần đầu chạy nó sẽ tải khoảng 20-30MB model về máy
            const blob = await imglyRemoveBackground(imgElement.src);
            
            const url = URL.createObjectURL(blob);
            Editor.replaceImage(url);
            alert("Đã tách nền thành công! (AI Pro)");

        } catch (error) {
            console.error(error);
            alert("Lỗi AI: " + error.message + "\n(Hãy thử reload trang hoặc dùng trình duyệt Chrome/Edge)");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};