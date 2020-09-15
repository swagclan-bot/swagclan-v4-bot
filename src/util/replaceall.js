/**
 * Replace all substrings in a string.
 * @param {String} string
 * @param {RegExp|String} pattern
 * @param {String} rep The replacement string.
 * @returns {String}
 */
export default function replaceAll(string, pattern, rep) {
    if (RegExp(pattern) === pattern) {
        return string.replace(RegExp(pattern, "g"), rep);
    }

    return string.split(pattern).join(rep);
}