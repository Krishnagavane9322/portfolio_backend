"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const Message_1 = require("../models/Message");
const mongoose_1 = __importDefault(require("mongoose"));
const mailer_1 = require("../lib/mailer");
exports.router = (0, express_1.Router)();
exports.router.get('/status', (_req, res) => {
    res.json({ ok: true, service: 'portfolio-api' });
});
const contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    email: zod_1.z.string().email(),
    subject: zod_1.z.string().min(1).max(200),
    message: zod_1.z.string().min(1).max(5000)
});
const contactLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 1000, max: 5 });
exports.router.post('/contact', contactLimiter, async (req, res) => {
    if (mongoose_1.default.connection.readyState !== 1) {
        return res.status(503).json({ error: 'Database not connected' });
    }
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    const doc = await Message_1.Message.create(parsed.data);
    // Try to email; don't fail the request if email fails
    const notifyTo = process.env.CONTACT_NOTIFY_TO || process.env.SMTP_USER;
    if (notifyTo) {
        (0, mailer_1.sendContactEmail)({
            to: notifyTo,
            fromEmail: parsed.data.email,
            name: parsed.data.name,
            subject: parsed.data.subject,
            message: parsed.data.message,
        }).catch((e) => console.error('Email send failed', e));
    }
    res.status(201).json({ ok: true, id: doc.id });
});
