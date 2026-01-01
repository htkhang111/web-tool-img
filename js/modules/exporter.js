// js/modules/exporter.js
export const Exporter = {
    download(canvas, filename, mimeType, quality) {
        if (!canvas) {
            alert("Chưa có ảnh để xử lý!");
            return;
        }

        // Tạo định dạng đuôi file
        let ext = 'jpg';
        if (mimeType === 'image/png') ext = 'png';
        if (mimeType === 'image/webp') ext = 'webp';

        const finalName = `${filename}.${ext}`;

        // Chuyển canvas thành Blob
        canvas.toBlob((blob) => {
            if (!blob) return;

            // Tạo link ảo
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = finalName;
            
            // Trigger
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        }, mimeType, parseFloat(quality));
    }
};