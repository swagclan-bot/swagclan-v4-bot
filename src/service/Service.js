// Imports
import { SwagClan } from "../class/SwagClan.js"
import EventEmitter from "events"

/**
 * Represents a service to interact with external interfaces or a lower level of the client.
 * @extends {EventEmitter}
 */
export class Service extends EventEmitter {
    /**
     * Instantiate the service.
     * @param {SwagClan} client The bot client that instantiated this service
     */
    constructor(client) {
        super();
        
        /**
         * The bot client that instantiated this service
         * @type {SwagClan}
         */
        this.client = client;
    }
}