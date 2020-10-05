// Imports
import { CommandInterface, BotModule, ModuleCommand, MessageMatcher, CommandVersion, CommandArgument, CommandSyntax, ArgumentType } from "../../../service/ModuleService.js"

import { p, is } from "../../../util/plural.js"

import client from "../../index.js"

export default new BotModule({
    name: "Music",
    description: "Commands for moderation and the server.",
    emoji: "🎶",
    commands: [
        new ModuleCommand({
            name: "Play",
            description: "Play a song from spotify or youtube.",
            emoji: "▶",
            versions: [
                new CommandVersion(["play", "p"], [
                    new CommandArgument({
                        name: "track",
                        description: "The song to play.",
                        emoji: "💿",
                        types: [ArgumentType.Text]
                    })
                ])
            ],
            callback: async function PlayMusic(message) {
                const player = client.MusicService.getPlayer(message.guild);

                if (message.member.voice?.channelID) {
                    await player.connectTo(message.member.voice.channel);

                    try {
                        const song = await client.MusicService.findSong(this.args.track.value);

                        player.queue.push(song);

                        return await this.reply("success", "Added song to queue. (" + p(player.queue.length, "song") + ")", {
                            fields: [song.display()],
                            thumbnail: {
                                url: song.data.albumCover
                            }
                        });
                    } catch (e) {
                        return await this.reply("success", "Could not add song to queue. " + e.toString());
                    }
                } else {
                    return await this.reply("error", "You must be in a voice channel to use this command.");
                }
            }
        }),
        new ModuleCommand({
            name: "Queue",
            description: "Get the current song queue.",
            emoji: "📜",
            versions: [
                new CommandVersion(["queue", "que", "q"], [])
            ],
            callback: async function MusicQueue(message) {
                const player = client.MusicService.getPlayer(message.guild);
                const ql = player.queue.length;

                if (ql) {
                    return await this.createPages("success", "There " + is(ql) + " " + p(ql, "song") + " in the queue.", player.queue.map((song, i) => {
                        const display = song.displaySnippet();

                        return {
                            title: (i + 1) + ". " + display.title + (i === player.current ? " ⬅" : ""),
                            body: display.body
                        }
                    }));
                } else {
                    return await this.reply("success", "The queue is empty.");
                }
            }
        }),
        new ModuleCommand({
            name: "Skip",
            description: "Skip the current song.",
            emoji: "⏩",
            versions: [
                new CommandVersion(["skip", "s"], [
                    new CommandArgument({
                        name: "amount",
                        description: "The number of songs to skip.",
                        emoji: "🎞",
                        types: [ArgumentType.UnsignedInteger],
                        default: 1
                    })
                ])
            ],
            callback: async function SkipSong(message) {
                const player = client.MusicService.getPlayer(message.guild);

                if (player.queue[player.current]) {
                    player.skip(this.args.amount.value);

                    return await this.reply("success", "Successfully skipped " + p(this.args.amount.value, "song") + ".")
                } else {
                    return await this.reply("success", "There is no song to skip.");
                }
            }
        }),
        new ModuleCommand({
            name: "Remove",
            description: "Remove a song or multiple songs from the queue.",
            emoji: "📤",
            versions: [
                new CommandVersion(["remove", "r"], [
                    new CommandArgument({
                        name: "songs",
                        description: "The song range to remove.",
                        emoji: "🎞",
                        types: [ArgumentType.UnsignedIntegerRange]
                    })
                ]),
                new CommandVersion(["remove", "r"], [
                    new CommandArgument({
                        name: "song",
                        description: "The song to remove.",
                        emoji: "🎞",
                        types: [ArgumentType.UnsignedInteger, ArgumentType.Text],
                        optional: true
                    })
                ])
            ],
            callback: async function RemoveSongs(message) {
                const player = client.MusicService.getPlayer(message.guild);

                if (this.args.song) {
                    const index = this.args.song.type === ArgumentType.UnsignedInteger ?
                        this.args.song.value - 1:
                        player.queue.findIndex(song => ~song.data.name.toLowerCase().indexOf(this.args.song.value));

                    const song = player.queue[index];

                    if (this.args.song.type === ArgumentType.Text && !~index) {
                        return await this.reply("error", "Song not found.");
                    }

                    if (index < 1 || index > player.queue.length) {
                        return await this.reply("error", "Song out of range.");
                    }

                    player.queue.splice(index, 1);

                    if (player.current === index) {
                        player.skip();

                        player.current--;
                    } else if (this.current > index) {
                        player.current--;
                    }

                    return await this.reply("success", "Removed song from queue.", {
                        fields: [song.displaySnippet()]
                    });
                } else if (this.args.songs) {
                    const song = this.args.songs.value.min;
                    const songs = this.args.songs.value.max - this.args.songs.value.min;
                }

                const song = this.args.songs ? this.args.songs.value.min : this.args.song.value;
                const songs = this.args.songs ? this.args.songs.value.max - this.args.songs.value.min : 1;

                if (song < 1 || song + songs > player.queue.length + 1) {
                    if (this.args.songs) {
                        return await this.reply("error", "Songs out of range.");
                    } else {
                        return await this.reply("error", "Song out of range.");
                    }
                }

                player.queue.splice(song - 1, songs);

                let doSkip = player.current >= song && player.current < song + songs;

                if (this.current >= song) {
                    if (this.current < song + songs) {
                        this.current -= (this.current - (song + 1));
                    } else {
                        this.current -= songs;
                    }
                }

                if (doSkip) {
                    player.skip();
                }
            }
        })
    ]
});