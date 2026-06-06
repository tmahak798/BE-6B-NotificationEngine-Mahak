import nodemailer from 'nodemailer';

// Ethereal is a fake SMTP service for testing
// Emails are captured and viewable at a preview URL
// No real emails are sent - perfect for development
let transporter: nodemailer.Transporter | null = null;
let testAccount: { user: string; pass: string } | null = null;

// Creates an Ethereal test account and transporter
// Called once on startup
export async function initEmailProvider(): Promise<void> {
  testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('Email provider initialized with Ethereal');
  console.log(`Email preview available at: https://ethereal.email`);
}

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Sends an email and returns the preview URL
export async function sendEmail(payload: EmailPayload): Promise<{
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}> {
  if (!transporter) {
    return { success: false, error: 'Email provider not initialized' };
  }

  try {
    const info = await transporter.sendMail({
      from: '"WealthBridge" <noreply@wealthbridge.in>',
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html || `<p>${payload.text}</p>`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`Email sent: ${info.messageId}`);
    console.log(`Preview URL: ${previewUrl}`);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    };
  } catch (error) {
    console.error('Email send failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}