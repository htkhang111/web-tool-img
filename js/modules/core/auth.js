// js/modules/core/auth.js
export const Auth = {
    currentUser: null,

    init() {
        this.loadSession();
        // Không render UI ở đây nữa vì đã tách trang
    },

    isLoggedIn() {
        return !!this.currentUser;
    },

    // --- Chức năng Bảo vệ (Dùng cho index.html) ---
    requireLogin() {
        this.loadSession();
        if (!this.currentUser) {
            window.location.href = 'login.html'; // Đá về Login nếu chưa đăng nhập
        } else {
            this.renderUserInfo(); // Nếu đã login thì hiện info
        }
    },

    // --- User Logic ---
    register(username) {
        const db = this.getDB();
        if (db[username]) return alert("Tài khoản đã tồn tại!");
        
        db[username] = { keys: [] };
        this.saveDB(db);
        this.login(username); // Đăng nhập luôn sau khi đăng ký
    },

    login(username) {
        const db = this.getDB();
        if (!db[username]) return alert("Tài khoản không tồn tại! Hãy tạo mới.");
        
        localStorage.setItem('studio_current_user', username);
        this.currentUser = username;
        
        // Chuyển hướng vào Studio
        window.location.href = 'index.html';
    },

    logout() {
        if(confirm('Đăng xuất khỏi Studio?')) {
            localStorage.removeItem('studio_current_user');
            this.currentUser = null;
            window.location.href = 'login.html'; // Đá về Login
        }
    },

    // --- Key Logic (Giữ nguyên) ---
    addKey(provider, key, name) {
        const db = this.getDB();
        const user = db[this.currentUser];
        user.keys.push({ id: Date.now(), provider, key: key.trim(), name: name || provider, active: true });
        
        // Auto activate last key
        user.keys.forEach(k => {
            if(k.id !== user.keys[user.keys.length-1].id && k.provider === provider) k.active = false;
        });

        this.saveDB(db);
        this.renderKeyList();
        alert("Đã lưu Key!");
    },

    removeKey(id) {
        const db = this.getDB();
        const user = db[this.currentUser];
        user.keys = user.keys.filter(k => k.id !== id);
        this.saveDB(db);
        this.renderKeyList();
    },

    getActiveKey(provider) {
        if (!this.currentUser) return null;
        const user = this.getDB()[this.currentUser];
        if(!user) return null;
        const keyObj = user.keys.find(k => k.provider === provider && k.active) || user.keys.find(k => k.provider === provider);
        return keyObj ? keyObj.key : null;
    },

    // --- Helpers & UI ---
    getDB() { return JSON.parse(localStorage.getItem('studio_users') || '{}'); },
    saveDB(db) { localStorage.setItem('studio_users', JSON.stringify(db)); },
    
    loadSession() { 
        const user = localStorage.getItem('studio_current_user');
        if (user && this.getDB()[user]) this.currentUser = user;
        else this.currentUser = null;
    },

    renderUserInfo() {
        // Chỉ chạy ở trang index.html
        const display = document.getElementById('usernameDisplay');
        if (display && this.currentUser) {
            display.innerText = this.currentUser;
        }
        this.renderKeyList(); // Load danh sách key vào Modal
    },

    renderKeyList() {
        const container = document.getElementById('keyListContainer');
        if (!container || !this.currentUser) return;
        
        container.innerHTML = '';
        const keys = this.getDB()[this.currentUser].keys || [];
        
        if(keys.length === 0) return container.innerHTML = '<div class="text-muted text-center small py-2">Chưa có Key nào.</div>';

        keys.forEach(k => {
            const div = document.createElement('div');
            div.className = `d-flex justify-content-between align-items-center p-2 mb-2 border rounded ${k.active ? 'border-success bg-dark' : 'border-secondary'}`;
            div.innerHTML = `
                <div class="text-truncate" style="max-width: 80%">
                    <span class="badge ${k.provider === 'photoroom' ? 'bg-primary' : 'bg-warning text-dark'} me-1">${k.provider}</span>
                    <span class="small fw-bold text-light">${k.name}</span>
                </div>
                <button class="btn btn-sm btn-outline-danger del-key" style="padding: 0 5px;" data-id="${k.id}">&times;</button>
            `;
            container.appendChild(div);
        });

        container.querySelectorAll('.del-key').forEach(b => {
            b.onclick = (e) => this.removeKey(parseInt(e.currentTarget.dataset.id));
        });
    }
};