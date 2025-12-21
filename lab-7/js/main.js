import './product-card.js';
import './product-list.js';
import './cart-panel.js';

import productsData from '../data.json' with { type: 'json' };
import { initCartUI } from './cart-ui.js';

const productList = document.querySelector('product-list');

if (productList) {
	productList.products = productsData;
}

initCartUI({
	productListSelector: 'product-list',
	cartSelector: 'cart-panel',
	openButtonId: 'openCart',
	closeButtonId: 'closeCart',
	drawerId: 'cartDrawer',
});
