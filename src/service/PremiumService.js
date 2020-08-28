// Imports
import { SwagClan } from "../class/SwagClan.js"

import { Service } from "./Service.js"

/**
 * Represents a service dedicated to managing premium users and their subscriptions.
 * @extends Service
 */
export class PremiumService extends Service {
    /**
     * Instantiate the premium service.
     * @param {SwagClan} client The client that instantiated this service.
     */
    constructor(client) {
        super(client);
    }
}