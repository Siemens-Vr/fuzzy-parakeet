import { sendMail } from './mailer';

export async function sendVerificationEmail(to: string, token: string) {
  // Fix: Use path parameter to match [token] route structure
  const verifyUrl = `${process.env.APP_BASE_URL}/auth/verify-email/${token}`;

  await sendMail({
    to,
    subject: 'Verify your VR Store account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2>Welcome to VR Store 👋</h2>
        <p>Thanks for signing up. Please verify your email address to activate your account.</p>

        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 20px;
                  background:#667eea;color:#fff;
                  text-decoration:none;border-radius:8px;
                  font-weight:bold;margin-top:16px;">
          Verify Email
        </a>

        <p style="margin-top:24px;font-size:14px;color:#333;">
            Or copy and paste this link into your browser:
            <br/>
            <a href="${verifyUrl}" style="color:#667eea; word-break: break-all;">
                ${verifyUrl}
            </a>
        </p>

        <p style="margin-top:24px;font-size:13px;color:#666;">
          If you did not create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string) {
  await sendMail({
    to,
    subject: 'Welcome to VR Store 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2>Your account is ready 🚀</h2>
        <p>
          Your email has been verified successfully.
          You can now explore, download, and sideload VR apps from the VR Store.
        </p>

        <a href="${process.env.APP_BASE_URL}"
           style="display:inline-block;padding:12px 20px;
                  background:#10b981;color:#fff;
                  text-decoration:none;border-radius:8px;
                  font-weight:bold;margin-top:16px;">
          Go to VR Store
        </a>

        <p style="margin-top:24px;font-size:13px;color:#666;">
          Happy exploring,<br/>
          The VR Store Team
        </p>
      </div>
    `,
  });
}
