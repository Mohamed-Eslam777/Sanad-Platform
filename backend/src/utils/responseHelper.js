/**
 * responseHelper.js — Standardised API response helpers.
 *
 * SECURITY: sendError never exposes raw error.message to clients in production.
 * Internal errors are logged via console.error and the client receives a generic message.
 */

const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Send a successful response.
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g. 200, 201)
 * @param {string} message - Human-readable success message
 * @param {*} data - Payload to return
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data,
    });
};

/**
 * Send an error response.
 *
 * If this is a 500-level error and we are in production, the raw error
 * message is suppressed and only logged server-side.
 *
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404, 500)
 * @param {string|Error} messageOrError - Error message string, or an Error object
 */
const sendError = (res, statusCode = 500, messageOrError = 'Internal Server Error') => {
    // If the caller passed an actual Error object, extract its message for logging
    const isErrorObj = messageOrError instanceof Error;
    const rawMessage = isErrorObj ? messageOrError.message : messageOrError;
    const isServerErr = statusCode >= 500;

    // Always log server-side for internal errors
    if (isServerErr) {
        console.error(`[Sanad Error] HTTP ${statusCode}:`, rawMessage);
    }

    // In production, hide implementation details for 500-level errors
    const clientMessage =
        isServerErr && IS_PROD
            ? 'حدث خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.'
            : rawMessage;

    return res.status(statusCode).json({
        status: 'error',
        message: clientMessage,
    });
};

module.exports = { sendSuccess, sendError };
