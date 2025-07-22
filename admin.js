// Состояние приложения (должно быть таким же, как в script.js)
let state = JSON.parse(localStorage.getItem('bookStoreState')) || {
    currentUser: null,
    users: [],
    books: [],
    rentals: [],
};

if (!state.currentUser || state.currentUser.role !== 'admin') {
    window.location.href = 'index.html';
}

function saveState() {
    localStorage.setItem('bookStoreState', JSON.stringify(state));
}

// DOM элементы
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminBooksLink = document.getElementById('admin-books-link');
const adminUsersLink = document.getElementById('admin-users-link');
const adminRentalsLink = document.getElementById('admin-rentals-link');
const adminBooksSection = document.getElementById('admin-books-section');
const adminUsersSection = document.getElementById('admin-users-section');
const adminRentalsSection = document.getElementById('admin-rentals-section');
const adminBooksList = document.getElementById('admin-books-list');
const usersTable = document.getElementById('users-table').querySelector('tbody');
const rentalsTable = document.getElementById('rentals-table').querySelector('tbody');
const addBookBtn = document.getElementById('add-book-btn');
const sendRemindersBtn = document.getElementById('send-reminders-btn');
const adminBookModal = document.getElementById('admin-book-modal');
const adminBookForm = document.getElementById('admin-book-form');
const deleteBookBtn = document.getElementById('delete-book-btn');

// Проверка авторизации администратора
function checkAdminAuth() {
    if (!state.currentUser || state.currentUser.role !== 'admin') {
        window.location.href = 'index.html';
    }
}

// Выход из системы
adminLogoutBtn.addEventListener('click', () => {
    state.currentUser = null;
    window.location.href = 'index.html';
});

// Переключение между разделами
adminBooksLink.addEventListener('click', (e) => {
    e.preventDefault();
    adminBooksSection.classList.remove('hidden');
    adminUsersSection.classList.add('hidden');
    adminRentalsSection.classList.add('hidden');
    renderAdminBooks();
});

adminUsersLink.addEventListener('click', (e) => {
    e.preventDefault();
    adminBooksSection.classList.add('hidden');
    adminUsersSection.classList.remove('hidden');
    adminRentalsSection.classList.add('hidden');
    renderUsersTable();
});

adminRentalsLink.addEventListener('click', (e) => {
    e.preventDefault();
    adminBooksSection.classList.add('hidden');
    adminUsersSection.classList.add('hidden');
    adminRentalsSection.classList.remove('hidden');
    renderRentalsTable();
});

// Открытие модального окна для добавления книги
addBookBtn.addEventListener('click', () => {
    adminBookForm.reset();
    document.getElementById('book-id').value = '';
    deleteBookBtn.classList.add('hidden');
    adminBookModal.classList.remove('hidden');
});

// Отправка напоминаний
sendRemindersBtn.addEventListener('click', () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const expiringRentals = state.rentals.filter((rental) => {
        if (rental.status !== 'active') return false;

        const endDate = new Date(rental.endDate);
        return endDate.toDateString() === tomorrow.toDateString();
    });

    if (expiringRentals.length === 0) {
        alert('Нет аренд, срок которых истекает завтра');
        return;
    }

    expiringRentals.forEach((rental) => {
        const user = state.users.find((u) => u.id === rental.userId);
        const book = state.books.find((b) => b.id === rental.bookId);

        // В реальном приложении здесь должно быть отправлено email-уведомление
        console.log(`Отправлено напоминание пользователю ${user.name} (${user.email}) о книге "${book.title}"`);
    });

    alert(`Отправлено ${expiringRentals.length} напоминаний`);
});

// Обработка формы книги
adminBookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('book-id').value;
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const year = document.getElementById('book-year').value;
    const category = document.getElementById('book-category').value;
    const price = parseFloat(document.getElementById('book-price').value);
    const rentPrice = parseFloat(document.getElementById('book-rent-price').value);
    const stock = parseInt(document.getElementById('book-stock').value);
    const image = document.getElementById('book-image').value;
    const description = document.getElementById('book-description').value;

    if (id) {
        const bookIndex = state.books.findIndex((b) => b.id == id);
        if (bookIndex !== -1) {
            state.books[bookIndex] = {
                ...state.books[bookIndex],
                title,
                author,
                year,
                category,
                price,
                rentPrice,
                stock,
                image,
                description,
            };
        }
    } else {
        // Add new book
        const newBook = {
            id: state.books.length > 0 ? Math.max(...state.books.map((b) => b.id)) + 1 : 1,
            title,
            author,
            year,
            category,
            price,
            rentPrice,
            stock,
            image,
            description,
        };
        state.books.push(newBook);
    }

    saveState(); // Save to localStorage
    adminBookModal.classList.add('hidden');
    renderAdminBooks();
});

