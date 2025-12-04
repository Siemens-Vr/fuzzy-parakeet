export async function sendVerificationEmail(to: string, token: string) {
  // TODO: implement real email sending (e.g. with Nodemailer or an email provider)
  console.log('sendVerificationEmail placeholder', { to, token });
}

export async function sendWelcomeEmail(to: string) {
  console.log('sendWelcomeEmail placeholder', { to });
}