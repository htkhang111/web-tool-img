// js/modules/sprite-core.js
let currentSprite = null;

export const SpriteCore = {
    init() {
        this.setupEvents();
    },

    setupEvents() {
        const input = document.getElementById('spriteInput');
        const btnConvert = document.getElementById('btnSpriteConvert');

        if (input) {
            input.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) this.loadSprite(e.target.files[0]);
            });
        }

        if (btnConvert) {
            btnConvert.addEventListener('click', () => this.processSprite());
        }

        // Hỗ trợ Paste (Chỉ chạy khi đang ở tab Sprite)
        document.addEventListener('paste', (e) => {
            const activeTab = document.querySelector('.nav-link.active');
            if (activeTab && activeTab.id === 'sprite-tab') {
                const items = e.clipboardData.items;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        this.loadSprite(items[i].getAsFile());
                        break;
                    }
                }
            }
        });
    },

    loadSprite(file) {
        // Reset UI
        document.getElementById('spritePreview').innerHTML = '';
        document.getElementById('spriteDropZone').style.display = 'none';
        document.getElementById('spriteEditorArea').style.display = 'flex';
        document.getElementById('spriteNameDisplay').innerText = file.name;
        document.getElementById('spriteOutName').value = file.name.split('.')[0] + '_anim';

        const img = new Image();
        img.onload = () => {
            currentSprite = img;
            // Hiển thị ảnh gốc để user dễ đếm hàng/cột
            const preview = document.getElementById('spritePreview');
            img.style.maxWidth = '100%';
            img.style.border = '1px solid #555';
            preview.appendChild(img);
            
            // Tự động đoán số frame (thường là vuông hoặc chữ nhật ngang)
            // Đây là đoán mò, user sẽ phải chỉnh lại
            document.getElementById('spriteCols').value = 4; 
            document.getElementById('spriteRows').value = 1;
        };
        img.src = URL.createObjectURL(file);
    },

    processSprite() {
        if (!currentSprite) return;

        const cols = parseInt(document.getElementById('spriteCols').value) || 1;
        const rows = parseInt(document.getElementById('spriteRows').value) || 1;
        const speed = parseInt(document.getElementById('spriteSpeed').value) || 100;
        const loop = document.getElementById('spriteLoop').checked;

        // Tính toán kích thước 1 frame
        const frameWidth = currentSprite.width / cols;
        const frameHeight = currentSprite.height / rows;

        // Init GIF Encoder
        const gif = new GIF({
            workers: 2,
            quality: 10,
            workerScript: './js/gif.worker.js',
            width: frameWidth,
            height: frameHeight,
            repeat: loop ? 0 : -1 // 0 là lặp vô hạn, -1 là chạy 1 lần
        });

        // UI Loading
        const btn = document.getElementById('btnSpriteConvert');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        btn.disabled = true;

        // Loop cắt ảnh
        // Duyệt theo Hàng trước, Cột sau (Z-order)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const canvas = document.createElement('canvas');
                canvas.width = frameWidth;
                canvas.height = frameHeight;
                const ctx = canvas.getContext('2d');

                // Cắt: drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
                ctx.drawImage(
                    currentSprite,
                    c * frameWidth, r * frameHeight, frameWidth, frameHeight, // Source
                    0, 0, frameWidth, frameHeight // Dest
                );

                gif.addFrame(canvas, { delay: speed, copy: true });
            }
        }

        gif.on('finished', (blob) => {
            // Restore UI
            btn.innerHTML = originalText;
            btn.disabled = false;

            // Tải xuống
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (document.getElementById('spriteOutName').value || 'sprite_anim') + '.gif';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Hiện kết quả preview nhỏ
            const resDiv = document.createElement('div');
            resDiv.className = "mt-3 alert alert-success";
            resDiv.innerHTML = "<strong>Xong!</strong> Kết quả: <br>";
            const resImg = document.createElement('img');
            resImg.src = url;
            resDiv.appendChild(resImg);
            document.getElementById('spritePreview').innerHTML = ''; // Xóa ảnh gốc
            document.getElementById('spritePreview').appendChild(resDiv);
            
            // Re-append ảnh gốc bên dưới để so sánh nếu cần
            currentSprite.style.marginTop = '10px';
            currentSprite.style.opacity = '0.5';
            document.getElementById('spritePreview').appendChild(currentSprite);
        });

        gif.render();
    }
};