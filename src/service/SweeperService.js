// Imports
import discord from "discord.js"

import { Service } from "./Service.js"

import { SwagClan } from "../class/SwagClan.js"

/**
 * Represents a set of a user message command call and the interface that the user interacts with.
 */
class SweepSet {
    /**
     * Instantiate a sweep set object.
     * @param {ChannelSweeper} sweeper The sweeper that the sweep set belongs to.
     * @param {discord.Message} message The original user message that called the command.
     * @param {CommandCallInterface} cmdinterface The interface that the user interacts with.
     */
    constructor(sweeper, message, cmdinterface) {
        /**
         * The sweeper that the sweep set belongs to.
         * @type {ChannelSweeper}
         */
        this.sweeper = sweeper;

        /**
         * The original user message that called the command.
         * @type {discord.Message}
         */
        this.message = message;

        /**
         * The interface The interface that the user interacts with.
         * @type {CommandCallInterface}
         */
        this.cmdinterface = cmdinterface;
    }

    /**
     * Flatten the message and interface replies for an array of messages.
     * @returns {Array<discord.Message>}
     */
    flatten() {
        const replies = this.cmdinterface.replies.filter(message => {
            return message && !message.deleted && message.deletable; // Don't count already-deleted messages.
        });

        return [this.message, ...replies];
    }
}

/**
 * Represents a sweeper for a channel.
 */
class ChannelSweeper {
    /**
     * Instantiate a channel sweeper object.
     * @param {SwagClan} client The client that instantiated the sweeper.
     * @param {SweeperService} sweeper_service The sweeper service that the sweeper is connected to.
     * @param {discord.Channel} channel The channel that the sweeper acts upon.
     */
    constructor(client, sweeper_service, channel) {
        /**
         * The client that instantiated the sweeper.
         * @type {SwagClan}
         */
        this.client = client;

        /**
         * The sweeper service that the sweeper is connected to.
         * @type {SweeperService}
         */
        this.service = sweeper_service;

        /**
         * The channel that the sweeper acts upon.
         * @type {discord.TextChannel}
         */
        this.channel = channel;

        /**
         * The sets that the sweeper contains.
         * @type {Array<SweepSet>}
         */
        this.sweep_sets = [];
    }

    /**
     * Add an interface to the sweeper.
     * @param {discord.Message} message The original user message that called the command.
     * @param {CommandCallInterface} cmdinterface The interface that the user interacts with.
     */
    pushInterface(message, cmdinterface) {
        this.sweep_sets.unshift(new SweepSet(this, message, cmdinterface));
    }

    /**
     * Add a sweep set to the sweeper.
     * @param {SweepSet} sweep_set The sweep set to push.
     */
    pushSweepSet(sweep_set) {
        this.sweep_sets.unshift(sweep_set);
    }

    /**
     * Delete all the messages in the sweep sets.
     */
    async sweep() {
        /** @type {Array<discord.Message>} */
        const messages = [];

        for (let i = 0; this.sweep_sets.length && messages.length < 100; i++) {
            const set = this.sweep_sets.shift();

            messages.push(...set.flatten());
        }
        
        if (messages.length === 0) {
            return;
        }

        if (messages.length > 100) {
            messages.length = 100;
        }

        if (messages.length === 1) {
            await messages[0].delete();
        } else {
            try {
                await this.channel.bulkDelete(messages);
            } catch (e) {
                
            }
        }
    }
}

/**
 * Represents a service for interacting with channel sweepers.
 * @extends {Service}
 */
export class SweeperService extends Service {
    /**
     * Instantiate the sweeper service.
     * @param {SwagClan} client The bot client that instantiated this service
     */
    constructor(client) {
        super(client);

        /**
         * The sweepers that the sweeper service controls.
         * @type {discord.Collection<String,ChannelSweeper>}
         */
        this.sweepers = new discord.Collection;
    }

    /**
     * Get a channel's sweeper.
     * @param {discord.ChannelResolvable} channel_resolvable The channel to get the sweeper for.
     * @returns {ChannelSweeper}
     */
    getSweeper(channel_resolvable) {
        const channel = this.client.channels.resolve(channel_resolvable);

        if (channel) {
            const sweeper = this.sweepers.get(channel.id);

            if (!sweeper) {
                this.sweepers.set(channel.id, new ChannelSweeper(this.client, this, channel));

                return this.getSweeper(channel);
            }

            return sweeper;
        }

        return null;
    }
}