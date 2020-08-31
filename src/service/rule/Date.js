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
            name: "Day of %",
            description: "The day of the date.",
            params: ["date"],
            callback: function GetDay(date) {
                return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][date.getUTCDay()];
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "313d7f65-fdf2-47c4-94c5-75d87d84235e",
            name: "Day number of %",
            description: "The number of the date.",
            params: ["date"],
            callback: function GetDay(date) {
                return date.getUTCDay();
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "b9fc9932-364a-48f8-88d6-8d1ffd515527",
            name: "Date of %",
            description: "The day of the month of the date.",
            params: ["date"],
            callback: function GetDate(date) {
                return date.getUTCDate();
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "c1ac7d5d-01e7-4716-a243-74acf5c9b943",
            name: "Month of %",
            description: "The current month of the date.",
            params: ["date"],
            callback: function GetMonth(date) {
                return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][date.getUTCMonth()];
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "e973b70c-f2fb-45c1-8192-ec3cfef3b323",
            name: "Month number of %",
            description: "The number of the current month of the date.",
            params: ["date"],
            callback: function GetMonth() {
                return new Date().getUTCMonth();
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "569ae4cc-b3cd-4717-bca3-08af59bb1e5e",
            name: "Year of %",
            description: "The current year of the date.",
            params: ["date"],
            callback: function GetYear(date) {
                return date.getUTCFullYear();
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "76e69313-eb3b-4597-acb7-fa43a8e0fac4",
            name: "Hour of %",
            description: "The current hour of the day of the date.",
            params: ["date"],
            callback: function GetHour(date) {
                return date.getUTCHours();
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "05d3dcee-ca21-4cc8-8022-6652a75b3807",
            name: "Minute of %",
            description: "The current minute of the hour of the date.",
            params: ["date"],
            callback: function GetMinute(date) {
                return date.getUTCMinutes();
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "4415a680-e58e-4409-a1f4-5e407e0d6576",
            name: "Second of %",
            description: "The current second of the minute of the date.",
            params: ["date"],
            callback: function GetSecond(date) {
                return date.getUTCSeconds();
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "52c9f184-adc8-40fd-bedf-f4f610918a16",
            name: "Timestamp of %",
            description: "The date as a unix timestamp.",
            params: ["date"],
            callback: function GetUnix(date) {
                return date.getTime();
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "64931c01-b4cf-456a-92eb-c1df435ea68d",
            name: "Now",
            description: "The current date.",
            params: [],
            callback: function GetNow() {
                return new Date();
            },
            fallback: null,
            returns: "date"
        })
    ]
});