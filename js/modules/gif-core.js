// js/modules/gif-core.js
// Module xử lý cắt/nén file GIF động

let superGifInstance = null;
let cropperInstance = null;
let currentFile = null;

export const GifCore = {
    init() {
        this.setupEvents();
    },

    setupEvents() {
        const input = document.getElementById('gifInput');
        const btnDownload = document.getElementById('btnGifDownload');
        const btnReset = document.getElementById('btnGifReset');

        if(input) {
            input.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) this.loadGif(e.target.files[0]);
            });
        }

        if(btnReset) {
            btnReset.addEventListener('click', () => {
                if (cropperInstance) cropperInstance.reset();
            });
        }

        if(btnDownload) {
            btnDownload.addEventListener('click', () => this.processAndExport());
        }

        // Hỗ trợ Paste GIF (Chỉ khi ở tab GIF)
        document.addEventListener('paste', (e) => {
            const activeTab = document.querySelector('.nav-link.active');
            if (activeTab && activeTab.id === 'gif-tab') {
                const items = e.clipboardData.items;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type === 'image/gif') {
                        this.loadGif(items[i].getAsFile());
                        break;
                    }
                }
            }
        });
    },

    loadGif(file) {
        currentFile = file;
        
        // Update UI
        document.getElementById('gifNameDisplay').innerText = file.name;
        document.getElementById('gifOutName').value = file.name.replace('.gif', '') + '_edited';
        document.getElementById('gifDropZone').style.display = 'none';
        document.getElementById('gifEditorArea').style.display = 'flex';

        const imgElement = document.getElementById('gifImagePlaceholder');
        
        // Reset
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        // Hack: Tái tạo element img để libgif không bị lỗi cache
        const newImg = imgElement.cloneNode(true);
        imgElement.parentNode.replaceChild(newImg, imgElement);
        newImg.src = URL.createObjectURL(file);

        // LibGif Init
        newImg.setAttribute('rel:animated_src', newImg.src);
        newImg.setAttribute('rel:auto_play', '0'); 

        // Khởi tạo SuperGif để phân tích frames
        superGifInstance = new SuperGif({ gif: newImg });
        superGifInstance.load(() => {
            const canvasEl = superGifInstance.get_canvas();
            // Gắn Cropper vào canvas của GIF
            cropperInstance = new Cropper(canvasEl, {
                viewMode: 1, autoCropArea: 1, movable: false, zoomable: false, rotatable: false, scalable: false,
            });
        });
    },

    processAndExport() {
        if (!superGifInstance || !cropperInstance) return;

        const cropData = cropperInstance.getData();
        const quality = parseInt(document.getElementById('gifQuality').value) || 10;
        const targetWidthInput = document.getElementById('gifWidth').value;
        const targetWidth = targetWidthInput ? parseInt(targetWidthInput) : 0;
        
        // Khởi tạo GIF Encoder
        const gif = new GIF({
            workers: 2,
            quality: quality,
            workerScript: './js/gif.worker.js',
            width: targetWidth > 0 ? targetWidth : cropData.width,
            height: targetWidth > 0 ? (cropData.height * (targetWidth / cropData.width)) : cropData.height
        });

        // UI Loading
        const loadingOverlay = document.getElementById('gifLoading');
        const progressText = document.getElementById('gifProgressText');
        loadingOverlay.style.setProperty('display', 'flex', 'important');

        const length = superGifInstance.get_length();
        
        const processFrame = (i) => {
            if (i >= length) {
                // Render xong
                gif.on('finished', (blob) => {
                    loadingOverlay.style.setProperty('display', 'none', 'important');
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = (document.getElementById('gifOutName').value || 'gif_edited') + '.gif';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
                gif.render();
                return;
            }

            progressText.innerText = `Đang xử lý Frame ${i + 1}/${length}`;
            superGifInstance.move_to(i);
            
            const sourceCanvas = superGifInstance.get_canvas();
            
            // 1. Cắt ảnh (Crop)
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cropData.width;
            tempCanvas.height = cropData.height;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(sourceCanvas, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);

            // 2. Resize (Nếu có)
            let finalCanvas = tempCanvas;
            if (targetWidth > 0) {
                const scaleFactor = targetWidth / cropData.width;
                const newHeight = cropData.height * scaleFactor;
                
                const resizeCanvas = document.createElement('canvas');
                resizeCanvas.width = targetWidth;
                resizeCanvas.height = newHeight;
                resizeCanvas.getContext('2d').drawImage(tempCanvas, 0, 0, resizeCanvas.width, resizeCanvas.height);
                finalCanvas = resizeCanvas;
            }

            const currentFrameInfo = superGifInstance.get_current_frame(); 
            // delay * 10 vì libgif dùng đơn vị 1/100s
            gif.addFrame(finalCanvas, { delay: currentFrameInfo.delay * 10 || 100, copy: true });

            setTimeout(() => processFrame(i + 1), 0);
        };
        processFrame(0);
    }
};