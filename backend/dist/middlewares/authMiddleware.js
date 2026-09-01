"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const token_1 = require("../utils/token");
const response_1 = require("../utils/response");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 'Authentication token missing or invalid format', 401);
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, token_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Invalid or expired access token', 401);
    }
};
exports.authenticate = authenticate;
