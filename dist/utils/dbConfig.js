"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
const mongoose_1 = require("mongoose");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = async () => {
    try {
        const connectionString = process.env.MONGO_DB_URL_LOCAL;
        const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";
        // const DB =
        //   "mongodb+srv://peterotunuya2:peterotunuya2@cluster0.i3bmjcu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        await (0, mongoose_1.connect)(DB, {
            connectTimeoutMS: 30000, // Increase connection timeout to 30 seconds
            socketTimeoutMS: 30000, // Increase socket timeout to 30 seconds
            serverSelectionTimeoutMS: 30000, // Increase server selection timeout
            heartbeatFrequencyMS: 1000, // More frequent heartbeats
            retryWrites: true,
            maxPoolSize: 10, // Adjust based on your needs
        });
        console.log("Database connection established 🔥❤️🔥");
    }
    catch (error) {
        console.error("Database connection error:", error);
        throw error; // Re-throw to handle it in the main application
    }
};
exports.dbConfig = dbConfig;
