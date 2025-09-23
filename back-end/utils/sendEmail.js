import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

// Check if SendGrid API key is properly configured
const sendGridApiKey = process.env.SENDGRID_API_KEY;
if (!sendGridApiKey || !sendGridApiKey.startsWith("SG.")) {
  console.warn(
    "Warning: SendGrid API key not properly configured. Email functionality will be disabled."
  );
} else {
  sgMail.setApiKey(sendGridApiKey);
}

const styles = {
  wrapper: `
    background: #f4f7fa;
    padding: 40px 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `,
  container: `
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  `,
  headerSection: `
    background: #ffffff;
    padding: 20px 30px;
    border-bottom: 1px solid #edf2f7;
    text-align: center;
  `,
  logo: `
    display: block;
    margin: 0 auto 10px;
    font-size: 24px;
    font-weight: 700;
    color: #2b6cb0;
    text-decoration: none;
  `,
  header: `
    font-size: 20px;
    font-weight: 600;
    color: #1a202c;
    margin: 0;
  `,
  subheader: `
    font-size: 14px;
    color: #718096;
    margin: 8px 0 0;
  `,
  content: `
    padding: 30px;
    font-size: 15px;
    line-height: 1.6;
    color: #4a5568;
  `,
  code: `
    display: block;
    background: #f7fafc;
    color: #2b6cb0;
    font-size: 24px;
    font-weight: 600;
    padding: 15px;
    border-radius: 6px;
    text-align: center;
    margin: 20px 0;
    letter-spacing: 2px;
    border: 1px solid #e2e8f0;
  `,
  button: `
    display: inline-block;
    background: #2b6cb0;
    color: #ffffff;
    padding: 12px 32px;
    text-decoration: none;
    font-size: 15px;
    font-weight: 600;
    border-radius: 6px;
    transition: background 0.2s ease;
  `,
  buttonHover: `
    background: #2c5282;
  `,
  footer: `
    background: #f7fafc;
    padding: 20px 30px;
    font-size: 12px;
    color: #718096;
    text-align: center;
    border-top: 1px solid #e2e8f0;
  `,
  link: `
    color: #2b6cb0;
    text-decoration: none;
    font-weight: 500;
  `,
};

