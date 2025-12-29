// Глобальные настройки

// Немедленный редирект для аутентифицированных пользователей
// (выполняется как можно раньше, чтобы избежать «мигания» страницы входа)
(function() {
    try {
        // Нормализуем путь (убираем query и завершающие слэши)
        const rawPath = window.location.pathname.split('?')[0].replace(/\/+$/g, '') || '/';
        const normalizedPath = rawPath === '' ? '/' : rawPath;
        const auth = !!localStorage.getItem('authToken');

        // Если пользователь авторизован и пытается попасть на страницы логина или регистрации — редиректим в ЛК
        if (auth && ['/','/login','/register'].includes(normalizedPath)) {
            window.location.replace('/dashboard'); // replace чтобы не добавлять в историю
        }
    } catch (e) {
        // Игнорируем ошибки доступа к localStorage
    }
})();

const AuthChecker = {
    // Страницы, которые НЕ требуют авторизации
    publicPages: ['/login', '/register', '', '/404'],

    // Токен авторизации в localStorage
    authTokenKey: 'authToken',

    // Флаг, что проверка выполнена
    checked: false,

    // Флаг, что требуется редирект
    redirecting: false,

    // Инициализация
    init() {
        if (this.checked) return;
        this.checked = true;

        // Проверяем текущую страницу
        const currentPage = this.getCurrentPage();
        const requiresAuth = this.requiresAuth(currentPage);

        // Только для страниц, требующих авторизации, скрываем контент
        if (requiresAuth) {
            this.hideAllContentImmediately();
        }

        // Выполняем проверку
        this.performCheck();
    },

    // Проверка авторизации
    isAuthenticated() {
        const token = localStorage.getItem(this.authTokenKey);
        return !!token;
    },

    // Получить текущую страницу (возвращает путь, например '/login')
    getCurrentPage() {
        const path = window.location.pathname;

        // Для корневого пути
        if (path === '/' || path === '') {
            return '/login';
        }

        // Если путь в карте, возвращаем сам путь
        if (pathMap[path]) {
            return path;
        }

        // Для всего остального считаем что это 404
        return '/404';
    },

    // Проверяем, нужна ли для страницы авторизация
    requiresAuth(page) {
        // Проверяем, есть ли атрибут data-requires-auth="true" на body
        if (document.body.hasAttribute('data-requires-auth')) {
            return document.body.getAttribute('data-requires-auth') === 'true';
        }

        // Проверяем мета-тег
        const metaTag = document.querySelector('meta[name="requires-auth"]');
        if (metaTag && metaTag.getAttribute('content') === 'true') {
            return true;
        }

        // Проверяем по списку публичных страниц
        const isPublic = this.publicPages.includes(page);

        // Если страница не в списке публичных, значит требует авторизации
        return !isPublic;
    },

    // Скрыть весь контент НЕМЕДЛЕННО (только для защищенных страниц)
    hideAllContentImmediately() {
        // Если body ещё не доступно — ничего не делаем
        if (!document.body) return;
        // Если уже скрыто, выходим
        if (document.body.classList.contains('auth-checking')) return;

        // Добавляем стили для скрытия контента СРАЗУ
        const hideStyle = document.createElement('style');
        hideStyle.id = 'auth-hide-styles';
        hideStyle.textContent = `
            body.auth-checking {
                overflow: hidden !important;
                height: 100vh !important;
                position: relative !important;
            }
            body.auth-checking > *:not(#auth-preloader) {
                opacity: 0 !important;
                visibility: hidden !important;
                display: none !important;
            }
            #auth-preloader {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background: white !important;
                z-index: 9999 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
            }
        `;

        // Вставляем стили в самое начало head
        document.head.insertBefore(hideStyle, document.head.firstChild);

        // Добавляем класс к body СРАЗУ
        if (document.body) document.body.classList.add('auth-checking');

        // Создаем прелоадер СРАЗУ
        this.createPreloader();
    },

    // Создать прелоадер
    createPreloader() {
        // Удаляем старый если есть
        const oldPreloader = document.getElementById('auth-preloader');
        if (oldPreloader) oldPreloader.remove();

        const preloader = document.createElement('div');
        preloader.id = 'auth-preloader';
        preloader.innerHTML = `
            <div class="relative">
                <div class="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
            </div>
        `;

        document.body.appendChild(preloader);

        // Добавляем стили для спиннера
        this.addSpinnerStyles();
    },

    addSpinnerStyles() {
        if (document.getElementById('auth-spinner-styles')) return;

        const style = document.createElement('style');
        style.id = 'auth-spinner-styles';
        style.textContent = `
            @keyframes auth-spinner-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin {
                animation: auth-spinner-spin 1s linear infinite !important;
            }
        `;

        document.head.appendChild(style);
    },

    // Показать контент (только для защищенных страниц)
    showContent() {
        const hideStyle = document.getElementById('auth-hide-styles');
        if (hideStyle) hideStyle.remove();

        if (document.body) document.body.classList.remove('auth-checking');

        const preloader = document.getElementById('auth-preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 300);
        }
    },

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 z-[10000] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    },

    // Редирект на страницу входа
    redirectToLogin() {
        this.redirecting = true;

        this.showError('Для доступа требуется авторизация');

        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
    },

    // Основная проверка
    performCheck() {
        const currentPage = this.getCurrentPage();
        const requiresAuth = this.requiresAuth(currentPage);
        const isAuthenticated = this.isAuthenticated();

        // Короткая задержка для плавности
        setTimeout(() => {
            if (requiresAuth && !isAuthenticated) {
                this.redirectToLogin();
                return;
            }

            if (!requiresAuth && isAuthenticated) {
                if (currentPage === '/login' || currentPage === '/register') {
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 100);
                    return;
                }
            }

            if (!requiresAuth && !isAuthenticated) {
                if (document.body.classList.contains('auth-checking')) {
                    this.showContent();
                }
                return;
            }

            if (requiresAuth && isAuthenticated) {
                this.showContent();
            }

        }, 100);
    },
};

