import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

export default new CustomCommandRuleGroup({
    name: "Date",
    description: "Rules for time and date (In UTC+0).",
    emoji: "📆",
    colour: "#c2f713",
    rules: [
        new CustomCommandRule({
            id: "a3296f7f-1175-4ccc-84d5-cee33c0cf31b",
            name: "Timer",
            description: "The number of milliseconds since the command was executed.",
            params: [],
            callback: function GetMilliseconds() {
                return Date.now() - this.script.started;
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "c8725ce2-c15b-400f-8c14-a4cea98189d1",
            name: "Day",
            description: "The day today.",
            params: [],
            callback: function GetDay() {
                const today = new Date();

                return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][today.getUTCDay()];
            },
            fallback: "",
            returns: "string"
        })
    ]
});