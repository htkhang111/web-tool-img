// js/modules/core/auth.js
export const Auth = {
    currentUser: null,

    init() {
        this.loadSession();
        this.renderAuthUI();
    },

    // --- User Logic ---
    register(username) {
        if (!username) return alert("Vui lòng nhập tên!");
        const db = this.getDB();
        
        if (db[username]) return alert("Tên này đã có người dùng!");

        db[username] = { keys: [] };
        this.saveDB(db);
        this.login(username);
        alert(`Chào mừng ${username}!`);
    },

    login(username) {
        const db = this.getDB();
        if (!db[username]) return alert("Tài khoản không tồn tại!");
        
        this.currentUser = username;
        localStorage.setItem('studio_current_user', username);
        this.updateUI();
    },

    logout() {
        if(confirm('Đăng xuất?')) {
            this.currentUser = null;
            localStorage.removeItem('studio_current_user');
            this.updateUI();
        }
    },

    // --- Key Logic ---
    addKey(provider, key, name) {
        if (!this.currentUser) return alert("Cần đăng nhập trước!");
        const db = this.getDB();
        const user = db[this.currentUser];
        
        user.keys.push({
            id: Date.now(),
            provider,
            key: key.trim(),
            name: name || provider,
            active: true
        });

        // Chỉ active 1 key mỗi loại
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
        const keyObj = user.keys.find(k => k.provider === provider && k.active) || user.keys.find(k => k.provider === provider);
        return keyObj ? keyObj.key : null;
    },

    // --- Helpers ---
    getDB() { return JSON.parse(localStorage.getItem('studio_users') || '{}'); },
    saveDB(db) { localStorage.setItem('studio_users', JSON.stringify(db)); },
    loadSession() { 
        const user = localStorage.getItem('studio_current_user');
        if (user && this.getDB()[user]) this.currentUser = user;
    },

    // --- UI Rendering ---
    updateUI() {
        this.renderAuthUI();
        this.renderKeyList();
        const modal = document.getElementById('authModal');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if(modalInstance) modalInstance.hide();
    },

    renderAuthUI() {
        const btnArea = document.getElementById('authBtnArea');
        const profileArea = document.getElementById('userProfileArea');
        
        if (this.currentUser) {
            btnArea.style.display = 'none';
            profileArea.style.display = 'flex';
            document.getElementById('usernameDisplay').innerText = this.currentUser;
        } else {
            btnArea.style.display = 'block';
            profileArea.style.display = 'none';
        }
    },

    renderKeyList() {
        const container = document.getElementById('keyListContainer');
        container.innerHTML = '';
        if (!this.currentUser) return container.innerHTML = '<div class="text-muted text-center">Đăng nhập để xem Key</div>';

        const keys = this.getDB()[this.currentUser].keys || [];
        if(keys.length === 0) return container.innerHTML = '<div class="text-muted text-center">Chưa có Key nào</div>';

        keys.forEach(k => {
            const div = document.createElement('div');
            div.className = `d-flex justify-content-between align-items-center p-2 mb-2 border rounded ${k.active ? 'border-success bg-dark' : 'border-secondary'}`;
            div.innerHTML = `
                <div class="text-truncate" style="max-width: 80%">
                    <span class="badge ${k.provider === 'photoroom' ? 'bg-primary' : 'bg-warning text-dark'}">${k.provider}</span>
                    <span class="fw-bold ms-2">${k.name}</span>
                </div>
                <button class="btn btn-sm btn-outline-danger del-key" data-id="${k.id}"><i class="fas fa-trash"></i></button>
            `;
            container.appendChild(div);
        });

        container.querySelectorAll('.del-key').forEach(b => {
            b.onclick = (e) => this.removeKey(parseInt(e.currentTarget.dataset.id));
        });
    }
};