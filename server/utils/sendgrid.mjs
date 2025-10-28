import sgMail from '@sendgrid/mail';

let connectionSettings;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email};
}

export async function getUncachableSendGridClient() {
  const {apiKey, email} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export async function sendPasswordResetEmail(toEmail, resetToken, resetUrl) {
  const { client, fromEmail } = await getUncachableSendGridClient();
  
  const msg = {
    to: toEmail,
    from: fromEmail,
    subject: 'Password Reset - FC Köln Football School',
    text: `You requested a password reset. Click this link to reset your password: ${resetUrl}?token=${resetToken}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc143c 0%, #b91c3c 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">FC Köln Football School</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6;">
            You requested a password reset for your FC Köln Football School account.
            Click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}?token=${resetToken}" 
               style="background: linear-gradient(135deg, #dc143c 0%, #b91c3c 100%); 
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 600;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            This link will expire in 1 hour.
          </p>
          <p style="color: #999; font-size: 14px;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          © 2025 Warubi Sports
        </div>
      </div>
    `,
  };

  await client.send(msg);
}
