import cardStyles from '../css/product-card.css' with { type: 'css' };

const template = document.createElement('template');

template.innerHTML = `
  <article class="card">
    <div class="image-wrapper">
      <div class="promo" id="promotion" hidden></div>
      <div class="image-box">
        <img class="image" id="image" alt="" />
      </div>
    </div>

    <div class="content">
      <h2 class="name" id="name">Nazwa towaru</h2>
      <p class="price" id="price">0,00 zł</p>

      <div class="divider" aria-hidden="true"></div>

      <div class="meta" data-section="colors" hidden>
        <p class="meta-title">Kolory</p>
        <div class="pill-group" id="colors"></div>
      </div>

      <div class="meta" data-section="sizes" hidden>
        <p class="meta-title">Rozmiary</p>
        <div class="pill-group" id="sizes"></div>
      </div>
    </div>

    <div class="cta-wrap">
      <button class="cta" type="button">Do koszyka</button>
    </div>
  </article>
`;

const priceFormatter = new Intl.NumberFormat('pl-PL', {
	style: 'currency',
	currency: 'PLN',
	minimumFractionDigits: 2,
});

const EMPTY_STATE = {
	id: null,
	name: 'Nazwa towaru',
	price: 0,
	image: '',
	imageAlt: '',
	promotion: '',
	colors: [],
	sizes: [],
};

export default class ProductCard extends HTMLElement {
	static get observedAttributes() {
		return [
			'product-id',
			'name',
			'price',
			'image',
			'image-alt',
			'promotion',
			'colors',
			'sizes',
		];
	}

	#data = { ...EMPTY_STATE };
	#button;
	#elements;
	#handleAddToCart = () => {
		this.dispatchEvent(
			new CustomEvent('add-to-cart', {
				detail: {
					id: this.#data.id,
					name: this.#data.name,
					price: this.#formatPrice(this.#data.price),
					priceValue: this.#data.price,
				},
				bubbles: true,
				composed: true,
			})
		);
	};

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.adoptedStyleSheets = [cardStyles];
		this.shadowRoot.appendChild(template.content.cloneNode(true));
		this.#elements = {
			image: this.shadowRoot.querySelector('#image'),
			name: this.shadowRoot.querySelector('#name'),
			price: this.shadowRoot.querySelector('#price'),
			promo: this.shadowRoot.querySelector('#promotion'),
			colorsSection: this.shadowRoot.querySelector('[data-section="colors"]'),
			sizesSection: this.shadowRoot.querySelector('[data-section="sizes"]'),
			colors: this.shadowRoot.querySelector('#colors'),
			sizes: this.shadowRoot.querySelector('#sizes'),
		};
		this.#button = this.shadowRoot.querySelector('.cta');
	}

	connectedCallback() {
		this.#button.addEventListener('click', this.#handleAddToCart);
		this.#render();
	}

	disconnectedCallback() {
		this.#button.removeEventListener('click', this.#handleAddToCart);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		this.#applyAttribute(name, newValue);
		this.#render();
	}

	set product(value) {
		if (!value) return;
		this.#data = {
			...EMPTY_STATE,
			...value,
		};
		this.#render();
	}

	set name(value) {
		this.#data.name = value ?? '';
		this.#render();
	}

	set price(value) {
		this.#data.price = this.#normalizePrice(value);
		this.#render();
	}

	set image(value) {
		this.#data.image = value ?? '';
		this.#render();
	}

	set imageAlt(value) {
		this.#data.imageAlt = value ?? '';
		this.#render();
	}

	set promotion(value) {
		this.#data.promotion = value ?? '';
		this.#render();
	}

	set colors(value) {
		this.#data.colors = Array.isArray(value) ? value : [];
		this.#render();
	}

	set sizes(value) {
		this.#data.sizes = Array.isArray(value) ? value : [];
		this.#render();
	}

	#applyAttribute(name, value) {
		switch (name) {
			case 'product-id':
				this.#data.id = value ?? null;
				break;
			case 'name':
				this.#data.name = value ?? '';
				break;
			case 'price':
				this.#data.price = this.#normalizePrice(value);
				break;
			case 'image':
				this.#data.image = value ?? '';
				break;
			case 'image-alt':
				this.#data.imageAlt = value ?? '';
				break;
			case 'promotion':
				this.#data.promotion = value ?? '';
				break;
			case 'colors':
				this.#data.colors = this.#parseList(value);
				break;
			case 'sizes':
				this.#data.sizes = this.#parseList(value);
				break;
			default:
				break;
		}
	}

	#parseList(value) {
		if (!value) return [];
		return value
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}

	#normalizePrice(value) {
		if (typeof value === 'number' && Number.isFinite(value)) return value;
		if (!value) return 0;
		const normalized = String(value)
			.replace(/zł/gi, '')
			.replace(/\s/g, '')
			.replace(',', '.');
		const parsed = Number.parseFloat(normalized);
		return Number.isFinite(parsed) ? parsed : 0;
	}

	#formatPrice(value) {
		return priceFormatter.format(value || 0);
	}

	#renderList(container, items, { treatAsColor = false } = {}) {
		container.innerHTML = '';
		items.forEach((item) => {
			const element = document.createElement('span');
			if (treatAsColor && this.#isColorValue(item)) {
				element.className = 'color-swatch';
				element.style.background = item;
			} else {
				element.className = 'pill';
				element.textContent = item;
			}
			container.appendChild(element);
		});
	}

	#isColorValue(value) {
		return /^#/.test(value) || /^rgb/.test(value) || /^hsl/.test(value);
	}

	#render() {
		this.#elements.name.textContent = this.#data.name || EMPTY_STATE.name;
		this.#elements.price.textContent = this.#formatPrice(this.#data.price);
		this.#elements.image.src = this.#data.image || '';
		this.#elements.image.alt = this.#data.imageAlt || this.#data.name || '';

		if (this.#data.promotion) {
			this.#elements.promo.textContent = this.#data.promotion;
			this.#elements.promo.hidden = false;
		} else {
			this.#elements.promo.textContent = '';
			this.#elements.promo.hidden = true;
		}

		const colorItems = Array.isArray(this.#data.colors) ? this.#data.colors : [];
		const sizeItems = Array.isArray(this.#data.sizes) ? this.#data.sizes : [];

		this.#elements.colorsSection.hidden = colorItems.length === 0;
		this.#elements.sizesSection.hidden = sizeItems.length === 0;

		this.#renderList(this.#elements.colors, colorItems, { treatAsColor: true });
		this.#renderList(this.#elements.sizes, sizeItems, { treatAsColor: false });
	}
}

customElements.define('product-card', ProductCard);
