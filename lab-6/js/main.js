import Ajax from '../../js-lib/ajax-lib.js';

const client = new Ajax({
	baseURL: 'https://jsonplaceholder.typicode.com/',
	timeout: 7000,
	headers: {
		'Content-Type': 'application/json',
	},
});

const elements = {
	loadSuccess: document.getElementById('load-success'),
	loadError: document.getElementById('load-error'),
	reset: document.getElementById('reset'),
	list: document.getElementById('users'),
	message: document.getElementById('message'),
	loader: document.getElementById('loader'),
	status: document.getElementById('status'),
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toggleLoader = (isLoading) => {
	elements.loader.hidden = !isLoading;
	elements.loadSuccess.disabled = isLoading;
	elements.loadError.disabled = isLoading;
	elements.reset.disabled = isLoading;
};

const showMessage = (text, type = 'info') => {
	elements.message.textContent = text;
	elements.status.dataset.type = type;
};

const clearView = () => {
	clearList();
	showMessage('Gotowy do pobierania danych użytkowników.', 'info');
};

const clearList = () => {
	elements.list.innerHTML = '';
};

const renderUsers = (users) => {
	const fragment = document.createDocumentFragment();
	users.forEach((user) => {
		const item = document.createElement('li');
		item.className = 'user-card';

		const name = document.createElement('h3');
		name.textContent = user.name;

		const username = document.createElement('p');
		username.textContent = `@${user.username}`;
		username.className = 'muted';

		const email = document.createElement('p');
		email.textContent = user.email;

		const company = document.createElement('p');
		company.textContent = user.company?.name;
		company.className = 'muted';

		item.appendChild(name);
		item.appendChild(username);
		item.appendChild(email);
		item.appendChild(company);
		fragment.appendChild(item);
	});

	elements.list.innerHTML = '';
	elements.list.appendChild(fragment);
};

const errorStrategies = [
	() => client.get('invalid-endpoint'),
	() => client.get('users?force-timeout', { timeout: 1 }),
	() => client.get('https://this-domain-should-not-resolve.example/fail'),
	() => Promise.reject(new Error('Symulowany błąd klienta')),
];

const randomErrorRequest = () => {
	const pick = Math.floor(Math.random() * errorStrategies.length);
	return errorStrategies[pick]();
};

const handleRequest = async (requestFn, startMessage) => {
	toggleLoader(true);
	showMessage(startMessage ?? 'Pobieranie użytkowników...', 'info');
	try {
		await delay(700);
		const data = await requestFn();
		renderUsers(data);
		showMessage('Użytkownicy pobrani pomyślnie.', 'success');
	} catch (error) {
		clearList();
		showMessage(error.message, 'error');
	} finally {
		toggleLoader(false);
	}
};

elements.loadSuccess.addEventListener('click', () => {
	handleRequest(
		() => client.get('users?_limit=6'),
		'Pobieranie użytkowników...'
	);
});

elements.loadError.addEventListener('click', () => {
	clearList();
	handleRequest(() => randomErrorRequest(), 'Symulacja błędnego pobierania...');
});

elements.reset.addEventListener('click', () => {
	clearView();
});

toggleLoader(false);
clearView();
