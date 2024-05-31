import isFullwidthCodePoint from './is-fullwidth-code-point';
import ansiStyles from './ansi-styles';

const ESCAPES = new Set([27, 155]);

const CODE_POINT_0 = '0'.codePointAt(0)!;
const CODE_POINT_9 = '9'.codePointAt(0)!;

const MAX_ANSI_SEQUENCE_LENGTH = 19;

const endCodesSet = new Set<string>();
const endCodesMap = new Map<string, string>();

for (const [start, end] of ansiStyles.codes) {
	endCodesSet.add(ansiStyles.color.ansi(end));
	endCodesMap.set(ansiStyles.color.ansi(start), ansiStyles.color.ansi(end));
}

function getEndCode(code: string): string {
	if (endCodesSet.has(code)) {
		return code;
	}

	if (endCodesMap.has(code)) {
		return endCodesMap.get(code)!;
	}

	code = code.slice(2);
	if (code.includes(';')) {
		code = code[0] + '0';
	}

	const returnValue = ansiStyles.codes.get(Number.parseInt(code, 10));
	if (returnValue) {
		return ansiStyles.color.ansi(returnValue);
	}

	return ansiStyles.reset.open;
}

function findNumberIndex(string: string): number {
	for (let index = 0; index < string.length; index++) {
		const codePoint = string.codePointAt(index);
		if (codePoint) {
			if (codePoint >= CODE_POINT_0 && codePoint <= CODE_POINT_9) {
				return index;
			}
		}
	}

	return -1;
}

function parseAnsiCode(string: string, offset: number): string {
	string = string.slice(offset, offset + MAX_ANSI_SEQUENCE_LENGTH);
	const startIndex = findNumberIndex(string);
	if (startIndex !== -1) {
		let endIndex = string.indexOf('m', startIndex);
		if (endIndex === -1) {
			endIndex = string.length;
		}

		return string.slice(0, endIndex + 1);
	}

	return '';
}

interface Token {
	type: 'ansi' | 'character';
	value?: string;
	code?: string;
	endCode?: string;
	isFullWidth?: boolean;
}

function tokenize(
	string: string,
	endCharacter = Number.POSITIVE_INFINITY
): Token[] {
	const returnValue: Token[] = [];

	let index = 0;
	let visibleCount = 0;
	while (index < string.length) {
		const codePoint = string.codePointAt(index);
		if (!codePoint) {
			break;
		}

		if (ESCAPES.has(codePoint)) {
			const code = parseAnsiCode(string, index);
			if (code) {
				returnValue.push({
					type: 'ansi',
					code,
					endCode: getEndCode(code),
				});
				index += code.length;
				continue;
			}
		}

		const isFullWidth = isFullwidthCodePoint(codePoint);
		const character = String.fromCodePoint(codePoint);

		returnValue.push({
			type: 'character',
			value: character,
			isFullWidth,
		});

		index += character.length;
		visibleCount += isFullwidthCodePoint(codePoint) ? 2 : character.length;

		if (visibleCount >= endCharacter) {
			break;
		}
	}

	return returnValue;
}

function reduceAnsiCodes(codes: Token[]): Token[] {
	let returnValue: Token[] = [];

	for (const code of codes) {
		if (code.code === ansiStyles.reset.open) {
			returnValue = [];
		} else if (endCodesSet.has(code.code!)) {
			returnValue = returnValue.filter(
				(returnValueCode) => returnValueCode.endCode !== code.code
			);
		} else {
			returnValue = returnValue.filter(
				(returnValueCode) => returnValueCode.endCode !== code.code
			);
			returnValue.push(code);
		}
	}

	return returnValue;
}

function undoAnsiCodes(codes: Token[]): string {
	const reduced = reduceAnsiCodes(codes);
	const endCodes = reduced.map(({ endCode }) => endCode!).reverse();
	return endCodes.join('');
}

export default function sliceAnsi(
	string: string,
	start = 0,
	end?: number
): string {
	const tokens: Token[] = tokenize(string, end);
	let activeCodes: Token[] = [];
	let position = 0;
	let returnValue = '';
	let include = false;

	for (const token of tokens) {
		if (end !== undefined && position >= end) {
			break;
		}

		if (token.type === 'ansi') {
			activeCodes.push(token);
			if (include) {
				returnValue += token.code!;
			}
		} else {
			if (!include && position >= start) {
				include = true;
				activeCodes = reduceAnsiCodes(activeCodes);
				returnValue = activeCodes.map(({ code }) => code!).join('');
			}

			if (include) {
				returnValue += token.value!;
			}

			position += token.isFullWidth ? 2 : token.value!.length;
		}
	}

	returnValue += undoAnsiCodes(activeCodes);
	return returnValue;
}
