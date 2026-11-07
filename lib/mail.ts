import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
  if (!user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  }
  return transporter;
}

// Never throws: the order is still saved even if the email fails to send
export async function sendMail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const t = getTransport();
  if (!t) {
    console.warn("[mail] SMTP_USER / SMTP_PASS are not set, email was not sent.");
    return false;
  }
  try {
    await t.sendMail({
      from: `"${process.env.SMTP_FROM_NAME ?? "Abrar Khan Electronics"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
      replyTo,
    });
    return true;
  } catch (e) {
    console.error("[mail] problem sending email:", e);
    return false;
  }
}