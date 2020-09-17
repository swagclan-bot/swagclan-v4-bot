/**
 * Make the first character of a string uppercase.
 * @param {String} str
 */
export default function uppercase(str) {
    return str[0].toUpperCase() + str.substr(1);
}