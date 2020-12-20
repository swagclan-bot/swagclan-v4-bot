import uppercase from "./uppercase.js"

/**
 * Convert a camel case word into individual words.
 * @param {String} camel
 * @param {Boolean} capitalise
 */
export function camelCaseToWords(camel, capitalise = false) {
    if (capitalise) {
        const normal = camel.replace(/([A-Z])/g, " $1");
        return normal[0].toUpperCase() + normal.substr(1).toLowerCase();
    }

    return camel.replace(/([A-Z])/g, " $1").toLowerCase();
}

/**
 * Convert individual words to camel case.
 * @param {String} words 
 */
export function wordsToCamelCase(words) {
    return words[0] + words.slice(1).map(uppercase).join("")
}

export default {
    camelCaseToWords,
    wordsToCamelCase
}