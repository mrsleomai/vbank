class CustomAccessibility extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="fixed bottom-4 right-4 z-50">
                <button id="specialButton" style="cursor:pointer; max-width: 300px;"
                        class="bg-yellow-500 text-white p-3 rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
                        title="Версия для слабовидящих" aria-label="Версия для слабовидящих">
                    <i data-feather="eye" class="w-5 h-5"></i>
                </button>
            </div>
        `;
        setTimeout(() => feather.replace(), 100);
    }
}

customElements.define('custom-accessibility', CustomAccessibility);