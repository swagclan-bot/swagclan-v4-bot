import fetch from "node-fetch"
import constants from "./constants.js"

/**
 * @typedef PlayerCareerBests
 * @property {Number} fused_to_max The most number of guns fused to max.
 * @property {Number} chests The most number of chests opened.
 * @property {Number} shockwaved The most number of shockwaves inflicted.
 * @property {Number} damage_done The most number of damage points dealt.
 * @property {Number} revealed The most number of players revealed.
 * @property {Number} assists The most number of assists.
 * @property {Number} damage_shielded The most number of damage blocked.
 * @property {Number} long_range_kills The most number of long range kills.
 * @property {Number} short_range_kills The most number of short range kills.
 * @property {Number} kills The most number of kills.
 * @property {Number} item_fused The most number of items fused.
 * @property {Number} critical_damage The most critical damage dealt.
 * @property {String} survival_time The longest time survived.
 * @property {Number} healed The most number of health points healed.
 * @property {Number} revives The most revives.
 * @property {Number} snares_triggered
 * @property {Number} mines_triggered The most number of mines triggered.
 */

/**
 * @typedef ItemStats
 * @property {String} name The name of the weapon.
 * @property {Number} kills The number of kills that the weapon has gotten.
 * @property {Number} damage The damage that the weapon has dealt.
 * @property {Number} headshot_damage The headshot damage that the weapon has dealt.
 * @property {Number} fusions The number of fusions that the weapon has done.
 * @property {Number} hs_accuracy The headshot accuracy of the weapon.
 * @property {Number} kills_per_match The number of kills that the weapon gets per match.
 * @property {Number} damage_per_match The number of damage that the weapon gets per match.
 * @property {Number} fusions_per_match The number of fusions that the weapon gets per match.
 */

/**
 * @typedef PlayerWeaponStats
 * @property {ItemStats} dragonfly The stats for the dragon fly.
 * @property {ItemStats} mammoth The stats for the mammoth mk1.
 * @property {ItemStats} theripper The stats for the Ripper.
 * @property {ItemStats} dtap The stats for the DTap.
 * @property {ItemStats} harpy The stats for the Harpy.
 * @property {ItemStats} homodo The stats for the komodo.
 * @property {ItemStats} hexfire The stats for the Hexfire.
 * @property {ItemStats} riotone The stats for the RiotOne.
 * @property {ItemStats} salvoepl The stats for the Salvo EPL.
 * @property {ItemStats} skybreaker The stats for the Skybreaker.
 * @property {ItemStats} protocolv The stats for the Protocol V.
 */

/**
 * @typedef PlayerHackStats
 * @property {ItemStats} mine The stats for the mine.
 * @property {ItemStats} slam The stats for the slam.
 * @property {ItemStats} shockwave The stats for the shockwave.
 * @property {ItemStats} wall The stats for the shockwave.
 * @property {ItemStats} heal The stats for the Heal.
 * @property {ItemStats} reveal The stats for the Reveal.
 * @property {ItemStats} teleport The stats for the Teleport.
 * @property {ItemStats} ball The stats for the Ball.
 * @property {ItemStats} invisibility The stats for the Invisibility.
 * @property {ItemStats} armour The stats for the Armour.
 * @property {ItemStats} magnet The stats for the Magnet.
 */

