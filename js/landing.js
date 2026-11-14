const currentUser = JSON.parse(localStorage.getItem('meal_current_user'));

const authNavArea = document.getElementById('authNavArea');
const heroCtaArea = document.getElementById('heroCtaArea');

if (currentUser) { // kiểm tra trạng thái tài khoản để điều chỉnh chữ trong các element của trang chủ
    const firstLetter = currentUser.fullname ? currentUser.fullname.charAt(0).toUpperCase() : 'U';
    
    authNavArea.innerHTML = `
        <div style="position: relative;">
            <button class="profile-btn" id="profileBtn">
                <div class="profile-avatar">${firstLetter}</div>
                <span class="profile-name">${currentUser.fullname}</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem; color: var(--text-muted); margin-left: 4px;"></i>
            </button>

            <div class="dropdown-menu" id="dropdownMenu">
                <a href="home.html"><i class="fa-solid fa-house"></i> Go to Home</a>
                <div style="height: 1px; background: var(--border-color); margin: 4px 0;"></div>
                <a href="#" id="logoutBtn" style="color: var(--primary);"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out</a>
            </div>
        </div>
    `;

    const profileBtn = document.getElementById('profileBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
    });

    window.addEventListener('click', () => {
        dropdownMenu.style.display = 'none';
    });

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('meal_current_user');
        window.location.reload();
    });

    heroCtaArea.innerHTML = `
        <a href="home.html" class="btn-primary"><i class="fa-solid fa-house" style="margin-right: 8px;"></i> Go to Home Dashboard</a>
    `;

} else {
    authNavArea.innerHTML = `
        <a href="signin.html" class="btn-signin">Sign In</a>
        <a href="signup.html" class="btn-signup">Get Started</a>
    `;

    heroCtaArea.innerHTML = `
        <a href="signup.html" class="btn-primary">Create Free Account</a>
        <a href="signin.html" class="btn-secondary">Explore Recipes</a>
    `;
}

// FAQ Accordion functionality
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        item.classList.toggle('active');
    });
});