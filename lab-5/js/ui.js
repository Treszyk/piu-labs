import store from './store.js';

const board = document.querySelector('[data-board]');
const addSquareBtn = document.querySelector('[data-add-square]');
const addCircleBtn = document.querySelector('[data-add-circle]');
const recolorSquaresBtn = document.querySelector('[data-recolor-squares]');
const recolorCirclesBtn = document.querySelector('[data-recolor-circles]');
const squaresCountEl = document.querySelector('[data-count-squares]');
const circlesCountEl = document.querySelector('[data-count-circles]');

const shapeElements = new Map();

const createShapeElement = (shape) => {
	const el = document.createElement('div');
	el.className = `shape ${shape.type}`;
	el.dataset.shapeId = shape.id;
	el.dataset.shapeType = shape.type;
	el.style.backgroundColor = shape.color;
	return el;
};

const syncShapes = (shapes) => {
	const seen = new Set();

	shapes.forEach((shape) => {
		seen.add(shape.id);
		const existing = shapeElements.get(shape.id);

		if (existing) {
			const desiredClass = `shape ${shape.type}`;
			if (existing.className !== desiredClass) {
				existing.className = desiredClass;
			}

			if (existing.dataset.shapeType !== shape.type) {
				existing.dataset.shapeType = shape.type;
			}

			if (existing.style.backgroundColor !== shape.color) {
				existing.style.backgroundColor = shape.color;
			}
			return;
		}

		const element = createShapeElement(shape);
		shapeElements.set(shape.id, element);
		board.appendChild(element);
	});

	for (const [id, element] of shapeElements) {
		if (!seen.has(id)) {
			element.remove();
			shapeElements.delete(id);
		}
	}
};

const updateCounters = () => {
	const counts = store.counts();
	squaresCountEl.textContent = counts.squares;
	circlesCountEl.textContent = counts.circles;
};

const handleBoardClick = (event) => {
	const target = event.target.closest('[data-shape-id]');
	if (!target || !board.contains(target)) return;
	store.removeShape(target.dataset.shapeId);
};

const wireEvents = () => {
	addSquareBtn.addEventListener('click', () => store.addShape('square'));
	addCircleBtn.addEventListener('click', () => store.addShape('circle'));
	recolorSquaresBtn.addEventListener('click', () =>
		store.recolorByType('square')
	);
	recolorCirclesBtn.addEventListener('click', () =>
		store.recolorByType('circle')
	);
	board.addEventListener('click', handleBoardClick);
};

export const initUI = () => {
	wireEvents();
	store.subscribe((state) => {
		syncShapes(state.shapes);
		updateCounters();
	});
};
