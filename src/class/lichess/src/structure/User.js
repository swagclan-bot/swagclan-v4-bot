import LichessClient from "../Client.js"
import Challenge from "./Challenge.js"

/**
 * @typedef JSONProfile
 * @property {String} bio The bio of the user.
 * @property {String} country The country code of the user.
 * @property {String} firstName the first name of the user.
 * @property {String} lastName The last name of the user.
 * @property {String} links The links of the user separated by newlines.
 * @property {String} location The location of the user.
 */

/**
 * @typedef JSONUserCounts
 * @property {Number} ai The number of games that the user has played against AI.
 * @property {Number} all The number of games that the user has played.
 * @property {Number} bookmarked The number of games that the user has bookmarked.
 * @property {Number} draw The number of games that the user has drawn.
 * @property {Number} drawH
 * @property {Number} import The number of games that the user has imported.
 * @property {Number} loss The number of games that the user has lost.
 * @property {Number} lossH
 * @property {Number} me The number of games that the user has played against the client user.
 * @property {Number} playing The number of games that the user is currently playing.
 * @property {Number} rated The number of games that the user has played competitively.
 * @property {Number} win The number of games that the user has won.
 * @property {Number} winH
 */

/**
 * @typedef JSONGamePerf
 * @property {Number} games The number of games that the user has played in this gamemode.
 * @property {Number} prog
 * @property {Number} rating The rating of the user in this gamemode.
 * @property {Number} rd
 */

/**
 * @typedef JSONPlayTime
 * @property {Number} total The number of seconds that the user has spent playing in total.
 * @property {Number} tv The number of seconds that the user has spent watching games.
 */

/**
 * @typedef JSONUser
 * @property {String} id The ID of the user.
 * @property {String} username The username of the user.
 * @property {String} title The professional chess title of the user.
 * @property {Boolean} online Whether or not the user is online.
 * @property {Boolean} playing Whether or not the user is playing.
 * @property {Boolean} streaming Whether or not the user is streaming.
 * @property {Number} createdAt When the user was created.
 * @property {Number} seenAt When the user was last seen.
 * @property {JSONProfile} profile The profile of the user.
 * @property {Number} nbFollowers The number of followers that the user has.
 * @property {Number} nbFollowing The number of users that the user is following.
 * @property {Number} completionRate
 * @property {String} language The language of the user.
 * @property {JSONUserCounts} count The counts of different games for the user.
 * @property { { [key: string]: JSONGamePerf } } perfs The user's stats for different games.
 * @property {Boolean} patron Whether or not the user is a JSON patron.
 * @property {Boolean} disabled Whether or not the user's account is disabled.
 * @property {Boolean} engine Whether or not the user's account is an engine account.
 * @property {Boolean} booster Whether or not the user's account is a booster account.
 * @property {JSONPlayTime} playTime The number of seconds that the user has spent playing in total and watching games.
 */

/**
 * @typedef ChallengeOptions
 * @property {Boolean} [rated] Whether or not the challenge should be rated.
 * @property {Number} [time] The clock starting time in seconds.
 * @property {Number} [increment] The number of seconds to increment the timer each move.
 * @property {Number} [days] The number of days to be given to each side.
 * @property {"random"|"black"|"white"} [color] The colour to be on the board.
 * @property {"standard"|"chess960"|"crazyhouse"|"antichess"|"atomic"|"horde"|"kingOfTheHill"|"racingKings"|"threeCheck"} [variant] The variant of the game to play.
 * @property {String} [fen] The FEN code of the starting position for the game.
 */

/**
 * @typedef UserStatus
 * @property {Boolean} online Whether or not the user is online.
 * @property {Boolean} playing Whether or not the user is playing.
 * @property {Boolean} streaming Whether or not the user is streaming.
 * @property {Boolean} patron Whether or not the user is a patron.
 */

/**
 * Represents a user on lichess
 */
export default class User {
    /**
     * Instantiate a user object.
     * @param {LichessClient} client The client that is instantiating this object.
     * @param {JSONUser} raw The raw information to construct the user with.
     */
    constructor(client, raw) {
        /**
         * The client that is instantiating this object.
         * @type {LichessClient}
         */
        this.client = client;

        /**
         * The ID of the user.
         * @type {String}
         */
        this.id = raw.id;

        /**
         * The username of the user.
         * @type {String}
         */
        this.username = raw.username;

        /**
         * The title of the user.
         * @type {String}
         */
        this.title = raw.title;

        /**
         * Whether or not the user is online.
         * @type {Boolean}
         */
        this.online = raw.online;

        /**
         * Whether or not the user is playing.
         * @type {Boolean}
         */
        this.playing = raw.playing;

        /**
         * Whether or not the user is streaming.
         * @type {Boolean}
         */
        this.streaming = raw.streaming;

        /**
         * When the user was created.
         * @type {Number}
         */
        this.createdAt = raw.createdAt;

        /**
         * When the user was last seen.
         * @type {Number}
         */
        this.seenAt = raw.seenAt;

        /**
         * The profile of the user.
         * @type {JSONProfile}
         */
        this.profile = raw.profile ? {
            bio: raw.profile.bio,
            country: raw.profile.country,
            firstName: raw.profile.firstName,
            lastName: raw.profile.lastName,
            links: raw.profile.links.split("\n"),
            location: raw.profile.location   
        } : null;

        /**
         * The number of followers that the user has.
         * @type {Number}
         */
        this.followers = raw.nbFollowers;

        /**
         * The number of users that the user is following.
         * @type {Number}
         */
        this.following = raw.nbFollowing;

        /**
         * @type {Number}
         */
        this.completionRate = raw.completionRate;

        /**
         * The language code of the user.
         * @type {String}
         */
        this.language = raw.language;

        /**
         * The counts of various different games.
         * @type {JSONUserCounts}
         */
        this.count = raw.count;

        /**
         * The user performance of different game modes.
         * @type {JSONGamePerf}
         */
        this.perfs = raw.perfs;

        /**
         * Whether or not the user is a lichess patron.
         * @type {Boolean}
         */
        this.patron = raw.patron;

        /**
         * Whether or not the user's account is disabled.
         * @type {Boolean}
         */
        this.disabled = raw.disabled;

        /**
         * Whether or not the user's account is an engine account.
         * @type {Boolean}
         */
        this.engine = raw.engine;

        /**
         * Whether or not the user's account is a booster account.
         * @type {Boolean}
         */
        this.booster = raw.booster;

        /**
         * The playtime of the user.
         * @type {JSONPlayTime}
         */
        this.playTime = raw.playTime;
    }

    /**
     * Challenge the user.
     * @param {ChallengeOptions} [options] The challenge match options.
     * @returns {Promise<Challenge>}
     */
    async challenge(options={}) {
        return await this.client.challengeUser(this.username, options);
    }

    /**
     * Get the status off the user.
     * @returns {Promise<UserStatus>}
     */
    async getStatus() {
        const { [this.id]: user } = await this.client.getStatus([this.id]);

        return user;
    }
}