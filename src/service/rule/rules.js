import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

import Date from "./Date.js"
import Logic from "./Logic.js"
import Maths from "./Maths.js"
import Member from "./Member.js"
import Message from "./Message.js"
import Permissions from "./Permissions.js"
import Role from "./Role.js"
import String from "./String.js"

/**
 * @type {Array<CustomCommandRuleGroup>}
 */
const rules = [
    Date,
    Logic,
    Maths,
    Member,
    Message,
    Role,
    String,
    Permissions
];

export default rules;