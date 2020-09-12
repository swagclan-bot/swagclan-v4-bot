// Imports
import dotenv from "dotenv"

import runtime_config from "./src/runtime.cfg.js"

dotenv.config();

setTimeout(async function () {
    const { default: colours } = await import("./src/util/colours.js");

	if (runtime_config.debug) {
        await colours();
    } else {
        await colours({
            suppress_errs: ["DiscordAPIError: Unknown Message", "Unhandled promise rejection"]
        });
    }
    
    await import("./src/index.js");
}, 500);