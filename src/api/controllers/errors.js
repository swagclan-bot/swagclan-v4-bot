import express from "express"

export class APIError {
    /**
     * An error code 500.
     */
    static get E500() {
        return new APIError(500, "Could not get resource.");
    }
    
    /**
     * An error code 429.
     */
    static get E429() {
        return new APIError(429, "Too many requests.");
    }

    /**
     * An error code 403.
     */
    static get E403() {
        return new APIError(403, "Missing permissions to view this resource.");
    }
    
    /**
     * An error code 404.
     */
    static get E404() {
        return new APIError(504, "Resource not found.");
    }
    
    /**
     * An error code 403.
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
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function Internal_Server_Error(req, res) {
    res.status(500).json(APIError.E500);
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function TooManyRequests(req, res) {
    res.status(429).json(APIError.E429);
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function Forbidden(req, res) {
    res.status(403).json(APIError.E403);
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function NotFound(req, res) {
    res.status(404).json(APIError.E404);
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function Bad_Request(req, res) {
    res.status(400).json(APIError.E400);
}

export default {
    APIError,
    Internal_Server_Error,
    Forbidden,
    NotFound,
    Bad_Request
}