import stringWidth from './string-width';
import stripAnsi from './strip-ansi';
import ansiStyles from './ansi-styles';

const ESCAPES: Set<string> = new Set(['\u001B', '\u009B']);

const END_CODE = 39;
const ANSI_ESCAPE_BELL = '\u0007';
const ANSI_CSI = '[';
const ANSI_OSC = ']';
const ANSI_SGR_TERMINATOR = 'm';
const ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;

const wrapAnsiCode = (code: number) =>
	`${ESCAPES.values().next().value}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;

const wrapAnsiHyperlink = (url: string) =>
	`${
		ESCAPES.values().next().value
	}${ANSI_ESCAPE_LINK}${url}${ANSI_ESCAPE_BELL}`;

const wordLengths = (string: string): number[] =>
	string.split(' ').map((character) => stringWidth(character));

const wrapWord = (rows: string[], word: string, columns: number): void => {
	const characters: string[] = [...word];

	let isInsideEscape = false;
	let isInsideLinkEscape = false;
	let visible = stringWidth(stripAnsi(rows[rows.length - 1]));

	for (const [index, character] of characters.entries()) {
		const characterLength = stringWidth(character);

		if (visible + characterLength <= columns) {
			rows[rows.length - 1] += character;
		} else {
			rows.push(character);
			visible = 0;
		}

		if (ESCAPES.has(character)) {
			isInsideEscape = true;

			const ansiEscapeLinkCandidate = characters
				.slice(index + 1, index + 1 + ANSI_ESCAPE_LINK.length)
				.join('');
			isInsideLinkEscape = ansiEscapeLinkCandidate === ANSI_ESCAPE_LINK;
		}

		if (isInsideEscape) {
			if (isInsideLinkEscape) {
				if (character === ANSI_ESCAPE_BELL) {
					isInsideEscape = false;
					isInsideLinkEscape = false;
				}
			} else if (character === ANSI_SGR_TERMINATOR) {
				isInsideEscape = false;
			}

			continue;
		}

		visible += characterLength;

		if (visible === columns && index < characters.length - 1) {
			rows.push('');
			visible = 0;
		}
	}

	if (!visible && rows[rows.length - 1].length > 0 && rows.length > 1) {
		rows[rows.length - 2] += rows.pop();
	}
};

const stringVisibleTrimSpacesRight = (string: string): string => {
	const words = string.split(' ');
	let last = words.length;

	while (last > 0) {
		if (stringWidth(words[last - 1]) > 0) {
			break;
		}

		last--;
	}

	if (last === words.length) {
		return string;
	}

	return words.slice(0, last).join(' ') + words.slice(last).join('');
};

interface WrapOptions {
	trim?: boolean;
	wordWrap?: boolean;
	hard?: boolean;
}

const exec = (
	string: string,
	columns: number,
	options: WrapOptions = {}
): string => {
	if (options.trim !== false && string.trim() === '') {
		return '';
	}

	let returnValue = '';
	let escapeCode;
	let escapeUrl;

	const lengths = wordLengths(string);
	let rows: string[] = [''];

	for (const [index, word] of string.split(' ').entries()) {
		if (options.trim !== false) {
			rows[rows.length - 1] = rows[rows.length - 1].trimStart();
		}

		let rowLength = stringWidth(stripAnsi(rows[rows.length - 1]));

		if (index !== 0) {
			if (
				rowLength >= columns &&
				(options.wordWrap === false || options.trim === false)
			) {
				rows.push('');
				rowLength = 0;
			}

			if (rowLength > 0 || options.trim === false) {
				rows[rows.length - 1] += ' ';
				rowLength++;
			}
		}

		if (options.hard && lengths[index] > columns) {
			const remainingColumns = columns - rowLength;
			const breaksStartingThisLine =
				1 + Math.floor((lengths[index] - remainingColumns - 1) / columns);
			const breaksStartingNextLine = Math.floor((lengths[index] - 1) / columns);
			if (breaksStartingNextLine < breaksStartingThisLine) {
				rows.push('');
			}

			wrapWord(rows, word, columns);
			continue;
		}

		if (
			rowLength + lengths[index] > columns &&
			rowLength > 0 &&
			lengths[index] > 0
		) {
			if (options.wordWrap === false && rowLength < columns) {
				wrapWord(rows, word, columns);
				continue;
			}

			rows.push('');
		}

		if (rowLength + lengths[index] > columns && options.wordWrap === false) {
			wrapWord(rows, word, columns);
			continue;
		}

		rows[rows.length - 1] += word;
	}

	if (options.trim !== false) {
		rows = rows.map((row) => stringVisibleTrimSpacesRight(row));
	}

	const preString = rows.join('\n');
	const pre = [...preString];

	let preStringIndex = 0;

	for (const [index, character] of pre.entries()) {
		returnValue += character;

		if (ESCAPES.has(character)) {
			type Groups = {
				code?: string;
				uri?: string;
			};

			const { groups }: { groups?: Groups } = new RegExp(
				`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`
			).exec(preString.slice(preStringIndex)) || { groups: {} };

			if (groups) {
				if (groups.code !== undefined) {
					const code = Number.parseFloat(groups.code);
					escapeCode = code === END_CODE ? undefined : code;
				} else if (groups.uri !== undefined) {
					escapeUrl = groups.uri.length === 0 ? undefined : groups.uri;
				}
			}
		}

		const code = ansiStyles.codes.get(Number(escapeCode));

		if (pre[index + 1] === '\n') {
			if (escapeUrl) {
				returnValue += wrapAnsiHyperlink('');
			}

			if (escapeCode && code) {
				returnValue += wrapAnsiCode(code);
			}
		} else if (character === '\n') {
			if (escapeCode && code) {
				returnValue += wrapAnsiCode(escapeCode);
			}

			if (escapeUrl) {
				returnValue += wrapAnsiHyperlink(escapeUrl);
			}
		}

		preStringIndex += character.length;
	}

	return returnValue;
};

export default function wrapAnsi(
	string: string,
	columns: number,
	options: WrapOptions = {}
): string {
	return String(string)
		.normalize()
		.replace('\r\n', '\n')
		.split('\n')
		.map((line) => exec(line, columns, options))
		.join('\n');
}
