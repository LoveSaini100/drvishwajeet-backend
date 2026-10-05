import express from 'express';
import nodemailer from 'nodemailer';
import { dataStore } from '../utils/dataStore.js';

const router = express.Router();

// Create robust Nodemailer Transporter
const createTransporter = () => {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const port = parseInt(process.env.SMTP_PORT?.trim() || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return null;
};

// @route   POST /api/email/send
// @desc    Send email to single or multiple recipients via SMTP
router.post('/email/send', async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one valid recipient email address',
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject cannot be empty',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty',
      });
    }

    // Clean and validate email list
    const cleanRecipients = recipients
      .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (cleanRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipient email addresses found.',
      });
    }

    const transporter = createTransporter();
    let dispatchStatus = 'sent';
    let details = '';

    const senderEmail = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || 'info@drvishwajeet.com';
    const senderName = 'Dr. Vishwajeet | IIT Roorkee Desk';

    if (transporter) {
      try {
        const mailOptions = {
          from: `"${senderName}" <${senderEmail}>`,
          to: cleanRecipients.join(', '),
          subject: subject.trim(),
          text: message.trim(),
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <div style="border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px;">
                <h2 style="color: #0f172a; margin: 0; font-size: 20px;">Dr. Vishwajeet</h2>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Faculty & Ramanujan Fellow, IIT Roorkee</p>
              </div>
              <div style="color: #334155; font-size: 15px; line-height: 1.6; white-space: pre-line; margin-bottom: 24px;">
                ${message.replace(/\n/g, '<br/>')}
              </div>
              <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
                <p style="margin: 0;">Sent officially from Dr. Vishwajeet's Academic Desk • IIT Roorkee</p>
              </div>
            </div>
          `,
        };

        const info = await transporter.sendMail(mailOptions);
        details = `Delivered via SMTP (${info.response || info.messageId})`;
        console.log(`✅ Email sent successfully to ${cleanRecipients.join(', ')}. Info:`, info.messageId);
      } catch (smtpErr) {
        console.error('❌ SMTP Dispatch Error:', smtpErr);
        dispatchStatus = 'failed';
        details = `SMTP Error: ${smtpErr.message}`;
        
        // Save failed log for visibility
        await dataStore.createEmailLog({
          recipients: cleanRecipients,
          subject: subject.trim(),
          message: message.trim(),
          sender: senderName,
          recipientCount: cleanRecipients.length,
          status: 'failed',
          details,
        });

        return res.status(500).json({
          success: false,
          message: `Failed to send email via SMTP: ${smtpErr.message}`,
        });
      }
    } else {
      details = `Simulated mode: SMTP credentials not configured in backend/.env.`;
      console.warn('⚠️ SMTP credentials not found. Email logged in simulation mode.');
    }

    // Save Successful Email Log
    const log = await dataStore.createEmailLog({
      recipients: cleanRecipients,
      subject: subject.trim(),
      message: message.trim(),
      sender: senderName,
      recipientCount: cleanRecipients.length,
      status: dispatchStatus,
      details,
    });

    res.json({
      success: true,
      message: `Email successfully sent to ${cleanRecipients.length} recipient${cleanRecipients.length > 1 ? 's' : ''}!`,
      log,
    });
  } catch (error) {
    console.error('Error in /api/email/send:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error sending email',
    });
  }
});

// @route   GET /api/email/logs
// @desc    Get sent email history
router.get('/email/logs', async (req, res) => {
  try {
    const logs = await dataStore.getEmailLogs();
    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching email logs',
    });
  }
});

export default router;
