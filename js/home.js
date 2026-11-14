// 1. Kiểm tra đăng nhập bảo mật
const currentUser = JSON.parse(localStorage.getItem('meal_current_user'));
if (!currentUser) {
    window.location.href = 'signin.html'; // nếu chx đăng nhập thì tự chuyển sang đăng nhập
} else {
    const profileNameEl = document.getElementById('profileName'); // profile ở góc trên phải
    const profileAvatarEl = document.getElementById('profileAvatar');
    if (profileNameEl) profileNameEl.textContent = currentUser.fullname;
    if (profileAvatarEl) profileAvatarEl.textContent = currentUser.fullname.charAt(0).toUpperCase();
}

// 2. Profile Dropdown & Logout (Có kiểm tra tồn tại phần tử an toàn)
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

if (profileBtn && dropdownMenu) { // profile dropdown khi click
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('active');
    });

    window.addEventListener('click', () => {
        dropdownMenu.classList.remove('active');
    });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('meal_current_user');
        window.location.href = 'signin.html';
    });
}

// Toast Notification
function showToast(message, type = 'success') { // hiện toast (thông báo nhỏ) khi thực hiện một thao tác
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
    setTimeout(() => toast.remove(), 3000); // xóa sau 3 giây
}

// Quản lý Favorites & Notes
function getFavorites() {
    return JSON.parse(localStorage.getItem('meal_favorites')) || [];
}

function toggleFavorite(meal, event) {
    event.stopPropagation(); // làm event chỉ thực hiện tại chính địa điểm hiện tại và ko lây sang các chức năng con khác
    let favorites = getFavorites();
    const index = favorites.findIndex(item => item.idMeal === meal.idMeal);

    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Removed from favorites', 'error');
    } else {
        meal.note = '';
        favorites.push(meal);
        showToast('Added to your favorite recipes!', 'success');
    }
    localStorage.setItem('meal_favorites', JSON.stringify(favorites));
    
    if (currentTab === 'favorites') {
        renderFavorites();
    } else {
        const btn = event.currentTarget;
        if (btn) {
            btn.classList.toggle('active');
            const icon = btn.querySelector('i');
            if (icon) icon.className = btn.classList.contains('active') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        }
    }
}

// API Render Meals
const recipeResults = document.getElementById('recipeResults');
const sectionTitle = document.getElementById('sectionTitle');
let currentTab = 'home';

async function fetchMeals(url, title) { // lấy thông tin công thức nấu ăn
    if (recipeResults) recipeResults.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">Loading recipes...</p>';
    if (sectionTitle) sectionTitle.textContent = title;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.meals) {
            if (recipeResults) recipeResults.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">No recipes found.</p>';
            return;
        }
        renderMeals(data.meals);
    } catch (err) {
        console.error(err);
        if (recipeResults) recipeResults.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--primary);">Failed to fetch recipes.</p>';
    }
}

function renderMeals(meals) { // khi favorite thì lưu vào tab favorite dưới dạng html và css mới
    const favorites = getFavorites();
    if (!recipeResults) return;

    recipeResults.innerHTML = meals.map(meal => {
        const isFav = favorites.some(fav => fav.idMeal === meal.idMeal);
        return `
            <div class="recipe-card" onclick="openRecipeModal('${meal.idMeal}')">
                <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(${escapeMealJson(meal)}, event)">
                    <i class="${isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
                </button>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="recipe-card-content">
                    <h3>${meal.strMeal}</h3>
                    <div class="recipe-meta">
                        <span><i class="fa-solid fa-earth-americas"></i> ${meal.strArea || 'Global'}</span>
                        <span><i class="fa-solid fa-utensils"></i> ${meal.strCategory || 'Dish'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function escapeMealJson(meal) {
    return JSON.stringify(meal).replace(/"/g, '&quot;'); // hóa thành json string để dễ đọc và sử dụng
}

async function loadFilters() {
    const categoryBar = document.getElementById('categoryBar');
    const areaBar = document.getElementById('areaBar');
    try {
        if (categoryBar) {
            const catRes = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
            const catData = await catRes.json();
            categoryBar.innerHTML = `<button class="category-chip active" onclick="filterByCategory('All', this)">All Categories</button>` +
                catData.meals.map(cat => `<button class="category-chip" onclick="filterByCategory('${cat.strCategory}', this)">${cat.strCategory}</button>`).join('');
        }

        if (areaBar) {
            const areaRes = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
            const areaData = await areaRes.json();
            
            // Hiển thị TOÀN BỘ danh sách các quốc gia/vùng miền thay vì bị cắt ngắn
            areaBar.innerHTML = `<button class="category-chip active" onclick="filterByArea('All', this)">All Cuisines</button>` +
                areaData.meals.map(area => `<button class="category-chip" onclick="filterByArea('${area.strArea}', this)">${area.strArea}</button>`).join('');
        }
    } catch (err) {
        console.error('Failed to load filters', err);
        showToast('Failed to load filter options.', 'error');
    }
}

function filterByCategory(category, btnElement) {
    document.querySelectorAll('#categoryBar .category-chip').forEach(el => el.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    if (category === 'All') {
        fetchMeals('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken', 'Trending Recipes');
    } else {
        fetchMeals(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`, `${category} Recipes`);
    }
}

