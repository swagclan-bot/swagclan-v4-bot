// Imports
import "colors"

import randomstring from "randomstring"
import mkdirp from "mkdirp"
import utils from "util"
import fs from "fs"

import runtime_config from "../runtime.cfg.js"
import runtime_id from "../runtime.id.js"

/**
 * @typedef ConsoleColoursOptions
 * @property {Array<String>} [suppress_errs] Suppress errors that contain a string in this array.
 */

/**
 * @param {ConsoleColoursOptions} options The options for the console colours.
 */
export default async (options) => {
    // await mkdirp("logs");

    const log_stream = fs.createWriteStream(runtime_config.logfile, {
        flags: "a"
    });
	
	const real_log = console.log;

    console.log = (...log) => {
        const log_id = randomstring.generate({
            length: 20,
            charset: "hex",
            capitalization: "lowercase"
        });

        if (!runtime_config.disableoutput) {
            process.stdout.write("\r\x1b[K");

            const format = utils.format(...log);
            const stripped = format.replace(/\x1b\[[0-9]+m/g, "");

            process.stdout.write("[" + new Date().toISOString() + "] " + format + "\n" + "SWAGCLAN > ".blue);

            log_stream.write("{" + log_id + "} [" + new Date().toISOString() + "] " + stripped + "\n");
            
            process.emit("log");
        }
        
        return log_id;
    }

    console.success = (...log) => {
        return console.log("[SUCCESS]".bgGreen, ...log);
    }

    console.info = (...log) => {
        return console.log("[INFO]".bgBlue, ...log);
    }

    console.warn = (...log) => {
        return console.log("[WARN]".bgYellow, ...log);
    }
	
    console.debug = (...log) => {
        if (runtime_config.debug) {
            return console.log("[DEBUG]".bgYellow, ...log);
        }
    }

    console.error = (...log) => {
        if (options.suppress_errs) {
            if (options.suppress_errs.some(err => ~log.join(" ").indexOf(err))) {
                return null;
            }
        }

        return console.log("[ERROR]".bgRed, ...log);
    }
}