export const columnRefs = new Map();

export function initColumns(app, columnsConfig, { onClick, onBlur, onFocus }) {
	const frag = document.createDocumentFragment();

	columnsConfig.forEach((column) => {
		const section = document.createElement('section');
		section.className = 'column';
		section.dataset.key = column.key;

		const header = document.createElement('div');
		header.className = 'column-header';

		const title = document.createElement('h2');
		title.textContent = column.title;

		const count = document.createElement('span');
		count.className = 'count';
		title.appendChild(count);

		const actions = document.createElement('div');
		actions.className = 'column-actions';
		actions.append(
			button('Dodaj kartę', 'add-card'),
			button('Koloruj kolumnę', 'color-column', true),
			button('Sortuj', 'sort', true)
		);

		header.append(title, actions);

		const cardsContainer = document.createElement('div');
		cardsContainer.className = 'cards';

		section.append(header, cardsContainer);
		frag.appendChild(section);

		columnRefs.set(column.key, { section, count, cardsContainer });

		section.addEventListener('click', (e) => onClick(e, column.key));
		cardsContainer.addEventListener('focusout', (e) => onBlur(e, column.key));
		cardsContainer.addEventListener('focusin', (e) => onFocus(e, column.key));
	});

	app.appendChild(frag);
}

export function renderAll(state, columnsConfig) {
	columnsConfig.forEach(({ key }) => renderColumn(state, key, columnsConfig));
}

export function renderColumn(state, key, columnsConfig) {
	const column = columnRefs.get(key);
	if (!column) return;

	const cards = state.columns[key];
	column.cardsContainer.innerHTML = '';

	if (!cards.length) {
		const empty = document.createElement('div');
		empty.className = 'empty-state';
		empty.textContent = 'Brak kart. Dodaj nową, aby rozpocząć!';
		column.cardsContainer.appendChild(empty);
	} else {
		cards.forEach((card) => {
			column.cardsContainer.appendChild(createCard(card, key, columnsConfig));
		});
	}

	column.count.textContent = String(cards.length);
}

function createCard(card, columnKey, columnsConfig) {
	const wrap = document.createElement('div');
	wrap.className = 'card';
	wrap.dataset.id = card.id;
	wrap.style.background = card.color;

	const content = document.createElement('div');
	content.className = 'card-content';
	content.contentEditable = 'true';
	content.textContent = card.text;
	content.style.whiteSpace = 'pre-wrap';

	const controls = document.createElement('div');
	controls.className = 'card-controls';

	const move = document.createElement('div');
	move.className = 'group';

	const leftBtn = btn('←', 'move-left');
	const rightBtn = btn('→', 'move-right');
	if (!canMoveLeft(columnsConfig, columnKey)) leftBtn.disabled = true;
	if (!canMoveRight(columnsConfig, columnKey)) rightBtn.disabled = true;
	move.append(leftBtn, rightBtn);

	const act = document.createElement('div');
	act.className = 'group';
	const colorBtn = btn('🎨', 'color-card');
	const del = btn('×', 'delete');
	del.className = 'delete';
	act.append(colorBtn, del);

	controls.append(move, act);
	wrap.append(content, controls);
	return wrap;
}

function button(label, action, secondary = false) {
	const b = document.createElement('button');
	b.className = 'button' + (secondary ? ' secondary' : '');
	b.dataset.action = action;
	b.type = 'button';
	b.textContent = label;
	return b;
}

function btn(txt, action) {
	const b = document.createElement('button');
	b.dataset.action = action;
	b.textContent = txt;
	return b;
}

function canMoveLeft(columnsConfig, columnKey) {
	return columnsConfig.findIndex((c) => c.key === columnKey) > 0;
}

function canMoveRight(columnsConfig, columnKey) {
	const i = columnsConfig.findIndex((c) => c.key === columnKey);
	return i > -1 && i < columnsConfig.length - 1;
}
