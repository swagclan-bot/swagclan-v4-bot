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
            description: "The day of the current week.",
            params: [],
            callback: function GetDay() {
                return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getUTCDay()];
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "313d7f65-fdf2-47c4-94c5-75d87d84235e",
            name: "Day number",
            description: "The number of the current day of the week.",
            params: [],
            callback: function GetDay() {
                return new Date().getUTCDay();
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "b9fc9932-364a-48f8-88d6-8d1ffd515527",
            name: "Date",
            description: "The date of the month.",
            params: [],
            callback: function GetDate() {
                return new Date().getUTCDate();
            }
        }),
        new CustomCommandRule({
            id: "c1ac7d5d-01e7-4716-a243-74acf5c9b943",
            name: "Month",
            description: "The current month.",
            params: [],
            callback: function GetMonth() {
                return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][new Date().getUTCMonth()];
            }
        }),
        new CustomCommandRule({
            id: "e973b70c-f2fb-45c1-8192-ec3cfef3b323",
            name: "Month number",
            description: "The number of the current month.",
            params: [],
            callback: function GetMonth() {
                return new Date().getUTCMonth();
            }
        }),
        new CustomCommandRule({
            id: "569ae4cc-b3cd-4717-bca3-08af59bb1e5e",
            name: "Year",
            description: "The current year.",
            params: [],
            callback: function GetYear() {
                return new Date().getUTCFullYear();
            }
        }),
        new CustomCommandRule({
            id: "76e69313-eb3b-4597-acb7-fa43a8e0fac4",
            name: "Hour",
            description: "The current hour of the day.",
            params: [],
            callback: function GetHour() {
                return new Date().getUTCHours();
            }
        }),
        new CustomCommandRule({
            id: "05d3dcee-ca21-4cc8-8022-6652a75b3807",
            name: "Minute",
            description: "The current minute of the hour.",
            params: [],
            callback: function GetMinute() {
                return new Date().getUTCMinutes();
            }
        }),
        new CustomCommandRule({
            id: "4415a680-e58e-4409-a1f4-5e407e0d6576",
            name: "Seconds",
            description: "The current second of the minute.",
            params: [],
            callback: function GetSecond() {
                return new Date().getUTCSeconds();
            }
        }),
        new CustomCommandRule({
            id: "52c9f184-adc8-40fd-bedf-f4f610918a16",
            name: "Unix timestamp",
            description: "The time as a unix timestamp.",
            params: [],
            callback: function GetUnix() {
                return Date.now();
            },
            fallback: 0,
            returns: "number"
        })
    ]
});