// Удаление книги
deleteBookBtn.addEventListener('click', () => {
    const id = document.getElementById('book-id').value;
    if (!id) return;

    if (confirm('Вы уверены, что хотите удалить эту книгу?')) {
        state.books = state.books.filter((book) => book.id != id);
        adminBookModal.classList.add('hidden');
        renderAdminBooks();
    }
});

// Отображение списка книг в админке
function renderAdminBooks() {
    adminBooksList.innerHTML = '';

    state.books.forEach((book) => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-card';
        bookElement.innerHTML = `
            <div class="book-image" style="background-image: url('${book.image || 'https://via.placeholder.com/200x300?text=No+Image'}')"></div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <div class="book-meta">${book.author}, ${book.year}</div>
                <div class="book-meta">Категория: ${book.category}</div>
                <div class="book-price">Цена: ${book.price} руб.</div>
                <div class="book-stock">В наличии: ${book.stock} шт.</div>
            </div>
        `;

        bookElement.addEventListener('click', () => editBook(book.id));
        adminBooksList.appendChild(bookElement);
    });
}

// Редактирование книги
function editBook(bookId) {
    const book = state.books.find((b) => b.id === bookId);
    if (!book) return;

    document.getElementById('book-id').value = book.id;
    document.getElementById('book-title').value = book.title;
    document.getElementById('book-author').value = book.author;
    document.getElementById('book-year').value = book.year;
    document.getElementById('book-category').value = book.category;
    document.getElementById('book-price').value = book.price;
    document.getElementById('book-rent-price').value = book.rentPrice;
    document.getElementById('book-stock').value = book.stock;
    document.getElementById('book-image').value = book.image || '';
    document.getElementById('book-description').value = book.description || '';

    deleteBookBtn.classList.remove('hidden');
    adminBookModal.classList.remove('hidden');
}

// Отображение таблицы пользователей
function renderUsersTable() {
    usersTable.innerHTML = '';

    state.users.forEach((user) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role === 'admin' ? 'Администратор' : 'Пользователь'}</td>
        <td>
            ${user.role !== 'admin' ? `<button class="make-admin-btn" data-id="${user.id}">Сделать админом</button>` : ''}
        </td>
    `;

        usersTable.appendChild(row);
    });

    // Обработчики для кнопок "Сделать админом"
    document.querySelectorAll('.make-admin-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const userId = parseInt(e.target.getAttribute('data-id'));
            makeAdmin(userId);
        });
    });
}

// Назначение администратором
function makeAdmin(userId) {
    const user = state.users.find((u) => u.id === userId);
    if (user) {
        user.role = 'admin';
        renderUsersTable();
    }
}

// Отображение таблицы аренд
function renderRentalsTable() {
    rentalsTable.innerHTML = '';

    state.rentals.forEach((rental) => {
        const book = state.books.find((b) => b.id === rental.bookId);
        const user = state.users.find((u) => u.id === rental.userId);

        if (!book || !user) return;

        const today = new Date();
        const endDate = new Date(rental.endDate);
        const isExpired = rental.status === 'expired' || (rental.endDate && today > endDate);

        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${rental.id}</td>
        <td>${book.title}</td>
        <td>${user.name}</td>
        <td>${rental.startDate}</td>
        <td>${rental.endDate || '-'}</td>
        <td class="${isExpired ? 'status-expired' : 'status-active'}">
            ${rental.type === 'buy' ? 'Куплено' : isExpired ? 'Просрочено' : 'Активно'}
        </td>
        <td>
            ${rental.type === 'rent' && isExpired ? `<button class="return-book-btn" data-id="${rental.id}">Отметить как возвращенную</button>` : ''}
        </td>
    `;

        rentalsTable.appendChild(row);
    });

    // Обработчики для кнопок возврата книг
    document.querySelectorAll('.return-book-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const rentalId = parseInt(e.target.getAttribute('data-id'));
            returnBook(rentalId);
        });
    });
}

// Возврат книги
function returnBook(rentalId) {
    const rental = state.rentals.find((r) => r.id === rentalId);
    if (!rental) return;

    const book = state.books.find((b) => b.id === rental.bookId);
    if (book) {
        book.stock++;
    }

    rental.status = 'returned';
    renderRentalsTable();
}

// Инициализация админ-панели
function initAdminPanel() {
    checkAdminAuth();
    if (state.currentUser && state.currentUser.role === 'admin') {
        renderAdminBooks();
        renderUsersTable();
        renderRentalsTable();
    } else {
        window.location.href = 'index.html';
    }
}

document.querySelector('.close').addEventListener('click', () => {
    adminBookModal.classList.add('hidden');
});

// Запуск админ-панели
initAdminPanel();
