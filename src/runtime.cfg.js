import yargs from "yargs"

export default yargs
    .option("debug", {
        type: "boolean",
        description: "Run in debug mode."
    })
    .option("lichessdev", {
        type: "boolean",
        description: "Use a local development version of lichess."
    })
    .option("suppress", {
        type: "array",
        description: "Suppress an error message.",
        default: []
    })
    .option("no-update", {
        type: "boolean",
        description: "Disable update-checking."
    })
    .option("disable-output", {
        type: "boolean",
        description: "Disable all console messages."
    })
    .option("disable-terminal", {
        type: "boolean",
        description: "Disable terminal interface."
    })
    .option("log-file", {
        type: "string",
        description: "The log file to output console messages to.",
        default: "logs.txt"
    })
    .option("old-api", {
        type: "boolean",
        description: "Use the old API."
    })
    .argv;