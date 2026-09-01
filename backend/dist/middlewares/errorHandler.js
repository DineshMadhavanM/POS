"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const errorHandler = (err, req, res, next) => {
    console.error('[Global Error Handler]', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return (0, response_1.sendError)(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};
exports.errorHandler = errorHandler;
