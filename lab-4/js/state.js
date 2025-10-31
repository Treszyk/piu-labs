import { STORAGE_KEY, ID_STORAGE_KEY, columnsConfig } from "./config.js";

export function generateColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 65 + Math.random() * 15;
  const lightness = 45 + Math.random() * 10;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

export function buildEmptyColumns() {
  return columnsConfig.reduce((acc, c) => {
    acc[c.key] = [];
    return acc;
  }, {});
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { columns: buildEmptyColumns() };
    const parsed = JSON.parse(raw);
    const columns = buildEmptyColumns();

    Object.keys(columns).forEach((key) => {
      const list = Array.isArray(parsed.columns?.[key])
        ? parsed.columns[key]
        : [];
      columns[key] = list
        .filter((card) => card && typeof card.id === "string")
        .map((card) => ({
          id: card.id,
          text: typeof card.text === "string" ? card.text : "",
          color: typeof card.color === "string" ? card.color : generateColor(),
          initFocused:
            typeof card.initFocused === "boolean" ? card.initFocused : true,
        }));
    });

    return { columns };
  } catch {
    return { columns: buildEmptyColumns() };
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function generateId() {
  const current = Number(localStorage.getItem(ID_STORAGE_KEY) || "0") + 1;
  localStorage.setItem(ID_STORAGE_KEY, String(current));
  return `card-${current}`;
}
