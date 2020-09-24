import FormData from "form-data"
import fetch from "node-fetch"

import EventEmitter from "./util/EventEmitter2.js"

import Challenge from "./structure/Challenge.js"
import User from "./structure/User.js"

import runtime_config from "../../../src/runtime.cfg.js"

/**
 * @callback GetAuthorisation
 * @returns {String}
 */

/**
 * @typedef IncompleteGame
 * @property {String} id The ID of the game.
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

const ldev = runtime_config.lichessdev;

/**
 * Represents a lichess client.
 * @extends {EventEmitter}
 */
export default class LichessClient extends EventEmitter {    
    /**
     * The base lichess hostname to use.
     * @type {String}
     */
    static BASE_HOST = ldev ? "localhost:9663" : "lichess.org"

    /**
     * The base lichess URL to use.
     * @type {String}
     */
    static BASE_URL = ldev ? "http://localhost:9663" : "https://lichess.org"

    static BASE_OAUTH = ldev ? "http://localhost:0000" : "https://oauth.lichess.org"

    /**
     * The base lichess API URL to use.
     * @type {String}
     */
    static BASE_API = ldev ? "http://localhost:9663/api" : "https://lichess.org/api"

    /**
     * Instantiate a lichess client.
     * @param {String} [auth] The oauth2 authorisation token provided.
     */
    constructor(auth) {
        super();

        /**
         * Get the authorisation token.
         * @returns {GetAuthorisation}
         */
        this.auth = () => auth;

        /**
         * The stream to read events in realtime.
         * @type {ReadableStream}
         */
        this.stream = null;

        if (auth) {
            fetch(LichessClient.BASE_API + "/stream/event", {
                headers: {
                    Authorization: auth
                }
            }).then(async res => {
                this.emit("ready");

                this.stream = res.body;

                this.stream.on("data", async chunk => {
                    const data = chunk.toString().trim();

                    if (data) {
                        const messages = data.split("\n");

                        for (let i = 0; i < messages.length; i++) {
                            try {
                                const {type: op, ...json } = JSON.parse(messages[i]);

                                switch (op) {
                                    case "gameStart":
                                        this.emit("gameStart", json.game);
                                        break;

                                    case "gameFinish":
                                        this.emit("gameFinish", json.game);
                                        break;

                                    case "challenge":
                                        this.emit("challenge", new Challenge(this, json.challenge));
                                        break;

                                    case "challengeCanceled":
                                        this.emit("challengeCancelled", new Challenge(this, json.challenge));
                                        break;
                                        
                                    case "challengeDeclined":
                                        this.emit("challengeDeclined", new Challenge(this, json.challenge));
                                        break;

                                    default:
                                        this.emit(op, json);
                                        break;
                                }
                            } catch (e) {
                                this.emit("error", e);
                            }
                        }
                    }
                });

                this.stream.on("end", () => console.log("Ended"));
            }).catch(console.log);
        }
    }
	
	/**
	 * A hooked emitter function.
	 * @param {String} ev The name of the event to call.
	 * @param {...any} args The arguments to pass to the event.
	*/
	async emit(ev, ...args) {
		super.emit(ev, ...args);
	}
    
    /**
     * Make a request to lichess servers.
     * @param {String} path The path to make a request to.
     * @param {fetch.RequestInit} [options] The options for the request.
     */
    async make(method, path, options = {}) {
        if (this.auth()) {
            if (!options.headers) options.headers = {};

            if (!options.headers.Authorization) options.headers.Authorization = this.auth();
        }

        const res = await fetch(LichessClient.BASE_API + path, {
            ...options,
            method
        });

        if (res.status === 200) {
            if (~res.headers.get("Content-Type").indexOf("application/json")) {
                const body = await res.text();

                try {
                    return JSON.parse(body);
                } catch (e) {
                    return body;
                }
            } else {
                return await res.text();
            }
        } else {
            throw res;
        }
    }

    /**
     * Make a GET request to lichess servers.
     * @param {String} path The path to make a request to.
     * @param {fetch.RequestInit} [options] The options for the request.
     */
    async get(path, options) {
        return await this.make("GET", path, options);
    }

    /**
     * Make a POST request to lichess servers.
     * @param {String} path The path to make a request to.
     * @param {fetch.RequestInit} [options] The options for the request.
     */
    async post(path, options) {
        return await this.make("POST", path, options);
    }

    /**
     * Make a PUT request to lichess servers.
     * @param {String} path The path to make a request to.
     * @param {fetch.RequestInit} [options] The options for the request.
     */
    async put(path, options) {
        return await this.make("PUT", path, options);
    }

    /**
     * Make a DELETE request to lichess servers.
     * @param {String} path The path to make a request to.
     * @param {fetch.RequestInit} [options] The options for the request.
     */
    async del(path, options) {
        return await this.make("DELETE", path, options);
    }
    
    /**
     * Get a user by their username, or get the client user if no username is provided.
     * @param {String} [username] The username of the user to get.
     * @returns {Promise<User>}
     */
    async getUser(username) {
		if (username) {
			return new User(this, await this.get("/user/" + username));
		} else {
			if (this.auth) {
				return new User(this, await this.get("/account"));
			} else {
				throw { status: 404 };
			}
		}
    }

    /**
     * Challenge a user by their username.
     * @param {String} [username] The username of the user to challenge.
     * @param {ChallengeOptions} [options] The challenge match options.
     * @returns {Promise<Challenge>}
     */
    async challengeUser(username, options={}) {
        const form = new URLSearchParams;

        if (typeof options.rated     !== "undefined") form.append("rated", options.rated);
        if (typeof options.time      !== "undefined") form.append("clock.limit", options.time);
        if (typeof options.increment !== "undefined") form.append("clock.increment", options.increment);
        if (typeof options.days      !== "undefined") form.append("days", options.days);
        if (typeof options.color     !== "undefined") form.append("color", options.color);
        if (typeof options.variant   !== "undefined") form.append("variant", options.variant);
        if (typeof options.fen       !== "undefined") form.append("fen", options.fen);
    
        const json = await this.post("/challenge/" + (username || ""), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: form
        });
    
        return new Challenge(this, json.challenge);
    }

    /**
     * Get the status of several users.
     * @param {Array<String>|String} ids The IDs of the users to get.
     * @returns {Promise<{ [key: string]: UserStatus } }
     */
    async getStatus(ids) {
        if (!Array.isArray(ids)) {
            const { [ids]: status } = await this.getStatus([ids]);

            return status;
        }

        const users = await this.get("/users/status?ids=" + ids.join(","));

        return Object.fromEntries(users.map(user => {
            const { id, name, ...status } = user;

            return [id, {
                online: false,
                playing: false,
                streaming: false,
                patron: false,
                title: "",
    
                ...status
            }];
        }));
    }
}