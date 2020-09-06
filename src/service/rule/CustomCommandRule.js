import { CustomCommandContextVariable } from "../CustomCommandService.js"

/**
 * @typedef CustomCommandRuleGroupInformation
 * @property {String} name The name of the rule group.
 * @property {String} description The description of the rule group.
 * @property {String} emoji The emoji of the rule group.
 * @property {String} colour The colour of the rule group.
 * @property {Array<CustomCommandRule>} rules The rules in the rule group.
 */

/**
 * Represents a rule group.
 */
export class CustomCommandRuleGroup {
    /**
     * Instantiate a custom command rule group object.
     * @param {CustomCommandRuleGroupInformation} info The custom command rule group information.
     */
    constructor(info) {
        /**
         * The name of the rule group.
         * @type {String}
         */
        this.name = info.name;

        /**
         * The description of the rule group.
         * @type {String}
         */
        this.description = info.description;

        /**
         * The emoji of the rule group.
         * @type {String}
         */
        this.emoji = info.emoji;

        /**
         * The colour of the rule group.
         * @type {String}
         */
        this.colour = info.colour;

        /**
         * The rules in the rule group.
         * @type {Array<CustomCommandRule>}
         */
        this.rules = info.rules;
    }
}

/**
 * @callback CustomCommandRuleCallback
 * @param {...any} args Arguments passed to the rule.
 */

/**
 * @typedef {String} CustomCommandType
 */


/**
 * @typedef CustomCommandRuleInformation
 * @property {String} name The name of the rule.
 * @property {String} description The description of the rule.
 * @property {String} group The group that the rule belongs to.
 * @property {Array<CustomCommandType>} params The parameters of the rule.
 * @property {CustomCommandRuleCallback} callback The callback function for the rule.
 * @property {any} fallback The value that is returned if the callback fails.
 * @property {CustomCommandType} returns The type that the rule returns.
 */

/**
 * Represents a rule for an action.
 */
export class CustomCommandRule {
    /**
     * Instantiate a custom command rule object.
     * @param {CustomCommandRuleInformation} info The custom command information.
     */
    constructor(info) {
        /**
         * The ID of the rule.
         * @type {String}
         */
        this.id = info.id;

        /**
         * The name of the rule.
         * @type {String}
         */
        this.name = info.name;

        /**
         * The description of the rule.
         * @type {String}
         */
        this.description = info.description;

        /**
         * The type that the rule returns.
         * @type {CustomCOmmandType}
         */
        this.returns = info.returns;

        /**
         * The parameters of the rule.
         * @type {Array<CustomCommandType>}
         */
        this.params = info.params;

        /**
         * The value that is returned if the callback fails.
         * @type {any}
         */
        this.fallback = info.fallback;

        /**
         * The callback function for the rule.
         * @type {CustomCommandRuleCallback}
         * @private
         */
        this._callback = info.callback;
    }

    /**
     * Execute the rule callback.
     * @param {CustomCommandContext} ctx The context of the rule.
     * @param {...CustomCommandExpression} args The arguments to pass to the rule.
     */
    async callback(ctx, ...args) {
        const parsed_args = [];

        for (let i = 0; i < args.length; i++) {
            const param = this.params[i];

            if (param) {
                if (param === "void" || param === "var") {
                    parsed_args.push(args[i]);
                    continue;
                }

                const arg = await args[i].evaluate(ctx);
                
                if (arg) {
                    const value = arg.value;

                    if (typeof value === "symbol") {
                        parsed_args.push(value);
                    } else if (param === "number") {
                        parsed_args.push(Number(value) || 0);
                    } else if (param === "boolean") {
                        parsed_args.push(Boolean(value));
                    } else if (param === "string") {
                        parsed_args.push(value ? (value + "") : "");
                    } else if (param === "message") {
                        parsed_args.push(ctx.message.channel.messages.resolve(value));
                    } else if (param === "member") {
                        parsed_args.push(ctx.message.guild.members.resolve(value));
                    } else if (param === "channel") {
                        parsed_args.push(ctx.message.guild.channels.resolve(value));
                    } else if (param === "role") {
                        parsed_args.push(ctx.message.guild.roles.resolve(value));
                    } else if (param === "date") {
                        parsed_args.push(new Date(value));
                    } else {
                        parsed_args.push(value);
                    }
                } else {
                    parsed_args.push(null);
                }
            } else {
                return;
            }
        }

        if (this.returns === "void") {
            try {
                await this._callback.call(ctx, ...parsed_args);
            } catch (e) {
                if (~e.toString().indexOf("DiscordAPIError") && ~e.toString().indexOf("empty message")) {
                    console.error(ctx.guild.id, ctx.command.id, e);
                }
            }
        } else {
            try {
                const ret = await this._callback.call(ctx, ...parsed_args);

                if (typeof ret !== "undefined") {
                    return new CustomCommandContextVariable(this.returns, ret);
                } else {
                    return this.fallback;
                }
            } catch (e) {
                if (~e.toString().indexOf("DiscordAPIError") && ~e.toString().indexOf("empty message")) {
                    console.error(ctx.guild.id, ctx.command.id, e);
                }

                return this.fallback;
            }
        }
    }
}