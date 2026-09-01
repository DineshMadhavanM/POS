"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
/**
 * Global cached database connection for serverless / lambda environments
 */
let isConnecting = false;
const connectDB = async () => {
    // If already connected
    if (mongoose_1.default.connection.readyState === 1) {
        return env_1.env.MONGO_URI;
    }
    if (isConnecting) {
        // Wait for in-progress connection
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (mongoose_1.default.connection.readyState === 1)
            return env_1.env.MONGO_URI;
    }
    try {
        isConnecting = true;
        mongoose_1.default.set('strictQuery', true);
        const uri = env_1.env.MONGO_URI || 'mongodb+srv://kit27ad17:Aidsdr-003@cluster0.nl8lf1t.mongodb.net/nineteen06?retryWrites=true&w=majority';
        console.log('[MongoDB] Connecting to MongoDB Atlas Cloud Database...');
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10
        });
        console.log('[MongoDB] Connected successfully to MongoDB Atlas Cloud');
        return uri;
    }
    catch (error) {
        console.error('[MongoDB Error] Database connection failure:', error.message || error);
        throw error;
    }
    finally {
        isConnecting = false;
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        if (mongoose_1.default.connection.readyState !== 0) {
            await mongoose_1.default.disconnect();
            console.log('[MongoDB] Disconnected successfully');
        }
    }
    catch (error) {
        console.error('[MongoDB Error] Disconnect failure:', error.message || error);
    }
};
exports.disconnectDB = disconnectDB;
