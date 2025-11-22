import { cloneState, generateId, randomHsl } from './helpers.js';

const STORAGE_KEY = 'lab5-shapes-state';

class Store {
	constructor() {
		this.subscribers = new Set();
		this.state = this.loadState();
	}

	loadState() {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed.shapes)) {
					return { shapes: parsed.shapes };
				}
			}
		} catch (err) {
			console.warn('Nie udało się wczytać stanu z localStorage', err);
		}
		return { shapes: [] };
	}

	persistState() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
		} catch (err) {
			console.warn('Nie udało się zapisać stanu w localStorage', err);
		}
	}

	getState() {
		return cloneState(this.state);
	}

	subscribe(callback) {
		this.subscribers.add(callback);
		callback(this.getState());
		return () => this.subscribers.delete(callback);
	}

	notify() {
		this.persistState();
		const snapshot = this.getState();
		this.subscribers.forEach((cb) => cb(snapshot));
	}

	setShapes(shapes) {
		this.state = { shapes };
		this.notify();
	}

	addShape(type) {
		const shape = {
			id: generateId(),
			type,
			color: randomHsl(),
		};
		this.setShapes([...this.state.shapes, shape]);
	}

	removeShape(id) {
		const shapes = this.state.shapes.filter((shape) => shape.id !== id);
		if (shapes.length !== this.state.shapes.length) {
			this.setShapes(shapes);
		}
	}

	recolorByType(type) {
		const shapes = this.state.shapes.map((shape) =>
			shape.type === type ? { ...shape, color: randomHsl() } : shape
		);
		this.setShapes(shapes);
	}

	counts() {
		return this.state.shapes.reduce(
			(acc, shape) => {
				if (shape.type === 'square') acc.squares += 1;
				if (shape.type === 'circle') acc.circles += 1;
				return acc;
			},
			{ squares: 0, circles: 0 }
		);
	}
}

const store = new Store();

export default store;
