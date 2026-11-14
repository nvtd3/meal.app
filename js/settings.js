const currentUser = JSON.parse(localStorage.getItem('meal_current_user'));
if (!currentUser) { window.location.href = 'signin.html'; }

// Hàm Toast Notification toàn cục
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = type === 'success' 
        ? `<i class="fa-solid fa-circle-check" style="color: #2A9D8F;"></i> ${message}` 
        : `<i class="fa-solid fa-circle-exclamation" style="color: #E63946;"></i> ${message}`;
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Tải sở thích ăn uống đã lưu trước đó nếu có
const savedPreferences = JSON.parse(localStorage.getItem('meal_preferences')) || [];
document.querySelectorAll('input[name="diet"]').forEach(checkbox => {
    if (savedPreferences.includes(checkbox.value)) {
        checkbox.checked = true;
    }
});

// Modal handling
let isActionConfirm = false;
function showModal(title, message, type = 'success', requireConfirm = false) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    const icon = document.getElementById('modalIcon');
    icon.className = `modal-icon ${type}`;
    icon.innerHTML = type === 'success' ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';
    document.getElementById('customModal').classList.add('active');
}

const modalCloseBtn = document.getElementById('modalCloseBtn');
if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
        document.getElementById('customModal').classList.remove('active');
        if (isActionConfirm) {
            localStorage.removeItem('meal_current_user');
            window.location.href = 'signin.html';
        }
    });
}

// 1. Đổi mật khẩu
const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmNewPassword').value;

        let users = JSON.parse(localStorage.getItem('meal_users')) || [];
        const user = users.find(u => u.email === currentUser.email);

        if (!user || user.password !== currentPass) {
            showModal('Error', 'Current password is incorrect!', 'error');
            return;
        }

        if (newPass !== confirmPass) {
            showModal('Error', 'New passwords do not match!', 'error');
            return;
        }

        users = users.map(u => u.email === currentUser.email ? { ...u, password: newPass } : u);
        localStorage.setItem('meal_users', JSON.stringify(users));

        showModal('Success!', 'Password updated successfully!');
        passwordForm.reset();
    });
}

// 2. Lưu sở thích ăn uống
const savePreferencesBtn = document.getElementById('savePreferencesBtn'); // HIỆN TẠI CHƯA HOÀN TOÀN HOẠT ĐỘNG
if (savePreferencesBtn) {
    savePreferencesBtn.addEventListener('click', function() {
        const selectedDiets = Array.from(document.querySelectorAll('input[name="diet"]:checked')).map(cb => cb.value);
        localStorage.setItem('meal_preferences', JSON.stringify(selectedDiets));
        showToast('Dietary preferences saved successfully! (WIP)');
    });
}


// 4. Xóa danh sách yêu thích
const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
if (clearFavoritesBtn) {
    clearFavoritesBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all your favorite recipes?')) {
            localStorage.removeItem('meal_favorites');
            showToast('All favorite recipes have been cleared.');
        }
    });
}

// 5. Xóa tài khoản
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function() {
        if (confirm('WARNING: This will permanently delete your account from this browser. Are you sure?')) {
            let users = JSON.parse(localStorage.getItem('meal_users')) || [];
            users = users.filter(u => u.email !== currentUser.email);
            localStorage.setItem('meal_users', JSON.stringify(users));

            isActionConfirm = true;
            showModal('Account Deleted', 'Your account has been deleted. Redirecting...', 'error', true);
        }
    });
}