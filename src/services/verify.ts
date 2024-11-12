import nodemailer from "nodemailer";
import { AppConfig } from "../config";

const verificationCodes: Map<
  string,
  { code: string; email: string; expires: Date }
> = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: AppConfig.GMAIL_ADDRESS,
    pass: AppConfig.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  discordId: string,
  email: string
): Promise<boolean> {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    verificationCodes.set(discordId, {
      code,
      email,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });

    await transporter.sendMail({
      from: AppConfig.GMAIL_ADDRESS,
      to: email,
      subject: "Verify Your Ramp Discord Integration",
      html: `
        <h2>Ramp Bot Verfication Code</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

export function verifyCode(
  discordId: string,
  submittedCode: string
): {
  valid: boolean;
  email?: string;
  message: string;
} {
  const storedData = verificationCodes.get(discordId);

  if (!storedData) {
    return {
      valid: false,
      message: "No verification code found. Please request a new one.",
    };
  }

  if (new Date() > storedData.expires) {
    verificationCodes.delete(discordId);
    return {
      valid: false,
      message: "Verification code has expired. Please request a new one.",
    };
  }

  if (storedData.code !== submittedCode) {
    return {
      valid: false,
      message: "Invalid verification code. Please try again.",
    };
  }

  verificationCodes.delete(discordId);

  return {
    valid: true,
    email: storedData.email,
    message: "Code verified successfully!",
  };
}

setInterval(() => {
  const now = new Date();
  for (const [discordId, data] of verificationCodes.entries()) {
    if (now > data.expires) {
      verificationCodes.delete(discordId);
    }
  }
}, 5 * 60 * 1000);
