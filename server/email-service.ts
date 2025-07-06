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