const emailTemplates = {
  emailConfirmation: ({ code }) => ({
    subject: "Confirm Your Account",
    html: `
      <div style="${styles.wrapper}">
        <div style="${styles.container}">
          <div style="${styles.headerSection}">
            <a href="#" style="${styles.logo}">MedRX</a>
            <div style="${styles.header}">Welcome to MedRX</div>
            <div style="${styles.subheader}">Let’s get you started</div>
          </div>
          <div style="${styles.content}">
            <p>Hi there,</p>
            <p>Thanks for joining MedRX! To activate your account, use the code below:</p>
            <div style="${styles.code}">${code}</div>
            <p>Enter this code on the verification page to complete your setup.</p>
            <p>If you didn’t sign up, please ignore this email.</p>
          </div>
          ${footer()}
        </div>
      </div>
    `,
  }),

  emailUpdate: ({ code }) => ({
    subject: "Confirm Your Email Change",
    html: `
      <div style="${styles.wrapper}">
        <div style="${styles.container}">
          <div style="${styles.headerSection}">
            <a href="#" style="${styles.logo}">MedRX</a>
            <div style="${styles.header}">Email Update</div>
            <div style="${styles.subheader}">Secure your new email</div>
          </div>
          <div style="${styles.content}">
            <p>Hello,</p>
            <p>You’ve requested to update your email address. Please confirm with this code:</p>
            <div style="${styles.code}">${code}</div>
            <p>Use it in the app to finalize the change. If this wasn’t you, contact support immediately.</p>
          </div>
          ${footer()}
        </div>
      </div>
    `,
  }),

  passwordReset: ({ resetLink }) => ({
    subject: "Reset Your Password",
    html: `
      <div style="${styles.wrapper}">
        <div style="${styles.container}">
          <div style="${styles.headerSection}">
            <a href="#" style="${styles.logo}">MedRX</a>
            <div style="${styles.header}">Password Reset</div>
            <div style="${
              styles.subheader
            }">Restore access to your account</div>
          </div>
          <div style="${styles.content}">
            <p>Hi,</p>
            <p>Forgot your password? Click below to reset it:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetLink}" 
                 style="${styles.button}"
                 onmouseover="this.style.background='#2c5282'"
                 onmouseout="this.style.background='#2b6cb0'">
                Reset Password
              </a>
            </div>
            <p>This link expires in 15 minutes. If you didn’t request this, please secure your account.</p>
          </div>
          ${footer()}
        </div>
      </div>
    `,
  }),

  emailVerification: ({ code }) => ({
    subject: "Verify Your Email Address",
    html: `
      <div style="${styles.wrapper}">
        <div style="${styles.container}">
          <div style="${styles.headerSection}">
            <a href="#" style="${styles.logo}">MedRX</a>
            <div style="${styles.header}">Email Verification</div>
            <div style="${styles.subheader}">One step to go</div>
          </div>
          <div style="${styles.content}">
            <p>Hello,</p>
            <p>We need to verify your email. Please use this code:</p>
            <div style="${styles.code}">${code}</div>
            <p>Enter it to activate your account. If this wasn’t you, let us know.</p>
          </div>
          ${footer()}
        </div>
      </div>
    `,
  }),

  prescriptionReceived: ({ senderName, folderName }) => ({
    subject: "New Prescription Received",
    html: `
      <div style="${styles.wrapper}">
        <div style="${styles.container}">
          <div style="${styles.headerSection}">
            <a href="#" style="${styles.logo}">MedRX</a>
            <div style="${styles.header}">New Prescription</div>
            <div style="${styles.subheader}">You have a new message</div>
          </div>
          <div style="${styles.content}">
            <p>Hello,</p>
            <p>You’ve received a new prescription from <strong>${senderName}</strong>.</p>
            <p>It has been saved in your folder: <strong>${folderName}</strong>.</p>
            <p>Check your MedRX account to view it.</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.FRONTEND_URL}/prescriptions" 
                 style="${styles.button}"
                 onmouseover="this.style.background='#2c5282'"
                 onmouseout="this.style.background='#2b6cb0'">
                View Prescription
              </a>
            </div>
            <p>If you didn’t expect this, please contact support.</p>
          </div>
          ${footer()}
        </div>
      </div>
    `,
  }),
  default: ({ text }) => ({
    subject: "MedRX Notification",
    html: `
      <div style="${styles.wrapper}">
        <div style="${styles.container}">
          <div style="${styles.headerSection}">
            <a href="#" style="${styles.logo}">MedRX</a>
            <div style="${styles.header}">Update</div>
            <div style="${styles.subheader}">Stay informed</div>
          </div>
          <div style="${styles.content}">
            <p>Hi there,</p>
            <p>${text || "No specific update available at this time."}</p>
          </div>
          ${footer()}
        </div>
      </div>
    `,
  }),
};

const footer = () => `
  <div style="${styles.footer}">
    <p>Need help? Reach out to <a href="mailto:support@MedRX.site" style="${
      styles.link
    }">support@MedRX.com</a></p>
    <p>© ${new Date().getFullYear()} MedRX, Inc. All rights reserved.</p>
  </div>
`;

const sendEmail = async ({ to, subject, type, data }) => {
  // Check if SendGrid is properly configured
  if (
    !process.env.SENDGRID_API_KEY ||
    !process.env.SENDGRID_API_KEY.startsWith("SG.")
  ) {
    console.log("Email sending skipped - SendGrid not configured");
    return {
      success: true,
      recipient: to,
      message: "Email sending disabled in development",
    };
  }

  try {
    const template = emailTemplates[type] || emailTemplates.default;
    const { subject: templateSubject, html } = template(data);

    const mailOptions = {
      from: `"MedRX" <${process.env.EMAIL_FROM}>`,
      to,
      subject: subject || templateSubject,
      html,
      trackingSettings: {
        clickTracking: {
          enable: false, // تعطيل تتبع النقرات
          enableText: false,
        },
      },
    };

    const response = await sgMail.send(mailOptions);
    console.log("Email sent:", subject); // للتحقق
    return { success: true, recipient: to };
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log(
        "تم تجاوز الحد اليومي للرسائل (100 رسالة). انتظر حتى الغد أو قم بترقية الخطة."
      );
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;
