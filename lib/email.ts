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
    const subject = status === 'ACTIVE' 
      ? 'Your Publisher Account has been Approved!'
      : 'Publisher Account Status Update';

    const content = status === 'ACTIVE'
      ? `
        <h2>Congratulations ${name}!</h2>
        <p>Your publisher account has been approved. You can now log in and start using our platform.</p>
        <p>Visit our platform to:</p>
        <ul>
          <li>Browse available merchant programs</li>
          <li>Apply for partnerships</li>
          <li>Generate tracking links</li>
          <li>Monitor your performance</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
      `
      : `
        <h2>Account Status Update</h2>
        <p>Dear ${name},</p>
        <p>We regret to inform you that your publisher account application has been declined.</p>
        <p>If you believe this is a mistake or would like to appeal this decision, please contact our support team.</p>
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
