export const randomHsl = () => {
	const hue = Math.floor(Math.random() * 360);
	const saturation = 70;
	const lightness = 70;
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const generateId = () =>
	`${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 8)}`;

export const cloneState = (state) => {
	if (typeof structuredClone === 'function') {
		return structuredClone(state);
	}
	return JSON.parse(JSON.stringify(state));
};
