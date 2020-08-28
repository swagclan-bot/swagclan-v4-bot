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
	 * @typedef AnyOptions
	 * @property {Number} timeout The number of miliseconds until all the listeners time-out.
	 */
	
	/**
	 * Listen to lots of events and wait for any to be called, cancelling the rest.
	 * @param { { [key: string]: function } } The listeners to listen for.
	 * @param {AnyOptions} [options] The options for the listeners.
	 * @returns {EventEmitter}
	 */
	async any(listeners, options = {}) {
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
		
		if (options.timeout) setTimeout(clearAll, options.timeout);
	}
}