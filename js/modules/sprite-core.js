// js/modules/sprite-core.js
// Logic: Drag & Drop, Animation Preview, Silent Export

let currentSprite = null;
let previewInterval = null;

export const SpriteCore = {
    init() {
        this.setupEvents();
    },

    setupEvents() {
        const input = document.getElementById('spriteInput');
        const btnConvert = document.getElementById('btnSpriteConvert');
        const dropZone = document.getElementById('spriteDropZone');
        
        const inputsToWatch = ['spriteCols', 'spriteRows', 'spriteFPS'];

        if (input) {
            input.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) this.loadSprite(e.target.files[0]);
            });
        }

        // Drag & Drop
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

        inputsToWatch.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('input', () => this.startPreviewAnimation());
        });

        // Paste Support
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
        document.getElementById('spriteDropZone').style.display = 'none';
        document.getElementById('spriteEditorArea').style.display = 'flex';
        document.getElementById('spriteNameDisplay').innerText = file.name;
        document.getElementById('spriteOutName').value = file.name.split('.')[0] + '_anim';
        
        // Ẩn vùng kết quả nếu đang hiện
        const resArea = document.getElementById('spriteResultArea');
        if(resArea) resArea.classList.add('d-none');

        const img = new Image();
        img.onload = () => {
            currentSprite = img;
            document.getElementById('spriteOriginalSize').innerText = `${img.width} x ${img.height} px`;
            
            document.getElementById('spriteCols').value = 4; 
            document.getElementById('spriteRows').value = 1;
            document.getElementById('spriteFPS').value = 12;
            
            this.startPreviewAnimation();
        };
        img.src = URL.createObjectURL(file);
    },

    startPreviewAnimation() {
        if (!currentSprite) return;
        
        if (previewInterval) clearInterval(previewInterval);

        const cols = parseInt(document.getElementById('spriteCols').value) || 1;
        const rows = parseInt(document.getElementById('spriteRows').value) || 1;
        const fps = parseInt(document.getElementById('spriteFPS').value) || 12;
        
        const delay = 1000 / fps;

        const frameW = Math.floor(currentSprite.width / cols);
        const frameH = Math.floor(currentSprite.height / rows);

        document.getElementById('spriteFrameSize').innerText = `${frameW} x ${frameH} px`;

        const canvas = document.getElementById('framePreviewCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = frameW;
        canvas.height = frameH;

        let currentFrameIndex = 0;
        const totalFrames = cols * rows;

        const draw = () => {
            const c = currentFrameIndex % cols;
            const r = Math.floor(currentFrameIndex / cols);

            ctx.clearRect(0, 0, frameW, frameH);
            ctx.drawImage(
                currentSprite, 
                c * frameW, r * frameH, 
                frameW, frameH, 
                0, 0, frameW, frameH
            );

            currentFrameIndex = (currentFrameIndex + 1) % totalFrames;
        };
        
        draw(); 
        previewInterval = setInterval(draw, delay);
    },

    processSprite() {
        if (!currentSprite) return;

        const cols = parseInt(document.getElementById('spriteCols').value) || 1;
        const rows = parseInt(document.getElementById('spriteRows').value) || 1;
        const fps = parseInt(document.getElementById('spriteFPS').value) || 12;
        const loop = document.getElementById('spriteLoop').checked;

        const delay = 1000 / fps; 

        const frameWidth = Math.floor(currentSprite.width / cols);
        const frameHeight = Math.floor(currentSprite.height / rows);

        const gif = new GIF({
            workers: 2,
            quality: 10,
            workerScript: './js/gif.worker.js',
            width: frameWidth,
            height: frameHeight,
            repeat: loop ? 0 : -1,
            transparent: 0x000000 
        });

        const btn = document.getElementById('btnSpriteConvert');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
        btn.disabled = true;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const canvas = document.createElement('canvas');
                canvas.width = frameWidth;
                canvas.height = frameHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(currentSprite, c * frameWidth, r * frameHeight, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
                gif.addFrame(canvas, { delay: delay, copy: true });
            }
        }

        gif.on('finished', (blob) => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            
            // Chỉ tải xuống, không hiện ảnh kết quả nữa
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (document.getElementById('spriteOutName').value || 'sprite_anim') + '.gif';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Xóa vùng kết quả nếu có
            const resArea = document.getElementById('spriteResultArea');
            if(resArea) resArea.classList.add('d-none');
        });

        gif.render();
    }
};