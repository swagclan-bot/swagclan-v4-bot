# SWAGCLAN
Swag clan is a modular discord bot written in discord.js. It has a lot of features, being fully integrated with lichess and using APIs for many services.

* [Invite the bot](https://api.weakeyes.dev/invite)
* [Get help on commands](https://swagclan.weakeyes.dev/help)
* [Get premium](https://swagclan.weakeyes.dev/premium)
* [Connect swagclan to discord](https://api.weakeyes.dev/auth/discord)

## Installation

### Prerequisites
* [Node.js](https://nodejs.org) (v14+)
* [NPM](https://npmjs.org) (Installed with node.js)
* [Git](https://git-scm.org) (Optional, for downloading updates)
* [Deno](https://deno.land) (Optional, for the secure JS environment command)
* A command prompt of your choice.
* A text editor of your choice.
* A discord bot created at https://discord.com/developers/applications (with a bot user)
* A lichess app created at https://lichess.org/account/oauth/app

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
    lichess_id: "",
    lichess_secret: ""
}

```
and enter in your credentials for each API that you have access to. Commands that require APIs that you don't have access to will not work.

#### Credentials
* `token` is your discord bot user's access token.
* `client_id` is the ID of your discord application.
* `client_secret` is the secret of your discord application.
* `ipinfo` is your API access token for https://ipinfo.io/ (Used for IP Locate commad)
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

You can then run `npm start` (or `npm run debug` to run the bot in debug mode) to log in to the bot account, and to begin listening for messages, this will also enable you to run commands through the bot in the interactive terminal. [See below for a list of commands](#Terminal-commands).

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
* `reload rules` - Reload all custom command rules.
* `reload <module>` - Reload a module.
* `unload <module>` - Unload a module.
* `help` - Display a help message.
* `exit` - Exit the process.

### Commandline arguments
You can apply some command-line arguments to change the behaviour of the bot.
* `--debug` - Run the bot in debug mode, i.e. more messages to further diagnose problems and the health of the bot.
* `--lichessdev` - Use a local development version of lichess. (You can run a local lichess server with [this repository](https://github.com/ornicar/lila).)
* `--suppress <error>` - Suppress error messages that contain this string, can be used multiple times to suppress different error messages. (Not recommended.)
* `--noupdate` - Disable update-checking. (Not recommended.)
* `--disableoutput` - Disable all console messages.
* `--disableterminal` - Disable swagclan terminal interface.
* `--logfile <file>` - The log file to output console messages to.
* `--oldapi` - Use the old API structure. (Temporary, likely to go.)

If you are running with `npm`, i.e. `npm start` or `npm run debug`, you can pass arguments with a preceding `--`, e.g. `npm start -- --lichessdev`

If you are running with `node`, i.e. `node bootstrap.js`, you can pass arguments normally, e.g. `node bootstrap.js --suppress UnhandledPromiseRejectionWarning --old-api`

### Emojis
Some emojis will be missing if you run this bot yourself, so you will have to set them up yourself. Upload all images in [assets](/assets) as emojis into a server (keep the names), and input the IDs of each of them into `.config.js`. You can get the ID by typing the emoji into a text channel but with a backslash before it, i.e `\:lichess:`, and post the message. This will replace the emoji with something like `<:lichess:730936886557933650>`. The number is the ID of the emoji.

![](https://i.imgur.com/h3f6BSq.png)

### APIs
While I try to use as many free and unlimited APIs as possible, some are just not possible and require some manual set-up to do.

See [Credentials](#Credentials) for more information. If you have any questions, you can contact me on discord at `"weakeyes"#4248`.

## Notes
This repository is licensed under the GNU General Public License v3.0, which means I am not responsible for anything you do with this bot.

### Issues
If you come across any bugs, or want to request a feature, you can file an issue with [GitHub issues](https://github.com/swagclan-bot/swagclan-v4-bot/issues).

### Contact
If you need help setting up the bot or any specific issues that **aren't** bugs, you can contact me on discord at "weakeyes"#4248, or email me at essmale2005@gmail.com.

### Credits
The bot uses the following services:
* Made with [Node.js](https://nodejs.org) using [Discord.js](https://discord.js.org)
* Icons from [Lichess](https://lichess.org), [Steam](https://steamcommunity.com), [Minecraft](https://minecraft.net), [Apex Legends](https://www.ea.com/games/apex-legends)
* Chess board images (i.e. The ones seen in the `.opening` command) from the free service by [Niklas Fiekas](https://github.com/niklasf), [Web-BoardImage](https://github.com/niklasf/web-boardimage).
* Chess openings database from https://github.com/niklasf/eco, also by [Niklas Fiekas](https://github.com/niklasf).
* And APIs from the following:
  * [Tabstats](https://tabstats.com) (API at https://github.com/Tabwire/HyperScape-API) for Hyperscape player statistics.
  * [Lichess](https://lichess.org) (API at https://lichess.org/api) for Lichess player statistics and matchmaking.
  * [Bible-API.com](https://bible-api.com) for specific bible verses.
  * [Ourmanna.com](https://ourmanna.com) for random bible verses.
  * [Relevant XKCD](https://relevantxkcd.appspot.com/) for XKCD comic search.
  * [XKCD API](https://xkcd.com/json.html) for specific xkcd comics.
  * [MC-API.net](https://mc-api.net) for minecraft server icons.
  * [MCAPI.xdefcon.com](https://mcapi.xdefcon.com) for minecraft server status and information.
  * [PlayerDB.co](https://playerdb.co) for steam user information.
  * [DictionaryAPI.dev](https://dictionaryapi.dev) for dictionary definitions and synonyms.
  * [Urban Dictionary API](https://rapidapi.com/community/api/urban-dictionary) for urban dictionary definitions.