// Imports
import dotenv from "dotenv"

dotenv.config();

setTimeout(async function () {
    const { default: colours } = await import("./src/util/colours.js");

	await colours();
    
    await import("./src/index.js");
}, 500);