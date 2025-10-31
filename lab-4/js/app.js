import { columnsConfig } from './config.js';
import { loadState, saveState, generateId, generateColor } from './state.js';
import { initColumns, renderAll, renderColumn, columnRefs } from './render.js';

const app = document.getElementById('app');
const state = loadState();

initColumns(app, columnsConfig, {
	onClick: handleColumnClick,
	onBlur: handleContentBlur,
	onFocus: handleContentFocus,
});

renderAll(state, columnsConfig);
window.addEventListener('beforeunload', () => saveState(state));

function handleColumnClick(event, columnKey) {
	const target = event.target;
	if (!(target instanceof HTMLElement)) return;

	const action = target.dataset.action;
	if (!action) return;

	if (action === 'add-card') return addCard(columnKey);
	if (action === 'color-column') return colorColumn(columnKey);
	if (action === 'sort') return sortColumn(columnKey);

	const cardElement = target.closest('.card');
	if (!cardElement) return;
	const cardId = cardElement.dataset.id;

	switch (action) {
		case 'move-left':
			return moveCard(cardId, columnKey, -1);
		case 'move-right':
			return moveCard(cardId, columnKey, 1);
		case 'delete':
			return deleteCard(cardId, columnKey);
		case 'color-card':
			return colorCard(cardId, columnKey);
	}
}

function handleContentBlur(event, columnKey) {
	const target = event.target;
	if (!(target instanceof HTMLElement)) return;
	if (!target.classList.contains('card-content')) return;

	const cardElement = target.closest('.card');
	if (!cardElement) return;

	const cardId = cardElement.dataset.id;
	const newText = editableHTMLtoPlainText(target);

	const columnCards = state.columns[columnKey];
	const card = columnCards.find((c) => c.id === cardId);
	if (!card) return;

	card.text = newText || '(bez tytułu)';
	saveState(state);
	renderColumn(state, columnKey, columnsConfig);
}

function handleContentFocus(event, columnKey) {
	const target = event.target;
	if (!(target instanceof HTMLElement)) return;
	if (!target.classList.contains('card-content')) return;

	const cardElement = target.closest('.card');
	if (!cardElement) return;
	const cardId = cardElement.dataset.id;

	const columnCards = state.columns[columnKey];
	const card = columnCards.find((c) => c.id === cardId);
	if (!card) return;

	if (!card.initFocused) {
		selectElementText(target);
		card.initFocused = true;
		saveState(state);
	}
}

function addCard(columnKey) {
	const columnCards = state.columns[columnKey];
	const newCard = {
		id: generateId(),
		text: 'Nowa karta',
		color: generateColor(),
		initFocused: false,
	};
	columnCards.push(newCard);
	saveState(state);
	renderColumn(state, columnKey, columnsConfig);

	requestAnimationFrame(() => {
		const lastCard = columnRefs
			.get(columnKey)
			?.cardsContainer.querySelector('.card:last-of-type .card-content');
		if (lastCard) lastCard.focus();
	});
}

function deleteCard(cardId, columnKey) {
	const columnCards = state.columns[columnKey];
	const index = columnCards.findIndex((c) => c.id === cardId);
	if (index === -1) return;
	columnCards.splice(index, 1);
	saveState(state);
	renderColumn(state, columnKey, columnsConfig);
}

function moveCard(cardId, fromColumnKey, direction) {
	const fromCards = state.columns[fromColumnKey];
	const index = fromCards.findIndex((c) => c.id === cardId);
	if (index === -1) return;
	const [card] = fromCards.splice(index, 1);

	const colIndex = columnsConfig.findIndex((c) => c.key === fromColumnKey);
	const targetColumn = columnsConfig[colIndex + direction];
	if (!targetColumn) {
		fromCards.splice(index, 0, card);
		return;
	}

	state.columns[targetColumn.key].push(card);
	saveState(state);
	renderColumn(state, fromColumnKey, columnsConfig);
	renderColumn(state, targetColumn.key, columnsConfig);
}

function colorColumn(columnKey) {
	const same = generateColor();
	state.columns[columnKey].forEach((card) => {
		card.color = same;
	});
	saveState(state);
	renderColumn(state, columnKey, columnsConfig);
}

function colorCard(cardId, columnKey) {
	const card = state.columns[columnKey].find((c) => c.id === cardId);
	if (!card) return;
	card.color = generateColor();
	saveState(state);
	renderColumn(state, columnKey, columnsConfig);
}

function sortColumn(columnKey) {
	state.columns[columnKey].sort((a, b) =>
		a.text.localeCompare(b.text, 'pl', { sensitivity: 'base' })
	);
	saveState(state);
	renderColumn(state, columnKey, columnsConfig);
}

function selectElementText(element) {
	const range = document.createRange();
	range.selectNodeContents(element);
	const selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

function editableHTMLtoPlainText(el) {
	let html = el.innerHTML;
	html = html
		.replace(/<div><br><\/div>/gi, '\n')
		.replace(/<div>/gi, '\n')
		.replace(/<\/div>/gi, '')
		.replace(/<br\s*\/?>/gi, '\n');
	const tmp = document.createElement('div');
	tmp.innerHTML = html;
	let text = tmp.textContent || '';
	text = text
		.replace(/\u00A0/g, ' ')
		.replace(/\r\n?/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
	return text;
}
