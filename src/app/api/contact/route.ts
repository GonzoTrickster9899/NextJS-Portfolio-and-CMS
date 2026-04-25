import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactNotification } from '@/lib/resend'
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
})

/**
 * Handle incoming POST requests for contact submissions by validating input, saving the message, and attempting to notify recipients.
 *
 * Validation failures return a 400 response with `{ error: 'Invalid input', details: <fieldErrors> }`. On success the message is persisted and the handler attempts to send a notification email; email delivery failures are logged but do not alter the client response. Unexpected errors return a 500 response with `{ error: 'Something went wrong' }`.
 *
 * @returns A JSON NextResponse: `{ success: true }` on successful save and notification attempt; `{ error: 'Invalid input', details: ... }` with status 400 for validation errors; `{ error: 'Something went wrong' }` with status 500 for unexpected failures.
 */
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

    // Save to database first — if email fails, the message is still captured
    await prisma.message.create({ data: { name, email, subject, message } })

    // Send notification email (non-fatal if it fails)
    try {
      await sendContactNotification({ name, email, subject, message })
    } catch (emailError) {
      // Log but don't surface to client — the message was saved successfully
      console.error('[CONTACT_EMAIL]', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CONTACT_API]', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
