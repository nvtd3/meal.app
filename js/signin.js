let isSuccessLogin = false; // Biến trạng thái đăng nhập

// Hàm hiển thị Popup Modal
function showModal(title, message, type = 'success') {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modalIcon.className = `modal-icon ${type}`;
    modalIcon.innerHTML = type === 'success' 
        ? '<i class="fa-solid fa-check"></i>' 
        : '<i class="fa-solid fa-triangle-exclamation"></i>';

    modal.classList.add('active');
}

// Hàm đóng Modal Popup & Chuyển hướng sang trang Hero (index.html)
function closeModal() {
    const modal = document.getElementById('customModal');
    modal.classList.remove('active');

    // Nếu đăng nhập thành công, tự động chuyển sang trang index.html (Hero)
    if (isSuccessLogin) {
        window.location.href = 'home.html';
    }
}

// Sự kiện đóng Modal khi bấm nút OK
document.getElementById('modalCloseBtn').addEventListener('click', closeModal);

// Đóng Modal khi click ra vùng nền mờ bên ngoài
document.getElementById('customModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Xử lý Sự kiện Submit Form Đăng nhập
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // 1. Lấy danh sách tài khoản đã đăng ký từ localStorage
    const users = JSON.parse(localStorage.getItem('meal_users')) || [];

    // 2. Tìm tài khoản trùng với email nhập vào
    const user = users.find(u => u.email === email);

    // 3. Kiểm tra xem Email có tồn tại không
    if (!user) {
        isSuccessLogin = false;
        showModal('Login Failed', 'Email address is not registered. Please sign up first!', 'error');
        return;
    }

    // 4. Kiểm tra Mật khẩu
    if (user.password !== password) {
        isSuccessLogin = false;
        showModal('Login Failed', 'Incorrect password. Please try again!', 'error');
        return;
    }

    // 5. Đăng nhập thành công -> Lưu thông tin phiên làm việc hiện tại
    isSuccessLogin = true;
    localStorage.setItem('meal_current_user', JSON.stringify({
        fullname: user.fullname,
        email: user.email,
        loginTime: new Date().toISOString()
    }));

    // 6. Hiển thị Popup Modal thông báo thành công
    showModal('Welcome Back!', `Hello ${user.fullname}, you have successfully signed in!`, 'success');
});