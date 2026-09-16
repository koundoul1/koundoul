const nodemailer = require('nodemailer');

// Transporter configured via env vars — supports any SMTP provider
// (Gmail, SendGrid, Brevo, etc.)
const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in env.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: parseInt(SMTP_PORT || '587', 10) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

const FROM = process.env.SMTP_FROM || 'Koundoul <noreply@koundoul.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.koundoul.com';

const sendPasswordResetEmail = async (to, firstName, token) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  const transporter = createTransporter();

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Réinitialisation de ton mot de passe — Koundoul',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"></head>
      <body style="font-family:sans-serif;background:#0D0D1A;color:#e5e7eb;margin:0;padding:0;">
        <div style="max-width:520px;margin:40px auto;background:#1a1a2e;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
          <div style="background:linear-gradient(135deg,#6C63FF,#00D9A3);padding:32px 24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;">Koundoul</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Plateforme éducative</p>
          </div>
          <div style="padding:32px 24px;">
            <h2 style="color:#fff;font-size:20px;margin-top:0;">Bonjour ${firstName || ''} 👋</h2>
            <p style="color:#9ca3af;line-height:1.6;">
              Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#6C63FF,#00D9A3);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:16px;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color:#6b7280;font-size:13px;line-height:1.6;">
              Ce lien est valable <strong style="color:#9ca3af;">1 heure</strong>. Si tu n'es pas à l'origine de cette demande, ignore cet email — ton compte reste sécurisé.
            </p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;">
            <p style="color:#4b5563;font-size:12px;text-align:center;margin:0;">
              © ${new Date().getFullYear()} Koundoul — contact@koundoul.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Bonjour ${firstName || ''},\n\nRéinitialise ton mot de passe en cliquant sur ce lien (valable 1h) :\n${resetUrl}\n\nSi tu n'es pas à l'origine de cette demande, ignore cet email.\n\nL'équipe Koundoul`,
  });
};

module.exports = { sendPasswordResetEmail };