function filterByArea(area, btnElement) {
    document.querySelectorAll('#areaBar .category-chip').forEach(el => el.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    if (area === 'All') {
        fetchMeals('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken', 'Trending Recipes');
    } else {
        fetchMeals(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`, `${area} Cuisine Recipes`);
    }
}

// Modal Xem Chi Tiết + Ghi Chú Cá Nhân
let activeMealId = null;

async function openRecipeModal(idMeal) {
    activeMealId = idMeal;
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
        const data = await res.json();
        const meal = data.meals[0];

        const modalImg = document.getElementById('modalImg');
        const modalTitle = document.getElementById('modalTitle');
        const modalCategory = document.getElementById('modalCategory');
        const modalArea = document.getElementById('modalArea');
        const modalInstructions = document.getElementById('modalInstructions');

        if (modalImg) modalImg.src = meal.strMealThumb;
        if (modalTitle) modalTitle.textContent = meal.strMeal;
        if (modalCategory) modalCategory.textContent = meal.strCategory;
        if (modalArea) modalArea.textContent = meal.strArea;
        if (modalInstructions) modalInstructions.textContent = meal.strInstructions;

        let favorites = getFavorites();
        let currentFav = favorites.find(f => f.idMeal === idMeal);
        
        let noteSection = document.getElementById('recipeNoteSection');
        if (!noteSection) {
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                noteSection = document.createElement('div');
                noteSection.id = 'recipeNoteSection';
                noteSection.style.cssText = 'margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-color);';
                noteSection.innerHTML = `
                    <h3 class="modal-section-title"><i class="fa-solid fa-note-sticky"></i> Personal Note</h3>
                    <textarea id="modalNoteInput" placeholder="Add a personal cooking note..." style="width: 100%; height: 80px; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.9rem; outline: none; resize: vertical;"></textarea>
                    <button id="saveNoteBtn" style="margin-top: 8px; padding: 8px 16px; background: var(--primary); color: #FFF; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">Save Note</button>
                `;
                modalBody.appendChild(noteSection);

                const saveNoteBtn = document.getElementById('saveNoteBtn');
                if (saveNoteBtn) {
                    saveNoteBtn.addEventListener('click', () => {
                        let favs = getFavorites();
                        let target = favs.find(f => f.idMeal === activeMealId);
                        const modalNoteInput = document.getElementById('modalNoteInput');
                        if (target && modalNoteInput) {
                            target.note = modalNoteInput.value;
                            localStorage.setItem('meal_favorites', JSON.stringify(favs));
                            showToast('Recipe note saved successfully!');
                        } else {
                            showToast('Please add recipe to favorites first to save notes.', 'error');
                        }
                    });
                }
            }
        }

        const modalNoteInput = document.getElementById('modalNoteInput');
        if (modalNoteInput) {
            modalNoteInput.value = currentFav ? (currentFav.note || '') : '';
        }

        let ingredientsHTML = '';
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
                ingredientsHTML += `<li>${measure ? measure : ''} <strong>${ingredient}</strong></li>`;
            }
        }
        const modalIngredients = document.getElementById('modalIngredients');
        if (modalIngredients) modalIngredients.innerHTML = ingredientsHTML;

        const recipeModal = document.getElementById('recipeModal');
        if (recipeModal) recipeModal.classList.add('active');
    } catch (err) {
        console.error('Failed to load recipe details', err);
    }
}

const modalCloseBtn = document.getElementById('modalCloseBtn');
if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
        const recipeModal = document.getElementById('recipeModal');
        if (recipeModal) recipeModal.classList.remove('active');
    });
}

// Search & Tabs
const searchForm = document.getElementById('searchForm');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        const query = searchInput ? searchInput.value.trim() : '';
        if (!query) return;
        fetchMeals(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`, `Search Results for "${query}"`);
    });
}

const tabHome = document.getElementById('tabHome');
const tabExplore = document.getElementById('tabExplore');
const tabFavorites = document.getElementById('tabFavorites');

function setActiveTab(activeBtn) {
    [tabHome, tabExplore, tabFavorites].forEach(btn => {
        if (btn) btn.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');
}

if (tabHome) {
    tabHome.addEventListener('click', () => {
        currentTab = 'home';
        setActiveTab(tabHome);
        fetchMeals('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken', 'Trending Recipes');
    });
}

if (tabExplore) {
    tabExplore.addEventListener('click', () => {
        currentTab = 'explore';
        setActiveTab(tabExplore);
        fetchMeals('https://www.themealdb.com/api/json/v1/1/search.php?s=b', 'Explore Popular Recipes');
    });
}

if (tabFavorites) {
    tabFavorites.addEventListener('click', () => {
        currentTab = 'favorites';
        setActiveTab(tabFavorites);
        renderFavorites();
    });
}

function renderFavorites() {
    const favorites = getFavorites();
    if (sectionTitle) sectionTitle.textContent = 'Your Favorite Recipes & Notes';
    
    if (favorites.length === 0) {
        if (recipeResults) {
            recipeResults.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">You have no favorite recipes saved yet. Click the heart icon on any recipe to save it!</p>';
        }
        return;
    }
    renderMeals(favorites);
}

// Khởi chạy hệ thống
loadFilters();
fetchMeals('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken', 'Trending Recipes');