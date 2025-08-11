import nodemailer from 'nodemailer';

// Configure nodemailer with your email service
const transporter = nodemailer.createTransport({
  // Replace with your email service configuration
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendNewPublisherNotification(publisher: {
  name: string;
  email: string;
  website: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.error('Admin email not configured');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: adminEmail,
      subject: 'New Publisher Registration',
      html: `
        <h2>New Publisher Registration</h2>
        <p>A new publisher has registered and requires approval:</p>
        <ul>
          <li><strong>Name:</strong> ${publisher.name}</li>
          <li><strong>Email:</strong> ${publisher.email}</li>
          <li><strong>Website:</strong> ${publisher.website}</li>
        </ul>
        <p>Please log in to the admin dashboard to review this request.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendStatusUpdateEmail(
  email: string,
  name: string,
  status: 'ACTIVE' | 'SUSPENDED'
) {
  try {
    // Determine if this is an approval from PENDING or a reactivation from SUSPENDED
    const isNewApproval = status === 'ACTIVE';
    
    const subject = isNewApproval 
      ? 'Your Publisher Account has been Approved!'
      : 'Publisher Account Status Update';

    const content = isNewApproval
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background-color: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">Congratulations ${name}!</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
            <p>Your publisher account has been <strong>approved</strong>. You can now log in and start using our platform.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4CAF50;">What's Next?</h3>
              <p>Visit our platform to:</p>
              <ul style="padding-left: 20px;">
                <li>Browse available merchant programs</li>
                <li>Apply for partnerships</li>
                <li>Generate tracking links</li>
                <li>Monitor your performance</li>
              </ul>
            </div>
            
            <p>To get started, simply <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" style="color: #4CAF50; text-decoration: none; font-weight: bold;">log in to your account</a>.</p>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
              <p>This email was sent to ${email}. If you believe this email was sent to you by mistake, please disregard it.</p>
            </div>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background-color: #F44336; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">Account Status Update</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
            <p>Dear ${name},</p>
            <p>We regret to inform you that your publisher account application has been <strong>declined</strong>.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #F44336;">What can you do?</h3>
              <p>You can:</p>
              <ul style="padding-left: 20px;">
                <li>Review our publisher guidelines to ensure your website meets our requirements</li>
                <li>Make necessary improvements to your website</li>
                <li>Contact our support team for more specific feedback</li>
                <li>Submit a new application once you've made the required changes</li>
              </ul>
            </div>
            
            <p>If you believe this is a mistake or would like to appeal this decision, please contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}" style="color: #F44336; text-decoration: none; font-weight: bold;">${process.env.SUPPORT_EMAIL || 'support@example.com'}</a>.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
              <p>This email was sent to ${email}. If you believe this email was sent to you by mistake, please disregard it.</p>
            </div>
          </div>
        </div>
      `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      html: content,
    });
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
}
