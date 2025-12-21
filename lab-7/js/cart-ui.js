import { getCartCount } from './cart-store.js';

export function initCartUI({
	productListSelector,
	cartSelector,
	openButtonId,
	closeButtonId,
	drawerId,
}) {
	const productList = document.querySelector(productListSelector);
	const cart = document.querySelector(cartSelector);

	const drawer = document.getElementById(drawerId);
	const openBtn = document.getElementById(openButtonId);
	const closeBtn = document.getElementById(closeButtonId);

	function getScrollbarWidth() {
		return window.innerWidth - document.documentElement.clientWidth;
	}

	function openDrawer() {
		if (!drawer) return;
		drawer.classList.add('is-open');
		drawer.setAttribute('aria-hidden', 'false');

		const sw = getScrollbarWidth();
		if (sw > 0) document.body.style.paddingRight = `${sw}px`;
		document.body.style.overflow = 'hidden';

		closeBtn?.focus?.();
	}

	function closeDrawer() {
		if (!drawer) return;
		drawer.classList.remove('is-open');
		drawer.setAttribute('aria-hidden', 'true');

		document.body.style.overflow = '';
		document.body.style.paddingRight = '';

		openBtn?.focus?.();
	}

	function pingCartButton() {
		if (!openBtn) return;
		openBtn.classList.remove('cart-fab--ping');
		void openBtn.offsetWidth;
		openBtn.classList.add('cart-fab--ping');
		window.setTimeout(() => openBtn.classList.remove('cart-fab--ping'), 420);
	}

	function updateBadge() {
		if (!openBtn) return;
		const count = getCartCount();
		openBtn.dataset.count = String(count);
		openBtn.toggleAttribute('data-has-items', count > 0);
	}

	openBtn?.addEventListener('click', openDrawer);
	closeBtn?.addEventListener('click', closeDrawer);

	drawer?.addEventListener('click', (e) => {
		const target = e.target;
		if (target instanceof HTMLElement && target.dataset.close === 'true') {
			closeDrawer();
		}
	});

	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') closeDrawer();
	});

	productList?.addEventListener('add-to-cart', (event) => {
		cart?.addItem(event.detail);
		pingCartButton();
		updateBadge();
	});

	cart?.addEventListener('cart-changed', () => {
		updateBadge();
	});

	window.addEventListener('storage', (e) => {
		if (e.key === 'lab7-cart-items') updateBadge();
	});

	window.addEventListener('cart-changed-global', () => {
		updateBadge();
	});

	updateBadge();
}
