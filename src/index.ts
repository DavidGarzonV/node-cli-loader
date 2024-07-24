import { green, red } from 'kleur';
import logUpdate, { LogUpdateRender } from './resources/log-update';
import { Spinner, Spinners } from './types';
import spinners from './spinners.json';

const stringIcons = {
	main: {
		tick: '✔',
		cross: '✖',
	},
	win: {
		tick: '√',
		cross: '×',
	}
};

const icons = process.platform === 'win32' ? stringIcons.win : stringIcons.main;	

export default class Loader {
	private static appLoaders: Set<Loader> = new Set();
	private timer: NodeJS.Timeout | null = null;
	private logUpdate: LogUpdateRender | undefined;
	private doneMessage: string | undefined = undefined;
	private loaderMessage: string | undefined = undefined;

	/**
	 * Renders the spinner
	 * @param spinner The spinner to render
	 * @param index Variable to control the frames iteration
	 * @param description The description to show next to the spinner
	 */
	private renderSpinner(spinner: Spinner, index: number, description: string) {
		const { frames } = spinner;
		const message = `${description}...`;

		this.logUpdate = logUpdate(frames[(index = ++index % frames.length)] + ' ' +`${message}`);
		this.loaderMessage = message;
		return index;
	}

	/**
	 * Stops last loader in the list of loaders
	 */
	private stopLastLoader(){
		const lastSpinner = Array.from(Loader.appLoaders).pop();
		lastSpinner?.done();
	}

	/**
	 * Starts loader with a spinner and a description
	 * @param [description] The description to show next to the spinner
	 * @param [spinname] Spinner name
	 * @param [doneMessage] The message to show when the loader is done
	 * @param [timeout] The time in milliseconds to wait before stopping the loader
	 */
	private start(description: string = '', spinname?: Spinners, doneMessage?: string, timeout?: number): Loader {
		this.stopLastLoader();

		const name = spinname ?? 'dots';
		const spinner = spinners[name];

		let index = 0;
		index = this.renderSpinner(spinner, index, description);
		this.timer = setInterval(() => {
			index = this.renderSpinner(spinner, index, description);
		}, spinner.interval);

		if (doneMessage) {
			this.doneMessage = doneMessage;
		}

		Loader.appLoaders.add(this);

		if (timeout !== undefined) {
			setTimeout(() => {
				this.done();
			}, timeout);
		}

		return this;
	}

	private finishLoader(loaderDone: boolean = true) {
		if (this.logUpdate) {
			const finalMessage = this.doneMessage && loaderDone ? this.doneMessage : this.loaderMessage;
			const icon = loaderDone ? green(icons.tick) : red(icons.cross);

			this.logUpdate = logUpdate(icon + ' ' + finalMessage);
			this.logUpdate?.done();
		}

		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		Loader.appLoaders.delete(this);
	}

	/**
	 * Persist the loader and mark it as finished
	 */
	public finish() {
		this.finishLoader();
	}

	/**
	 * Persist the loader and mark it as done
	 */
	private done() {
		this.finishLoader();
	}

	/**
	 * Persist the loader and marks it as failed
	 */
	private stop(){
		this.finishLoader(false);
	}

	/**
	 * Stops all pending loaders that are not set to stayLoading
	 */
	public static stopAll() {
		Loader.appLoaders.forEach((spinner) => {
			spinner.done();
		});
	}

	/**
	 * Interrupts all pending loaders marking as failed
	 */
	public static interrupt(){
		Loader.appLoaders.forEach((spinner) => {
			spinner.stop();
		});
	}

	/**
	 * Creates a new loader and adds it to the list of loaders
	 * @param description The description to show next to the spinner
	 * @param [options] Options for the loader
	 * @param [options].[spinname] The name of the spinner to use
	 * @param [options].[doneMessage] The message to show when the loader is done
	 * @param [options].[timeout] The time in milliseconds to wait before stopping the loader
	 */
	public static create(
		description: string = '',
		options?: { spinname?: Spinners, doneMessage?: string, timeout?: number }
	) {
		return new Loader().start(description, options?.spinname, options?.doneMessage, options?.timeout);
	}
}
