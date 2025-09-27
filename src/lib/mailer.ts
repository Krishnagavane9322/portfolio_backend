import nodemailer from 'nodemailer';

export function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = port === 465;

  if (!host || !user || !pass) {
    throw new Error('SMTP env vars missing');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

export async function sendContactEmail(params: {
  to: string;
  fromEmail: string;
  name: string;
  subject: string;
  message: string;
}) {
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
