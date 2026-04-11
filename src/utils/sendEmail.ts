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
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Use multiple potential paths to find templates (for local and production compatibility)
  const potentialPaths = [
    path.join(process.cwd(), 'src/views/emails', `${templateName}.ejs`),
    path.join(process.cwd(), 'dist/src/views/emails', `${templateName}.ejs`),
    path.join(__dirname, '../views/emails', `${templateName}.ejs`),
    path.join(__dirname, '../../../src/views/emails', `${templateName}.ejs`),
  ];

  let templatePath = '';
  for (const p of potentialPaths) {
    if (fs.existsSync(p)) {
      templatePath = p;
      break;
    }
  }

  if (!templatePath) {
    console.error(`[Email] Template not found in any of the potential paths:`, potentialPaths);
    throw new Error(`Email template ${templateName} not found.`);
  }

  try {
    console.log(`[Email] Attempting to send to: ${to}`);
    console.log(`[Email] Using template: ${templatePath}`);
    
    // Render the EJS template
    const html = await ejs.renderFile(templatePath, templateData) as string;

    const mailOptions = {
      from: `"Nexus Express" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Success! Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('[Email] CRITICAL FAILURE:', error);
    throw error;
  }
};
