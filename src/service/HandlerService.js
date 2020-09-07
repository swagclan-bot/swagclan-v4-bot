// Imports
import discord from "discord.js";

import { Service } from "./Service.js"
import { SwagClan } from "../class/SwagClan.js"

/**
 * Represents a service for handling API messages received by the bot client.
 * @extends {Service}
 */
export class HandlerService extends Service {
    /**
     * Instantiate the handler service.
     * @param {SwagClan} client The bot client that instantiated this service
     */
    constructor(client) {
        super(client);
    }

    /**
     * Handle an API message received by the bot client.
     * @param {String} message The message to handle.
     * @param {...any} args The arguments to pass to the handler.
     */
    async handle(message, ...args) {
        if (message === "message") {
            await this.handleCreateMessage(...args);
        }
    }

    /**
     * Handle an API message to say a message was created.
     * @param {discord.Message} message The message that was created.
     */
    async handleCreateMessage(message) {
        if (message.author.id === this.client.user.id) return;
        if (!message.member) return;

        await this.client.SettingsService.getSettings(message.guild);

        let custom_commands = await this.client.CustomCommandService.getCustomCommands(message.guild);

        if (this.client.PrivilegeService.blacklist.test(message.member)) {
            return;
        }

        const modules = this.client.ModuleService.modules;

        for (let entry of modules) {
            const module = entry[1];
            const commands = module.commands;
            const matchers = module.matchers;

            for (let command of commands) {
                const parsed_args = await command.validate(message);

                if (parsed_args) {
                    command.callback(message, parsed_args);
                    return;
                }
            }
            
            for (let matcher of matchers) {
                if (await matcher.test(message)) {
                    matcher.callback(message);
                    return;
                }
            }
        }

        for (let command of [...custom_commands.commands.values()]) {
            if (command.enabled) {
                const validation = await command.validate(message);

                if (validation) {
                    const { trigger, args } = validation;

                    command.execute(message, trigger, args);
                }
            }
        }
    }
}