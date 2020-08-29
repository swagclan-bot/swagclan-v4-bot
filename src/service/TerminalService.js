import { Service } from "./Service.js"

import { SwagClan } from "../class/SwagClan.js"

import fs from "fs/promises"

/**
 * Represents a service dedicated to handling interactive terminal commands
 * @extends {Service}
 */
export class TerminalService extends Service {
	/**
	 * Instantiate the terminal service.
	 * @param {SwagClan} client The client that is instantiating this service.
	 */
	constructor(client) {
		super(client);
	}
	
	/**
	 * Run a command through the service manually.
	 */
	async runCommand(str) {
		const _this = this;
		
		const args = str.match(/\w+|"[\w\s]*"/g).map(_ => _.replace(/^\"/, "").replace(/\"$/, "")); // Split on spaces except those in quotes.
		const command = args.shift();
		const privileges = this.client.PrivilegeService;
		
		function listAllOf(pclass) {
			const users = [...pclass.users.values()];
			const guilds = [...pclass.guilds.values()];
			
			process.stdout.write("==Users==".yellow + "\n");
			if (users.length) {
				for (let i = 0; i < users.length; i++) {
					process.stdout.write("*".green + " " + users[i].tag + " (" + users[i].id + ")\n");
				}
			} else {
				process.stdout.write("None.\n");
			}
			
			process.stdout.write("==Guilds==".yellow + "\n");
			if (guilds.length) {
				for (let i = 0; i < guilds.length; i++) {
					process.stdout.write("*".green + " " + guilds[i].name + " (" + guilds[i].id + ")\n");
				}
			} else {
				process.stdout.write("None.\n");
			}
		}
		
		async function listAllModules() {
			const modules = [..._this.client.ModuleService.modules.values()];
			
			const available = (await fs.readdir(_this.client.ModuleService.path)).filter(filename => !_this.client.ModuleService.modules.get(filename));
			
			process.stdout.write("==Loaded==".yellow + "\n");
			
			if (modules.length) {
				for (let i = 0; i < modules.length; i++) {
					process.stdout.write("*".green + " " + modules[i].name.blue + "\n");
				}
			} else {
				process.stdout.write("None.\n");
			}
			
			process.stdout.write("==Available==".yellow + "\n");
			
			if (available.length) {
				for (let i = 0; i < available.length; i++) {
					process.stdout.write("*".green + " " + available[i] + "\n");
				}
			} else {
				process.stdout.write("None.\n");
			}
		}
		
		if (command === "admins") {
			listAllOf(privileges.admins);
		} else if (command === "uadmin") {
			if (args[0]) {
				const user = this.client.users.resolve(args[0]);
				
				if (user) {
					if (!privileges.admins.users.get(user.id)) {
						privileges.admins.users.set(user.id, {
							timestamp: Date.now(),
							tag: user.tag,
							id: user.id
						});
						
						await privileges.admins.save();
						
						process.stdout.write(("Gave user " + user.tag + " administrator privileges.").green + "\n");
						
						listAllOf(privileges.admins);
					} else {
						process.stdout.write("Error: User is already a bot administrator.".red + "\n");
					}
				} else {
					process.stdout.write("Error: User not found.".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <userid>".red + "\n");
			}
		} else if (command === "gadmin") {
			if (args[0]) {
				const guild = this.client.guilds.resolve(args[0]);
				
				if (guild) {
					if (privileges.admins.guilds.get(guild.id)) {
						privileges.admins.guilds.set(guild.id, {
							timestamp: Date.now(),
							name: user.tag,
							id: user.id
						});
						
						await privileges.admins.save();
						
						process.stdout.write(("Gave guild " + guild.name + " administrator privileges.").green + "\n");
						
						listAllOf(privileges.admins);
					} else {
						process.stdout.write("Error: Guild already has bot administrator.".red + "\n");
					}
				} else {
					process.stdout.write("Error: Guild not found.".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <guildid>".red + "\n");
			}
		} else if (command === "radmin") {
			if (args[0]) {
				const user = privileges.admins.users.get(args[0]);
				const guild = privileges.admins.guilds.get(args[0]);
				
				if (user) {
					privileges.admins.users.delete(args[0]);
					
					await privileges.admins.save();
					
					process.stdout.write(("Removed administrator privileges from user " + user.tag + ".").green + "\n");
					
					listAllOf(privileges.admins);
				} else if (guild) {
					privileges.admins.guilds.delete(args[0]);
					
					await privileges.admins.save();
					
					process.stdout.write(("Removed administrator privileges from guild " + guild.name + ".").green + "\n");
					
					listAllOf(privileges.admins);
				} else {
					process.stdout.write("Error: User or guild is not an admin.".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <id>".red + "\n");
			}
		} else if (command === "blacklist") {
			listAllOf(privileges.blacklist);
		} else if (command === "ublacklist") {
			if (args[0]) {
				const user = this.client.users.resolve(args[0]);
				
				if (user) {
					if (!privileges.blacklist.users.get(user.id)) {
						privileges.blacklist.users.set(user.id, {
							timestamp: Date.now(),
							tag: user.tag,
							id: user.id
						});
						
						await privileges.blacklist.save();
						
						process.stdout.write(("Blacklisted user " + user.tag + ".").green + "\n");
						
						listAllOf(privileges.blacklist);
					} else {
						process.stdout.write("Error: User is already blacklisted.".red + "\n");
					}
				} else {
					process.stdout.write("Error: User not found.".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <userid>".red + "\n");
			}
		} else if (command === "gblacklist") {
			if (args[0]) {
				const guild = this.client.guilds.resolve(args[0]);
				
				if (guild) {
					if (privileges.admins.blacklist.get(guild.id)) {
						privileges.admins.blacklist.set(guild.id, {
							timestamp: Date.now(),
							name: user.tag,
							id: user.id
						});
						
						await privileges.blacklist.save();
						
						process.stdout.write(("Blacklisted guild " + guild.name + ".").green + "\n");
						
						listAllOf(privileges.blacklist);
					} else {
						process.stdout.write("Error: Guild already blacklisted.".red + "\n");
					}
				} else {
					process.stdout.write("Error: Guild not found.".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <guildid>".red + "\n");
			}
		} else if (command === "rblacklist") {
			if (args[0]) {
				const user = privileges.blacklist.users.get(args[0]);
				const guild = privileges.blacklist.guilds.get(args[0]);
				
				if (user) {
					privileges.blacklist.users.delete(args[0]);
					
					await privileges.blacklist.save();
					
					process.stdout.write(("Removed user " + user.tag + " from the blacklist.").green + "\n");
					
					listAllOf(privileges.blacklist);
				} else if (guild) {
					privileges.blacklist.guilds.delete(args[0]);
					
					await privileges.blacklist.save();
					
					process.stdout.write(("Removed guild " + guild.name + " from the blacklist.").green + "\n");
					
					listAllOf(privileges.blacklist);
				} else {
					process.stdout.write("Error: User or guild is not blacklisted".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <id>".red + "\n");
			}
		} else if (command === "beta") {
			listAllOf(privileges.beta);
		} else if (command === "ubeta") {
			if (args[0]) {
				const user = this.client.users.resolve(args[0]);
				
				if (user) {
					if (!privileges.beta.users.get(user.id)) {
						privileges.beta.users.set(user.id, {
							timestamp: Date.now(),
							tag: user.tag,
							id: user.id
						});
						
						await privileges.beta.save();
						
						process.stdout.write(("Gave user " + user.tag + " beta privileges.").green + "\n");
						
						listAllOf(privileges.beta);
					} else {
						process.stdout.write("Error: User already has beta privileges.".red + "\n");
					}
				} else {
					process.stdout.write("Error: User not found.".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <userid>".red + "\n");
			}
		} else if (command === "gbeta") {
			if (args[0]) {
				const guild = this.client.guilds.resolve(args[0]);
				
				if (guild) {
					if (privileges.beta.users.get(guild.id)) {
						privileges.beta.users.set(guild.id, {
							timestamp: Date.now(),
							name: user.tag,
							id: user.id
						});
						
						await privileges.beta.save();
						
						process.stdout.write(("Gave guild " + guild.name + " beta privileges.").green + "\n");
						
						listAllOf(privileges.beta);
					} else {
						process.stdout.write("Error: Guild already has beta privileges.".red + "\n");
					}
				} else {
					process.stdout.write("Error: Guild not found.".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <guildid>".red + "\n");
			}
		} else if (command === "rbeta") {
			if (args[0]) {
				const user = privileges.beta.users.get(args[0]);
				const guild = privileges.beta.guilds.get(args[0]);
				
				if (user) {
					privileges.beta.users.delete(args[0]);
					
					await privileges.beta.save();
					
					process.stdout.write(("Removed beta privileges from tag " + user.tag + ".").green + "\n");
					
					listAllOf(privileges.beta);
				} else if (guild) {
					privileges.beta.guilds.delete(args[0]);
					
					await privileges.beta.save();
					
					process.stdout.write(("Removed beta privileges from guild " + guild.name + ".").green + "\n");
					
					listAllOf(privileges.beta);
				} else {
					process.stdout.write("Error: User or guild does not have beta.".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <id>".red + "\n");
			}
		} else if (command === "modules") {
			await listAllModules();
		} else if (command === "load") {
			if (args[0]) {
				try {
					const module = await this.client.ModuleService.load(args[0]);
					
					process.stdout.write(("Loaded module " + module.name + ".").green + "\n");
					
					await listAllModules();
				} catch (e) {
					process.stduout.write("Error: Could not load module.".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <module>".red + "\n");
			}
		} else if (command === "reload") {
			if (args[0]) {
				try {
					const module = await this.client.ModuleService.reload(args[0]);
					
					process.stdout.write(("Reloaded module " + module.name + ".").green + "\n");
					
					await listAllModules();
				} catch (e) {
					process.stduout.write("Error: Could not reload module.".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <module>".red + "\n");
			}
		} else if (command === "unload") {
			if (args[0]) {
				try {
					const module = await this.client.ModuleService.unload(args[0]);
					
					process.stdout.write(("Unloaded module " + module.name + ".").green + "\n");
					
					await listAllModules();
				} catch (e) {
					process.stduout.write("Error: Could not unload module.".red + "\n");
				}
			} else {
				process.stdout.write("Error: Missing argument <module>".red + "\n");
			}
		} else if (command === "help") {
			process.stdout.write("See https://github.com/swagclan-bot/swagclan-v4-bot#Commands for help on terminal commands.\n");
		} else if (command === "exit") {
			process.exit(0);
		}
	}
	
	/**
	 * Begin listening for commands on the terminal.
	 */
	begin() {
		process.stdin.resume();

		process.stdout.write("\r\x1b[K");
		process.stdout.write("SWAGCLAN > ".blue);

		process.stdin.on("data", async chunk => {
			await this.runCommand(chunk.toString());
			
			process.stdout.write("\n");
			process.stdout.write("\r\x1b[K");
			process.stdout.write("SWAGCLAN > ".blue);
		});
	}
	
	/**
	 * Stop listening for commands in the terminal.
	 */
	end() {
		process.stdout.write("\r\x1b[K");
		process.stdin.pause();
	}
}