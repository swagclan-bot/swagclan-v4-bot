import fetch from "node-fetch"
import constants from "./constants.js"

/**
 * @typedef {String} SoundURL
 */

/**
 * @typedef WordDefinition
 * @property {String} definition
 * @property {String} permalink
 * @property {Number} thumbs_up
 * @property {Array<SoundURL>} sound_urls
 * @property {String} author
 * @property {String} word
 * @property {Number} defid
 * @property {String} current_vote
 * @property {String} written_on
 * @property {String} example
 * @property {Number} thumbs_down
 */

/**
 * Get a definition by it's ID.
 * @param {Number} defid The ID of the definition.
 * @returns {WordDefinition}
 */
export async function getDefinition(defid) {
    const res = await fetch(constants.BASE_API + "/define?defid=" + defid);

    if (res.status === 200) {
        const terms = await res.json();

        if (terms.list && terms.list.length) {
            return terms.list[0];
        } else {
            throw {
                code: 404,
                res
            }
        }
    } else {
        throw {
            code: res.status,
            res
        }
    }
}

/**
 * Get definitions for a word.
 * @param {string} term
 * @returns {Array<WordDefinition>}
 */
export async function getDefinitions(term) {
    const res = await fetch(constants.BASE_API + "/define?term=" + encodeURIComponent(term));

    if (res.status === 200) {
        const terms = await res.json();

        if (terms.list && terms.list.length) {
            return terms.list;
        } else {
            throw {
                code: 404,
                res
            }
        }
    } else {
        throw {
            code: res.status,
            res
        }
    }
}

/**
 * Get a random word definition.
 * @returns {WordDefinition}
 */
export async function getRandom() {
    const res = await fetch(constants.BASE_API + "/random");

    if (res.status === 200) {
        const terms = await res.json();

        if (terms.list && terms.list.length) {
            return terms.list[0];
        } else {
            throw {
                code: 404,
                res
            }
        }
    } else {
        throw {
            code: res.status,
            res
        }
    }
}

export default {
    getDefinition,
    getDefinitions,
    getRandom
}