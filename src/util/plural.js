/**
 * Pluralise a word depending on the number of items.
 * @param {Number} n The number of items.
 * @param {String} s The singular version of the word.
 * @param {String} pl The plural version of the word.
 * @returns {String}
 */
export function p(n, s, pl = s + "s") {
    return "**" + n + "** " + (n === 1 ? s : pl);
}

/**
 * Get is/are based on the amount.
 * @param {Number} num The number to evaluate.
 * @returns {String}
 */
export function is(num) {
    return num === 1 ? "is" : "are";
}