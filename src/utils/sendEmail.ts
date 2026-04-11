import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendEmail = async (to: string, subject: string, templateData: any, templateName: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials (EMAIL_USER or EMAIL_PASS) are missing in environment variables.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 20000, // 20 seconds
    greetingTimeout: 20000,
  });

  // Precise path resolution prioritized by __dirname (relative to this file)
  const potentialPaths = [
    path.join(__dirname, '../views/emails', `${templateName}.ejs`),
    path.join(process.cwd(), 'src/views/emails', `${templateName}.ejs`),
    path.join(process.cwd(), 'dist/src/views/emails', `${templateName}.ejs`),
    path.join('/opt/render/project/src/src/views/emails', `${templateName}.ejs`), // Fallback for Render unusual structure
  ];

  let templatePath = '';
  for (const p of potentialPaths) {
    if (fs.existsSync(p)) {
      templatePath = p;
      break;
    }
  }

  if (!templatePath) {
    console.error(`[Email] ERROR: Template not found. Checked paths:`, potentialPaths);
    throw new Error(`Email template ${templateName} not found.`);
  }

  try {
    console.log(`[Email] Attempting render: ${templatePath}`);
    const html = await ejs.renderFile(templatePath, templateData);
    console.log(`[Email] Render successful.`);

    const mailOptions = {
      from: `"Nexus Express" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: html as string,
    };

    console.log(`[Email] Connecting to SMTP on port 465 (Secure: true)...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] SENT SUCCESSFULLY! Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('[Email] ERROR ENCOUNTERED:', error);
    throw error;
  }
};
