// Imports
import { CommandInterface, BotModule, ModuleCommand, MessageMatcher, CommandVersion, CommandArgument, CommandSyntax, ArgumentType } from "../../../service/ModuleService.js"

import { p, is } from "../../../util/plural.js"

import client from "../../index.js"

export default new BotModule({
    name: "Music",
    description: "Commands for moderation and the server.",
    emoji: "🎶",
    beta: true,
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

                if (!message.member.voice?.channel) {
                    return await this.reply("error", "You must be in a voice channel to use this command.");
                }
                
                if (!player.channel?.id || message.member.voice.channelID !== player.channel?.id) {
                    return await this.reply("error", "You must be in the voice channel to use this command.");
                }

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

                if (!message.member.voice?.channel) {
                    return await this.reply("error", "You must be in a voice channel to use this command.");
                }
                
                if (!player.channel?.id || message.member.voice.channelID !== player.channel?.id) {
                    return await this.reply("error", "You must be in the voice channel to use this command.");
                }

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
                
                if (!message.member.voice?.channel) {
                    return await this.reply("error", "You must be in a voice channel to use this command.");
                }

                if (!player.channel?.id || message.member.voice.channelID !== player.channel?.id) {
                    return await this.reply("error", "You must be in the voice channel to use this command.");
                }

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
                
                if (!message.member.voice?.channel) {
                    return await this.reply("error", "You must be in a voice channel to use this command.");
                }
                
                if (!player.channel?.id || message.member.voice.channelID !== player.channel?.id) {
                    return await this.reply("error", "You must be in the voice channel to use this command.");
                }

                if (this.args.song) {
                    const index = this.args.song.type === ArgumentType.UnsignedInteger ?
                        this.args.song.value - 1:
                        player.queue.findIndex(song => ~song.data.name.toLowerCase().indexOf(this.args.song.value));

                    const song = player.queue[index];

                    if (this.args.song.type === ArgumentType.Text && !~index) {
                        return await this.reply("error", "Song not found.");
                    }

                    if (index < 0 || index > player.queue.length) {
                        return await this.reply("error", "Song out of range.");
                    }

                    if (player.current === index) {
                        player.skip();
                        
                        player.queue.splice(index, 1);
                        player.current--;
                    } else if (player.current > index) {
                        player.queue.splice(index, 1);

                        player.current--;
                    } else { // if (player.current < index) {
                        player.queue.splice(index, 1);
                    }

                    return await this.reply("success", "Removed song from queue.", {
                        fields: [song.displaySnippet()]
                    });
                } else if (this.args.songs) {
                    const index = this.args.songs.value.min - 1;
                    const length = (this.args.songs.value.max - this.args.songs.value.min) + 1;

                    if (index < 0 || index + length > player.queue.length) {
                        return await this.reply("error", "Songs out of range.");
                    }

                    if (player.current >= index && player.current < index + length) {
                        player.skip();

                        player.queue.splice(index - 1, length);
                        player.current = index;
                    } else if (player.current >= index + length) {
                        player.queue.splice(index -1, length);
                        player.current -= length;
                    } else { // if (player.current < index)
                        player.queue.splice(index - 1, length);
                    }

                    return await this.reply("success", "Removed " + p(length, "song") + " from the queue.");
                }
            }
        }),
        new ModuleCommand({
            name: "Loop",
            description: "Loop the current song that is playing.",
            emoji: "🔁",
            versions: [
                new CommandVersion(["loop", "l"], [])
            ],
            callback: async function LoopSong(message) {
                const player = client.MusicService.getPlayer(message.guild);

                if (!message.member.voice?.channel) {
                    return await this.reply("error", "You must be in a voice channel to use this command.");
                }
                
                if (!player.channel?.id || message.member.voice.channelID !== player.channel?.id) {
                    return await this.reply("error", "You must be in the voice channel to use this command.");
                }

                const current = player.queue[player.current];

                if (current) {
                    current.loop = !current.loop;

                    if (current.loop) {
                        await this.reply("Now looping current song! 🔁");
                    } else {
                        await this.reply("Stopped looping current song. ↪");
                    }
                } else {
                    return await this.reply("There is no song playing.");
                }
            }
        })
    ]
});