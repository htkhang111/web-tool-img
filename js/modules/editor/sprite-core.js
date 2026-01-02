// js/modules/sprite-core.js
// Fix: High Precision Cutting (Fix lỗi trôi hình), Offset, Studio Flow

let currentSprite = null;
let previewInterval = null;
let isLocked = false;

export const SpriteCore = {
    init() {
        this.setupEvents();
    },

    setupEvents() {
        const input = document.getElementById('spriteInput');
        const btnConvert = document.getElementById('btnSpriteConvert');
        const btnLock = document.getElementById('btnLockSprite');
        const dropZone = document.getElementById('spriteDropZone');
        
        // Theo dõi thay đổi để update preview ngay
        const inputsToWatch = ['spriteCols', 'spriteRows', 'spriteFPS', 'spriteOffsetX', 'spriteOffsetY'];

        if (input) {
            input.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) this.loadSprite(e.target.files[0]);
            });
        }

        if (btnLock) {
            btnLock.addEventListener('click', () => this.toggleLock());
        }

        // Xử lý Drag & Drop
        if (dropZone) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, false);
            });

            dropZone.addEventListener('dragover', () => dropZone.classList.add('active'));
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('active'));

            dropZone.addEventListener('drop', (e) => {
                dropZone.classList.remove('active');
                const dt = e.dataTransfer;
                if (dt.files && dt.files[0]) this.loadSprite(dt.files[0]);
            });
        }

        if (btnConvert) btnConvert.addEventListener('click', () => this.processSprite());

        // Gắn sự kiện update realtime
        inputsToWatch.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('input', () => this.startPreviewAnimation());
        });

        // Hỗ trợ Paste
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
        this.unlockUI();
        
        document.getElementById('spriteDropZone').style.display = 'none';
        document.getElementById('spriteEditorArea').style.display = 'flex';
        document.getElementById('spriteNameDisplay').innerText = file.name;
        document.getElementById('spriteOutName').value = file.name.split('.')[0] + '_anim';

        const img = new Image();
        img.onload = () => {
            currentSprite = img;
            document.getElementById('spriteOriginalSize').innerText = `${img.width} x ${img.height} px`;
            
            // Reset thông số
            document.getElementById('spriteCols').value = 4; 
            document.getElementById('spriteRows').value = 1;
            document.getElementById('spriteFPS').value = 12;
            document.getElementById('spriteOffsetX').value = 0;
            document.getElementById('spriteOffsetY').value = 0;
            
            this.startPreviewAnimation();
        };
        img.src = URL.createObjectURL(file);
    },

    toggleLock() {
        if (!currentSprite) return;
        isLocked = !isLocked;
        
        const configSet = document.getElementById('spriteConfigSet');
        const exportPanel = document.getElementById('spriteExportPanel');
        const btnLock = document.getElementById('btnLockSprite');

        if (isLocked) {
            configSet.disabled = true;
            exportPanel.style.opacity = '1';
            exportPanel.style.pointerEvents = 'auto';
            btnLock.innerHTML = '<i class="fas fa-unlock"></i> Mở Khóa Cấu Hình';
            btnLock.className = 'btn btn-outline-secondary w-100 fw-bold mt-auto';
        } else {
            this.unlockUI();
        }
    },

    unlockUI() {
        isLocked = false;
        const configSet = document.getElementById('spriteConfigSet');
        const exportPanel = document.getElementById('spriteExportPanel');
        const btnLock = document.getElementById('btnLockSprite');

        if(configSet) configSet.disabled = false;
        if(exportPanel) {
            exportPanel.style.opacity = '0.5';
            exportPanel.style.pointerEvents = 'none';
        }
        if(btnLock) {
            btnLock.innerHTML = '<i class="fas fa-lock"></i> Chốt & Tiếp Tục';
            btnLock.className = 'btn btn-outline-danger w-100 fw-bold mt-auto';
        }
    },

    startPreviewAnimation() {
        if (!currentSprite) return;
        if (previewInterval) clearInterval(previewInterval);

        const cols = parseInt(document.getElementById('spriteCols').value) || 1;
        const rows = parseInt(document.getElementById('spriteRows').value) || 1;
        const fps = parseInt(document.getElementById('spriteFPS').value) || 12;
        
        const offX = parseInt(document.getElementById('spriteOffsetX').value) || 0;
        const offY = parseInt(document.getElementById('spriteOffsetY').value) || 0;

        const delay = 1000 / fps;

        // --- FIX QUAN TRỌNG: Dùng số thực (Float) thay vì làm tròn (Math.floor) ---
        // Điều này giúp cắt chính xác tuyệt đối, không bị lệch frame cuối
        const frameW = currentSprite.width / cols; 
        const frameH = currentSprite.height / rows;

        // Chỉ làm tròn khi hiển thị text cho đẹp
        document.getElementById('spriteFrameSize').innerText = `${Math.round(frameW)} x ${Math.round(frameH)} px`;

        const canvas = document.getElementById('framePreviewCanvas');
        const ctx = canvas.getContext('2d');
        
        // Canvas cần kích thước nguyên, nhưng vẽ bên trong dùng số thực
        canvas.width = Math.ceil(frameW);
        canvas.height = Math.ceil(frameH);

        let currentFrameIndex = 0;
        const totalFrames = cols * rows;

        const draw = () => {
            // Tính toán vị trí cắt (dùng số thực)
            const c = currentFrameIndex % cols;
            const r = Math.floor(currentFrameIndex / cols);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Vẽ frame
            ctx.drawImage(
                currentSprite, 
                c * frameW, r * frameH, // Source X, Y (Float)
                frameW, frameH,         // Source W, H (Float)
                offX, offY,             // Dest X, Y (Có Offset căn chỉnh)
                frameW, frameH          // Dest W, H
            );

            currentFrameIndex = (currentFrameIndex + 1) % totalFrames;
        };
        
        draw(); 
        previewInterval = setInterval(draw, delay);
    },

    processSprite() {
        if (!currentSprite) return;

        const format = document.getElementById('spriteFormat').value; 
        const targetWidthInput = document.getElementById('spriteTargetWidth').value;
        const name = document.getElementById('spriteOutName').value || 'result';

        const cols = parseInt(document.getElementById('spriteCols').value);
        const rows = parseInt(document.getElementById('spriteRows').value);
        const offX = parseInt(document.getElementById('spriteOffsetX').value) || 0;
        const offY = parseInt(document.getElementById('spriteOffsetY').value) || 0;
        
        // Dùng số thực cho tính toán
        const frameW = currentSprite.width / cols;
        const frameH = currentSprite.height / rows;

        // Tính toán Resize
        let finalW = Math.ceil(frameW);
        let finalH = Math.ceil(frameH);
        let scale = 1;

        if (targetWidthInput && parseInt(targetWidthInput) > 0) {
            finalW = parseInt(targetWidthInput);
            scale = finalW / frameW;
            finalH = Math.ceil(frameH * scale);
        }

        // Offset cũng phải scale theo
        const scaledOffX = offX * scale;
        const scaledOffY = offY * scale;

        // --- XUẤT PNG ---
        if (format === 'png') {
            const canvas = document.createElement('canvas');
            canvas.width = finalW;
            canvas.height = finalH;
            const ctx = canvas.getContext('2d');
            
            ctx.drawImage(currentSprite, 0, 0, frameW, frameH, scaledOffX, scaledOffY, finalW, finalH);
            
            canvas.toBlob((blob) => {
                this.forceDownload(blob, `${name}.png`);
            });
            return;
        }

        // --- XUẤT GIF ---
        const fps = parseInt(document.getElementById('spriteFPS').value);
        const loop = document.getElementById('spriteLoop').checked;
        const delay = 1000 / fps;

        const gif = new GIF({
            workers: 2,
            quality: 10,
            workerScript: './js/gif.worker.js',
            width: finalW,
            height: finalH,
            repeat: loop ? 0 : -1,
            transparent: 0x000000 
        });

        const btn = document.getElementById('btnSpriteConvert');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        btn.disabled = true;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const canvas = document.createElement('canvas');
                canvas.width = finalW;
                canvas.height = finalH;
                const ctx = canvas.getContext('2d');
                
                ctx.drawImage(
                    currentSprite, 
                    c * frameW, r * frameH, frameW, frameH, 
                    scaledOffX, scaledOffY, finalW, finalH
                );
                
                gif.addFrame(canvas, { delay: delay, copy: true });
            }
        }

        gif.on('finished', (blob) => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            this.forceDownload(blob, `${name}.gif`);
        });

        gif.render();
    },

    forceDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};