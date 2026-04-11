import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
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

  const templatePath = path.join(process.cwd(), 'src/views/emails', `${templateName}.ejs`);

  try {
    console.log(`[Email] Preparing to send to: ${to}`);
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