/**
 * @typedef PlayerStats
 * @property {Number} wins The number of wins that the player has.
 * @property {Number} crown_wins The number of wins that the player has from keeping the crown.
 * @property {Number} damage The number of damage points that the player has took.
 * @property {Number} assists The number of assists that the player has got.
 * @property {Number} assists_per_match The average number of assists per match that the player gets.
 * @property {Number} matches The number of matches that the player has played.
 * @property {Number} chests_broken The number of chests that the player has broken.
 * @property {Number} chests_per_match The average number of chests per match that the player breaks.
 * @property {Number} crown_pickups The number of crowns that the player has picked up.
 * @property {Number} damage_done The number of damage points that the player has dealt.
 * @property {Number} damage_per_match The average number of damage points per match that the player deals.
 * @property {Number} kills The number of kills that the player has.
 * @property {Number} fusions The number of fusions that the player has made.
 * @property {Number} fusions_per_match The average number of fusions per match that the player makes.
 * @property {Number} last_rank The last rank of the player.
 * @property {Number} revives The number of people that the player has revived.
 * @property {Number} revives_per_match The average number of revives per match that the player gets.
 * @property {String} time_played The time that the player has played for (formatted).
 * @property {Number} solo_crown_wins The number of crown wins that the player has gotten in solo.
 * @property {Number} squad_crown_wins The number of crown wins that the player has gotten in squdas.
 * @property {Number} solo_last_rank The last rank of the player on solo.
 * @property {Number} squad_last_rank The last rank of the player on squad.
 * @property {String} solo_time_played The time that the player has played in solo.
 * @property {String} squad_time_played The time that the player has played in squads.
 * @property {Number} solo_matches The number of matches that the player has played has on solo.
 * @property {Number} squad_matches The number of matches that the player has played on squads.
 * @property {Number} solo_wins The number of wins that the player has on solo.
 * @property {Number} squad_wins The number of wins that the player has on squauds.
 * @property {PlayerCareerBests} career_bests The best of stats the player has ever gotten.
 * @property {Number} weapon_headshot_damage The number of damage points dealt with headshots
 * @property {Number} headshot_damage_per_match The average headshot damage per match that the player deals.
 * @property {Number} weapon_body_damage The number of damage points dealt with body shots.
 * @property {Number} damage_by_items The number of damage dealt with items. (?)
 * @property {Number} average_kills_per_match The average number of kills that the player gets per match.
 * @property {Number} average_damage_per_kill The average amount of damage dealt per kill.
 * @property {Number} losses The number of games that the player has lost.
 * @property {Number} solo_losses The number of games that the player has lost in solo.
 * @property {Number} squad_losses The number of games that the player has won in squads.
 * @property {Number} winrate The rate that the player wins a game.
 * @property {Number} solo_winrate The rate that the player wins a solo game.
 * @property {Number} squad_winrate The rate that the player wins a squad game.
 * @property {Number} crown_pickup_success_rate The rate that a crown pickup results in a win.
 * @property {Number} kd The kills-death ratio for the player.
 * @property {Number} headshot_accuracy The accuracy in which the player gets a headshot.
 * @property {PlayerWeaponStats} weapons The stats for individual weapons.
 * @property {PlayerHackStats} hacks The stats for the individual hacks.
 */

/**
 * @typedef UserProfile
 * @property {String} id The ID of the user.
 * @property {String} name The name of the user.
 * @property {String} platform The platform of the user.
 */

/**
 * @typedef UserProfileStats
 * @property {UserProfile} profile The profile of the user.
 * @property {PlayerStats} stats The stats of the user.
 */

/**
 * Parse a percentage into a fraction of 1.
 * @param {String} perc The percentage to parse.
 * @returns {Number}
 */
function parsePerc(perc) {
    return Math.floor(parseFloat(perc) * 100) / 10000;
}

/**
 * Get the stats of a player by their ID.
 * @param {String} id The ID of the player.
 * @returns {UserProfileStats}
 */
