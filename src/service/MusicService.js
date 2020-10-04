// Imports
import { SwagClan } from "../class/SwagClan.js"

import { Service } from "./Service.js"

import discord from "discord.js"

import client from "../client/index.js"

import StreamingProvider from "./streaming/StreamingProvider.js"
import youtube from "./streaming/youtube.js"
import spotify from "./streaming/spotify.js"

/**
 * @typedef SongData
 * @property {String} name The name of the song.
 * @property {String} authors The author of the song.
 * @property {String} album The album of the song.
 * @property {String} description The description of the song.
 * @property {String} release_date The release date of the song.
 * @property {String} id The ID of the song.
 * @property {Array<String>} authorIds The ID of the authors.
 * @property {String} albumId The ID of the song's album.
 * @property {String} url The URL of the song.
 * @property {Array<String>} authorURLs The URLs of the song authors.
 * @property {String} albumURL The URL of the song album.
 * @property {String} streamURL The URL of where the song can be streamed.
 * @property {String} albumCover The URL of the album's cover image.
 * @property {Number} duration The duration of the song in milliseconds.
 */

/**
 * @callback EmbedSnippet
 * @property {String} title The title of the embed.
 * @property {String} description The description of the embed.
 */

/**
 * Represents a song in a queue.
 */
class Song {
    /**
     * Instantiate a song.
     * @param {StreamingProvider} provider The streaming provider for the song.
     * @param {any} data The song data.
     */
    constructor(provider, data) {
        /**
         * The streaming provider for the song.
         * @type {StreamingProvider}
         */
        this.provider = provider;

        /**
         * The song data.
         * @type {SongData}
         */
        this.data = data;

        /**
         * The broadcast that the song is playing through.
         * @type {discord.StreamDispatcher}
         */
        this.dispatcher = null;

        /**
         * Whether or not the song should be looped.
         * @type {Boolean}
         */
        this.loop = false;
    }

    /**
     * Display the song in an embed.
     * @returns {EmbedSnippet}
     */
    display() {
        return {
            title: this.data.name,
            body: `
*Released ${this.data.release_date}${this.data.album ? "\nIn [" + this.data.album + "](" + this.data.albumURL + ")" : ""}
By ${this.data.authors.map((author, i) => "[" + author + "](" + this.data.authorURLs[i] + ")").join(", ")}*

${this.data.description || "No description."}
            `.trim()
        }
    }
    
    /**
     * Display the song in an snippet embed.
     * @returns {EmbedSnippet}
     */
    displaySnippet() {
        return {
            title: this.data.name,
            body: `
*Released ${this.data.release_date}
By ${this.data.authors.map((author, i) => "[" + author + "](" + this.data.authorURLs[i] + ")").join(", ")}*
            `.trim()
        }
    }

    /**
     * Stream the song through a readable stream.
     * @returns {ReadableStream}
     */
    stream() {
        return this.provider.stream(this.data);
    }
}

/**
 * Represents a queue for songs.
 * @extends {Array<Song>}
 */
class SongQueue extends Array {
    /**
     * Instantiate a song queue.
     * @param {MusicPlayer} player The player that this queue is for.
     */
    constructor(player) {
        super();

        /**
         * The player that this queue is for.
         * @type {MusicPlayer}
         */
        this.player = player;

        /**
         * The service that this queue is for.
         * @type {MusicService}
         */
        this.service = player.service;
    }

    /**
     * Add a song to the queue.
     * @param {Song} song The song to add.
     */
    push(song) {
        super.push(song);

        if (this.length === 1 || this.player.current >= this.length - 1) {
            this.player.play();
        }
    }

    /**
     * Clear the queue.
     */
    clear() {
        const current = this[this.player.current];
        
        this.splice(0);
        
        if (current) current.dispatcher.end();
    }
}

/**
 * Represents a music player for a server.
 */
