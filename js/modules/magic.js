// js/modules/magic.js
import { Editor } from './editor.js';

export const Magic = {
    isWandActive: false,
    apiKey: localStorage.getItem('removeBgApiKey') || '',

    init() {
        this.setupEvents();
    },

    setupEvents() {
        const btnWand = document.getElementById('btnMagicWand');
        const btnAI = document.getElementById('btnAiRemove');

        // 1. Nút Magic Wand (Cây đũa thần)
        if (btnWand) {
            btnWand.addEventListener('click', () => {
                this.isWandActive = !this.isWandActive;
                this.toggleWandMode(this.isWandActive);
            });
        }

        // 2. Sự kiện Click lên ảnh để xóa màu (Khi Wand Active)
        // Lưu ý: CropperJS tạo ra các lớp div đè lên ảnh, ta cần bắt sự kiện toàn cục hoặc trên container
        document.addEventListener('click', (e) => {
            if (!this.isWandActive) return;
            
            // Chỉ xử lý khi click vào vùng ảnh cropper
            const cropperCanvas = document.querySelector('.cropper-canvas');
            if (cropperCanvas && cropperCanvas.contains(e.target)) {
                this.handleWandClick(e, cropperCanvas);
            }
        });

        // 3. Nút AI Remove Background
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
            // Đổi con trỏ chuột thành Crosshair
            if (container) container.style.cursor = 'crosshair';
            // Tạm thời disable drag của cropper để dễ click
            Editor.disableDrag(); 
        } else {
            btn.classList.remove('btn-warning');
            btn.classList.add('btn-outline-warning');
            btn.innerHTML = '<i class="fas fa-magic"></i> Magic Wand';
            if (container) container.style.cursor = 'default';
            Editor.enableDrag();
        }
    },

    handleWandClick(e, cropperCanvasEl) {
        // Lấy vị trí click tương đối so với ảnh
        const rect = cropperCanvasEl.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Lấy ảnh hiện tại từ Editor
        const originalImage = Editor.getImageElement();
        
        // Tạo Canvas để xử lý pixel
        const canvas = document.createElement('canvas');
        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(originalImage, 0, 0);

        // Tính tỉ lệ giữa hiển thị và ảnh thật
        const scaleX = originalImage.naturalWidth / rect.width;
        const scaleY = originalImage.naturalHeight / rect.height;

        const trueX = Math.floor(clickX * scaleX);
        const trueY = Math.floor(clickY * scaleY);

        // Thực hiện thuật toán Flood Fill (Xóa màu lan truyền)
        this.floodFill(canvas, trueX, trueY, 30); // Tolerance 30

        // Cập nhật lại ảnh trong Editor
        Editor.replaceImage(canvas.toDataURL('image/png'));
        
        // Tắt chế độ Wand sau khi xóa xong (hoặc giữ lại tùy ý, ở đây tôi giữ lại để xóa tiếp)
    },

    // Thuật toán Flood Fill (Loang màu) để xóa nền
    floodFill(canvas, startX, startY, tolerance) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Lấy màu tại điểm click
        const startPos = (startY * width + startX) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];

        // Nếu click vào vùng đã trong suốt thì thôi
        if (startA === 0) return;

        const pixelStack = [[startX, startY]];
        const visited = new Uint8Array(width * height); // Đánh dấu điểm đã duyệt

        // Helper check màu giống nhau
        const matchColor = (pos) => {
            const r = data[pos];
            const g = data[pos + 1];
            const b = data[pos + 2];
            const a = data[pos + 3];
            
            // Đã trong suốt rồi
            if (a === 0) return false;

            return (
                Math.abs(r - startR) <= tolerance &&
                Math.abs(g - startG) <= tolerance &&
                Math.abs(b - startB) <= tolerance
            );
        };

        while (pixelStack.length) {
            const newPos = pixelStack.pop();
            const x = newPos[0];
            const y = newPos[1];

            const pixelPos = (y * width + x) * 4;
            const visitPos = y * width + x;

            if (visited[visitPos]) continue;
            
            let y1 = y;
            while (y1 >= 0 && matchColor((y1 * width + x) * 4) && !visited[y1 * width + x]) {
                y1--;
            }
            y1++;
            
            let spanLeft = false;
            let spanRight = false;

            while (y1 < height && matchColor((y1 * width + x) * 4) && !visited[y1 * width + x]) {
                const currentPixelPos = (y1 * width + x) * 4;
                
                // XÓA ĐIỂM ẢNH (Biến thành trong suốt)
                data[currentPixelPos + 3] = 0; 
                visited[y1 * width + x] = 1;

                if (x > 0) {
                    if (matchColor((y1 * width + (x - 1)) * 4) && !visited[y1 * width + (x - 1)]) {
                        if (!spanLeft) {
                            pixelStack.push([x - 1, y1]);
                            spanLeft = true;
                        }
                    } else if (spanLeft) {
                        spanLeft = false;
                    }
                }

                if (x < width - 1) {
                    if (matchColor((y1 * width + (x + 1)) * 4) && !visited[y1 * width + (x + 1)]) {
                        if (!spanRight) {
                            pixelStack.push([x + 1, y1]);
                            spanRight = true;
                        }
                    } else if (spanRight) {
                        spanRight = false;
                    }
                }
                y1++;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    },

    // --- AI REMOVE BACKGROUND (Dùng API remove.bg) ---
    async processAiRemove() {
        // Kiểm tra API Key
        if (!this.apiKey) {
            const key = prompt("Nhập API Key của remove.bg (Miễn phí 50 lần/tháng):\nĐăng ký tại: https://www.remove.bg/api");
            if (key) {
                this.apiKey = key;
                localStorage.setItem('removeBgApiKey', key);
            } else {
                return;
            }
        }

        const btn = document.getElementById('btnAiRemove');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang AI xử lý...';
        btn.disabled = true;

        try {
            // Lấy ảnh từ editor
            const canvas = Editor.getCanvas();
            if (!canvas) throw new Error("Chưa có ảnh!");

            // Convert canvas sang Blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

            const formData = new FormData();
            formData.append('image_file', blob);
            formData.append('size', 'auto');

            // Gọi API
            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: { 'X-Api-Key': this.apiKey },
                body: formData
            });

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    localStorage.removeItem('removeBgApiKey');
                    throw new Error("API Key không đúng hoặc hết lượt dùng. Vui lòng thử lại.");
                }
                throw new Error("Lỗi kết nối đến Server AI: " + response.statusText);
            }

            const resultBlob = await response.blob();
            const resultUrl = URL.createObjectURL(resultBlob);

            // Cập nhật lại Editor
            Editor.replaceImage(resultUrl);
            alert("Đã xóa nền thành công!");

        } catch (error) {
            alert("Lỗi: " + error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};