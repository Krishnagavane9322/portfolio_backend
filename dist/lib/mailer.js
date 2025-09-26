"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransport = createTransport;
exports.sendContactEmail = sendContactEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
function createTransport() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = port === 465;
    if (!host || !user || !pass) {
        throw new Error('SMTP env vars missing');
    }
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
    });
}
async function sendContactEmail(params) {
    const transporter = createTransport();
    const from = process.env.MAIL_FROM || params.fromEmail;
    await transporter.sendMail({
        from,
        to: params.to,
        subject: `[Portfolio] ${params.subject}`,
        text: `From: ${params.name} <${params.fromEmail}>
\nMessage:\n${params.message}`,
    });
}