class MusicPlayer {
    /**
     * Instantiate a music player.
     * @param {MusicService} service The service that the player is playing music for.
     * @param {discord.Guild} guild The guild that the player is playing music for.
     */
    constructor(service, guild) {
        /**
         * The service that the player is playing music for.
         * @type {MusicService}
         */
        this.service = service;

        /**
         * The music queue.
         * @type {SongQueue}
         */
        this.queue = new SongQueue(this);

        /**
         * The song that is currently playing.
         * @type {Number}
         */
        this.current = 0;

        /**
         * The guild that the player is playing music for.
         * @type {discord.Guild}
         */
        this.guild = guild;
        
        /**
         * The voice connection for the player.
         * @type {discord.VoiceConnection}
         */
        this.connection = null;

        /**
         * The volume of the player.
         * @type {Number}
         */
        this.volume = 1;

        /**
         * Whether or not to loop the queue.
         * @type {Boolean}
         */
        this.loop = false;
    }

    get channel() {
        return this.connection?.channel;
    }

    /**
     * Connect to a voice channel.
     * @param {discord.ChannelResolvable} channelResolvable The channel to connect to.
     * @returns {discord.VoiceConnection}
     */
    async connectTo(channelResolvable) {
        /** @type {discord.VoiceChannel} */
        const channel = client.channels.resolve(channelResolvable);

        if (channel && channel.type === "voice") {
            this.connection = await channel.join();
            const state = channel.members?.get(client.user.id)?.voice;

            if (state) {
                return this.connection;
            } else {
                try {
                    await this.connection.disconnect();
                } catch (e) {}

                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * Skip to the next song in the queue.
     * @type {Number} The number of songs to skip
     */
    skip(num=1) {
        const current = this.queue[this.current];

        if (num <= 0) {
            return;
        }

        if (current) {
            this.current += num - 1;

            current.loop = false;
            current.dispatcher.end();
        }
    }

    /**
     * Play the next song in the queue.
     */
    async play() {
        const current = this.queue[this.current];

        if (current) {
            current.dispatcher = this.connection.play(await current.stream());

            current.dispatcher.setVolume(this.volume);

            current.dispatcher.on("close", () => {
                current.dispatcher = null;

                if (current.loop) {
                    return this.play();
                }
                
                this.current++;

                if (this.current < this.queue.length) {
                    return this.play();
                }
            });
        }
    }

    /**
     * Stop the player.
     */
    async stop() {
        const current = this.queue[this.current];

        if (current) {
            this.queue.clear();
            
            current.dispatcher.end();

            await this.channel.leave();

            this.channel = null;
            this.connection = null;
        }
    }

    /**
     * Pause the current song.
     */
    pause() {
        const current = this.queue[this.current];

        if (current) {
            current.dispatcher.pause();
        }
    }
    
    /**
     * Pause the current song.
     */
    resume() {
        const current = this.queue[this.current];

        if (current) {
            current.dispatcher.resume();
        }
    }

    /**
     * Disconnect the bot from the voice channel.
     */
    async disconnect() {
        await this.connection.disconnect();

        this.channel = null;
        this.connection = null;
        this.state = null;
    }
}

/**
 * Represents a service dedicated to managing bot music.
 * @extends Service
 */
export class MusicService extends Service {
    /**
     * Instantiate the voice service.
     * @param {SwagClan} client The client that instantiated this service.
     */
    constructor(client) {
        super(client);

        /**
         * The music players for this service.
         * @type {discord.Collection<String,MusicPlayer>}
         */
        this.players = new discord.Collection;

        /**
         * Music streaming providers to stream from.
         * @type {Array<StreamingProvider>}
         */
        this.providers = [
            spotify,
            youtube
        ];
    }

    /**
     * Search a song across all providers.
     * @param {String} search The search term to find a song by.
     * @returns {Promise<Song>}
     */
    async findSong(search) {
        for (let i = 0; i < this.providers.length; i++) {
            if (this.providers[i].regex.test(search)) {
                return new Song(this.providers[i], await this.providers[i].resolve(search));
            }
        }

        return null;
    }

    /**
     * Get a guild's music player.
     * @param {discord.GuildResolvable} guildResolvable The guild to get the player for.
     * @returns {MusicPlayer}
     */
    getPlayer(guildResolvable) {
        const guild = client.guilds.resolve(guildResolvable);

        if (guild) {
            const player = this.players.get(guild.id);

            if (player) {
                return player;
            } else {
                this.players.set(guild.id, new MusicPlayer(this, guild));

                return this.getPlayer(guild);
            }
        } else {
            return null;
        }
    }
}