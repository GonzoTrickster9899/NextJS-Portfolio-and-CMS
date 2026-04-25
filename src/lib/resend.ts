import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send an email notification to the admin containing a submitted contact form message.
 *
 * @param name - Sender's full name from the contact form
 * @param email - Sender's email address (used as the reply-to and for the "Reply" link)
 * @param subject - Subject provided by the sender
 * @param message - Body of the message submitted by the sender
 * @returns The response object returned by the Resend emails API
 */
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
        <!-- Emerald header -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; border-radius: 16px 16px 0 0; color: white;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700;">New Contact Message</h1>
          <p style="margin: 4px 0 0; opacity: 0.85; font-size: 14px;">From your portfolio contact form</p>
        </div>
        <div style="background: #f4faf7; padding: 24px; border-radius: 0 0 16px 16px; border: 1px solid #d1fae5; border-top: none;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 12px 8px 0; font-size: 13px; color: #6b7280; font-weight: 600; width: 80px; vertical-align: top;">Name</td>
              <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 500;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px 8px 0; font-size: 13px; color: #6b7280; font-weight: 600; vertical-align: top;">Email</td>
              <td style="padding: 8px 0; font-size: 14px;">
                <a href="mailto:${email}" style="color: #059669; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 12px 8px 0; font-size: 13px; color: #6b7280; font-weight: 600; vertical-align: top;">Subject</td>
              <td style="padding: 8px 0; font-size: 14px; color: #111827;">${subject}</td>
            </tr>
          </table>
          <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #d1fae5;">
            <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; font-weight: 600;">Message</p>
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${message}</p>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
               style="display: inline-block; padding: 10px 24px; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; border-radius: 24px; font-size: 14px; font-weight: 600;">
              Reply to ${name}
            </a>
          </div>
          <p style="margin: 16px 0 0; text-align: center; font-size: 12px; color: #9ca3af;">
            Or visit your <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inbox" style="color: #059669;">admin inbox</a>
          </p>
        </div>
      </div>
    `,
  })
}
