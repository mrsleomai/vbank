class CustomSidebar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const userRole = localStorage.getItem('userRole') || 'client';
        const isAuthenticated = localStorage.getItem('authToken') !== null;

        if (!isAuthenticated) return;

        this.innerHTML = `
            <aside class="w-64 bg-white border-r border-gray-200 min-h-screen p-6 hidden md:block">
                <!-- Блок пользователя -->
                <div class="mb-8">
                    <div class="flex items-center space-x-3 mb-6">
                        <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <i data-feather="user" class="w-6 h-6 text-white"></i>
                        </div>
                        <div>
                            <div class="font-semibold text-gray-800">${userRole === 'employee' ? 'Сотрудник банка' : 'Клиент'}</div>
                            <div class="text-sm text-gray-600">Личный кабинет</div>
                        </div>
                    </div>
                    
                ${userRole === 'client' ? `
                    <div class="mt-8 pt-6 border-t border-gray-200">
                        <h3 class="text-sm font-semibold text-gray-500 mb-3">Статистика</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Активных карт:</span>
                                <span id="sidebarActiveCards" class="font-semibold text-blue-600">—</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Операций за последний месяц:</span>
                                <span id="sidebarOpsLastMonth" class="font-semibold text-blue-600">—</span>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Для сотрудников - статистика -->
                ${userRole === 'employee' ? `
                    <div class="mt-8 pt-6 border-t border-gray-200">
                        <h3 class="text-sm font-semibold text-gray-500 mb-3">Статистика по картам</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Заявки в работе:</span>
                                <span id="sidebarPendingApps" class="font-semibold text-blue-600">—</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Новые заявки:</span>
                                <span id="sidebarNewApps" class="font-semibold text-yellow-600">—</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Активных карт:</span>
                                <span id="sidebarActiveCardsEmployee" class="font-semibold text-green-600">—</span>
                            </div>
                        </div>
                    </div>
                ` : ''} 
                
                    <!-- Нужна помощь (оформление как секция, с разделителем) -->
                    <div class="mt-8 pt-6 border-t border-gray-200">
                        <h3 class="text-sm font-semibold text-gray-500 mb-3">Нужна помощь?</h3>
                        <div class="space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Если возник вопрос — наши специалисты помогут</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <a href="/contacts" class="font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center text-sm">
                                    <i data-feather="help-circle" class="w-4 h-4 mr-1"></i>
                                    Связаться с поддержкой
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        `;

        setTimeout(() => feather.replace(), 100);

        // После отрисовки сайдбара — попытка подставить статистику из дашборда
        setTimeout(() => {
            const updateSidebarStats = (stats) => {
                // Если stats не переданы, пробуем получить их из глобального провайдера
                if (!stats && typeof window.getDashboardStats === 'function') {
                    try { stats = window.getDashboardStats(); } catch(e) { /* ignore */ }
                }

                // Для сотрудников отображаем реальные данные по заявкам
                if (userRole === 'employee') {
                    const pendingEl = this.querySelector('#sidebarPendingApps');
                    const newEl = this.querySelector('#sidebarNewApps');
                    const activeEl = this.querySelector('#sidebarActiveCardsEmployee');
                    if (!pendingEl || !newEl || !activeEl) return;

                    const apps = JSON.parse(localStorage.getItem('cardApplications') || '[]');
                    const pending = apps.filter(a => a.status === 'PENDING').length;
                    const created = apps.filter(a => a.status === 'CREATED').length;
                    const clientCards = JSON.parse(localStorage.getItem('clientCards') || '[]');
                    const active = clientCards.filter(c => c.status === 'ACTIVE').length;

                    pendingEl.textContent = pending;
                    newEl.textContent = created;
                    activeEl.textContent = active;
                    return;
                }

                // Для клиента — отображаем статистику по картам и операциям
                const ac = this.querySelector('#sidebarActiveCards');
                const om = this.querySelector('#sidebarOpsLastMonth');
                if (!ac || !om) return;
                ac.textContent = (stats && typeof stats.activeCards === 'number') ? stats.activeCards : '—';
                om.textContent = (stats && typeof stats.opsLastMonth === 'number') ? stats.opsLastMonth : '—';
            };

            // Если глобальная функция доступна — немедленно используем
            if (window.getDashboardStats) {
                try { updateSidebarStats(window.getDashboardStats()); } catch(e) {}
            }

            // Слушаем обновления от дашборда
            document.addEventListener('dashboardStatsUpdated', (e) => {
                try { updateSidebarStats(e.detail); } catch(e) {}
            });

            // Слушаем изменения заявок и обновляем данные для сотрудников
            document.addEventListener('cardApplicationsUpdated', (e) => {
                try { updateSidebarStats(); } catch(e) {}
            });

            // На случай, если статистика появится чуть позже
            setTimeout(() => {
                if (window.getDashboardStats) {
                    try { updateSidebarStats(window.getDashboardStats()); } catch(e) {}
                }
                // И единоразово обновим данные по заявкам (для сотрудников)
                try { updateSidebarStats(); } catch(e) {}
            }, 500);
        }, 200);
    }
}

if (!customElements.get('custom-sidebar')) {
    customElements.define('custom-sidebar', CustomSidebar);
}