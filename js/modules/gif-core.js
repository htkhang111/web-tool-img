let currentSprite = null;

export const SpriteCore = {
    init() {
        this.setupEvents();
    },

    setupEvents() {
        const input = document.getElementById('spriteInput');
        const btnConvert = document.getElementById('btnSpriteConvert');
        
        const inputsToWatch = ['spriteCols', 'spriteRows'];

        if (input) {
            input.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) this.loadSprite(e.target.files[0]);
            });
        }

        if (btnConvert) btnConvert.addEventListener('click', () => this.processSprite());

        // Update preview khi nhập
        inputsToWatch.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('input', () => this.updateFrameInfoAndPreview());
        });

        // Paste support
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
        document.getElementById('spriteResultArea').classList.add('d-none');

        const img = new Image();
        img.onload = () => {
            currentSprite = img;
            document.getElementById('spriteOriginalSize').innerText = `${img.width} x ${img.height} px`;
            // Default
            document.getElementById('spriteCols').value = 4; 
            document.getElementById('spriteRows').value = 1;
            this.updateFrameInfoAndPreview();
        };
        img.src = URL.createObjectURL(file);
    },

    updateFrameInfoAndPreview() {
        if (!currentSprite) return;

        const cols = parseInt(document.getElementById('spriteCols').value) || 1;
        const rows = parseInt(document.getElementById('spriteRows').value) || 1;

        const frameW = Math.floor(currentSprite.width / cols);
        const frameH = Math.floor(currentSprite.height / rows);

        document.getElementById('spriteFrameSize').innerText = `${frameW} x ${frameH} px`;

        const canvas = document.getElementById('framePreviewCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = frameW;
        canvas.height = frameH;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(currentSprite, 0, 0, frameW, frameH, 0, 0, frameW, frameH);
    },

    processSprite() {
        if (!currentSprite) return;

        const cols = parseInt(document.getElementById('spriteCols').value) || 1;
        const rows = parseInt(document.getElementById('spriteRows').value) || 1;
        const speed = parseInt(document.getElementById('spriteSpeed').value) || 100;
        const loop = document.getElementById('spriteLoop').checked;

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
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        btn.disabled = true;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const canvas = document.createElement('canvas');
                canvas.width = frameWidth;
                canvas.height = frameHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(currentSprite, c * frameWidth, r * frameHeight, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
                gif.addFrame(canvas, { delay: speed, copy: true });
            }
        }

        gif.on('finished', (blob) => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = (document.getElementById('spriteOutName').value || 'sprite_anim') + '.gif';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            const resImg = document.getElementById('spriteResultImg');
            resImg.src = url;
            document.getElementById('spriteResultArea').classList.remove('d-none');
        });

        gif.render();
    }
};