// js/modules/core/auth.js
export const Auth = {
    currentUser: null,

    init() {
        this.loadSession();
        this.renderAuthUI();
    },

    // --- User System ---
    register(username) {
        if (!username) return alert("Vui lòng nhập tên tài khoản!");
        const users = JSON.parse(localStorage.getItem('studio_users') || '{}');
        
        if (users[username]) {
            return alert("Tài khoản này đã tồn tại!");
        }

        users[username] = { keys: [] }; 
        localStorage.setItem('studio_users', JSON.stringify(users));
        this.login(username);
        alert(`Chào mừng ${username} gia nhập Studio!`);
    },

    login(username) {
        const users = JSON.parse(localStorage.getItem('studio_users') || '{}');
        if (!users[username]) {
            return alert("Tài khoản không tồn tại! Hãy đăng ký trước.");
        }
        
        this.currentUser = username;
        localStorage.setItem('studio_current_user', username);
        this.updateUI();
    },

    logout() {
        if(confirm('Bạn muốn đăng xuất?')) {
            this.currentUser = null;
            localStorage.removeItem('studio_current_user');
            this.updateUI();
        }
    },

    loadSession() {
        const savedUser = localStorage.getItem('studio_current_user');
        const users = JSON.parse(localStorage.getItem('studio_users') || '{}');
        if (savedUser && users[savedUser]) {
            this.currentUser = savedUser;
        }
    },

    // --- Key System ---
    addKey(provider, key, name) {
        if (!this.currentUser) return alert("Đăng nhập để lưu Key nhé bro!");
        
        const users = JSON.parse(localStorage.getItem('studio_users') || '{}');
        const userDate = users[this.currentUser];
        const finalName = name || `${provider}_${Date.now().toString().slice(-4)}`;

        userDate.keys.push({
            id: Date.now(),
            provider, 
            key: key.trim(),
            name: finalName,
            active: true 
        });

        // Chỉ giữ 1 key active mỗi loại cho đơn giản
        userDate.keys.forEach(k => {
            if (k.id !== userDate.keys[userDate.keys.length-1].id && k.provider === provider) {
                k.active = false;
            }
        });

        localStorage.setItem('studio_users', JSON.stringify(users));
        this.renderKeyList();
        alert("Đã lưu Key thành công!");
    },

    removeKey(id) {
        if (!this.currentUser) return;
        const users = JSON.parse(localStorage.getItem('studio_users') || '{}');
        const userDate = users[this.currentUser];
        userDate.keys = userDate.keys.filter(k => k.id !== id);
        localStorage.setItem('studio_users', JSON.stringify(users));
        this.renderKeyList();
    },

    getActiveKey(provider) {
        if (!this.currentUser) return null;
        const users = JSON.parse(localStorage.getItem('studio_users') || '{}');
        if (!users[this.currentUser]) return null;
        
        const keys = users[this.currentUser].keys || [];
        const keyObj = keys.find(k => k.provider === provider && k.active) || keys.find(k => k.provider === provider);
        return keyObj ? keyObj.key : null;
    },

    // --- UI Helpers ---
    updateUI() {
        this.renderAuthUI();
        this.renderKeyList();
        
        // Đóng modal
        const modalEl = document.getElementById('authModal');
        if(modalEl && window.bootstrap) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
    },

    renderAuthUI() {
        const authBtnArea = document.getElementById('authBtnArea');
        const userProfileArea = document.getElementById('userProfileArea');
        const usernameDisplay = document.getElementById('usernameDisplay');

        if (this.currentUser) {
            if(authBtnArea) authBtnArea.style.display = 'none';
            if(userProfileArea) userProfileArea.style.display = 'flex';
            if(usernameDisplay) usernameDisplay.innerText = this.currentUser;
        } else {
            if(authBtnArea) authBtnArea.style.display = 'block';
            if(userProfileArea) userProfileArea.style.display = 'none';
        }
    },

    renderKeyList() {
        const listContainer = document.getElementById('keyListContainer');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        if (!this.currentUser) {
            listContainer.innerHTML = '<div class="text-center text-muted py-3">Đăng nhập để xem kho Key</div>';
            return;
        }

        const users = JSON.parse(localStorage.getItem('studio_users') || '{}');
        const keys = users[this.currentUser].keys || [];

        if (keys.length === 0) {
            listContainer.innerHTML = '<div class="text-center text-muted py-3">Chưa có Key. Thêm ngay để chạy mượt hơn!</div>';
            return;
        }

        keys.forEach(k => {
            const item = document.createElement('div');
            item.className = `d-flex justify-content-between align-items-center p-2 rounded mb-2 border ${k.active ? 'border-success bg-dark' : 'border-secondary bg-secondary'}`;
            item.innerHTML = `
                <div class="text-truncate" style="max-width: 75%;">
                    <span class="badge ${k.provider === 'photoroom' ? 'bg-primary' : 'bg-warning text-dark'} me-1">${k.provider}</span>
                    <strong class="text-light">${k.name}</strong>
                    ${k.active ? '<i class="fas fa-check-circle text-success ms-1" title="Đang dùng"></i>' : ''}
                </div>
                <button class="btn btn-sm btn-outline-danger btn-delete-key" data-id="${k.id}"><i class="fas fa-trash"></i></button>
            `;
            listContainer.appendChild(item);
        });

        document.querySelectorAll('.btn-delete-key').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                if(confirm('Xóa Key này?')) this.removeKey(id);
            });
        });
    }
};