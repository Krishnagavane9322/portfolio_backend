"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = require("./routes");
const app = (0, express_1.default)();
// Security & middleware
app.use((0, helmet_1.default)());
// CORS (allow dev origins and handle preflight explicitly)
const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Rate limit all API routes
const limiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 1000, max: 60 });
app.use('/api', limiter);
// Health
app.get('/health', (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
});
// API routes
app.use('/api', routes_1.router);
// Not found
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});
// Start function
async function start() {
    const port = Number(process.env.PORT) || 4000;
    app.listen(port, () => {
        console.log(`API listening on http://localhost:${port}`);
    });
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log('MongoDB connected');
    }
    catch (e) {
        console.error('MongoDB connection failed:', e);
    }
}
start().catch((e) => {
    console.error('Failed to start server', e);
});
