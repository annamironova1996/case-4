// Состояние приложения
let state = JSON.parse(localStorage.getItem('bookStoreState')) || {
    currentUser: null,
    users: [
        { id: 1, name: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
        { id: 2, name: 'user1', email: 'user1@example.com', password: 'user1123', role: 'user' },
    ],
    books: [
        {
            id: 1,
            title: '1984',
            author: 'Джордж Оруэлл',
            year: 1949,
            category: 'Антиутопия',
            price: 500,
            rentPrice: 20,
            stock: 10,
            image: 'https://example.com/book1.jpg',
            description: 'Классическая антиутопия о тоталитарном обществе.',
        },
        {
            id: 2,
            title: 'Мастер и Маргарита',
            author: 'Михаил Булгаков',
            year: 1967,
            category: 'Роман',
            price: 450,
            rentPrice: 15,
            stock: 8,
            image: 'https://example.com/book2.jpg',
            description: 'Мистический роман о дьяволе, посещающем Москву 1930-х годов.',
        },
        {
            id: 3,
            title: 'Преступление и наказание',
            author: 'Фёдор Достоевский',
            year: 1866,
            category: 'Роман',
            price: 400,
            rentPrice: 10,
            stock: 12,
            image: 'https://example.com/book3.jpg',
            description: 'Психологический роман о студенте, совершившем убийство.',
        },
    ],
    rentals: [
        {
            id: 1,
            bookId: 1,
            userId: 2,
            startDate: '2023-05-01',
            endDate: '2023-05-15',
            status: 'expired',
            type: 'rent',
        },
    ],
    isLoginMode: true,
};

function saveState() {
    localStorage.setItem('bookStoreState', JSON.stringify(state));
}

// DOM элементы
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const adminLink = document.getElementById('admin-link');
const authModal = document.getElementById('auth-modal');
const bookModal = document.getElementById('book-modal');
const authForm = document.getElementById('auth-form');
const authSwitch = document.getElementById('auth-switch');
const modalTitle = document.getElementById('modal-title');
const nameField = document.getElementById('name-field');
const usernameDisplay = document.getElementById('username-display');
const authButtons = document.getElementById('auth-buttons');
const userProfile = document.getElementById('user-profile');
const homeSection = document.getElementById('home-section');
const booksSection = document.getElementById('books-section');
const rentalsSection = document.getElementById('rentals-section');
const booksLink = document.getElementById('books-link');
const rentalsLink = document.getElementById('rentals-link');
const featuredBooks = document.getElementById('featured-books');
const allBooks = document.getElementById('all-books');
const userRentals = document.getElementById('user-rentals');
const categoryFilter = document.getElementById('category-filter');
const authorFilter = document.getElementById('author-filter');
const yearFilter = document.getElementById('year-filter');
const sortBy = document.getElementById('sort-by');
const applyFilters = document.getElementById('apply-filters');
const bookModalContent = document.getElementById('book-modal-content');
const bookActions = document.getElementById('book-actions');
const rentButtons = document.querySelectorAll('.rent-btn');
const buyBtn = document.getElementById('buy-btn');

// Закрытие модальных окон
document.querySelectorAll('.close').forEach((closeBtn) => {
    closeBtn.addEventListener('click', () => {
        authModal.classList.add('hidden');
        bookModal.classList.add('hidden');
    });
});

// Открытие модального окна входа
loginBtn.addEventListener('click', () => {
    state.isLoginMode = true;
    modalTitle.textContent = 'Вход';
    authSwitch.textContent = 'Нужно зарегистрироваться?';
    nameField.classList.add('hidden');
    authModal.classList.remove('hidden');
});

// Открытие модального окна регистрации
registerBtn.addEventListener('click', () => {
    state.isLoginMode = false;
    modalTitle.textContent = 'Регистрация';
    authSwitch.textContent = 'Уже есть аккаунт? Войти';
    nameField.classList.remove('hidden');
    authModal.classList.remove('hidden');
});

// Переключение между входом и регистрацией
authSwitch.addEventListener('click', () => {
    state.isLoginMode = !state.isLoginMode;
    if (state.isLoginMode) {
        modalTitle.textContent = 'Вход';
        authSwitch.textContent = 'Нужно зарегистрироваться?';
        nameField.classList.add('hidden');
    } else {
        modalTitle.textContent = 'Регистрация';
        authSwitch.textContent = 'Уже есть аккаунт? Войти';
        nameField.classList.remove('hidden');
    }
});

// Обработка формы авторизации/регистрации
authForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (state.isLoginMode) {
        // Вход
        const user = state.users.find((u) => u.email === email && u.password === password);
        if (user) {
            state.currentUser = user;
            saveState();
            updateUI();
            authModal.classList.add('hidden');
            authForm.reset();
        } else {
            alert('Неверный email или пароль');
        }
    } else {
        // Регистрация
        const name = document.getElementById('name').value;
        if (state.users.some((u) => u.email === email)) {
            alert('Пользователь с таким email уже существует');
            return;
        }

        const newUser = {
            id: state.users.length + 1,
            name,
            email,
            password,
            role: 'user',
        };

        state.users.push(newUser);
        state.currentUser = newUser;
        updateUI();
        authModal.classList.add('hidden');
        authForm.reset();
    }
});

