const win = new cheatgui.Window({
	title: 'Scanner',
	width: 350,
	height: 300,
	x: 20,
	y: 20
});

const options = {
	classes: true,
	instances: true,
	privateFields: true
};

const valueInput = new cheatgui.Input('Value', '""');
win.append(valueInput);

const rootInput = new cheatgui.Input('Start from', 'window');
win.append(rootInput);

const paths = new Set();

const btn = new cheatgui.Button('Start', () => {
	paths.clear();
	resultText.ref.innerHTML = '';
	scan(eval(rootInput.getValue()), eval(valueInput.getValue()));
});
win.append(btn);

const opts = new cheatgui.Tree('Options');
win.append(opts);

opts.append((new cheatgui.Switch('Search in classes', true)).bind(options, 'classes'));
opts.append((new cheatgui.Switch('Search in instances', true)).bind(options, 'instances'));
opts.append((new cheatgui.Switch('Search in private fields', true)).bind(options, 'privateFields'));

const statusText = new cheatgui.Text('Status');
statusText.ref.style.color = '#888';
win.append(statusText);

const resultText = new cheatgui.Text('Results');
win.append(resultText);

async function scan(obj, value, currentPath = rootInput.getValue(), depth = 0, seenObjects = new WeakSet()) {
	if (depth > 1000) {
		return;
	}

	statusText.setContent(currentPath);

	if (obj === value) {
		paths.add(currentPath);
		resultText.ref.innerHTML = Array.from(paths).join('<br>');
		return;
	}

	if (!options.classes && isClass(obj)) return;
	if (!options.instances && isInstanceOfClass(obj)) return;

	if (typeof obj === 'object' && obj !== null) {
		if (seenObjects.has(obj)) {
			return;
		}
		seenObjects.add(obj, currentPath);
	}

	if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
		let i = 1;
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				if (!options.privateFields && key.startsWith('_')) continue;
				setTimeout(() => scan(obj[key], value, `${currentPath}.${key}`, depth + 1, seenObjects), i);
				i++;
			}
		}
	}

	if (Array.isArray(obj)) {
		for (let i = 0; i < obj.length; i++) {
			setTimeout(() => scan(obj[i], value, `${currentPath}[${i}]`, depth + 1, seenObjects), i);
		}
	}
}

function isClass(variable) {
	return typeof variable === 'function' && variable.prototype !== undefined;
}

function isInstanceOfClass(variable) {
	return variable !== window &&
		variable !== null &&
		typeof variable === 'object' &&
		typeof variable.constructor === 'function' &&
		typeof variable.constructor.prototype === 'object' &&
		variable.constructor.prototype.constructor === variable.constructor;
}