// Карта соответствия путей
const pathMap = {
    '/': 'index.html',
    '/login': 'index.html',
    '/register': 'register.html',
    '/dashboard': 'dashboard.html',
    '/cards': 'cards.html',
    '/security': 'security.html',
    '/articles': 'articles.html',
    '/articles/': 'articles.html',
    '/articles/115-fz': 'articles/115-fz.html',
    '/articles/choose-card': 'articles/choose-card.html',
    '/articles/finance-basics': 'articles/finance-basics.html',
    '/articles/investing': 'articles/investing.html',
    '/articles/card-security': 'articles/card-security.html',
    '/contacts': 'contacts.html',
    '/help': 'contacts.html',
    '/sitemap': 'sitemap.html',
    '/404': '404.html'
};

// Запускаем проверку авторизации
(function () {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AuthChecker.init();
        });
    } else {
        AuthChecker.init();
    }

    setTimeout(() => {
        if (document.body && document.body.classList.contains('auth-checking') && !AuthChecker.redirecting) {
            AuthChecker.showContent();
        }
    }, 5000);
})();

// Глобальная функция для проверки
window.checkAuth = () => AuthChecker.isAuthenticated();

// Генератор UUID (v4) — единая реализация для всего приложения
window.generateUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Вспомогательная функция для показа уведомлений
window.showNotification = (type, message) => {
    // Удаляем старые уведомления
    const oldNotifications = document.querySelectorAll('.custom-notification');
    oldNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `custom-notification fixed top-4 right-4 z-[10000] px-4 py-2 rounded-lg shadow-lg ${type === 'error' ? 'bg-red-500' :
            type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
};

// Поиск по сайту
(function() {
    let searchIndex = null;
    let searchLoaded = false;

    async function loadSearchIndex() {
        if (searchLoaded) return searchIndex;
        try {
            const res = await fetch('/search-index.json', {cache: 'no-store'});
            if (!res.ok) return [];
            searchIndex = await res.json();
        } catch (e) {
            console.error('Не удалось загрузить search-index.json', e);
            searchIndex = [];
        }
        searchLoaded = true;
        return searchIndex;
    }

    // Простая полнотекстовая фильтрация по title, content и keywords
    async function performSiteSearch(query) {
        if (!query || !query.trim()) return [];
        const q = query.trim().toLowerCase();
        const tokens = q.split(/\s+/).filter(Boolean);
        const idx = await loadSearchIndex();

        const results = idx.map(item => {
            const hay = (item.title + ' ' + item.content + ' ' + (item.keywords||[]).join(' ')).toLowerCase();
            let score = 0;
            tokens.forEach(t => {
                if (hay.includes(t)) score += 1;
            });
            return {item, score};
        }).filter(r => r.score > 0)
          .sort((a,b) => b.score - a.score);

        return results.map(r => {
            const snippet = createSnippet(r.item.content, tokens);
            return {path: r.item.path, title: r.item.title, snippet};
        });
    }

    function createSnippet(content, tokens) {
        const text = content || '';
        const lower = text.toLowerCase();
        let idx = -1;
        for (const t of tokens) {
            idx = lower.indexOf(t);
            if (idx >= 0) break;
        }
        if (idx === -1) return text.slice(0,150) + (text.length>150? '...':'');
        const start = Math.max(0, idx - 40);
        const snippet = text.slice(start, Math.min(text.length, idx + 80));
        return (start>0? '...':'') + snippet + (idx + 80 < text.length ? '...' : '');
    }

    function renderSearchResults(results, container) {
        if (!container) return;
        container.innerHTML = '';
        if (!results || results.length === 0) {
            container.innerHTML = '<div class="px-3 py-2 text-sm text-gray-500">Ничего не найдено</div>';
            container.classList.remove('hidden');
            return;
        }

        const list = document.createElement('div');
        results.slice(0,8).forEach(r => {
            const a = document.createElement('a');
            a.href = r.path;
            a.className = 'block px-3 py-2 hover:bg-gray-100 text-sm text-gray-800 no-underline';
            a.innerHTML = `<div class="font-medium">${escapeHtml(r.title)}</div><div class="text-xs text-gray-600 mt-1">${escapeHtml(r.snippet)}</div>`;
            list.appendChild(a);
        });
        container.appendChild(list);
        container.classList.remove('hidden');
    }

    function escapeHtml(str) {
        return String(str).replace(/[&"'<>]/g, function (s) { return ({'&':'&amp;','"':'&quot;',"'":"&#39;","<":"&lt;",">":"&gt;"})[s]; });
    }

    function debounce(fn, wait) {
        let t;
        return function(...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    function initFooterSearch() {
        const input = document.getElementById('siteSearchInput');
        const resultsBox = document.getElementById('siteSearchResults');
        if (!input || !resultsBox) return;

        const onInput = debounce(async function(e) {
            const q = input.value;
            if (!q || q.trim().length === 0) {
                resultsBox.innerHTML = '';
                resultsBox.classList.add('hidden');
                return;
            }
            const results = await performSiteSearch(q);
            renderSearchResults(results, resultsBox);
        }, 250);

        input.addEventListener('input', onInput);

        document.addEventListener('click', function(e) {
            if (!resultsBox) return;
            if (!resultsBox.contains(e.target) && e.target !== input) {
                resultsBox.classList.add('hidden');
            }
        });

        input.addEventListener('keydown', async function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = input.value;
                const results = await performSiteSearch(q);
                if (results && results.length>0) {
                    window.location.href = results[0].path;
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        initFooterSearch();
    });

    window.performSiteSearch = performSiteSearch;
})();

document.addEventListener('click', function (e) {
    const isLogout = e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn');
    if (isLogout) {
        e.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        showNotification('success', 'Вы успешно вышли из системы');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    }
});