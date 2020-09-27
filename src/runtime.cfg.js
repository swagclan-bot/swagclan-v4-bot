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
    .option("noupdate", {
        type: "boolean",
        description: "Disable update-checking."
    })
    .option("disableoutput", {
        type: "boolean",
        description: "Disable all console messages."
    })
    .option("disableterminal", {
        type: "boolean",
        description: "Disable terminal interface."
    })
    .option("logfile", {
        type: "string",
        description: "The log file to output console messages to.",
        default: "logs.txt"
    })
    .option("oldapi", {
        type: "boolean",
        description: "Use the old API."
    })
    .argv;