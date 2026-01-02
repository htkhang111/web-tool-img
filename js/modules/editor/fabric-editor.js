// js/modules/editor/fabric-editor.js
export const FabricEditor = {
    canvas: null,

    init() {
        // Khởi tạo Fabric Canvas
        this.canvas = new fabric.Canvas('fabricCanvas', {
            width: 800,
            height: 600,
            backgroundColor: null, // Transparent
            preserveObjectStacking: true // Giữ thứ tự layer khi chọn
        });

        this.setupEvents();
    },

    setupEvents() {
        // Xóa đối tượng (Phím Delete)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && this.canvas.getActiveObject()) {
                this.deleteActive();
            }
        });

        // Nút Toolbar
        const btnDelete = document.getElementById('btnDeleteObj');
        const btnFront = document.getElementById('btnBringFront');
        const btnBack = document.getElementById('btnSendBack');
        const btnClear = document.getElementById('btnClearAll');

        if(btnDelete) btnDelete.onclick = () => this.deleteActive();
        if(btnFront) btnFront.onclick = () => {
            const obj = this.canvas.getActiveObject();
            if(obj) { obj.bringToFront(); this.canvas.discardActiveObject(); this.canvas.renderAll(); }
        };
        if(btnBack) btnBack.onclick = () => {
            const obj = this.canvas.getActiveObject();
            if(obj) { obj.sendToBack(); this.canvas.discardActiveObject(); this.canvas.renderAll(); }
        };
        if(btnClear) btnClear.onclick = () => {
            if(confirm('Xóa trắng toàn bộ Workspace?')) this.canvas.clear();
        };
    },

    addImage(url, isAppend = false) {
        fabric.Image.fromURL(url, (img) => {
            // Nếu là ảnh đầu tiên (chưa có gì), resize canvas theo ảnh
            if (!isAppend || this.canvas.getObjects().length === 0) {
                // Giới hạn max width hiển thị để không vỡ layout
                const maxWidth = 1000;
                let scale = 1;
                if (img.width > maxWidth) {
                    scale = maxWidth / img.width;
                }

                this.canvas.setWidth(img.width * scale);
                this.canvas.setHeight(img.height * scale);
                this.canvas.setBackgroundImage(null); // Xóa bg cũ
                
                // Scale ảnh khớp canvas
                img.scale(scale);
            } else {
                // Ảnh thêm vào sau thì scale nhỏ lại cho dễ nhìn (1/3 canvas)
                img.scaleToWidth(this.canvas.getWidth() / 3);
            }

            img.set({
                cornerColor: '#0dcaf0', // Màu xanh dương cyan
                cornerStyle: 'circle',
                borderColor: '#0dcaf0',
                transparentCorners: false
            });

            this.canvas.add(img);
            this.canvas.setActiveObject(img);
            
            // FIX: Tính toán lại vị trí chuột trên canvas để sửa lỗi không click được
            this.canvas.calcOffset(); 
            this.canvas.renderAll();
        });
    },

    deleteActive() {
        const active = this.canvas.getActiveObject();
        if (active) {
            this.canvas.remove(active);
            this.canvas.discardActiveObject();
            this.canvas.renderAll();
        }
    },

    getActiveObject() {
        return this.canvas.getActiveObject();
    },

    // Thay thế ảnh của Object đang chọn (Dùng cho AI Remove BG)
    replaceActiveImage(newUrl) {
        const activeObj = this.canvas.getActiveObject();
        if (!activeObj || activeObj.type !== 'image') return;

        const oldLeft = activeObj.left;
        const oldTop = activeObj.top;
        const oldScaleX = activeObj.scaleX;
        const oldScaleY = activeObj.scaleY;
        const oldAngle = activeObj.angle;

        fabric.Image.fromURL(newUrl, (newImg) => {
            newImg.set({
                left: oldLeft,
                top: oldTop,
                scaleX: oldScaleX,
                scaleY: oldScaleY,
                angle: oldAngle,
                cornerColor: '#0dcaf0',
                cornerStyle: 'circle',
                borderColor: '#0dcaf0',
                transparentCorners: false
            });

            this.canvas.remove(activeObj);
            this.canvas.add(newImg);
            this.canvas.setActiveObject(newImg);
            this.canvas.calcOffset(); // Fix offset khi thay ảnh
            this.canvas.renderAll();
        });
    },

    exportImage(format, quality) {
        return this.canvas.toDataURL({
            format: format === 'image/jpeg' ? 'jpeg' : 'png',
            quality: parseFloat(quality),
            multiplier: 1
        });
    }
};