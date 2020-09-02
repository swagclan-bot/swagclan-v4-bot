import randomstring from "randomstring"
import url from "url"
import path from "path"

import fs from "fs/promises"

import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

/**
 * Represents a manager for custom command rule groups and rules.
 */
export default class RuleManager {
    /**
     * Instantiate the rule manager.
     */
    constructor() {
        /**
         * The rule groups loaded into the manager.
         * @type {Array<CustomCommandRuleGroup>}
         */
        this.rule_groups = [];
    }

    /**
     * Reload the rule groups from the file system.
     * @returns {Array<CustomCommandRuleGroup>}
     */
    async reload() {
        const __filename = url.fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const new_rules = [];

        const fs_dir = await fs.readdir(__dirname);
        const fs_rule_groups = fs_dir.filter(file => file !== "CustomCommandRule.js" && file !== "rules.js");

        for (let i = 0; i < fs_rule_groups.length; i++) {
            const refresh_id = randomstring.generate({
                length: 10,
                charset: "hex",
                capitalization: "lowercase"
            });

            const fs_rule_group = fs_rule_groups[i];
            
            const rule = (await import("file:///" + path.resolve(__dirname, fs_rule_group + "?" + refresh_id))).default;

            new_rules.push(rule);
        }

        this.rule_groups = new_rules;

        return this.rule_groups;
    }
}