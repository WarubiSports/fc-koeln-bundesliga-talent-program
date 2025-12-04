import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } from '@getbrevo/brevo';
import { withRetry, getCircuitStatus } from './resilience.js';
import { logger } from './logger.js';

const EMAIL_CIRCUIT_NAME = 'brevo-email';

interface EmailAttachment {
  content: string;
  name: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments?: EmailAttachment[];
}

function getBrevoClient(): TransactionalEmailsApi {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }

  const apiInstance = new TransactionalEmailsApi();
  apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);
  
  return apiInstance;
}

function getSenderEmail(): string {
  return process.env.BREVO_SENDER_EMAIL || 'info@warubi-sports.com';
}

function getSenderName(): string {
  return process.env.BREVO_SENDER_NAME || 'Warubi Sports';
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const circuitStatus = getCircuitStatus(EMAIL_CIRCUIT_NAME);
  if (circuitStatus.state === 'open') {
    logger.warn('[Brevo] Circuit is open, email may fail');
  }

  const apiInstance = getBrevoClient();
  
  const sendSmtpEmail = new SendSmtpEmail();
  sendSmtpEmail.sender = { 
    email: getSenderEmail(), 
    name: getSenderName() 
  };
  sendSmtpEmail.to = [{ email: options.to }];
  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.htmlContent = options.htmlContent;
  
  if (options.textContent) {
    sendSmtpEmail.textContent = options.textContent;
  }
  
  if (options.attachments && options.attachments.length > 0) {
    sendSmtpEmail.attachment = options.attachments.map(att => ({
      content: att.content,
      name: att.name
    }));
  }

  await withRetry(
    () => apiInstance.sendTransacEmail(sendSmtpEmail),
    { 
      maxRetries: 2, 
      baseDelay: 1000, 
      timeout: 30000,
      circuitName: EMAIL_CIRCUIT_NAME 
    }
  );
  
  logger.info(`[Brevo] Email sent successfully to ${options.to}`);
}

export async function sendExposureReportEmail(
  toEmail: string, 
  playerName: string, 
  pdfBuffer: Buffer
): Promise<void> {
  const pdfBase64 = pdfBuffer.toString('base64');
  
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
          Exposure<span style="font-weight: 400;">Engine</span>
        </h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
          Your Recruiting Visibility Analysis
        </p>
      </div>
      
      <div style="padding: 40px 30px; background: #1e293b;">
        <h2 style="color: #f1f5f9; margin: 0 0 20px 0; font-size: 20px;">
          Hi ${playerName},
        </h2>
        <p style="color: #94a3b8; line-height: 1.7; margin: 0 0 25px 0;">
          Your ExposureEngine analysis report is attached to this email. This PDF contains your complete recruiting visibility breakdown, action plan, and personalized recommendations.
        </p>
        
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            What's in your report:
          </h3>
          <ul style="color: #cbd5e1; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Visibility scores across D1, D2, D3, NAIA, and JUCO</li>
            <li>Player readiness radar analysis</li>
            <li>90-day personalized action plan</li>
            <li>Reality check benchmarks vs typical commits</li>
          </ul>
        </div>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 25px 0 0 0;">
          Keep this report handy as you work through your recruiting journey. For more pathways and support, visit 
          <a href="https://warubi-sports.com/pathways" style="color: #10b981; text-decoration: none;">Warubi Elite Pathways</a>.
        </p>
      </div>
      
      <div style="padding: 25px 30px; text-align: center; background: #0f172a; border-top: 1px solid #1e293b;">
        <p style="color: #475569; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} Warubi Sports Analytics
        </p>
      </div>
    </div>
  `;

  const textContent = `Hi ${playerName},\n\nYour ExposureEngine analysis report is attached to this email.\n\nThis PDF contains your complete recruiting visibility breakdown, action plan, and personalized recommendations.\n\nKeep this report handy as you work through your recruiting journey.\n\n- Warubi Sports`;

  await sendEmail({
    to: toEmail,
    subject: `Your ExposureEngine Report - ${playerName}`,
    htmlContent,
    textContent,
    attachments: [{
      content: pdfBase64,
      name: `ExposureEngine_${playerName.replace(/\s+/g, '_')}_Report.pdf`
    }]
  });
}

export function getBrevoCircuitStatus() {
  return getCircuitStatus(EMAIL_CIRCUIT_NAME);
}

export function isBrevoConfigured(): boolean {
  return !!process.env.BREVO_API_KEY;
}
