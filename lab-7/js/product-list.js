export default class ProductList extends HTMLElement {
	#products = [];
	#section;

	constructor() {
		super();
		this.#section = document.createElement('section');
		this.#section.className = 'grid';
		this.#section.setAttribute('aria-label', 'Lista produktów');
	}

	connectedCallback() {
		if (!this.contains(this.#section)) {
			this.appendChild(this.#section);
		}
		this.#render();
	}

	set products(value) {
		this.#products = Array.isArray(value) ? value : [];
		this.#render();
	}

	get products() {
		return this.#products;
	}

	#render() {
		this.#section.innerHTML = '';
		this.#products.forEach((product) => {
			const card = document.createElement('product-card');
			card.product = {
				...product,
				image: product.image ? `../lab-3/images/${product.image}` : '',
			};
			this.#section.appendChild(card);
		});
	}
}

customElements.define('product-list', ProductList);
