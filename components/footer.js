class CustomFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-gray-800 text-white py-8 mt-12 w-full">
                <div class="w-full px-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mx-auto max-w-7xl">
                        <div>
                            <h4 class="font-semibold mb-4">Информация</h4>
                            <ul class="space-y-2 text-sm text-gray-400">
                                <li><a href="/security" class="hover:text-white">Безопасность</a></li>
                                <li><a href="/articles" class="hover:text-white">Лента новостей</a></li>
                                <li><a href="/sitemap" class="hover:text-white">Карта сайта</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 class="font-semibold mb-4">Контакты</h4>
                            <ul class="space-y-2 text-sm text-gray-400">
                                <li>Телефон: +7 (953) 524-24-78</li>
                                <li>Email: info@vbank.ru</li>
                                <li>Поддержка 24/7</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400 mx-auto max-w-7xl">
                        <p>© 2025 В-Банк. Все права защищены.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('custom-footer', CustomFooter);