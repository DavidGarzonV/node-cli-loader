import process from 'node:process';
import onetime from './onetime';
import { onExit } from 'signal-exit';

type WritableStream = NodeJS.WritableStream;

const getTerminal = (): WritableStream | undefined => {
	if (process.stderr.isTTY) {
		return process.stderr;
	} else if (process.stdout.isTTY) {
		return process.stdout;
	}

	return undefined;
};

const restoreCursor = (): void => {
	const terminal = getTerminal();
	if (!terminal) return;

	onetime(() => {
		onExit(
			() => {
				terminal.write('\u001B[?25h');
			},
			{ alwaysLast: true }
		);
	})();
};

export default restoreCursor;