// Выход из системы
logoutBtn.addEventListener('click', () => {
    state.currentUser = null;
    updateUI();
});

// Переключение между разделами
booksLink.addEventListener('click', (e) => {
    e.preventDefault();
    homeSection.classList.add('hidden');
    booksSection.classList.remove('hidden');
    rentalsSection.classList.add('hidden');
    renderBooks();
});

rentalsLink.addEventListener('click', (e) => {
    e.preventDefault();
    homeSection.classList.add('hidden');
    booksSection.classList.add('hidden');
    rentalsSection.classList.remove('hidden');
    renderUserRentals();
});

adminLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (state.currentUser && state.currentUser.role === 'admin') {
        saveState();
        window.location.href = 'admin.html';
    } else {
        alert('Доступ только для администраторов');
    }
});

// Обновление интерфейса
function updateUI() {
    if (document.getElementById('auth-buttons')) {
        if (state.currentUser) {
            authButtons.classList.add('hidden');
            userProfile.classList.remove('hidden');
            usernameDisplay.textContent = state.currentUser.name;

            if (state.currentUser.role === 'admin') {
                adminLink.classList.remove('hidden');
            } else {
                adminLink.classList.add('hidden');
            }
        } else {
            authButtons.classList.remove('hidden');
            userProfile.classList.add('hidden');
            adminLink.classList.add('hidden');
        }

        renderFeaturedBooks();
        renderFilterOptions();
    }
}

// Отображение рекомендуемых книг
function renderFeaturedBooks() {
    featuredBooks.innerHTML = '';

    // Берем первые 4 книги для примера
    const featured = state.books.slice(0, 4);

    featured.forEach((book) => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-card';
        bookElement.innerHTML = `
            <div class="book-image" style="background-image: url('${book.image || 'https://via.placeholder.com/200x300?text=No+Image'}')"></div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <div class="book-meta">${book.author}, ${book.year}</div>
                <div class="book-price">${book.price} руб.</div>
            </div>
        `;

        bookElement.addEventListener('click', () => showBookDetails(book.id));
        featuredBooks.appendChild(bookElement);
    });
}

// Отображение всех книг с фильтрами
function renderBooks() {
    allBooks.innerHTML = '';

    const category = categoryFilter.value;
    const author = authorFilter.value;
    const year = yearFilter.value;
    const sortField = sortBy.value;

    let filteredBooks = [...state.books];

    // Применяем фильтры
    if (category) {
        filteredBooks = filteredBooks.filter((book) => book.category === category);
    }

    if (author) {
        filteredBooks = filteredBooks.filter((book) => book.author === author);
    }

    if (year) {
        filteredBooks = filteredBooks.filter((book) => book.year.toString() === year);
    }

    // Сортируем
    filteredBooks.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1;
        if (a[sortField] > b[sortField]) return 1;
        return 0;
    });

    if (filteredBooks.length === 0) {
        allBooks.innerHTML = '<p>Книги не найдены</p>';
        return;
    }

    filteredBooks.forEach((book) => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-card';
        bookElement.innerHTML = `
            <div class="book-image" style="background-image: url('${book.image || 'https://via.placeholder.com/200x300?text=No+Image'}')"></div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <div class="book-meta">${book.author}, ${book.year}</div>
                <div class="book-price">${book.price} руб.</div>
            </div>
        `;

        bookElement.addEventListener('click', () => showBookDetails(book.id));
        allBooks.appendChild(bookElement);
    });
}

