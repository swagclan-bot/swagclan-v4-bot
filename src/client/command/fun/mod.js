// Imports
import discord from "discord.js"
import { BotModule, ModuleCommand, MessageMatcher, CommandVersion, CommandArgument, CommandSyntax, ArgumentType } from "../../../service/ModuleService.js"

import fetch from "node-fetch"
import FormData from "form-data"

import lichess from "../../../class/lichess/index.js"

import config from "../../../../.config.js"

function pad_left(pad, len, str) {
    return pad.repeat(len - str.length >= 0 ? len - str.length : 0) + str;
}

export default new BotModule({
    name: "Fun",
    description: "Games and random useless commands.",
    emoji: "🎲",
    commands: [new ModuleCommand({
        name: "Would You Rather",
        description: "Present a would you rather question to debate on with friends",
        emoji: "⚖",
        versions: [
            new CommandVersion(["wyr", "rather"], []),
            new CommandVersion(["wyr", "rather"], [
                new CommandArgument({
                    name: "choicea",
                    description: "The first choice for the Would You Rather question.",
                    emoji: "🔥",
                    types: [ArgumentType.Text]
                }),
                new CommandSyntax("or"),
                new CommandArgument({
                    name: "choiceb",
                    description: "The second choice for the Would You Rather question.",
                    emoji: "💧",
                    types: [ArgumentType.Text]
                })
            ])
        ],
		example: "https://i.imgur.com/Co5v0Un.gif",
        callback: async function WouldYouRather(message) {
            message.delete();

            let choicea = this.args.choicea?.value;
            let choiceb = this.args.choiceb?.value;

            if (!choicea) {
                await this.reply("success", "Loading question..");

                const ids = new FormData;
                ids.append("ids", Math.round(Math.random() * 9999 + 1));

                const res = await fetch("http://either.io/questions/get", {
                    method: "POST",
                    body: ids
                });

                const json = await res.json();

                choicea = json.questions[0].option_1;
                choiceb = json.questions[0].option_2;
            }
            
            await this.edit("success", "Would you rather: ", {
                fields: [{
                    title: "1️⃣",
                    body: choicea,
                    inline: true
                }, {
                    title: "2️⃣",
                    body: choiceb,
                    inline: true
                }],
                ...(!this.args.choicea ? {
                    footer: "Question provided by either.io"
                } : {})
            });

            const reply = this.replies[this.replies.length - 1];

            const collector = reply.createReactionCollector((reaction, user) => {
                return (reaction.emoji.name === "1️⃣" || reaction.emoji.name === "2️⃣") && user.id !== message.client.user.id;
            }, { idle: 86400000, dispose: true });

            const update_percentages = (reaction, user, add) => {
                const one_reaction = reply.reactions.cache.find(reaction => reaction.emoji.name === "1️⃣");
                const two_reaction = reply.reactions.cache.find(reaction => reaction.emoji.name === "2️⃣");

                if (add) {
                    if (reaction.emoji.name === "1️⃣") {
                        if (two_reaction?.users?.cache?.get(user.id)) {
                            two_reaction.users.remove(user.id);
                            return;
                        }
                    } else if (reaction.emoji.name === "2️⃣") {
                        if (one_reaction?.users?.cache?.get(user.id)) {
                            one_reaction.users.remove(user.id);
                            return;
                        }
                    }
                }

                const ones = one_reaction ? one_reaction.count - 1: 0;
                const twos = two_reaction ? two_reaction.count - 1: 0;
                const total = ones + twos;

                const one_percentage = Math.round(ones / total * 1000) / 10;
                const two_percentage = Math.round(twos / total * 1000) / 10;

                this.edit("success", "Would you rather: ", {
                    fields: [{
                        title: "1️⃣" + (total ? " (" + one_percentage + "%)" : ""),
                        body: choicea,
                        inline: true
                    }, {
                        title: "2️⃣" + (total ? " (" + two_percentage + "%)" : ""),
                        body: choiceb,
                        inline: true
                    }],
                    ...(!this.args.choicea ? {
                        footer: "Question provided by either.io"
                    } : {})
                });
            }

            collector.on("collect", (a, b) => update_percentages(a, b, true));
            collector.on("remove", (a, b) => update_percentages(a, b, false));

            collector.on("end", end => {
                const one_reaction = reply.reactions.cache.find(reaction => reaction.emoji.name === "1️⃣");
                const two_reaction = reply.reactions.cache.find(reaction => reaction.emoji.name === "2️⃣");

                const ones = one_reaction ? one_reaction.count - 1: 0;
                const twos = two_reaction ? two_reaction.count - 1: 0;
                const total = ones + twos;
                
                const one_percentage = Math.round(ones / total * 1000) / 10;
                const two_percentage = Math.round(twos / total * 1000) / 10;
                
                this.edit("success", "Would you rather: ", {
                    fields: [{
                        title: "1️⃣" + (total ? " (" + one_percentage + "%)" : ""),
                        body: choicea,
                        inline: true
                    }, {
                        title: "2️⃣" + (total ? " (" + two_percentage + "%)" : ""),
                        body: choiceb,
                        inline: true
                    }],
                    footer: "Voting has concluded."
                });
            });

            await reply.react("1️⃣");
            await reply.react("2️⃣");
        }
    }), new ModuleCommand({
        name: "Say As",
        description: "Spoof a message as sent by another user.",
        emoji: "🕵️‍♀️",
        versions: [
            new CommandVersion(["say"], [
                new CommandArgument({
                    name: "text",
                    description: "The message to fake.",
                    emoji: "💬",
                    types: [ArgumentType.Rest]
                }),
                new CommandSyntax("as"),
                new CommandArgument({
                    name: "who",
                    description: "The user to fake.",
                    emoji: "👨",
                    types: [ArgumentType.Mention]
                })
            ]),
            new CommandVersion(["sayas"], [
                new CommandArgument({
                    name: "who",
                    description: "The user to fake.",
                    emoji: "👨",
                    types: [ArgumentType.Mention]
                }),
                new CommandArgument({
                    name: "text",
                    description: "The message to fake.",
                    emoji: "💬",
                    types: [ArgumentType.Rest]
                })
            ])
        ],
		example: "https://i.imgur.com/Co5v0Un.gif",
        callback: async function SpoofMessage(message) {
            message.delete();

            const webhooks = await message.guild.fetchWebhooks();

            if (webhooks.size >= 10) {
                return await this.reply("error", "Maximum number of webhooks reached.");
            }
            
            const webhook = await message.channel.createWebhook(this.args.who.value.nickname || this.args.who.value.user.username, {
                avatar: this.args.who.value.user.avatarURL({ format: "png" }),
                reason: "Spoof a message."
            });

            const webhookClient = new discord.WebhookClient(webhook.id, webhook.token);

            await webhookClient.send(this.args.text.value);
            webhookClient.delete();
        }
    }),
    new ModuleCommand({
        name: "Bible Verses",
        description: "Get a random or specific bible verse or verse range to think about today.",
        emoji: "🙏",
        versions: [
            new CommandVersion(["verse", "rbv", "bible"], []),
            new CommandVersion(["verse", "bible"], [
                new CommandArgument({
                    name: "book",
                    description: "The reference book.",
                    emoji: "📕",
                    types: [new ArgumentType({
                        name: "Bible Book",
                        description: "A book from the bible.",
                        examples: ["Matthew"],
                        validate: /^.+$/
                    })]
                }),
                new CommandArgument({
                    name: "verse",
                    description: "The verse to get.",
                    emoji: "📜",
                    types: [new ArgumentType({
                        name: "Verse",
                        description: "A verse from the bible.",
                        examples: ["7:13"],
                        validate: /^\d+:\d+$/
                    })]
                })
            ]),
            new CommandVersion(["verses", "bible"], [
                new CommandArgument({
                    name: "book",
                    description: "The reference book.",
                    emoji: "📕",
                    types: [ArgumentType.Text]
                }),
                new CommandArgument({
                    name: "verses",
                    description: "The verse range to get.",
                    emoji: "📜",
                    types: [new ArgumentType({
                        name: "Verses",
                        description: "A range of verses to get",
                        examples: ["22:34-40"],
                        validate: /^\d+:\d+-\d+(:\d+)?$/
                    })]
                })
            ])
        ],
		example: "https://i.imgur.com/fPkRkPH.gif",
        callback: async function GetBibleVerse(message) {
            if (this.args.book) {
                if (this.args.verses) {
                    const res = await fetch("https://bible-api.com/" + encodeURIComponent(this.args.book.value) + "+" + encodeURIComponent(this.args.verses.value));
                    const verse = await res.json();

                    if (verse.error) {
                        return await this.reply("error", "Verse not found.");
                    } else {
                        return await this.createPages("success", "Found " + verse.verses.length + " verse" + (verse.verses.length === 1 ? "" : "s"), verse.verses.map(verse_ => {
                            const book_name = verse_.book_name === "Psalm" ? "Psalms" : verse_.book_name;

                            return {
                                title: verse_.book_name + " " + verse_.chapter + ":" + verse_.verse,
                                body: "“" + verse_.text.replace(/\n/g, " ").replace(/[^a-zA-Z0-9-_,\."'!? ]/g, "").trim() + "” [Interpretation](https://www.bibleref.com/" + book_name + "/" + verse_.chapter + "/" + verse_.book_name + "-" + verse_.chapter + "-" + verse_.verse + ".html)"
                            }
                        }), {
                            footer: verse.translation_name + " (" + verse.translation_note + ") | Provided by bible-api.com"
                        });
                    }
                } else if (this.args.verse) {
                    const res = await fetch("https://bible-api.com/" + encodeURIComponent(this.args.book.value) + "%20" + encodeURIComponent(this.args.verse.value));
                    const verse = await res.json();

                    if (verse.error) {
                        return await this.reply("error", "Verse not found.");
                    } else {
                        const book_name = verse.verses[0].book_name === "Psalm" ? "Psalms" : verse.verses[0].book_name;

                        return await this.reply("success", "", {
                            fields: [
                                {
                                    title: verse.reference,
                                    body: "“" + verse.text.replace(/\n/g, " ").replace(/[^a-zA-Z0-9-_,\."'!? ]/g, "").trim() + "” [Interpretation](https://www.bibleref.com/" + book_name + "/" + verse.verses[0].chapter + "/" + verse.verses[0].book_name + "-" + verse.verses[0].chapter + "-" + verse.verses[0].verse + ".html)"
                                }
                            ],
                            footer: verse.translation_name + " (" + verse.translation_note + ") | Provided by bible-api.com"
                        });
                    }
                }
            } else {
                const res = await fetch("https://beta.ourmanna.com/api/v1/get/?format=json&order=random");
                const verse = await res.json();
                
                const chapterverse = verse.verse.details.reference.match(/\d+:\d+/)[0];
                const chapter = chapterverse.split(":")[0];
                const versenum = chapterverse.split(":")[1];

                const book = verse.verse.details.reference.split(" " + chapterverse)[0].replace(/ /g, "-");
                const book_name = book === "Psalm" ? "Psalms" : book;

                return await this.reply("success", "", {
                    fields: [
                        {
                            title: verse.verse.details.reference,
                            body: "“" + verse.verse.details.text + "” [Interpretation](https://www.bibleref.com/" + book_name + "/" + chapter + "/" + book + "-" + chapter + "-" + versenum + ".html)"
                        }
                    ],
                    footer: "New International Version | Provided by ourmanna.com"
                });
            }
        }
    }),
    new ModuleCommand({
        name: "XKCD",
        description: "Search or get an XKCD comic.",
        emoji: "🖼",
        versions: [
            new CommandVersion(["xkcd"], [
                new CommandSyntax("random", true)
            ]),
            new CommandVersion(["xkcd"], [
                new CommandArgument({
                    name: "id",
                    description: "The ID of the comic to get.",
                    emoji: "📋",
                    types: [ArgumentType.Integer]
                })
            ]),
            new CommandVersion(["xkcd"], [
                new CommandArgument({
                    name: "search",
                    description: "A search term to find a comic.",
                    emoji: "🔎",
                    types: [ArgumentType.Text]
                })
            ])
        ],
		example: "https://i.imgur.com/6FAQaIX.gif",
        callback: async function GetXKCDComic(message) {
            if (this.args.search) {
                this.reply("success", "Searching XKCD for `" + this.args.search.value + "`..");

                const search = new FormData;
                search.append("search", this.args.search.value)

                const res = await fetch("https://relevant-xkcd-backend.herokuapp.com/search", {
                    method: "POST",
                    body: search
                });

                const json = await res.json();

                if (json.success && json.results[0]) {
                    const comic = json.results[0];

                    return await this.edit("success", "[" + comic.number + ". " + comic.title + " (" + comic.date + ")](https://" + comic.url + ")", {
                        image: {
                            url: comic.image
                        },
                        footer: "Search provided by relevant-xkcd.github.io"
                    });
                } else {
                    return await this.edit("error", "Could not find any comics with term `" + this.args.search.value + "`.");
                }
            } else if (this.args.id) {
                const res = await fetch("https://xkcd.com/" + encodeURIComponent(this.args.id.value) + "/info.0.json");

                if (res.status === 404) {
                    return await this.error("error", "Could not find comic with id `" + this.args.id.value + "`");
                } else {
                    const comic = await res.json();

                    const date = comic.year + "-" + pad_left("0", 2, comic.month) + "-" + pad_left("0", 2, comic.day);

                    return await this.reply("success", "[" + comic.num + ". " + comic.safe_title + " (" + date + ")](https://xkcd.com" + comic.num + ")", {
                        image: {
                            url: comic.img
                        },
                        footer: "Provided by xkcd.com"
                    });
                }
            } else {
                const res = await fetch("https://xkcd.com/info.0.json");
                const comic = await res.json();

                if (this.args.random) {
                    const total = comic.num;
                    const random = Math.floor(Math.random() * total) + 1;

                    const res2 = await fetch("https://xkcd.com/" + random + "/info.0.json");

                    if (res2.status === 404) {
                        return await this.error("error", "Could not get a random XKCD comic.");
                    } else {
                        const comic2 = await res2.json();
    
                        const date = comic2.year + "-" + pad_left("0", 2, comic2.month) + "-" + pad_left("0", 2, comic2.day);
    
                        return await this.reply("success", "[" + comic2.num + ". " + comic2.safe_title + " (" + date + ")](https://xkcd.com/" + comic2.num + ")", {
                            image: {
                                url: comic2.img
                            },
                            footer: "Provided by xkcd.com"
                        });
                    }
                } else {
                    const date = comic.year + "-" + pad_left("0", 2, comic.month) + "-" + pad_left("0", 2, comic.day);

                    return await this.reply("success", "[" + comic.num + ". " + comic.safe_title + " (" + date + ")](https://xkcd.com/" + comic.num + ")", {
                        image: {
                            url: comic.img
                        },
                        footer: "Provided by xkcd.com"
                    });
                }
            }
        }
    }), new ModuleCommand({
        name: "Minesweeper",
        description: "Play a classic minesweeper game.",
        emoji: "💥",
        versions: [
            new CommandVersion(["minesweeper"], [
                new CommandSyntax("paste", true)
            ]),
            new CommandVersion(["minesweeper"], [
                new CommandArgument({
                    name: "width",
                    description: "The width of the board.",
                    emoji: "📏",
                    types: [ArgumentType.Integer]
                }),
                new CommandArgument({
                    name: "height",
                    description: "The height of the board.",
                    emoji: "📏",
                    types: [ArgumentType.Integer],
                    optional: true
                }),
                new CommandArgument({
                    name: "mines",
                    description: "The number of mines on the board.",
                    emoji: "💥",
                    types: [ArgumentType.Integer],
                    optional: true
                }),
                new CommandSyntax("paste", true)
            ])
        ],
		example: "https://i.imgur.com/kM6fXlq.gif",
        callback: async function GenerateMinesweeperBoard(message) {
            let width = this.args.width?.value || 8;
            let height = this.args.height?.value || width;

            if (width < 4 || height < 4) {
                return await this.reply("error", "Board size too small.");
            }

            if (height > 30) {
                return await this.reply("error", "Board height too big.");
            }

            if (width > 30) {
                return await this.reply("error", "Board width too big.")
            }

            function GenerateMinesweeperMatrix(width, height, mines) {
                var matrix = [];
                var matrix_clone = [];

                for (let y = 0; y < height; y++) {
                    matrix.push([]);
                    matrix_clone.push([]);

                    for (let x = 0; x < width; x++) {
                        matrix[y].push(0);
                        matrix_clone[y].push("");
                    }
                }

                for (let i = 0; i < mines; i++) {
                    let x = Math.floor(Math.random() * width);
                    let y = Math.floor(Math.random() * height);

                    while (matrix[y][x] === -1) {
                        x = Math.floor(Math.random() * width);
                        y = Math.floor(Math.random() * height);
                    }

                    matrix[y][x] = -1;
                }

                for (let y = 0; y < matrix.length; y++) {
                    for (let x = 0; x < matrix[y].length; x++) {
                        if (matrix[y][x] !== -1) {
                            let num = 0;

                            if (matrix[y - 1]?.[x - 1] === -1) num++;
                            if (matrix[y - 1]?.[x] === -1) num++;
                            if (matrix[y - 1]?.[x + 1] === -1) num++;
                            if (matrix[y + 1]?.[x - 1] === -1) num++;
                            if (matrix[y + 1]?.[x] === -1) num++;
                            if (matrix[y + 1]?.[x + 1] === -1) num++;
                            if (matrix[y][x - 1] === -1) num++;
                            if (matrix[y][x + 1] === -1) num++;

                            matrix[y][x] = num;
                        }

                        var emojis = [":boom:", ":zero:", ":one:", ":two:", ":three:", ":four:", ":five:", ":six:", ":seven:", ":eight:"];

                        matrix_clone[y][x] = emojis[matrix[y][x] + 1];
                    }
                }

                function findRandomOfNumber(matrix, num) {
                    function findAllOfNumber(matrix, num) {
                        const positions = [];

                        for (let y = 0; y < matrix.length; y++) {
                            for (let x = 0; x < matrix[y].length; x++) {
                                if (matrix[y][x] === num) {
                                    positions.push([y, x]);
                                }
                            }
                        }

                        return positions;
                    }

                    var all = findAllOfNumber(matrix, num);

                    return all[Math.floor(Math.random() * all.length)];
                }

                let num = 0;
                let reveal = findRandomOfNumber(matrix, num);

                while (!reveal) {
                    if (num > 7) {
                        reveal = null;
                        break;
                    }

                    reveal = findRandomOfNumber(matrix, ++num);
                }

                for (let y = 0; y < matrix_clone.length; y++) {
                    for (let x = 0; x < matrix_clone[y].length; x++) {
                        if (reveal && (y !== reveal[0] || x !== reveal[1])) {
                            matrix_clone[y][x] = "||" + matrix_clone[y][x] + "||";
                        }
                    }
                }

                return matrix_clone;
            }

            let mines = this.args.mines?.value || Math.ceil(((width * height) / 100) * 15);
            
            if (mines > Math.ceil(((width * height) / 100) * 75)) {
                return await this.reply("error", "Too many mines (>75%)!");
            }
            
            if (mines < Math.ceil((width * height) / 100) * 5) {
                return await this.reply("error", "Not enough mines (<5%)!");
            }

            let display = (this.args.paste ? "```" : "") +
                GenerateMinesweeperMatrix(width, height, mines).map(row => row.join("")).join("\n") +
                (this.args.paste ? "```" : "");

            if (display.length > 2000) {
                return await this.reply("error", width + "x" + height + " board size too big.");
            }
            
            if (this.args.paste) {
                return await this.replyText(display);
            }

            return await this.reply("success", display);
        }
    }),
    new ModuleCommand({
        name: "Lichess Challenge",
        description: "Challenge another user on lichess.",
        emoji: "<:lichess:" + config.emoji.lichess + ">",
        versions: [
            new CommandVersion(["lichess", "challenge", "chess"], [
                new CommandArgument({
                    name: "user",
                    description: "The user to challenge on lichess.",
                    emoji: "🏷",
                    types: [ArgumentType.Mention, ArgumentType.Any]
                }),
                new CommandArgument({
                    name: "variant",
                    description: "The variant of chess to play",
                    emoji: "<:horsey:" + config.emoji.horsey + ">",
                    types: [new ArgumentType({
                        name: "Variant",
                        description: "A lichess variant.",
                        examples: ["standard", "chess960", "antichess", "threeCheck"],
                        validate: async function isVariant(message, text) {
                            return ~["standard", "chess960", "crazyhouse", "antichess", "atomic", "horde", "kingofthehill", "racingkings", "threecheck"].indexOf(text.toLowerCase())
                        }
                    })],
                    default: "standard"
                }),
                new CommandArgument({
                    name: "control",
                    description: "The custom time control to play.",
                    emoji: "⏰",
                    types: [
                        new ArgumentType({
                            name: "Time Control",
                            description: "A chess time control setting.",
                            examples: ["5+3", "10+0", "2d", "bullet", "blitz", "classical"],
                            validate: /^((((1\/2)|(1\/4)|\d+)(\+\d+)?)|(\d+d)|(blitz)|(rapid)|(bullet)|(classical)(unlimited))$/
                        })
                    ],
                    optional: true,
                    default: "unlimited"
                }),
                new CommandArgument({
                    name: "colour",
                    description: "The colour to play.",
                    emoji: "⚪",
                    types: [new ArgumentType({
                        name: "black/white/random",
                        description: "A chess colour.",
                        examples: ["black", "white"],
                        validate: /^(black)|(white)|(any)$/i
                    })],
                    optional: true,
                    default: "random"
                })
            ])
        ],
		example: "https://i.imgur.com/DUQJIAN.gif",
        callback: async function LichessChallenge(message) {
			const service = this.client.AccountService;
            const account = await service.getAccount(message.author);

            const user_account = this.args.user.type === ArgumentType.Mention ? await service.getAccount(this.args.user.value.user) : null;
            const dest_id = this.args.user.type === ArgumentType.Mention ? user_account.connections.lichess?.id : this.args.user.value;
            
            if (this.args.control) {
                if (/^\d+d$/.test(this.args.control.value)) {
                    const days = parseInt(this.args.control.value.match(/\d+/));

                    if (days < 1 || days > 15) {
                        return await this.reply("error", "Correspondence days must be between `1` and `15`, inclusive.")
                    }
                } else {
                    const control = this.args.control.value.split("+").map(_ => parseInt(_));

                    if (control[0] < 1 || control[0] > 180) {
                        return await this.reply("error", "The time limit must be between `1` and `180`, inclusive.");
                    }

                    if (control[1] > 60) {
                        return await this.reply("error", "The time increment must be between `1` and `60`, inclusive.");
                    }
                }
            }

            if (account.connections.lichess) {
                try {
                    if (dest_id) {
                        const challenger = new lichess.Client(await account.connections.lichess.token());
        
                        challenger.on("ready", async () => {
                            await this.reply("info", "Challenging **" + this.escape(dest_id) + "**..");

                            const user = await challenger.getUser(dest_id);
                            
                            if (account.connections.lichess.id === dest_id) {
                                return await this.edit("error", "You can not challenge yourself.");
                            }

                            const masked = user => "[@" + user.name + "](" + lichess.Client.BASE_URL + "/@/" + user.id + ") (" + user.rating + ")";

                            try {
								const controls = {
									"blitz": "5+0",
									"rapid": "10+0",
									"bullet": "1+0",
									"classical": "30+0"
                                };
								
                                const challenge = await user.challenge({
                                    ...(this.args.control && this.args.control.value !== "unlimited" ? (
                                        /^\d+d$/.test(this.args.control.value) ? {
                                            days: parseInt(this.args.control.value.match(/\d+/))
                                        } : (() => {
											const show = controls[this.args.control.value] || this.args.control.value;
											
                                            const control = show.split("+").map(_ => _[1] === "/" ? _ : parseInt(_));
                                            
                                            return {
                                                time: control[0] === "1/2" ? 30 : control[0] === "1/4" ? 15 : control[0] * 60,
                                                increment: control[1] || 0
                                            }
                                        })()
                                    ) : {}),
                                    variant: lichess.variants[lichess.variants.indexOf(this.args.variant.value.toLowerCase())] || "standard"
                                });

                                const reset_reactions = () => this.replies?.[this.replies.length - 1]?.reactions?.removeAll();
								
								challenge.any({
									"started": async () => {
										const { [challenge.challenger.name]: status } = await challenger.getStatus([challenge.challenger.name]);

										if (!status.online) {
											await this.delete();

											if (challenge.destUser) {
												await this.reply("success", "Match started between " + masked(challenge.challenger) + " and " + masked(challenge.destUser) + ", spectate at " + challenge.url, {
													text: "<@" + message.author.id + ">"
												});
											} else {
												await this.reply("success", "Match started with " + masked(challenge.challenger) + ", spectate at " + challenge.url, {
													text: "<@" + message.author.id + ">"
												});
											}
										} else {
											if (challenge.destUser) {
												await this.edit("success", "Match started between " + masked(challenge.challenger) + " and " + masked(challenge.destUser) + ", spectate at " + challenge.url);
											} else {
												await this.edit("success", "Match started with " + masked(challenge.challenger) + ", spectate at " + challenge.url);
											}
										}

										reset_reactions();
									},
									"declined": async () => {
										await this.edit("success", masked(challenge.destUser) + " declined challenge against " + masked(challenge.challenger));

										reset_reactions();
									},
									"cancelled": async () => {
										await this.edit("success", "Challenge between " + masked(challenge.challenger) + " and " + masked(challenge.destUser) + " was cancelled.");
										
										reset_reactions();
									}
                                }, { timeout: 90000 });
                                
                                challenge.once("ended", async () => {
                                    await this.edit("success", "Match between " + masked(challenge.challenger) + " and " + masked(challenge.destUser) + " ended, post-match analysis at " + challenge.url);

                                    reset_reactions();
                                });

                                if (challenge.destUser) {
									const variant = challenge.variant.key.replace(/([A-Z])/g, " $1").toLowerCase();
									const speed = challenge.speed.replace(/([A-Z])/g, " $1").toLowerCase();
                                    await this.edit("success", "Created " + variant + " " + speed + (challenge.timeControl.show ? " (" + challenge.timeControl.show + ")" : "") + " challenge at " + challenge.url + " against " + masked(challenge.destUser));
                                    
                                    const msg = this.replies[this.replies.length - 1];

                                    await msg.react("❌");

                                    const collector = msg.createReactionCollector((reaction, user) => {
                                        return reaction.emoji.name === "❌" && (user.id === user_account?.id) || user.id === message.author.id;
                                    }, { time: 900000, max: 1 }); // 15 minutes

                                    collector.on("collect", async (reaction, user) => {
                                        if (user.id === message.author.id) {
                                            try {
                                                await challenge.cancel();
                                            } catch (e) {
                                                if (user_account) {
                                                    try {
                                                        await challenge.decline(await user_account.connections.lichess.token());

                                                        return await this.edit("success", "Challenge against " + masked(challenge.destUser) + " was cancelled.");
                                                    } catch (e) {  };
                                                }

                                                return await this.edit("error", "Could not cancel challenge, go to " + challenge.url + " to cancel manually.");
                                            }
                                            
                                            await this.edit("success", "Challenge between " + masked(challenge.challenger) + " and " + masked(challenge.destUser) + " was cancelled.");
                                        } else {
                                            await challenge.decline(await user_account.connections.lichess.token());
                                        }
                                    });

                                    collector.on("end", async () => {
                                        reset_reactions();
                                    });
                                } else {
                                    await this.edit("success", "Created open challenge at " + challenge.url + ", waiting for first user to join.");
                                }
                            } catch (e) {
                                if (e.status === 429) {
                                    return await this.edit("error", "Could not challenge user, please wait a few minutes.");
                                } else if (e.status === 401) {
                                    delete account.connections.lichess;
            
                                    await account.save();
                                } else if (e.status === 404) {
                                    return await this.edit("error", "Could not find user.");
                                } else {
                                    return await this.edit("error", "Could not challenge user, please try again later");
                                }
                            }
                        });
                    } else {
                        if (this.args.user.type === ArgumentType.Mention) {
                            return await this.edit("error", "That user does not have a lichess account connected.");
                        } else {
                            return await this.edit("error", "Could not find user.");
                        }
                    }
                } catch (e) {
                    if (e.status === 429) {
                        return await this.edit("error", "Could not challenge user, please wait a few minutes.");
                    } else if (e.status === 404) {
                        return await this.edit("error", "Could not find user.");
                    } else {
                        return await this.edit("error", "Could not challenge user, please try again later");
                    }
                }
            } else {
                return await this.reply("error", "You do not have a lichess account connected. [Click here to link your account](" + process.env.BASE_API + "/account/connections/lichess)");
            }
        }
    })],
    matches: [new MessageMatcher({
        matches: [/\bpog((ger)|g)?s?\b/i],
        callback: async function PoggersEmote(message) {
            message.react("720687219123421256");
        }
    })]
});