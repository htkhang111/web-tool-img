// js/modules/tools/magic.js
import { FabricEditor } from '../editor/fabric-editor.js';
import { Auth } from '../core/auth.js';

export const Magic = {
    init() {
        const btn = document.getElementById('btnAiRemove');
        if(btn) btn.onclick = () => this.process();
    },

    async process() {
        const activeObj = FabricEditor.getActiveObject();
        if (!activeObj || activeObj.type !== 'image') return alert("⚠️ Hãy chọn một tấm ảnh trước!");

        // Lấy Key: Ưu tiên HuggingFace (Free), nếu không có thì PhotoRoom
        let userKey = Auth.getActiveKey('huggingface');
        let provider = 'huggingface';

        if (!userKey) {
            userKey = Auth.getActiveKey('photoroom');
            if(userKey) provider = 'photoroom';
        }

        const btn = document.getElementById('btnAiRemove');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        btn.disabled = true;

        try {
            // Chuẩn bị file
            const blob = await this.toBlob(activeObj.getSrc());

            // Chuẩn bị Header
            const headers = {};
            if (userKey) {
                headers['x-user-api-key'] = userKey;
                headers['x-provider'] = provider;
            }

            console.log(`Magic: Sending request (${userKey ? 'User Key' : 'Server Key'})...`);

            // Gọi Backend
            const res = await fetch('/api/remove-bg', {
                method: 'POST',
                headers: headers,
                body: blob
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `Server Error ${res.status}`);
            }

            // Nhận kết quả
            const resBlob = await res.blob();
            const url = URL.createObjectURL(resBlob);
            FabricEditor.replaceActiveImage(url);

        } catch (e) {
            console.error(e);
            alert(`❌ Lỗi: ${e.message}`);
        } finally {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    },

    async toBlob(src) {
        if (src.startsWith('data:')) {
            const arr = src.split(','), mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length; 
            const u8arr = new Uint8Array(n);
            while(n--) u8arr[n] = bstr.charCodeAt(n);
            return new Blob([u8arr], {type:mime});
        }
        return await (await fetch(src)).blob();
    }
};