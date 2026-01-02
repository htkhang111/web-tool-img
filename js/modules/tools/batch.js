// js/modules/tools/batch.js
export const BatchTool = {
    selectedFiles: [],

    init() {
        const input = document.getElementById('batchInput');
        const btnClear = document.getElementById('btnBatchClear');
        const btnProcess = document.getElementById('btnBatchProcess');
        const dropZone = document.getElementById('batchDropZone');

        if (input) {
            input.addEventListener('change', (e) => this.handleFiles(e.target.files));
        }

        if (btnClear) {
            btnClear.addEventListener('click', () => this.reset());
        }

        if (btnProcess) {
            btnProcess.addEventListener('click', () => this.processBatch());
        }

        // Drag Drop cho Batch
        if (dropZone) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); });
            });
            dropZone.addEventListener('drop', (e) => this.handleFiles(e.dataTransfer.files));
        }
    },

    handleFiles(files) {
        if (!files || files.length === 0) return;
        this.selectedFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        
        document.getElementById('batchCount').innerText = this.selectedFiles.length;
        document.getElementById('batchDropZone').style.display = 'none';
        document.getElementById('batchOptions').style.display = 'block';
    },

    reset() {
        this.selectedFiles = [];
        document.getElementById('batchDropZone').style.display = 'block';
        document.getElementById('batchOptions').style.display = 'none';
        document.getElementById('batchProgress').style.display = 'none';
        document.getElementById('batchInput').value = '';
    },

    async processBatch() {
        if (this.selectedFiles.length === 0) return;

        const namePattern = document.getElementById('batchNamePattern').value || 'Image_{n}';
        const targetFormat = document.getElementById('batchFormat').value;
        const startNum = parseInt(document.getElementById('batchStartNum').value) || 1;
        
        const zip = new JSZip();
        const folder = zip.folder("Processed_Images");
        
        const progressBar = document.querySelector('#batchProgress .progress-bar');
        document.getElementById('batchProgress').style.display = 'flex';
        
        const total = this.selectedFiles.length;
        
        for (let i = 0; i < total; i++) {
            const file = this.selectedFiles[i];
            const idx = startNum + i;
            
            // Tạo tên mới
            let newName = namePattern.replace('{n}', idx);
            
            // Xử lý định dạng
            let blobToAdd = file;
            let extension = file.name.split('.').pop();
            
            // Nếu cần convert định dạng
            if (targetFormat !== 'original') {
                blobToAdd = await this.convertImage(file, targetFormat);
                extension = targetFormat === 'image/png' ? 'png' : (targetFormat === 'image/webp' ? 'webp' : 'jpg');
            } else {
                // Nếu giữ nguyên, chỉ đảm bảo tên file không dính đuôi cũ
                // (Logic ở đây đơn giản là lấy extension từ file gốc)
            }

            folder.file(`${newName}.${extension}`, blobToAdd);
            
            // Update UI
            const percent = Math.round(((i + 1) / total) * 100);
            progressBar.style.width = `${percent}%`;
            progressBar.innerText = `${percent}%`;
        }

        // Generate ZIP
        zip.generateAsync({type:"blob"}).then((content) => {
            saveAs(content, "Batch_Images.zip");
            alert("Đã xử lý xong! File ZIP đang tải xuống.");
            this.reset();
        });
    },

    convertImage(file, mimeType) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => resolve(blob), mimeType, 0.9);
            };
            img.src = URL.createObjectURL(file);
        });
    }
};