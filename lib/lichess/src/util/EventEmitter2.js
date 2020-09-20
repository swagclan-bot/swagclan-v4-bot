import EventEmitter from "events"

/**
 * Represents an event emitter with more features.
 */
export default class EventEmitter2 extends EventEmitter {
	/**
	 * Instantiate the event emitter.
	 * @param {any} options The options for the event emitter.
	 */
	constructor(options) {
		super(options);
	}

	/**
	 * Listen to lots of events and wait for any to be called, cancelling the rest.
	 * @param { { [key: string]: function } } The listeners to listen for.
	 * @param {Number} [timeout] The number of milliseconds until all of the listeners time out.
	 * @returns {EventEmitter}
	 */
	async any(listeners, timeout) {
		const _this = this;
		
		const hooks = Object.entries(listeners).map(entry => {
			return [entry[0], (...args) => (entry[1](...args), clearAll())];
		});
		
		function clearAll() {
			for (let i = 0; i < hooks.length; i++) {
				const entry = hooks[i];
				
				_this.off(entry[0], entry[1]);
			}
		}
		
		for (let i = 0; i < hooks.length; i++) {
			const entry = hooks[i];
			
			this.on(entry[0], entry[1]);
		}
		
		if (typeof timeout !== "undefined") setTimeout(clearAll, timeout);
	}
}