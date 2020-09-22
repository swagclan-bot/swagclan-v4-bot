import fetch from "node-fetch"

import constants from "./constants.js"

/**
 * @typedef Gamemode
 * @property {String} mode The ID of the mode.
 * @property {String} display_name
 */

/**
 * Get all diabotical modes.
 * @returns { { [key: string]: Gamemode } }
 */
export async function getModes() {
    const res = await fetch(constants.BASE_API + "/modes");

    if (res.status !== 200) {
        throw res;
    }

    const json = await res.json();

    return json;
}

/**
 * @typedef UserProfile
 * @property {String} active_battlepass_id
 * @property {String} avatar
 * @property {String} avatarURL
 * @property {Number} battlepass_level
 * @property {Boolean} battlepass_owned
 * @property {Number} battlepass_xp
 * @property {String} country
 * @property {String} flagURL
 * @property {UserCustomizations} customizations
 * @property {Number} level
 * @property {String} name
 * @property {String} user_id
 */

/**
 * Get a player by their username or ID.
 * @param {String} username The username of the player to get.
 * @returns {Promise<UserProfile>}
 */
export async function getPlayer(username) {
    const res = await fetch(constants.BASE_API + "/user/" + encodeURIComponent(username));

    if (res.status !== 200) {
        throw res;
    }

    const json = await res.json();

    return json;
}


/**
 * @typedef StatItemEntry
 * @property {String} time_frame
 * @property {String} match_mode
 * @property {String} match_mm_mode
 * @property {String} weapon
 * @property {String} weapon_code
 * @property {Number} time_played In seconds.
 * @property {Number} match_count
 * @property {Number} match_won
 * @property {Number} match_lost
 * @property {Number} match_tied
 * @property {Number} frags
 * @property {Number} assists
 * @property {Number} deaths
 * @property {Number} captures
 * @property {Number} time_alive In seconds.
 * @property {Number} distance_moved
 * @property {Number} spawn_count
 * @property {Number} damage_done
 * @property {Number} damage_taken
 * @property {Number} damage_self
 * @property {Number} shots_fired
 * @property {Number} shots_hit
 * @property {Number} most_frags
 * @property {Number} most_captures
 * @property {Number} armor
 * @property {Number} health
 * @property {Number} powerup_count
 * @property {Number} commends
 */

/**
 * @typedef StatAllItemsEntry
 * @property {String} time_frame
 * @property {String} match_mode
 * @property {String} match_mm_mode
 * @property {Number} time_played In seconds.
 * @property {Number} match_count
 * @property {Number} match_won
 * @property {Number} match_lost
 * @property {Number} match_tied
 * @property {Number} frags
 * @property {Number} assists
 * @property {Number} deaths
 * @property {Number} captures
 * @property {Number} time_alive In seconds.
 * @property {Number} distance_moved
 * @property {Number} spawn_count
 * @property {Number} damage_done
 * @property {Number} damage_taken
 * @property {Number} damage_self
 * @property {Number} shots_fired
 * @property {Number} shots_hit
 * @property {Number} most_frags
 * @property {Number} most_captures
 * @property {Number} armor
 * @property {Number} health
 * @property {Number} powerup_count
 * @property {Number} commends
 */

/**
 * @typedef { { [key: string]: StatItemEntry } } StatItemEntries 
 */

/**
 * @typedef StatTimeframe
 * @property {StatItemEntries} overview
 * @property { { [key: string]: StatItemEntries } } modes
 */

/**
 * @typedef { { [key: string]: StatTimeframe } } UserStats
 */

/**
 * Get a player's stats by their username or ID.
 * @param {String} username The username of the player to get.
 * @returns {Promise<UserStats>}
 */
export async function getStats(username) {
    const res = await fetch(constants.BASE_API + "/user/" + encodeURIComponent(username) + "/stats");

    if (res.status !== 200) {
        throw res;
    }

    const json = await res.json();

    return json;
}


/**
 * @typedef MatchModifiers
 * @property {Number} instagib
 * @property {"diabotical"|"race"|"vintage"} physics
 */

/**
 * @typedef MatchWeaponStats
 * @property {String} weapon
 * @property {Number} deaths_from
 * @property {Number} deaths_equipped
 * @property {Number} damage
 * @property {Number} damage_self
 * @property {Number} damage_taken
 * @property {Number} frags
 * @property {Number} weapon_index
 * @property {Number} shots_fired
 * @property {Number} shots_hit
 */

/**
 * @typedef MatchTeamRoundStats
 * @property {Number} base The macguffin base location.
 * @property {Number} score
 */

/**
 * @typedef PlayerMatchTeamStats
 * @property {Array<MatchTeamRoundStats>} rounds
 */

/**
 * @typedef MatchPlayerStats
 * @property {Number} assists
 * @property {Number} deaths
 * @property {Number} damage
 * @property {Number} damage_taken
 * @property {Number} frags
 * @property {Number} health
 * @property {Number} score
 * @property { { [key: string]: MatchWeaponStats } } weapons
 */

/**
 * @typedef PlayerMatch
 * @property {Number} created_timestamp
 * @property {Number} finished_timestamp
 * @property {Boolean} finished
 * @property {String} location
 * @property {String} id
 * @property {String} map
 * @property {String} mm_mode
 * @property {String} mode
 * @property {Boolean} private
 * @property {Number} rounds
 * @property {Number} state
 * @property {Number} time
 * @property {Number} type
 * @property {Number} score_limit
 * @property {MatchPlayerStats} stats 
 * @property {Number} team_count
 * @property {Number} team_placement
 * @property {Number} team_score
 * @property {Number} team_size
 * @property {Number} team_stats
 * @property {Number} time_limit
 * @property {Number} user_team_idx
 */

/**
 * Get a player's matches by their username or ID.
 * @param {String} username The username of the player to get.
 * @returns {Promise<Array<PlayerMatch>>}
 */
export async function getMatches(username) {
    const res = await fetch(constants.BASE_API + "/user/" + encodeURIComponent(username) + "/matches");

    if (res.status !== 200) {
        throw res;
    }

    const json = await res.json();

    return json;
}

export default {
    getPlayer,
    getStats,
    getMatches
}