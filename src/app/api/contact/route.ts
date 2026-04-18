import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ContactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = parsed.data

    // Save to database
    await prisma.message.create({ data: { name, email, subject, message } })

    // Send notification email to admin
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Portfolio <noreply@yourdomain.com>',
      to: process.env.ADMIN_EMAIL!,
      subject: `[Portfolio Contact] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">New message from your portfolio</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Name:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Subject:</td>
              <td style="padding: 8px 0;">${subject}</td>
            </tr>
          </table>
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />
          <p style="white-space: pre-wrap; color: #333; line-height: 1.6;">${message}</p>
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">
            Reply directly to this email or visit your 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inbox">admin inbox</a>.
          </p>
        </div>
      `,
      reply_to: email,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CONTACT_API]', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
