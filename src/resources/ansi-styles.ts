const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi16 =
	(offset = 0) =>
		(code: number): string =>
			`\u001B[${code + offset}m`;

const wrapAnsi256 =
	(offset = 0) =>
		(code: number): string =>
			`\u001B[${38 + offset};5;${code}m`;

const wrapAnsi16m =
	(offset = 0) =>
		(red: number, green: number, blue: number): string =>
			`\u001B[${38 + offset};2;${red};${green};${blue}m`;

interface AnsiStyleCode {
	[key: string]: number[];
}

interface AnsiOpenClose {
	open: string;
	close: string;
}

interface AnsiStyles {
	modifier: AnsiStyleCode | AnsiOpenClose;
	color: {
		black: number[];
		red: number[];
		green: number[];
		yellow: number[];
		blue: number[];
		magenta: number[];
		cyan: number[];
		white: number[];
		blackBright: number[];
		gray: number[];
		grey: number[];
		redBright: number[];
		greenBright: number[];
		yellowBright: number[];
		blueBright: number[];
		magentaBright: number[];
		cyanBright: number[];
		whiteBright: number[];
		open: string;
		close: string;
		ansi: (code: number) => string;
		ansi256: (code: number) => string;
		ansi16m: (red: number, green: number, blue: number) => string;
	};
	bgColor: {
		bgBlack: number[];
		bgRed: number[];
		bgGreen: number[];
		bgYellow: number[];
		bgBlue: number[];
		bgMagenta: number[];
		bgCyan: number[];
		bgWhite: number[];
		bgBlackBright: number[];
		bgGray: number[];
		bgGrey: number[];
		bgRedBright: number[];
		bgGreenBright: number[];
		bgYellowBright: number[];
		bgBlueBright: number[];
		bgMagentaBright: number[];
		bgCyanBright: number[];
		bgWhiteBright: number[];
		open: string;
		close: string;
		ansi: (code: number) => string;
		ansi256: (code: number) => string;
		ansi16m: (red: number, green: number, blue: number) => string;
	};
	rgbToAnsi256: (...args: number[]) => number;
	hexToRgb: (hex: number) => number[];
	ansi256ToAnsi: (code: number) => number;
	hexToAnsi256: (hex: number) => number;
	codes: Map<number, number>;
	reset: {
		open: string;
		close: string;
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

const styles: AnsiStyles = {
	modifier: {
		reset: [0, 0],
		bold: [1, 22],
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		overline: [53, 55],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29],
	},
	color: {
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],
		blackBright: [90, 39],
		gray: [90, 39],
		grey: [90, 39],
		redBright: [91, 39],
		greenBright: [92, 39],
		yellowBright: [93, 39],
		blueBright: [94, 39],
		magentaBright: [95, 39],
		cyanBright: [96, 39],
		whiteBright: [97, 39],
		open: '\u001B[38;2;',
		close: '\u001B[39m',
		ansi: wrapAnsi16(),
		ansi256: wrapAnsi256(),
		ansi16m: wrapAnsi16m(),
	},
	bgColor: {
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49],
		bgBlackBright: [100, 49],
		bgGray: [100, 49],
		bgGrey: [100, 49],
		bgRedBright: [101, 49],
		bgGreenBright: [102, 49],
		bgYellowBright: [103, 49],
		bgBlueBright: [104, 49],
		bgMagentaBright: [105, 49],
		bgCyanBright: [106, 49],
		bgWhiteBright: [107, 49],
		open: '\u001B[48;2;',
		close: '\u001B[49m',
		ansi: wrapAnsi16(ANSI_BACKGROUND_OFFSET),
		ansi256: wrapAnsi256(ANSI_BACKGROUND_OFFSET),
		ansi16m: wrapAnsi16m(ANSI_BACKGROUND_OFFSET),
	},
	rgbToAnsi256: (): number => 0,
	hexToRgb: (): number[] => [],
	ansi256ToAnsi: (): number => 0,
	hexToAnsi256: (): number => 0,
	codes: new Map(),
	reset: {
		open: '\u001B[0m',
		close: '\u001B[0m',
	},
};

export const modifierNames = Object.keys(styles.modifier);

export const foregroundColorNames = Object.keys(styles.color);

export const backgroundColorNames = Object.keys(styles.bgColor);

export const colorNames = [...foregroundColorNames, ...backgroundColorNames];

function assembleStyles() {
	const codes = new Map<number, number>();

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			if (styles[styleName]) {
				styles[styleName].open = `\u001B[${(style as number[])[0]}m`;
				styles[styleName].close = `\u001B[${(style as number[])[1]}m`;
			} else {
				styles[styleName] = {
					open: `\u001B[${(style as number[])[0]}m`,
					close: `\u001B[${(style as number[])[1]}m`,
				};
			}

			group[styleName] = styles[styleName as keyof AnsiStyles];
			codes.set((style as number[])[0], (style as number[])[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false,
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false,
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi = wrapAnsi16();
	styles.color.ansi256 = wrapAnsi256();
	styles.color.ansi16m = wrapAnsi16m();
	styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

	Object.defineProperties(styles, {
		rgbToAnsi256: {
			value: (red: number, green: number, blue: number) => {
				if (red === green && green === blue) {
					if (red < 8) {
						return 16;
					}

					if (red > 248) {
						return 231;
					}

					return Math.round(((red - 8) / 247) * 24) + 232;
				}

				return (
					16 +
					36 * Math.round((red / 255) * 5) +
					6 * Math.round((green / 255) * 5) +
					Math.round((blue / 255) * 5)
				);
			},
			enumerable: false,
		},
		hexToRgb: {
			value: (hex: number) => {
				const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
				if (!matches) {
					return [0, 0, 0];
				}

				let [colorString] = matches;

				if (colorString.length === 3) {
					colorString = [...colorString]
						.map((character) => character + character)
						.join('');
				}

				const integer = Number.parseInt(colorString, 16);

				return [
					/* eslint-disable no-bitwise */
					(integer >> 16) & 0xff,
					(integer >> 8) & 0xff,
					integer & 0xff,
					/* eslint-enable no-bitwise */
				];
			},
			enumerable: false,
		},
		hexToAnsi256: {
			value: (hex: number) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
			enumerable: false,
		},
		ansi256ToAnsi: {
			value: (code: number): number => {
				if (code < 8) {
					return 30 + code;
				}

				if (code < 16) {
					return 90 + (code - 8);
				}

				let red;
				let green;
				let blue;

				if (code >= 232) {
					red = ((code - 232) * 10 + 8) / 255;
					green = red;
					blue = red;
				} else {
					code -= 16;

					const remainder = code % 36;

					red = Math.floor(code / 36) / 5;
					green = Math.floor(remainder / 6) / 5;
					blue = (remainder % 6) / 5;
				}

				const value = Math.max(red, green, blue) * 2;

				if (value === 0) {
					return 30;
				}

				// eslint-disable-next-line no-bitwise
				let result =
					30 +
					((Math.round(blue) << 2) |
						(Math.round(green) << 1) |
						Math.round(red));

				if (value === 2) {
					result += 60;
				}

				return result;
			},
			enumerable: false,
		},
		rgbToAnsi: {
			value: (red: number, green: number, blue: number): number =>
				styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
			enumerable: false,
		},
		hexToAnsi: {
			value: (hex: number): number =>
				styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
			enumerable: false,
		},
	});

	return styles;
}

const ansiStyles = assembleStyles();

export default ansiStyles;
