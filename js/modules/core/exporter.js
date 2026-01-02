// js/modules/core/exporter.js
export const Exporter = {
    // Hàm cũ dùng cho Canvas element
    download(canvas, filename, mimeType, quality) {
        if (!canvas) return;
        let ext = mimeType === 'image/png' ? 'png' : (mimeType === 'image/webp' ? 'webp' : 'jpg');
        
        canvas.toBlob((blob) => {
            saveAs(blob, `${filename}.${ext}`); // Dùng FileSaver.js cho chuẩn
        }, mimeType, parseFloat(quality));
    },

    // Hàm mới dùng cho Base64 string (Fabric export)
    downloadBase64(dataURL, filename, mimeType) {
        let ext = mimeType === 'image/png' ? 'png' : (mimeType === 'image/webp' ? 'webp' : 'jpg');
        // Convert Base64 to Blob
        fetch(dataURL)
            .then(res => res.blob())
            .then(blob => {
                saveAs(blob, `${filename}.${ext}`);
            });
    }
};