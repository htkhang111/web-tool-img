let cropper;
const image = document.getElementById('image');
const input = document.getElementById('imageInput');
const editorArea = document.getElementById('editorArea');
const fileNameDisplay = document.getElementById('fileName');
const qualityRange = document.getElementById('qualityRange');
const qualityVal = document.getElementById('qualityVal');

// Cập nhật hiển thị % chất lượng
qualityRange.addEventListener('input', (e) => {
    qualityVal.innerText = Math.round(e.target.value * 100) + '%';
});

// Xử lý khi chọn ảnh
input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.innerText = `Đang sửa: ${file.name}`;
        // Đặt tên mặc định cho output
        document.getElementById('outName').value = file.name.split('.')[0] + '_edited';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            image.src = e.target.result;
            editorArea.style.display = 'flex'; // Hiện khu vực sửa
            
            // Hủy cropper cũ nếu có
            if (cropper) {
                cropper.destroy();
            }
            // Tạo cropper mới
            cropper = new Cropper(image, {
                viewMode: 1,
                autoCropArea: 1,
                responsive: true,
            });
        };
        reader.readAsDataURL(file);
    }
});

// Các nút chức năng
window.rotate = (deg) => {
    if(cropper) cropper.rotate(deg);
}

window.resetCrop = () => {
    if(cropper) cropper.reset();
}

// Xử lý tải xuống
document.getElementById('btnDownload').addEventListener('click', () => {
    if (!cropper) return;

    const format = document.getElementById('outFormat').value;
    const quality = parseFloat(document.getElementById('qualityRange').value);
    const nameInput = document.getElementById('outName').value || 'image_edited';
    
    // Xác định đuôi file dựa trên mime type
    let extension = 'jpg';
    if(format === 'image/png') extension = 'png';
    else if(format === 'image/webp') extension = 'webp';

    // Lấy canvas đã crop
    const canvas = cropper.getCroppedCanvas();
    
    // Chuyển canvas thành Blob (file ảo) để tải
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        
        // Tạo thẻ a ẩn để kích hoạt tải xuống
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nameInput}.${extension}`;
        document.body.appendChild(a);
        a.click();
        
        // Dọn dẹp
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Hiện preview nhỏ
        const resultDiv = document.getElementById('resultPreview');
        resultDiv.innerHTML = '';
        const imgPreview = document.createElement('img');
        imgPreview.src = url;
        imgPreview.style.maxWidth = '100%';
        imgPreview.style.maxHeight = '150px';
        resultDiv.appendChild(imgPreview);

    }, format, quality);
});