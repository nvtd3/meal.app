// 1. Kiểm tra trạng thái đăng nhập
const currentUser = JSON.parse(localStorage.getItem('meal_current_user'));
if (!currentUser) {
    window.location.href = 'signin.html';
} else {
    document.getElementById('profileName').textContent = currentUser.fullname;
    document.getElementById('profileAvatar').textContent = currentUser.fullname.charAt(0).toUpperCase();
}

// 2. Xử lý Dropdown Profile & Đăng xuất
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
});

window.addEventListener('click', () => dropdownMenu.classList.remove('active'));

document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('meal_current_user');
    window.location.href = 'signin.html';
});

// 3. Quản lý Favorites trong localStorage
function getFavorites() {
    return JSON.parse(localStorage.getItem('meal_favorites')) || [];
}

function toggleFavorite(meal, event) {
    event.stopPropagation();
    let favorites = getFavorites();
    const index = favorites.findIndex(item => item.idMeal === meal.idMeal);

    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(meal);
    }
    localStorage.setItem('meal_favorites', JSON.stringify(favorites));
    
    // Nếu đang ở tab Favorites thì render lại luôn
    if (currentTab === 'favorites') {
        renderFavorites();
    } else {
        // Cập nhật lại icon tim trên card hiện tại
        const btn = event.currentTarget;
        btn.classList.toggle('active');
        const icon = btn.querySelector('i');
        icon.className = btn.classList.contains('active') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    }
}

// 4. Gọi API TheMealDB & Render danh sách món ăn
const recipeResults = document.getElementById('recipeResults');
const sectionTitle = document.getElementById('sectionTitle');
let currentTab = 'home';

async function fetchMeals(url, title) {
    recipeResults.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">Loading delicious recipes...</p>';
    sectionTitle.textContent = title;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.meals) {
            recipeResults.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">No recipes found.</p>';
            return;
        }

        renderMeals(data.meals);
    } catch (err) {
        console.error(err);
        recipeResults.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--primary);">Failed to fetch recipes.</p>';
    }
}

function renderMeals(meals) {
    const favorites = getFavorites();

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

// Hàm hỗ trợ escape JSON truyền vào inline onclick
function escapeMealJson(meal) {
    return JSON.stringify(meal).replace(/"/g, '&quot;');
}

// 5. Tải danh mục Categories cho thanh Filter Bar
async function loadCategories() {
    const categoryBar = document.getElementById('categoryBar');
    try {
        const res = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
        const data = await res.json();

        // Tạo nút "All" đầu tiên
        let html = `<button class="category-chip active" onclick="filterByCategory('All', this)">All</button>`;
        
        html += data.meals.slice(0, 8).map(cat => `
            <button class="category-chip" onclick="filterByCategory('${cat.strCategory}', this)">${cat.strCategory}</button>
        `).join('');

        categoryBar.innerHTML = html;
    } catch (err) {
        console.error('Failed to load categories', err);
    }
}

function filterByCategory(category, btnElement) {
    document.querySelectorAll('.category-chip').forEach(el => el.classList.remove('active'));
    btnElement.classList.add('active');

    if (category === 'All') {
        fetchMeals('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken', 'Trending Recipes');
    } else {
        fetchMeals(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`, `${category} Recipes`);
    }
}

// 6. Xử lý Xem chi tiết món ăn (Modal Popup)
async function openRecipeModal(idMeal) {
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
        const data = await res.json();
        const meal = data.meals[0];

        document.getElementById('modalImg').src = meal.strMealThumb;
        document.getElementById('modalTitle').textContent = meal.strMeal;
        document.getElementById('modalCategory').textContent = meal.strCategory;
        document.getElementById('modalArea').textContent = meal.strArea;
        document.getElementById('modalInstructions').textContent = meal.strInstructions;

        // Lấy danh sách nguyên liệu và định lượng
        let ingredientsHTML = '';
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
                ingredientsHTML += `<li>${measure ? measure : ''} <strong>${ingredient}</strong></li>`;
            }
        }
        document.getElementById('modalIngredients').innerHTML = ingredientsHTML;

        document.getElementById('recipeModal').classList.add('active');
    } catch (err) {
        console.error('Failed to load recipe details', err);
    }
}

document.getElementById('modalCloseBtn').addEventListener('click', () => {
    document.getElementById('recipeModal').classList.remove('active');
});

document.getElementById('recipeModal').addEventListener('click', (e) => {
    if (e.target.id === 'recipeModal') {
        document.getElementById('recipeModal').classList.remove('active');
    }
});

// 7. Xử lý tìm kiếm Search Form
document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    fetchMeals(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`, `Search Results for "${query}"`);
});

// 8. Chuyển đổi giữa các Tabs (Home, Explore, Favorites)
const tabHome = document.getElementById('tabHome');
const tabExplore = document.getElementById('tabExplore');
const tabFavorites = document.getElementById('tabFavorites');

function setActiveTab(activeBtn) {
    [tabHome, tabExplore, tabFavorites].forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

tabHome.addEventListener('click', () => {
    currentTab = 'home';
    setActiveTab(tabHome);
    fetchMeals('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken', 'Trending Recipes');
});

tabExplore.addEventListener('click', () => {
    currentTab = 'explore';
    setActiveTab(tabExplore);
    // Lấy món ăn ngẫu nhiên hoặc phổ biến
    fetchMeals('https://www.themealdb.com/api/json/v1/1/search.php?s=b', 'Explore Popular Recipes');
});

tabFavorites.addEventListener('click', () => {
    currentTab = 'favorites';
    setActiveTab(tabFavorites);
    renderFavorites();
});

function renderFavorites() {
    const favorites = getFavorites();
    sectionTitle.textContent = 'Your Favorite Recipes';
    
    if (favorites.length === 0) {
        recipeResults.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">You have no favorite recipes saved yet. Click the heart icon on any recipe to save it!</p>';
        return;
    }
    renderMeals(favorites);
}

// Khởi chạy mặc định khi load trang lần đầu
loadCategories();
fetchMeals('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken', 'Trending Recipes');