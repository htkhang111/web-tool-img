// js/modules/core/auth.js
export const Auth = {
    currentUser: null,
    
    // --- KHỞI TẠO & SESSION ---
    init() {
        // Load session từ LocalStorage (để F5 không bị mất login)
        const savedUser = localStorage.getItem('studio_user_session');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
            } catch (e) {
                console.error("Lỗi đọc session cũ", e);
                this.logout();
            }
        }
    },

    isLoggedIn() {
        return !!this.currentUser;
    },

    requireLogin() {
        this.init();
        if (!this.currentUser) {
            // Chưa đăng nhập -> Đá về trang login
            window.location.href = 'login.html';
        } else {
            // Đã đăng nhập -> Hiển thị thông tin
            this.renderUserInfo();
        }
    },

    // --- GỌI API BACKEND ---

    async register(username, password) {
        const btn = document.getElementById('btnRegister');
        const msg = document.getElementById('msg');
        
        try {
            if(btn) { btn.disabled = true; btn.innerText = "Đang xử lý..."; }
            if(msg) msg.innerText = "";

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Lỗi không xác định");
            
            alert(data.message); // "Đăng ký thành công"
            // Reload để user nhập lại login cho chắc (hoặc tự login luôn tùy bạn)
            window.location.reload();
            
        } catch (err) {
            if(msg) msg.innerText = err.message;
            else alert(err.message);
        } finally {
            if(btn) { btn.disabled = false; btn.innerText = "Đăng Ký"; }
        }
    },

    async login(username, password) {
        const btn = document.getElementById('btnLogin');
        const msg = document.getElementById('msg');

        try {
            if(btn) { btn.disabled = true; btn.innerText = "Đang vào..."; }
            if(msg) msg.innerText = "";

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Sai tài khoản/mật khẩu");

            // Đăng nhập thành công -> Lưu session
            this.currentUser = data;
            localStorage.setItem('studio_user_session', JSON.stringify(data));

            // Chuyển vào Studio
            window.location.href = 'index.html';

        } catch (err) {
            if(msg) msg.innerText = err.message;
            else alert(err.message);
        } finally {
            if(btn) { btn.disabled = false; btn.innerText = "Đăng Nhập"; }
        }
    },

    logout() {
        if(confirm('Bạn muốn đăng xuất?')) {
            localStorage.removeItem('studio_user_session');
            this.currentUser = null;
            window.location.href = 'login.html';
        }
    },

    // --- XỬ LÝ KEYS (Tạm thời chỉ hiển thị, chưa có API Add/Remove) ---
    
    getActiveKey(provider) {
        if (!this.currentUser || !this.currentUser.keys) return null;
        // Tìm key active của provider đó
        const keyObj = this.currentUser.keys.find(k => k.provider === provider && k.active) 
                    || this.currentUser.keys.find(k => k.provider === provider);
        return keyObj ? keyObj.key : null;
    },

    addKey(provider, key, name) {
        // TODO: Cần viết thêm API /api/user/add-key để lưu vào DB thật
        alert("Tính năng lưu Key vào Database đang được bảo trì! Vui lòng chờ update sau.");
        console.log("Mock Add Key:", provider, key, name);
    },

    removeKey(id) {
        // TODO: Cần viết thêm API /api/user/remove-key
        alert("Tính năng xóa Key đang được bảo trì!");
    },

    // --- GIAO DIỆN (UI) ---

    renderUserInfo() {
        const display = document.getElementById('usernameDisplay');
        if (display && this.currentUser) {
            display.innerText = this.currentUser.username;
        }
        this.renderKeyList();
    },

    renderKeyList() {
        const container = document.getElementById('keyListContainer');
        if (!container || !this.currentUser) return;
        
        container.innerHTML = '';
        const keys = this.currentUser.keys || [];
        
        if(keys.length === 0) {
            return container.innerHTML = '<div class="text-muted text-center small py-2">Chưa có Key nào.</div>';
        }

        keys.forEach(k => {
            const div = document.createElement('div');
            div.className = `d-flex justify-content-between align-items-center p-2 mb-2 border rounded ${k.active ? 'border-success bg-dark' : 'border-secondary'}`;
            div.innerHTML = `
                <div class="text-truncate" style="max-width: 80%">
                    <span class="badge ${k.provider === 'photoroom' ? 'bg-primary' : 'bg-warning text-dark'} me-1">${k.provider}</span>
                    <span class="small fw-bold text-light">${k.name || 'Key'}</span>
                </div>
                <button class="btn btn-sm btn-outline-danger del-key" style="padding: 0 5px;" data-id="${k.id || ''}">&times;</button>
            `;
            container.appendChild(div);
        });

        // Gán sự kiện xóa (dù chưa chạy backend nhưng để UI không chết)
        container.querySelectorAll('.del-key').forEach(b => {
            b.onclick = (e) => this.removeKey(e.currentTarget.dataset.id);
        });
    }
};