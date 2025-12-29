class CustomNavbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const isAuthenticated = localStorage.getItem('authToken') !== null;
        const userRole = localStorage.getItem('userRole') || 'client';
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');

        // Если пользователь не авторизован, не показываем навигацию
        if (!isAuthenticated) {
            this.style.display = 'none';
            return;
        }

        this.innerHTML = `
            <nav class="bg-blue-800 text-white shadow-lg">
                <div class="w-full px-4">
                    <div class="flex flex-wrap lg:flex-nowrap justify-between items-center py-4 w-full">
                        <div class="flex items-center space-x-4">
                            <!-- Гамбургер-меню (всегда доступен слева от логотипа) -->
                            <button id="mobileMenuToggle" type="button"
                                    class="text-white focus:outline-none mr-3 cursor-pointer"
                                    aria-label="Открыть меню" aria-expanded="false">
                                <i data-feather="menu" class="w-6 h-6"></i>
                            </button>
                            
                            <a href="/dashboard" class="text-xl font-bold flex items-center space-x-2 whitespace-nowrap">
                                <div class="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
                                    <img src="/recources/mini_logo.png" alt="В-Банк" class="w-full h-full object-cover" />
                                </div>
                                <span>В-Банк</span>
                            </a>
                            

                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <!-- Поиск по сайту в хедере (показывается на lg и выше) -->
                            <div class="hidden lg:block mr-4 relative">
                                <label for="siteSearchInput" class="sr-only">Поиск по сайту</label>
                                <input id="siteSearchInput" type="search" placeholder="Поиск по сайту..." aria-label="Поиск по сайту"
                                       class="px-3 py-2 rounded-md text-sm bg-white text-black w-64" />
                                <div id="siteSearchResults" class="absolute right-0 mt-2 w-80 bg-white text-black rounded-md shadow-lg hidden z-50"></div>
                            </div>

                            <div class="hidden lg:flex items-center space-x-3">
                                <div class="text-right">
                                    <div class="text-sm">${userData.firstName || 'Пользователь'}</div>
                                    <div class="text-xs opacity-75">${userRole === 'employee' ? 'Сотрудник банка' : 'Клиент'}</div>
                                </div>
                                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <i data-feather="user" class="w-4 h-4"></i>
                                </div>
                            </div>
                            <button id="logoutBtn" 
                                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm flex items-center space-x-2">
                                <i data-feather="log-out" class="w-4 h-4"></i>
                                <span>Выйти</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Мобильное меню (слайд-ауот слева) -->
                    <div id="mobileMenu" class="mobile-menu">
                        <!-- panel top: close button and bank logo/name (non-clickable) -->
                        <div class="mobile-panel-top">
                            <button id="mobileMenuClose" type="button" class="text-white focus:outline-none" aria-label="Закрыть меню">
                                <i data-feather="x" class="w-6 h-6"></i>
                            </button>
                              <div class="text-xl font-bold flex items-center space-x-2 whitespace-nowrap">
                                <div class="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
                                    <img src="/recources/mini_logo.png" alt="В-Банк" class="w-full h-full object-cover" />
                                </div>
                                <span>В-Банк</span>
                            </div>
                        </div>
                        
                        <div class="space-y-1 px-3">
                            <a href="/dashboard" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors">
                                <i data-feather="home" class="w-5 h-5"></i>
                                <span class="font-medium">Личный кабинет</span>
                            </a>
                            
                            <a href="/cards" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors">
                                <i data-feather="credit-card" class="w-5 h-5"></i>
                                <span class="font-medium">Дебетовые карты</span>
                            </a>
                            
                            <a href="/security" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors">
                                <i data-feather="shield" class="w-5 h-5"></i>
                                <span class="font-medium">Безопасность</span>
                            </a>
                            
                            <a href="/articles" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors">
                                <i data-feather="file-text" class="w-5 h-5"></i>
                                <span class="font-medium">Лента новостей</span>
                            </a>
                            
                            <a href="/contacts" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors">
                                <i data-feather="phone" class="w-5 h-5"></i>
                                <span class="font-medium">Контакты</span>
                            </a>
                            
                            <a href="/sitemap" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors">
                                <i data-feather="map" class="w-5 h-5"></i>
                                <span class="font-medium">Карта сайта</span>
                            </a>
                        </div>
                    </div> 
                    <div id="mobileMenuOverlay" class="mobile-menu-overlay hidden" aria-hidden="true"></div>
            </nav>
        `;

        // Инициализация иконок
        setTimeout(() => {
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }, 100);

        // Обработка мобильного меню
        this.initMobileMenu();
    }

    initMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const toggleBtn = document.getElementById('mobileMenuToggle');
        const overlay = document.getElementById('mobileMenuOverlay');
        const closeBtn = document.getElementById('mobileMenuClose');

        if (toggleBtn && mobileMenu) {
            toggleBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('open');
                if (overlay) {
                    if (mobileMenu.classList.contains('open')) {
                        overlay.classList.remove('hidden');
                        overlay.setAttribute('aria-hidden', 'false');
                    } else {
                        overlay.classList.add('hidden');
                        overlay.setAttribute('aria-hidden', 'true');
                    }
                }

                toggleBtn.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    if (mobileMenu.classList.contains('open')) {
                        icon.setAttribute('data-feather', 'x');
                    } else {
                        icon.setAttribute('data-feather', 'menu');
                    }
                    feather.replace();
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                if (overlay) {
                    overlay.classList.add('hidden');
                    overlay.setAttribute('aria-hidden', 'true');
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                if (mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.remove('open');
                    overlay.classList.add('hidden');
                    overlay.setAttribute('aria-hidden', 'true');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    const icon = toggleBtn.querySelector('i');
                    if (icon) { icon.setAttribute('data-feather', 'menu'); feather.replace(); }
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.remove('open');
                    overlay.classList.add('hidden');
                    overlay.setAttribute('aria-hidden', 'true');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    const icon = toggleBtn.querySelector('i');
                    if (icon) { icon.setAttribute('data-feather', 'menu'); feather.replace(); }
                }
            });
        }

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!mobileMenu || !toggleBtn) return;

            const isClickInsideMenu = mobileMenu.contains(e.target);
            const isClickOnToggle = toggleBtn.contains(e.target);

            if (!isClickInsideMenu && !isClickOnToggle && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                if (overlay) { overlay.classList.add('hidden'); overlay.setAttribute('aria-hidden', 'true'); }
                // Возвращаем иконку гамбургера
                const toggleIcon = toggleBtn.querySelector('i');
                if (toggleIcon) {
                    toggleIcon.setAttribute('data-feather', 'menu');
                    feather.replace();
                }
            }
        });
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
    }
}

customElements.define('custom-navbar', CustomNavbar);