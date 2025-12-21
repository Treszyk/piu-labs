import panelStyles from '../css/cart-panel.css' with { type: 'css' };

const template = document.createElement('template');

template.innerHTML = `
  <section class="panel">
    <h2>Koszyk</h2>
    <p class="empty" id="empty">Koszyk jest pusty. Dodaj produkty.</p>
    <ul id="list"></ul>
    <div class="summary">
      <span>Suma</span>
      <span id="total">0,00 zł</span>
    </div>
  </section>
`;

const priceFormatter = new Intl.NumberFormat('pl-PL', {
	style: 'currency',
	currency: 'PLN',
	minimumFractionDigits: 2,
});

const STORAGE_KEY = 'lab7-cart-items';

export default class CartPanel extends HTMLElement {
	#items = [];
	#list;
	#total;
	#empty;

	#handleRemove = (event) => {
		const button = event.target.closest('button[data-index]');
		if (!button) return;
		const index = Number.parseInt(button.dataset.index, 10);
		if (Number.isNaN(index)) return;

		this.#items = this.#items.filter((_, i) => i !== index);
		this.#saveToStorage();
		this.#render();
		this.#emitChanged();
	};

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.adoptedStyleSheets = [panelStyles];
		this.shadowRoot.appendChild(template.content.cloneNode(true));
		this.#list = this.shadowRoot.querySelector('#list');
		this.#total = this.shadowRoot.querySelector('#total');
		this.#empty = this.shadowRoot.querySelector('#empty');
	}

	connectedCallback() {
		this.#loadFromStorage();
		this.#list.addEventListener('click', this.#handleRemove);
		this.#render();
		this.#emitChanged();
	}

	disconnectedCallback() {
		this.#list.removeEventListener('click', this.#handleRemove);
	}

	addItem(item) {
		if (!item) return;
		this.#items = [...this.#items, item];
		this.#saveToStorage();
		this.#render();
		this.#emitChanged();
	}

	#emitChanged() {
		this.dispatchEvent(
			new CustomEvent('cart-changed', {
				bubbles: true,
				composed: true,
				detail: { count: this.#items.length },
			})
		);
	}

	#render() {
		this.#list.innerHTML = '';
		this.#empty.hidden = this.#items.length > 0;

		this.#items.forEach((item, index) => {
			const listItem = document.createElement('li');

			const header = document.createElement('div');
			header.className = 'item-header';

			const name = document.createElement('span');
			name.className = 'item-name';
			name.textContent = item.name;

			const price = document.createElement('span');
			price.className = 'item-price';
			price.textContent = item.price;

			header.appendChild(name);
			header.appendChild(price);

			const button = document.createElement('button');
			button.type = 'button';
			button.dataset.index = String(index);
			button.textContent = 'Usuń';

			listItem.appendChild(header);
			listItem.appendChild(button);
			this.#list.appendChild(listItem);
		});

		const totalValue = this.#items.reduce(
			(sum, item) => sum + (item.priceValue || 0),
			0
		);
		this.#total.textContent = priceFormatter.format(totalValue);
	}

	#loadFromStorage() {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return;
		try {
			const parsed = JSON.parse(raw);
			this.#items = Array.isArray(parsed) ? parsed : [];
		} catch {
			this.#items = [];
		}
	}

	#saveToStorage() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#items));
	}
}

customElements.define('cart-panel', CartPanel);
