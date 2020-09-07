// Imports
import * as discord from "discord.js"
import child_process from "child_process"
import fetch from "node-fetch"

import { AccountService } from "../service/AccountService.js"
import { AuthorisationService } from "../service/AuthorisationService.js"
import { CustomCommandService } from "../service/CustomCommandService.js"
import { HandlerService } from "../service/HandlerService.js"
import { ModuleService } from "../service/ModuleService.js"
import { PremiumService } from "../service/PremiumService.js"
import { PrivilegeService } from "../service/PrivilegeService.js"
import { SessionService } from "../service/SessionService.js"
import { SettingsService } from "../service/SettingsService.js"
import { StorageService } from "../service/StorageService.js"
import { SweeperService } from "../service/SweeperService.js"
import { TerminalService } from "../service/TerminalService.js"
import { VoiceService } from "../service/VoiceService.js"

import runtime_id from "../runtime.id.js"

/**
 * @typedef SwagClanInheritOptions
 * @property { { [key: string]: SettingDefinition } } setting_definitions The definitions for the settings.
 * @property {String} accounts_path The path for the user accounts.
 * @property {String} custom_commands_path The path for the guild custom commands.
 * @property {String} sesssions_path The path for the user sessions.
 * @property {String} settings_path The path for the guild settings.
 * @property {String} privilege_path The path for privilege classes.
 * @property {String} module_path The path for the modules.
 * 
 * @typedef {discord.ClientOptions & SwagClanInheritOptions} SwagClanOptions
 */

/**
 * Represents a Swag Clan bot client with services.
 * @extends {discord.Client}
 */
export class SwagClan extends discord.Client {
    /**
     * Instantiate the client.
     * @param {SwagClanOptions} options The client instantiation options.
     */
    constructor(options) {
        super();

        /**
         * The service dedicated to managing user accounts.
         * @type {AccountService}
         */
        this.AccountService = new AccountService(this, options.accounts_path);

        /**
         * The service dedicated to managing custom commands in guilds.
         * @type {CustomCommandService}
         */
        this.CustomCommandService = new CustomCommandService(this, options.custom_commands_path);
        
        /**
         * The service dedicated to handling messages received by the bot client.
         * @type {HandlerService}
         */
        this.HandlerService = new HandlerService(this);

        /**
         * The service dedicated to loading and interacting with bot modules.
         * @type {ModuleService}
         */
        this.ModuleService = new ModuleService(this, options.module_path);
        
        /**
         * The service dedicated to managing premium users and their subscriptions.
         * @type {PremiumService}
         */
        this.PremiumService = new PremiumService(this);
        
        /**
         * The service dedicated to managing privilege classes.
         * @type {PrivilegeService}
         */
        this.PrivilegeService = new PrivilegeService(this, options.privileges_path);

        /**
         * The service dedicated to managing user sessions.
         * @type {SessionService}
         */
        this.SessionService = new SessionService(this, options.sessions_path);

        /**
         * The service dedicated to guild settings and configuration.
         * @type {SettingsService}
         */
        this.SettingsService = new SettingsService(this, options.setting_definitions, options.settings_path);

        /**
         * The service dedicated to guild storage.
         * @type {StorageService}
         */
        this.StorageService = new StorageService(this, options.storage_path);

        /**
         * The service dedicated to interacting with channel sweepers.
         * @type {SweeperService}
         */
        this.SweeperService = new SweeperService(this);
		
		/**
		 * The service dedicated to handling terminal commands.
		 * @type {TerminalService}
		 */
		this.TerminalService = new TerminalService(this);
        
        /**
         * The service dedicated to managing bot voice states.
         * @type {VoiceService}
         */
        this.VoiceService = new VoiceService(this);

        /**
         * The ID of the current runtime.
         * @type {String}
         */
        this.runtime_id = runtime_id;
    }
    
    /**
     * Emit a message to functions listening for it.
     * @param {String} message The message to emit.
     * @param {...any} args The args to pass to the listeners.
     */
    async emit(message, ...args) {
        const ev = await this.HandlerService.handle(message, ...args);

        if (ev && ev.preventDefault) {
            return;
        }

        super.emit(message, ...args);
    }

    /**
     * Get the last commit hash.
     * @returns {String}
     */
    async getCommit() {
        return child_process.execSync("git rev-parse HEAD").toString().trim();
    }

    /**
     * Get the latest stable version.
     * @returns {String}
     */
    async getLatest() {
        try {
            const res = await fetch("https://api.thechimp.store");
            const { version } = await res.json();

            return version;
        } catch (e) {
            return null;
        }
    }
}