import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { Message } from '../models/Message';
import mongoose from 'mongoose';
import { sendContactEmail } from '../lib/mailer';

export const router = Router();

router.get('/status', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'portfolio-api' });
});

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000)
});

const contactLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });

router.post('/contact', contactLimiter as any, async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }

  const doc = await Message.create(parsed.data);
  // Try to email; don't fail the request if email fails
  const notifyTo = process.env.CONTACT_NOTIFY_TO || process.env.SMTP_USER;
  if (notifyTo) {
    sendContactEmail({
      to: notifyTo,
      fromEmail: parsed.data.email,
      name: parsed.data.name,
      subject: parsed.data.subject,
      message: parsed.data.message,
    }).catch((e) => console.error('Email send failed', e));
  }
  res.status(201).json({ ok: true, id: doc.id });
});

