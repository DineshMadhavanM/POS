"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const startServer = async () => {
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
        await (0, db_1.connectDB)();
        app_1.default.listen(env_1.env.PORT, () => {
            console.log(`=================================================`);
            console.log(` NexStack POS Backend API running on port ${env_1.env.PORT}`);
            console.log(` Health check: http://localhost:${env_1.env.PORT}/health`);
            console.log(`=================================================`);
        });
    }
};
startServer();
module.exports = app_1.default;
exports.default = app_1.default;