// Отображение фильтров
function renderFilterOptions() {
    // Категории
    const categories = [...new Set(state.books.map((book) => book.category))];
    categoryFilter.innerHTML = '<option value="">Все категории</option>';
    categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Авторы
    const authors = [...new Set(state.books.map((book) => book.author))];
    authorFilter.innerHTML = '<option value="">Все авторы</option>';
    authors.forEach((author) => {
        const option = document.createElement('option');
        option.value = author;
        option.textContent = author;
        authorFilter.appendChild(option);
    });

    // Годы
    const years = [...new Set(state.books.map((book) => book.year))].sort((a, b) => b - a);
    yearFilter.innerHTML = '<option value="">Все годы</option>';
    years.forEach((year) => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

// Показ деталей книги
function showBookDetails(bookId) {
    const book = state.books.find((b) => b.id === bookId);
    if (!book) return;

    bookModalContent.innerHTML = `
        <div class="book-details">
            <div class="book-details-image" style="background-image: url('${book.image || 'https://via.placeholder.com/200x300?text=No+Image'}')"></div>
            <div class="book-details-info">
                <h3>${book.title}</h3>
                <p><strong>Автор:</strong> ${book.author}</p>
                <p><strong>Год издания:</strong> ${book.year}</p>
                <p><strong>Категория:</strong> ${book.category}</p>
                <p><strong>Цена:</strong> ${book.price} руб.</p>
                <p><strong>Аренда:</strong> ${book.rentPrice} руб./день</p>
                <p><strong>В наличии:</strong> ${book.stock} шт.</p>
                <p><strong>Описание:</strong> ${book.description}</p>
            </div>
        </div>
    `;

    // Показываем кнопки действий только для авторизованных пользователей
    if (state.currentUser && book.stock > 0) {
        bookActions.classList.remove('hidden');

        // Обновляем обработчики для кнопок аренды
        document.querySelectorAll('.rent-btn').forEach((btn) => {
            btn.onclick = null; // Удаляем старые обработчики
            btn.addEventListener('click', (e) => {
                const duration = parseInt(e.target.getAttribute('data-duration'));
                rentBook(book.id, duration);
            });
        });

        // Обработчик для кнопки покупки
        buyBtn.onclick = null;
        buyBtn.addEventListener('click', () => buyBook(book.id));
    } else {
        bookActions.classList.add('hidden');
    }

    bookModal.classList.remove('hidden');
}

// Аренда книги
function rentBook(bookId, durationDays) {
    if (!state.currentUser) return;

    const book = state.books.find((b) => b.id === bookId);
    if (!book || book.stock <= 0) {
        alert('Книга недоступна для аренды');
        return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    const newRental = {
        id: state.rentals.length + 1,
        bookId,
        userId: state.currentUser.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: 'active',
        type: 'rent',
    };

    state.rentals.push(newRental);
    book.stock--;

    alert(`Вы успешно арендовали книгу "${book.title}" до ${endDate.toLocaleDateString()}`);
    bookModal.classList.add('hidden');
    renderBooks();
    renderUserRentals();
}

// Покупка книги
function buyBook(bookId) {
    if (!state.currentUser) return;

    const book = state.books.find((b) => b.id === bookId);
    if (!book || book.stock <= 0) {
        alert('Книга недоступна для покупки');
        return;
    }

    const newRental = {
        id: state.rentals.length + 1,
        bookId,
        userId: state.currentUser.id,
        startDate: new Date().toISOString().split('T')[0],
        endDate: null,
        status: 'owned',
        type: 'buy',
    };

    state.rentals.push(newRental);
    book.stock--;

    alert(`Вы успешно купили книгу "${book.title}"`);
    bookModal.classList.add('hidden');
    renderBooks();
    renderUserRentals();
}

// Отображение аренд пользователя
function renderUserRentals() {
    if (!state.currentUser) return;

    userRentals.innerHTML = '';

    const userRentalList = state.rentals.filter((r) => r.userId === state.currentUser.id);

    if (userRentalList.length === 0) {
        userRentals.innerHTML = '<p>У вас нет активных аренд или покупок</p>';
        return;
    }

    userRentalList.forEach((rental) => {
        const book = state.books.find((b) => b.id === rental.bookId);
        if (!book) return;

        const rentalElement = document.createElement('div');
        rentalElement.className = 'rental-item';

        const today = new Date();
        const endDate = new Date(rental.endDate);
        const isExpired = rental.status === 'expired' || (rental.endDate && today > endDate);

        rentalElement.innerHTML = `
            <div class="rental-info">
                <h3>${book.title}</h3>
                <span class="rental-status ${isExpired ? 'status-expired' : 'status-active'}">
                    ${rental.type === 'buy' ? 'Куплено' : isExpired ? 'Просрочено' : 'Активно'}
                </span>
            </div>
            <div class="rental-meta">
                <p>${book.author}, ${book.year}</p>
            </div>
            ${
                rental.type === 'rent'
                    ? `
            <div class="rental-dates">
                <span>Аренда с ${rental.startDate} по ${rental.endDate}</span>
                ${isExpired ? '<span class="rental-overdue">Просрочено на ' + Math.floor((today - endDate) / (1000 * 60 * 60 * 24)) + ' дней</span>' : ''}
            </div>
            `
                    : ''
            }
        `;

        userRentals.appendChild(rentalElement);
    });
}

// Применение фильтров
applyFilters.addEventListener('click', renderBooks);

// Инициализация приложения
updateUI();
