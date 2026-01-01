// js/modules/gif-core.js
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
        const dropZone = document.getElementById('gifDropZone'); // <--- MỚI

        if(input) {
            input.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) this.loadGif(e.target.files[0]);
            });
        }

        // --- XỬ LÝ KÉO THẢ CHO GIF ---
        if (dropZone) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, false);
            });

            dropZone.addEventListener('dragover', () => dropZone.classList.add('bg-dark', 'border-white'));
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('bg-dark', 'border-white'));

            dropZone.addEventListener('drop', (e) => {
                dropZone.classList.remove('bg-dark', 'border-white');
                const dt = e.dataTransfer;
                if (dt.files && dt.files[0] && dt.files[0].type === 'image/gif') {
                    this.loadGif(dt.files[0]);
                } else {
                    alert("Vui lòng thả file GIF!");
                }
            });
        }
        // ------------------------------

        if(btnReset) {
            btnReset.addEventListener('click', () => {
                if (cropperInstance) cropperInstance.reset();
            });
        }

        if(btnDownload) {
            btnDownload.addEventListener('click', () => this.processAndExport());
        }

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
        
        document.getElementById('gifNameDisplay').innerText = file.name;
        document.getElementById('gifOutName').value = file.name.replace('.gif', '') + '_edited';
        document.getElementById('gifDropZone').style.display = 'none';
        document.getElementById('gifEditorArea').style.display = 'flex';

        const imgElement = document.getElementById('gifImagePlaceholder');
        
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        const newImg = imgElement.cloneNode(true);
        imgElement.parentNode.replaceChild(newImg, imgElement);
        newImg.src = URL.createObjectURL(file);

        newImg.setAttribute('rel:animated_src', newImg.src);
        newImg.setAttribute('rel:auto_play', '0'); 

        superGifInstance = new SuperGif({ gif: newImg });
        superGifInstance.load(() => {
            const canvasEl = superGifInstance.get_canvas();
            cropperInstance = new Cropper(canvasEl, {
                viewMode: 1, autoCropArea: 1, movable: false, zoomable: false, rotatable: false, scalable: false,
            });
        });
    },

    processAndExport() {
        if (!superGifInstance || !cropperInstance) return;

        const cropData = cropperInstance.getData();
        const quality = parseInt(document.getElementById('gifQuality').value);
        const targetWidth = parseInt(document.getElementById('gifWidth').value) || 0;
        
        const gif = new GIF({
            workers: 2,
            quality: quality,
            workerScript: './js/gif.worker.js',
            width: targetWidth > 0 ? targetWidth : cropData.width,
            height: targetWidth > 0 ? (cropData.height * (targetWidth / cropData.width)) : cropData.height
        });

        const loadingOverlay = document.getElementById('gifLoading');
        const progressText = document.getElementById('gifProgressText');
        loadingOverlay.style.setProperty('display', 'flex', 'important');

        const length = superGifInstance.get_length();
        
        const processFrame = (i) => {
            if (i >= length) {
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
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cropData.width;
            tempCanvas.height = cropData.height;
            const ctx = tempCanvas.getContext('2d');

            ctx.drawImage(sourceCanvas, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);

            let finalCanvas = tempCanvas;
            if (targetWidth > 0) {
                const scaleFactor = targetWidth / cropData.width;
                const resizeCanvas = document.createElement('canvas');
                resizeCanvas.width = targetWidth;
                resizeCanvas.height = cropData.height * scaleFactor;
                resizeCanvas.getContext('2d').drawImage(tempCanvas, 0, 0, resizeCanvas.width, resizeCanvas.height);
                finalCanvas = resizeCanvas;
            }

            const currentFrameInfo = superGifInstance.get_current_frame(); 
            gif.addFrame(finalCanvas, { delay: currentFrameInfo.delay * 10 || 100, copy: true });

            setTimeout(() => processFrame(i + 1), 0);
        };
        processFrame(0);
    }
};