export const CART_STORAGE_KEY = 'lab7-cart-items';

export function readCartItems() {
	try {
		const raw = localStorage.getItem(CART_STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function writeCartItems(items) {
	localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
	dispatchCartChanged();
}

export function getCartCount() {
	return readCartItems().length;
}

export function dispatchCartChanged() {
	window.dispatchEvent(new CustomEvent('cart-changed-global'));
}
