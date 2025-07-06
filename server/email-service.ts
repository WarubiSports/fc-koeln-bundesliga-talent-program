import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendUserConfirmationEmail(
  userEmail: string | null,
  userName: string,
  house: string
): Promise<boolean> {
  if (!userEmail) {
    console.error('No email provided for user confirmation');
    return false;
  }
  const subject = "Welcome to FC Köln International Talent Program!";
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #DC143C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { background-color: #333; color: white; padding: 15px; text-align: center; }
        .button { background-color: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .highlight { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏆 FC Köln International Talent Program</h1>
      </div>
      
      <div class="content">
        <h2>Welcome ${userName}!</h2>
        
        <p>Congratulations! Your account has been approved by Max Bisinger and you're now officially part of the FC Köln International Talent Program.</p>
        
        <div class="highlight">
          <strong>Your Assignment:</strong><br>
          You have been assigned to <strong>${house}</strong>
        </div>
        
        <p>You can now access the full platform to:</p>
        <ul>
          <li>View your training schedule and upcoming matches</li>
          <li>Participate in team communications</li>
          <li>Manage your house responsibilities and chores</li>
          <li>Place weekly grocery orders</li>
          <li>Access your performance metrics and development plans</li>
        </ul>
        
        <p>
          <a href="https://warubisports.replit.app" class="button">Login to Platform</a>
        </p>
        
        <p>If you have any questions or need assistance, please don't hesitate to reach out to the coaching staff.</p>
        
        <p>Welcome to the team!</p>
        
        <p><strong>FC Köln Coaching Staff</strong></p>
      </div>
      
      <div class="footer">
        <p>FC Köln International Talent Program<br>
        This is an automated message from the team management system.</p>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
    Welcome to FC Köln International Talent Program!
    
    Congratulations ${userName}!
    
    Your account has been approved by Max Bisinger and you're now officially part of the FC Köln International Talent Program.
    
    Your Assignment: You have been assigned to ${house}
    
    You can now access the full platform to:
    - View your training schedule and upcoming matches
    - Participate in team communications
    - Manage your house responsibilities and chores
    - Place weekly grocery orders
    - Access your performance metrics and development plans
    
    Visit: https://warubisports.replit.app
    
    If you have any questions or need assistance, please don't hesitate to reach out to the coaching staff.
    
    Welcome to the team!
    
    FC Köln Coaching Staff
  `;
  
  return await sendEmail({
    to: userEmail,
    from: "max.bisinger@warubi-sports.com", // Admin email as sender
    subject,
    text: textContent,
    html: htmlContent,
  });
}

export async function sendPasswordResetEmail(
  userEmail: string | null,
  userName: string,
  resetToken: string
): Promise<boolean> {
  if (!userEmail) {
    console.error('No email provided for password reset');
    return false;
  }

  const subject = "Password Reset - FC Köln International Talent Program";
  const resetUrl = `https://warubisports.replit.app/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #DC143C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { background-color: #333; color: white; padding: 15px; text-align: center; }
        .button { background-color: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
        .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
        .code { background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 18px; letter-spacing: 2px; text-align: center; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 FC Köln International Talent Program</h1>
      </div>
      
      <div class="content">
        <h2>Password Reset Request</h2>
        
        <p>Hello ${userName},</p>
        
        <p>We received a request to reset your password for the FC Köln International Talent Program platform.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <p>
          <a href="${resetUrl}" class="button">Reset Password</a>
        </p>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
        
        <div class="warning">
          <strong>Important:</strong>
          <ul>
            <li>This link will expire in 1 hour for security reasons</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>Contact the coaching staff if you have any concerns</li>
          </ul>
        </div>
        
        <p>If you're having trouble clicking the button, copy and paste the link above into your web browser.</p>
        
        <p><strong>FC Köln Coaching Staff</strong></p>
      </div>
      
      <div class="footer">
        <p>FC Köln International Talent Program<br>
        This is an automated message from the team management system.</p>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
    Password Reset Request - FC Köln International Talent Program
    
    Hello ${userName},
    
    We received a request to reset your password for the FC Köln International Talent Program platform.
    
    Visit this link to reset your password:
    ${resetUrl}
    
    Important:
    - This link will expire in 1 hour for security reasons
    - If you didn't request this password reset, please ignore this email
    - Contact the coaching staff if you have any concerns
    
    FC Köln Coaching Staff
  `;
  
  return await sendEmail({
    to: userEmail,
    from: "max.bisinger@warubi-sports.com",
    subject,
    text: textContent,
    html: htmlContent,
  });
}