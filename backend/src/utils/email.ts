import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendStatusEmail(to: string, title: string, status: string) {
    try {
        await resend.emails.send({
            from: "CivicFix <onboarding@resend.dev>",
            to,
            subject: `Your complaint "${title}" is now ${status}`,
            html: `<p>Hello,</p><p>Your reported issue "<strong>${title}</strong>" has been updated to status: <strong>${status}</strong>.</p><p>— CivicFix Team</p>`,
        });
    } catch (err) {
        console.error("Email send failed:", err);
    }
}