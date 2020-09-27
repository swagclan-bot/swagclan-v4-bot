import express from "express"

/**
 * Represents an error in the API.
 */
export class APIError {
    /**
     * An error code 500. Internal server error.
     */
    static get E500() {
        return new APIError(500, "Could not get resource.");
    }
    
    /**
     * An error code 429. Too many requests.
     */
    static get E429() {
        return new APIError(429, "Too many requests.");
    }

    /**
     * An error code 403. Forbidden.
     */
    static get E403() {
        return new APIError(403, "Missing permissions to view this resource.");
    }
    
    /**
     * An error code 404. Not found.
     */
    static get E404() {
        return new APIError(404, "Resource not found.");
    }
    
    /**
     * An error code 400. Bad Request.
     */
    static get E400() {
        return new APIError(400, "Malformed request body.");
    }

    /**
     * Instantiate an API error.
     * @param {String} code The code for the error.
     * @param {String} [message] The brief message for the error.
     */
    constructor(code, message) {
        this.error = {
            /**
             * The code for the error.
             * @type {String}
             */
            code: code,

            /**
             * The brief message for the error.
             * @type {String}
             */
            message: message
        }
    }

    /**
     * @param {express.Request} req 
     * @param {express.Response} res 
     */
    respond(req, res) {
        res.status(this.error.code).json(this);
    }
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function Internal_Server_Error(req, res) {
    APIError.E500.respond(req, res);
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function TooManyRequests(req, res) {
    APIError.E429.respond(req, res);
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function Forbidden(req, res) {
    APIError.E403.respond(req, res);
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function Not_Found(req, res) {
    APIError.E404.respond(req, res);
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function Bad_Request(req, res) {
    APIError.E400.respond(req, res);
}

export default {
    APIError,
    Internal_Server_Error,
    Forbidden,
    Not_Found,
    Bad_Request
}