"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
exports.env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://kit27ad17:Aidsdr-003@cluster0.nl8lf1t.mongodb.net/nineteen06?retryWrites=true&w=majority',
    JWT_SECRET: process.env.JWT_SECRET || 'nexstack_super_secret_jwt_access_key_2026',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'nexstack_super_secret_jwt_refresh_key_2026',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://saxscmsnjyctqqwxoqfa.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNheHNjbXNuanljdHFxd3hvcWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjAzMzEsImV4cCI6MjEwMzY5NjMzMX0.RQwZggDY-99XmvK15NNxsgEWuqhfasjpb2dmAP5Olhs',
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNheHNjbXNuanljdHFxd3hvcWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEyMDMzMSwiZXhwIjoyMTAzNjk2MzMxfQ.IbuuoyeDGMmiVxWuoMGhiyzpLXGYeadrTKQObxyzwII'
};
