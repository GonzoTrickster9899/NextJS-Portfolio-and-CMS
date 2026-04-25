import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error('Unauthorized')
}

/**
 * Updates a message's read status for the message identified by the route `id`; only accessible to the configured admin user.
 *
 * @param params - A promise resolving to an object with the route `id` of the message to update.
 * @param req - HTTP request whose JSON body may include `isRead` (boolean) to set the message's read state; if omitted, the message is marked as read.
 * @returns A NextResponse containing JSON:
 * - `{ success: true }` on successful update,
 * - `{ error: 'Unauthorized' }` with status 401 if the caller is not the admin,
 * - `{ error: 'Failed to update message' }` with status 500 on other failures.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await assertAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id } = await params
    await prisma.message.update({
      where: { id },
      data: { isRead: body.isRead ?? true },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[INBOX_PATCH]', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

/**
 * Deletes the message identified by the route `id`, requiring admin authorization.
 *
 * @param params - A promise that resolves to route parameters containing the `id` of the message to delete.
 * @returns A JSON response: `{ success: true }` when deletion succeeds; `{ error: 'Unauthorized' }` with status 401 if the caller is not the admin; `{ error: 'Failed to delete message' }` with status 500 for other failures.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await assertAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.message.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[INBOX_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
