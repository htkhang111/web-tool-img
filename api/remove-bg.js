// api/remove-bg.js
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Cho phép ảnh to 10MB
        },
    },
};

export default async function handler(req, res) {
    // Chỉ chấp nhận POST
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // 1. Lấy API Key từ Header (Ưu tiên Key của User, nếu không có dùng Key Server)
        const userKey = req.headers['x-user-api-key'];
        const serverKey = process.env.HUGGING_FACE_TOKEN; // Cài trong Vercel Setting
        
        // Mặc định dùng Hugging Face nếu không chỉ định provider
        const provider = req.headers['x-provider'] || 'huggingface';
        
        // Quyết định dùng Key nào
        const token = userKey || serverKey;

        if (!token) {
            return res.status(401).json({ 
                error: 'Thiếu API Key! Vui lòng đăng nhập và thêm Key, hoặc liên hệ Admin.' 
            });
        }

        // 2. Cấu hình Endpoint
        let endpoint, headers;

        if (provider === 'photoroom') {
            endpoint = "https://sdk.photoroom.com/v1/segment";
            headers = {
                "x-api-key": token
            };
        } else {
            // Mặc định Hugging Face (Model RMBG-1.4)
            endpoint = "https://api-inference.huggingface.co/models/briaai/RMBG-1.4";
            headers = {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/octet-stream",
            };
        }

        console.log(`[Server] Processing with ${provider}...`);

        // 3. Gọi AI Service
        const aiResponse = await fetch(endpoint, {
            method: "POST",
            headers: headers,
            body: req.body, // Truyền thẳng binary ảnh lên
        });

        if (!aiResponse.ok) {
            const errText = await aiResponse.text();
            if (aiResponse.status === 503) {
                return res.status(503).json({ error: "AI đang khởi động (Cold Start), vui lòng thử lại sau 30s!" });
            }
            throw new Error(`AI Error (${aiResponse.status}): ${errText}`);
        }

        // 4. Trả ảnh về cho Frontend
        const imageBlob = await aiResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(buffer);

    } catch (error) {
        console.error("[Server Error]", error);
        res.status(500).json({ error: error.message });
    }
}