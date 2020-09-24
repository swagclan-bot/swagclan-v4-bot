/**
 * Hook a JS function.
 * @param {any} object The object to bind.
 * @param {String} func The function name to hook.
 * @param {Function} hook The hook function.
 * @returns {Boolean}
 */
export default function hookfunc(object, func, hook) {
    if (typeof object[func] === "function" && object[func].bind) {
        const _original = object[func].bind(object);
    
        object[func] = function (...args) {
            return hook(_original, ...args);
        }

        return true;
    } else {
        return false;
    }
}