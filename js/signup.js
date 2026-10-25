let isSuccessRegistration = false; // Biến đánh dấu đăng ký thành công

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

// Hàm đóng Popup Modal & Chuyển trang nếu đăng ký thành công
function closeModal() {
    const modal = document.getElementById('customModal');
    modal.classList.remove('active');

    // Nếu đăng ký thành công thì chuyển sang trang signin.html
    if (isSuccessRegistration) {
        window.location.href = 'signin.html';
    }
}

// Sự kiện đóng modal
document.getElementById('modalCloseBtn').addEventListener('click', closeModal);

document.getElementById('customModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Xử lý Form Submit
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // 1. Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
        isSuccessRegistration = false;
        showModal('Error', 'Passwords do not match!', 'error');
        return;
    }

    // 2. Lấy dữ liệu từ localStorage
    let users = JSON.parse(localStorage.getItem('meal_users')) || [];

    // 3. Kiểm tra trùng Email
    const userExist = users.find(user => user.email === email);
    if (userExist) {
        isSuccessRegistration = false;
        showModal('Error', 'This email is already registered on meal.app!', 'error');
        return;
    }

    // 4. Lưu user mới
    const newUser = {
        fullname: fullname,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('meal_users', JSON.stringify(users));

    // 5. Đánh dấu đăng ký thành công & Hiện Popup
    isSuccessRegistration = true;
    showModal('Success!', 'Account registered successfully! Redirecting to login page...', 'success');
    document.getElementById('registerForm').reset();
});