// api/remove-bg.js
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Cho phép upload ảnh tối đa 10MB
        },
    },
};

export default async function handler(req, res) {
    // Chỉ chấp nhận method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Lấy API Key
    // Ưu tiên Key từ User gửi lên (Header: x-user-api-key)
    // Nếu không có thì lấy Key của Server (Biến môi trường)
    const userKey = req.headers['x-user-api-key'];
    const serverKey = process.env.HUGGING_FACE_TOKEN; 
    
    // Xác định Provider (huggingface hoặc photoroom)
    const provider = req.headers['x-provider'] || 'huggingface';

    // Logic chọn token cuối cùng
    const token = userKey || serverKey;

    if (!token) {
        return res.status(401).json({ 
            error: 'Thiếu API Key! Vui lòng nhập Key cá nhân hoặc liên hệ Admin cấu hình Server Key.' 
        });
    }

    try {
        let endpoint = "";
        let headers = {};

        if (provider === 'photoroom') {
            endpoint = "https://sdk.photoroom.com/v1/segment";
            headers = {
                "x-api-key": token
                // PhotoRoom nhận binary body trực tiếp
            };
        } else {
            // Mặc định là Hugging Face (RMBG-1.4)
            endpoint = "https://api-inference.huggingface.co/models/briaai/RMBG-1.4";
            headers = {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/octet-stream",
            };
        }

        console.log(`Processing with provider: ${provider}`);

        // Gửi request sang AI Provider
        const response = await fetch(endpoint, {
            method: "POST",
            headers: headers,
            body: req.body, // Stream thẳng body từ client lên
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("AI Provider Error:", errText);
            
            // Xử lý lỗi cold start của Hugging Face
            if (response.status === 503) {
                return res.status(503).json({ error: "Model AI đang khởi động (Cold Start). Vui lòng đợi 30s rồi thử lại!" });
            }
            
            throw new Error(`Lỗi từ AI (${response.status}): ${errText.substring(0, 100)}...`);
        }

        // Nhận ảnh kết quả (Blob) và chuyển thành Buffer để trả về
        const imageBlob = await response.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Trả ảnh PNG về cho Frontend
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(buffer);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
}