import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error('Unauthorized')
}

/**
 * Handles DELETE requests to remove a project by ID while enforcing admin authorization.
 *
 * @param _req - The incoming request object (unused).
 * @param params - A promise resolving to route parameters; must include `id` of the project to delete.
 * @returns A NextResponse containing JSON:
 * - `{ success: true }` when the project was deleted successfully.
 * - `{ error: 'Unauthorized' }` with status 401 when the requester is not the configured admin.
 * - `{ error: 'Failed to delete project' }` with status 500 when deletion fails.
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
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PROJECT_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
