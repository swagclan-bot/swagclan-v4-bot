# SWAGCLAN
Swag clan is a modular discord bot written in discord.js. It has a lot of features, being fully integrated with lichess and using APIs for many services.

[Invite the bot](https://discord.com/oauth2/authorize?client_id=714560478977851442&scope=bot&permissions=809639952)
[Help on commands](https://swagclan.thechimp.store/help)
[Get premium](https://swagclan.thechimp.store/premium)
[Login with discord](https://api.thechimp.store/auth/discord)

## Installation

### Prerequisites
* [Node.js](https://nodejs.org) (v14+)
* [NPM](https://npmjs.org) (Installed with node.js)
* [Git](https://git-scm.org) (Optional, for downloading updates)
* [Deno](https://deno.land) (Optional, for the secure JS environment command)
* A command prompt of your choice.
* A text editor of your choice.
* A discord bot created at https://discord.com/developers/applications (with a bot user)

### Download repository
If you have installed [Git](https://git-scm.org), you can enter `git clone https://swagclan-bot/swagclan-v4-bot` in your command prompt to download the repository locally to your computer.

If not, you can simply download the repository as an archive file from the code dropdown above.

### Configure bot
Using a text editor, create a `.credentials.js` file with these contents:
```js
export default {
    token: "",
    client_id: "",
    client_secret: "",
    ipinfo: "",
    rapidapi: "",
    lichess_id: "",
    lichess_secret: ""
}

```
and enter in your credentials for each API that you have access to. Commands that require APIs that you don't have access to will not work.

While I try to use as many free and unlimited APIs as possible, some are just not possible and require some manual set-up to do.

* `token` is your discord bot user's access token.
* `client_id` is the ID of your discord application.
* `client_secret` is the secret of your discord application.
* `ipinfo` is your API access token for https://ipinfo.io/ (Used for IP Locate commad)
* `rapidapi` is your API access token for https://rapidapi.com/ (Used for Urban Dictionary command)
* `lichess_id` is the ID of your lichess application created at https://lichess.org/account/oauth/app. (Used for lichess integration)
* `lichess_secret` is the secret for your lichess application created at https://lichess.org/account/oauth/app. (Used for lichess integration)

Next, create a `.env` with the following template
```
PORT=5000
ENVIRONMENT=development
BASE_WEB=http://localhost:3000
BASE_API=http://localhost:5000
```
You can modify these if you like. "ENVIRONMENT" takes either `development` or `production`.

### Install packages
Enter the directory in your command prompt, by using `cd swagclan-v4-bot`.

Then run `npm install` to install all required packages for the bot, this shouldn't take too long.

You can then run `npm start` (or `npm run debug` to run the bot in debug mode) to log in to the bot account, and to begin listening for messages, this will also enable you to run commands through the bot in the interactive terminal. [See below for a list of commands](https://github.com/swagclan-bot/swagclan-v4-bot#Terminal-commands).

### Updating
You can run `git pull` to update the bot to the latest version. If you have changed any part of the code yourself, there may be merge conflicts which you will have to sort out manually.

### Terminal commands
* `admins` - Get a list of all users and guilds with administrator privileges.
* `uadmin <userid>` - Give a user administrator privileges. (Only works for cached users)
* `gadmin <guildid>` - Give a guild administrator privileges for all commands ran inside it.
* `radmin <id>` - Remove administrator privileges from a user or a guild.
* `blacklist` - Get a list of all blacklisted users and guilds.
* `ublacklist <userid>` - Blacklist a user from using the bot. (Only works for cached users)
* `gblacklist <guildid>` - Blacklist a guild from using the bot.
* `rblacklist <id>` - Remove a user or guild from the blacklist.
* `beta` - Get a list of all users and guilds with beta privileges.
* `ubeta <userid>` - Give a user beta privileges. (Only works for cached users)
* `gbeta <guildid>` - Give a guild beta privileges for all commands ran inside it.
* `rbeta <id>` - Remove beta privileges from a user or a guild.
* `modules` - Get a list of all loaded and available modules.
* `load <module>` - Load a module.
* `reload <module>` - Reload a module.
* `unload <module>` - Unload a module.
* `help` - Display a help message.
* `exit` - Exit the process.

## Notes
This repository is licensed under the GNU General Public License v3.0, which means I am not responsible for anything you do with this bot.