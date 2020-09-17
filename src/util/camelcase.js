import uppercase from "./uppercase.js"

/**
 * Convert a camel case word into individual words.
 * @param {String} camel
 */
export function camelCaseToWords(camel) {
    return camel.replace(/([A-Z])/g, " $1");
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