import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactNotification({
  name,
  email,
  subject,
  message,
}: {
  name: string
  email: string
  subject: string
  message: string
}) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Portfolio <noreply@yourdomain.com>',
    to: process.env.ADMIN_EMAIL!,
    reply_to: email,
    subject: `[Portfolio Contact] ${subject}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #f97316, #ec4899); padding: 24px; border-radius: 16px 16px 0 0; color: white;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700;">New Contact Message</h1>
          <p style="margin: 4px 0 0; opacity: 0.85; font-size: 14px;">From your portfolio contact form</p>
        </div>
        <div style="background: #f9f7f5; padding: 24px; border-radius: 0 0 16px 16px; border: 1px solid #e8e4e0; border-top: none;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 12px 8px 0; font-size: 13px; color: #888; font-weight: 600; width: 80px;">Name</td>
              <td style="padding: 8px 0; font-size: 14px; color: #333; font-weight: 500;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px 8px 0; font-size: 13px; color: #888; font-weight: 600;">Email</td>
              <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #f97316; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px 8px 0; font-size: 13px; color: #888; font-weight: 600;">Subject</td>
              <td style="padding: 8px 0; font-size: 14px; color: #333;">${subject}</td>
            </tr>
          </table>
          <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e8e4e0;">
            <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; font-weight: 600;">Message</p>
            <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.7; white-space: pre-wrap;">${message}</p>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
               style="display: inline-block; padding: 10px 24px; background: linear-gradient(135deg, #f97316, #ec4899); color: white; text-decoration: none; border-radius: 24px; font-size: 14px; font-weight: 600;">
              Reply to ${name}
            </a>
          </div>
        </div>
      </div>
    `,
  })
}
