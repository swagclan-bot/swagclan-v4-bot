// Imports
import path from "path"
import url from "url"
import fetch from "node-fetch"
import human_dur from "humanize-duration"

import { SwagClan } from "../class/SwagClan.js"

import setting_definitions from "./settings.js"
import credentials from "../../.credentials.js"

import config from "../../.config.js"

import runtime_config from "../runtime.cfg.js"
import runtime_id from "../runtime.id.js"

/**
 * Create a Bot interface.
 * @returns {SwagClan}
 */
export default async function bot() {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const client = new SwagClan({
        setting_definitions,
        accounts_path: path.resolve("private/accounts"),
        custom_commands_path: path.resolve("private/commands"),
        privileges_path: path.resolve("private/privileges"),
        sessions_path: path.resolve("private/sessions"),
        settings_path: path.resolve("private/settings"),
        module_path: path.resolve(__dirname, "command")
    });
	
    console.info("Process started" + (runtime_config.debug ? " in debug" : "") + " and client initialised, runtime ID: " + runtime_id);
    
    console.info("Checking for updates..");

    const latest_stable = await client.getLatest();

    if (latest_stable > config.version) {
        console.warn("A new stable version (" + config.version.green + " -> " + latest_stable.green + ") is available. Use `git pull` to update.");
    } else {
        console.info("No updates found.");
    }
	
	client.TerminalService.begin();

    await client.login(credentials.token);
    
    console.success("Bot logged in.");

    await client.PrivilegeService.admins.load();
    await client.PrivilegeService.beta.load();
    await client.PrivilegeService.blacklist.load();

    // Settings service events.
    client.SettingsService.on("load", settings => {
        console.info("Loaded settings for guild " + settings.id + " (" + client.SettingsService.guilds.size + ")");
    });

    client.SettingsService.on("error", (id, error) => {
        console.error("Could not load settings for guild " + id);
    });
    
    // Custom command service events
    client.CustomCommandService.on("load", settings => {
        console.info("Loaded commands for guild " + settings.id + " (" + client.CustomCommandService.guilds.size + ")");
    });

    client.CustomCommandService.on("error", (id, error) => {
        console.error("Could not load commands for guild " + id);
    });

    const modules = await client.ModuleService.loadFromDirectory();

    console.info("Loaded " + modules.size + " modules.");
    modules.map(module => "- " + module.name).forEach(ln => console.info(ln));

    async function updatePresence() {
        client.user.setPresence({
            activity: {
                type: "WATCHING",
                name: "for " + human_dur(process.uptime() * 1000, { round: true })
            }
        });

        setTimeout(updatePresence, (Math.random() + 1) * 7500);
    }

    setTimeout(updatePresence, (Math.random() + 1) * 7500);

    await updatePresence();

    const _ms = 60000; // 1 min
    let has_done = false;

    if (process.env.ENVIRONMENT === "production") {
        async function alpha_cat_intercontental_missle() {
            const cur_hr = new Date().getUTCHours();

            if (cur_hr === 0) {
                if (!has_done) {
                    const res = await fetch("https://restcountries.eu/rest/v2/all");
                    const json = await res.json();

                    const g = client.guilds.cache.get("557265103226142730"); // alpha cat discord

                    if (g) {
                        const guild = await g.fetch();

                        const channel = guild.channels.cache.get("709132608180584528"); // pray channel

                        if (channel) {
                            if (res.status === 200) {
                                const random = json[Math.floor(Math.random() * json.length)];

                                if (random?.name) {
                                    channel.setName(random.name);
                                } else {
                                    console.error("Could not get country.");
                                }
                            } else {
                                console.error("Could not get country.");
                            }
                        } else {
                            console.error("Could not find channel.");
                        }
                    } else {
                        console.error("Could not get guild.");
                    }

                    has_done = true;
                }
            } else {
                has_done = false;
            }
        }

        alpha_cat_intercontental_missle();

        setInterval(alpha_cat_intercontental_missle, _ms);
    }

    return client;
}