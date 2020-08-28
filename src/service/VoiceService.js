// Imports
import { SwagClan } from "../class/SwagClan.js"

import { Service } from "./Service.js"

/**
 * Represents a service dedicated to managing bot voice states.
 * @extends Service
 */
export class VoiceService extends Service {
    /**
     * Instantiate the voice service.
     * @param {SwagClan} client The client that instantiated this service.
     */
    constructor(client) {
        super(client);
    }
}