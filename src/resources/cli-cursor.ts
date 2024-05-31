import process from 'node:process';
import restoreCursor from './restore-cursor';

interface CliCursorState {
	isHidden: boolean;
	show(writableStream?: NodeJS.WriteStream): void;
	hide(writableStream?: NodeJS.WriteStream): void;
	toggle(force?: boolean, writableStream?: NodeJS.WriteStream): void;
}

const cliCursor: CliCursorState = {
	isHidden: false,
	show: (writableStream = process.stderr): void => {
		if (!writableStream.isTTY) {
			return;
		}

		cliCursor.isHidden = false;
		writableStream.write('\u001B[?25h');
	},
	hide: (writableStream = process.stderr): void => {
		if (!writableStream.isTTY) {
			return;
		}

		restoreCursor();
		cliCursor.isHidden = true;
		writableStream.write('\u001B[?25l');
	},
	toggle: (force?: boolean, writableStream = process.stderr): void => {
		if (force !== undefined) {
			cliCursor.isHidden = force;
		}

		if (cliCursor.isHidden) {
			cliCursor.show(writableStream);
		} else {
			cliCursor.hide(writableStream);
		}
	},
};

export default cliCursor;