export async function getStats(id) {
    const res = await fetch(constants.BASE_API + "/update/" + encodeURIComponent(id));

    if (res.status === 200) {
        const json = await res.json();

        if (!json.status || json.status === 200) {
            const stats = json.data.stats;
            const weapons = json.data.weapons;
            const hacks = json.data.hacks;

            /** @type {UserProfileStats} */
            const ret = {
                profile: {
                    id: json.player.p_id,
                    name: json.player.p_name,
                    platform: json.player.p_platform
                },
                stats: {
                    wins: stats.wins,
                    crown_wins: stats.crown_wins,
                    damage: stats.damage,
                    assists: stats.assists,
                    assists_per_match: stats.assists / stats.matches,
                    matches: stats.matches,
                    chests_broken: stats.chests_broken,
                    chests_per_match: stats.chests_broken / stats.matches,
                    crown_pickups: stats.crown_pickups,
                    damage_done: stats.damage_done,
                    damage_per_match: stats.damage_done / stats.matches,
                    kills: stats.kills,
                    kills_per_match: stats.kills / stats.matches,
                    fusions: stats.fusions,
                    fusions_per_match: stats.fusions / stats.matches,
                    last_rank: stats.last_rank,
                    revives: stats.revives,
                    revives_per_match: stats.revives / stats.squad_matches,
                    time_played: stats.time_played,
                    solo_crown_wins: stats.solo_crown_wins,
                    squad_crown_wins: stats.squad_crown_wins,
                    solo_last_rank: stats.solo_last_rank,
                    squad_last_rank: stats.squad_last_rank,
                    solo_time_played: stats.solo_time_played,
                    squad_time_played: stats.squad_time_played,
                    solo_matches: stats.solo_matches,
                    squad_matches: stats.squad_matches,
                    solo_wins: stats.solo_wins,
                    squad_wins: stats.squad_wins,
                    career_bests: {
                        fused_to_max: stats.careerbest_fused_to_max,
                        chests: stats.careerbest_chests,
                        shockwaved: stats.careerbest_shockwaved,
                        damage_done: stats.careerbest_damage_done,
                        revealed: stats.careerbest_revealed,
                        assists: stats.careerbest_assists,
                        damage_shielded: stats.careerbest_damage_shielded,
                        long_range_kills: stats.careerbest_long_range_final_blows,
                        short_range_kills: stats.careerbest_short_range_final_blows,
                        kills: stats.careerbest_kills,
                        item_fused: stats.careerbest_item_fused,
                        critical_damage: stats.careerbest_critical_damage,
                        survival_time: stats.careerbest_survival_time,
                        healed: stats.careerbest_healed,
                        revives: stats.careerbest_revives,
                        snares_triggered: stats.careerbest_snare_triggered,
                        mines_triggerd: stats.careerbest_mines_triggered
                    },
                    weapon_headshot_damage: stats.weapon_headshot_damage,
                    headshot_damage_per_match: stats.weapon_headshot_damage / stats.matches,
                    weapon_body_damage: stats.weapon_body_damage,
                    damage_by_items: stats.damage_by_items,
                    average_kills_per_match: parseFloat(stats.avg_kills_per_match),
                    average_damage_per_kill: parseFloat(stats.avg_dmg_per_kill),
                    losses: stats.losses,
                    solo_losses: stats.solo_losses,
                    squad_losses: stats.squad_losses,
                    winrate: parsePerc(stats.winrate),
                    solo_winrate: parsePerc(stats.solo_winrate),
                    squad_winrate: parsePerc(stats.squad_winrate),
                    crown_pickup_success_rate: parsePerc(stats.crown_pick_success_rate),
                    kd: stats.kd,
                    headshot_accuracy: parsePerc(stats.headshot_accuracy),
                    weapons: Object.fromEntries(Object.entries(weapons).map(([name, stat]) => {
                        return [name.match(/[a-zA-Z]/g).join(""), {
                            ...stat,
                            kills_per_match: stat.kills / stats.matches,
                            damage_per_match: stat.damage / stats.matches,
                            fusions_per_match: stat.fusions / stats.matches,
                            name
                        }]
                    })),
                    hacks: Object.fromEntries(Object.entries(hacks).map(([name, stat]) => {
                        return [name.match(/[a-zA-Z]/g).join(""), {
                            ...stat,
                            kills_per_match: stat.kills / stats.matches,
                            damage_per_match: stat.damage / stats.matches,
                            fusions_per_match: stat.fusions / stats.matches,
                            name
                        }]
                    }))
                }
            }
            
            return ret;
        } else {
            throw json.status;
        }
    } else {
        throw res.status;
    }
}

/**
 * Get user information by platform and username.
 * @param {String} platform The platform of the player.
 * @param {String} username The username of the player.
 * @returns {UserProfile}
 */
export async function getUser(platform, username) {
    const res = await fetch(constants.BASE_API + "/search/" + encodeURIComponent(platform)  + "/" + encodeURIComponent(username));

    if (res.status === 200) {
        const search = await res.json();

        if (!search.status || search.status === 200) {
            if (Object.values(search.players).length) {
                const profile = Object.values(search.players)[0].profile;

                return {
                    id: profile.p_id,
                    name: profile.p_name,
                    platform: profile.p_platform
                }
            } else {
                throw 404;
            }
        } else {
            throw search.status;
        }
    } else {
        throw res.status;
    }
}

export default {
    getStats,
    getUser
}