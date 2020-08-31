import LichessClient from "../Client.js"

import EventEmitter from "../util/EventEmitter2.js"

/**
 * @typedef JSONChallengeTimeControl
 * @property {Number} increment The number of seconds to get added per move.
 * @property {Number} limit The number of seconds that the players start off with.
 * @property {String} show The display for the time control. (x+y)
 * @property {String} type
 */

/**
 * @typedef JSONChallengeVariant
 * @property {String} key The back-end name of the variant.
 * @property {String} name The display name of the variant.
 * @property {String} short The shortened display name of the variant.
 */

/**
 * @typedef JSONChallengeUser
 * @property {String} id The ID of the user.
 * @property {String} name The name of the user.
 * @property {Boolean} online Whether or not the user is online.
 * @property {Boolean} provisional,
 * @property {Number} rating The rating of the user.
 * @property {String} title The title of the user.
 */

/**
 * @typedef JSONChallengePerf
 * @property {String} icon The icon of the match. (For use with the Lichess font.)
 * @property {String} name The name of the performance.
 */

 
/**
 * @typedef JSONChallenge
 * @property {String} id The ID of the match.
 * @property {String} url The URL of the match.
 * @property {String} color The colour of the match.
 * @property {String} direction The direction of the challenge from the perspective of the authorised user.
 * @property {JSONChallengeTimeControl} timeControl The timing settings for the match.
 * @property {JSONChallengeVariant} variant The variant of the match.
 * @property {JSONChallengeUser} challenger The challenger of the match.
 * @property {JSONChallengeUser} destUser The user who has been challenged.
 * @property {JSONChallengePerf} perf The performance of the match.
 * @property {Boolean} rated Whether or not the match is rated.
 * @property {String} speed The speed of the match. (blitz, bullet, superbullet, etc.)
 * @property {String} status The status of the match request.
 */

/**
 * Represents a incoming or outgoing challenge on Lichess.
 * @extends {EventEmitter}
 */
export default class Challenge extends EventEmitter {
    /**
     * Instantiate a lichess challenge object.
     * @param {LichessClient} client The client that is instantiating this object.
     * @param {JSONChallenge} raw The raw response information to construct the challenge.
     */
    constructor(client, raw) {
        super();

        /**
         * The client that instantiated this object.
         * @type {LichessClient}
         */
        this.client = client;

        /**
         * The ID of the challenge.
         * @type {String}
         */
        this.id = raw.id;

        /**
         * The URL of the challenge.
         * @type {String}
         */
        this.url = raw.url;

        /**
         * The colour of the challenger.
         * @type {"random"|"black"|"white"}
         */
        this.color = raw.color;

        /**
         * The direction of the challenge.
         * @type {"in"|"out"}
         */
        this.direction = raw.direction;

        /**
         * The time control of the challenge.
         * @type {JSONChallengeTimeControl}
         */
        this.timeControl = raw.timeControl;

        /**
         * The variant of the challenge.
         * @type {JSONChallengeVariant}
         */
        this.variant = raw.variant;

        /**
         * The challenger.
         * @type {JSONChallengeUser}
         */
        this.challenger = raw.challenger;

        /**
         * The destination user.
         * @type {JSONChallengeUser}
         */
        this.destUser = raw.destUser;

        /**
         * The performance of the challenge.
         * @type {JSONChallengePerf}
         */
        this.perf = raw.perf;

        /**
         * Whether or not the challenge is rated.
         * @type {Boolean}
         */
        this.rated = raw.rated;

        /**
         * The speed of the challenge.
         * @type {String}
         */
        this.speed = raw.speed;

        /**
         * The status of the challenge.
         * @type {String}
         */
        this.status = raw.status;
		
		this.client.any({
			"gameStart": ({ id }) => {
				if (id === this.id) {
					this.emit("started", { id });
				}
			},
			"challengeCancelled": challenge => {
				if (challenge.id === this.id) {
					this.emit("cancelled", challenge);
				}
			},
			"challengeDeclined": challenge => {
				if (challenge.id === this.id) {
					this.emit("declined", challenge);
				}
			}
        }, { timeout: 90000 } ); // 1 1/2 hours
        
        this.client.once("gameFinish", ({ id }) => {
            if (id === this.id) {
                this.emit("ended", { id });
            }
        });
    }

    /**
     * Cancel the challenge.
     * @returns {Promise}
     */
    async cancel() {
        await this.client.post("/challenge/" + this.id + "/cancel");
    }

    /**
     * Decline the challenge on behalf of the destination user.
     * @param {String} auth The oauth2 authentication token for the other user.
     * @returns {Promise}
     */
    async decline(auth) {
        await this.client.post("/challenge/" + this.id + "/decline", {
            headers: {
                Authorization: auth
            }
        });
    }

    /**
     * Accept the challenge on behalf of the destination user.
     * @param {String} auth The oauth2 authentication token for the other user.
     * @returns {Promise}
     */
    async accept(auth) {
        await this.client.post("/challenge/" + this.id + "/accept", {
            headers: {
                Authorization: auth
            }
        });
    }
}