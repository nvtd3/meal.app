const currentUser = JSON.parse(localStorage.getItem('meal_current_user'));
if (!currentUser) { window.location.href = 'signin.html'; }

// Hiển thị thông tin
document.getElementById('profileBigAvatar').textContent = currentUser.fullname.charAt(0).toUpperCase();
document.getElementById('profileFullName').textContent = currentUser.fullname;
document.getElementById('profileEmail').textContent = currentUser.email;
document.getElementById('editFullname').value = currentUser.fullname;
document.getElementById('editEmail').value = currentUser.email;

// Thống kê số lượng favorite recipes
const favorites = JSON.parse(localStorage.getItem('meal_favorites')) || [];
document.getElementById('favCount').textContent = favorites.length;

if (currentUser.loginTime) {
    document.getElementById('memberSince').textContent = new Date(currentUser.loginTime).toLocaleDateString();
}

// Modal handling
function showModal(title, message) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('customModal').classList.add('active');
}
document.getElementById('modalCloseBtn').addEventListener('click', () => {
    document.getElementById('customModal').classList.remove('active');
});

// Cập nhật profile
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const newName = document.getElementById('editFullname').value.trim();
    if (!newName) return;

    // Cập nhật meal_current_user
    currentUser.fullname = newName;
    localStorage.setItem('meal_current_user', JSON.stringify(currentUser));

    // Cập nhật trong danh sách meal_users
    let users = JSON.parse(localStorage.getItem('meal_users')) || [];
    users = users.map(u => u.email === currentUser.email ? { ...u, fullname: newName } : u);
    localStorage.setItem('meal_users', JSON.stringify(users));

    document.getElementById('profileFullName').textContent = newName;
    document.getElementById('profileBigAvatar').textContent = newName.charAt(0).toUpperCase();
    
    showModal('Success!', 'Your profile has been successfully updated.');
});