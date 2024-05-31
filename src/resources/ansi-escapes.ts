import process from 'node:process';

export const isBrowser = globalThis.window?.document !== undefined;

const ESC = '\u001B[';
const OSC = '\u001B]';
const BEL = '\u0007';
const SEP = ';';

const isTerminalApp = !isBrowser && process.env.TERM_PROGRAM === 'Apple_Terminal';
const isWindows = !isBrowser && process.platform === 'win32';

type CwdFunction = () => string;

const cwdFunction: CwdFunction = isBrowser ? () => {
	throw new Error('`process.cwd()` only works in Node.js, not the browser.');
} : process.cwd;

export const cursorTo = (x: number, y?: number): string => {
	if (typeof x !== 'number') {
		throw new TypeError('The `x` argument is required');
	}

	return ESC + (y ? (y + 1) + SEP + (x + 1) + 'H' : (x + 1) + 'G');
};

export const cursorMove = (x: number, y?: number): string => {
	if (typeof x !== 'number') {
		throw new TypeError('The `x` argument is required');
	}

	let returnValue = '';

	if (x < 0) {
		returnValue += ESC + (-x) + 'D';
	} else if (x > 0) {
		returnValue += ESC + x + 'C';
	}

	if (y !== undefined) {
		if (y < 0) {
			returnValue += ESC + (-y) + 'A';
		} else if (y > 0) {
			returnValue += ESC + y + 'B';
		}
	}

	return returnValue;
};

export const cursorUp = (count = 1): string => ESC + count + 'A';
export const cursorDown = (count = 1): string => ESC + count + 'B';
export const cursorForward = (count = 1): string => ESC + count + 'C';
export const cursorBackward = (count = 1): string => ESC + count + 'D';

export const cursorLeft = ESC + 'G';
export const cursorSavePosition = isTerminalApp ? '\u001B7' : ESC + 's';
export const cursorRestorePosition = isTerminalApp ? '\u001B8' : ESC + 'u';
export const cursorGetPosition = ESC + '6n';
export const cursorNextLine = ESC + 'E';
export const cursorPrevLine = ESC + 'F';
export const cursorHide = ESC + '?25l';
export const cursorShow = ESC + '?25h';

export const eraseLines = (count: number): string => {
	let clear = '';

	for (let i = 0; i < count; i++) {
		clear += eraseLine + (i < count - 1 ? cursorUp() : '');
	}

	if (count) {
		clear += cursorLeft;
	}

	return clear;
};

export const eraseEndLine = ESC + 'K';
export const eraseStartLine = ESC + '1K';
export const eraseLine = ESC + '2K';
export const eraseDown = ESC + 'J';
export const eraseUp = ESC + '1J';
export const eraseScreen = ESC + '2J';
export const scrollUp = ESC + 'S';
export const scrollDown = ESC + 'T';

export const clearScreen = '\u001Bc';

export const clearTerminal = isWindows
	? '<span class="math-inline">{eraseScreen}</span>{ESC}0f'
	: `<span class="math-inline">{eraseScreen}</span>{ESC}3J${ESC}H`;

export const enterAlternativeScreen = ESC + '?1049h';
export const exitAlternativeScreen = ESC + '?1049l';

export const beep = BEL;

export const link = (text: string, url: string): string => [
	OSC,
	'8',
	SEP,
	SEP,
	url,
	BEL,
	text,
	OSC,
	'8',
	SEP,
	SEP,
	BEL,
].join('');

export const image = (data: string | Buffer, options: { width?: number, height?: number, preserveAspectRatio?: boolean} = {}): string => {
	let returnValue = `${OSC}1337;File=inline=1`;

	if (options.width) {
		returnValue += `;width=${options.width}`;
	}

	if (options.height) {
		returnValue += `;height=${options.height}`;
	}

	if (options.preserveAspectRatio === false) {
		returnValue += ';preserveAspectRatio=0';
	}

	return returnValue + ':' + Buffer.from(data).toString('base64') + BEL;
};

export const iTerm = {
	setCwd: (cwd: string = cwdFunction()): string => `${OSC}50;CurrentDir=${cwd}${BEL}`,

	annotation(message: string, options: { x?: number, y?: number, isHidden?: boolean }  = {}): string {
		let returnValue = `${OSC}1337;`;

		const hasX = options.x !== undefined;
		const hasY = options.y !== undefined;
		if ((hasX || hasY) && !(hasX && hasY && Object.keys(options).length !== undefined)) {
			throw new Error('`x`, `y` and `length` must be defined when `x` or `y` is defined');
		}

		message = message.replace('|', '');

		returnValue += options.isHidden ? 'AddHiddenAnnotation=' : 'AddAnnotation=';

		if (Object.keys(options).length > 0) {
			returnValue += (
				hasX
					? [message, Object.keys(options).length, options.x, options.y]
					: [Object.keys(options).length, message]
			).join('|');
		} else {
			returnValue += message;
		}

		return returnValue + BEL;
	},
};
