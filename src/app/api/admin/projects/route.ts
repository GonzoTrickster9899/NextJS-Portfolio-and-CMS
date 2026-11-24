import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAdmin } from '@/lib/auth/admin'

/**
 * Handle GET requests to return all projects to an authorized admin.
 *
 * @returns A NextResponse containing the list of projects under `projects` on success; on authorization failure, a JSON error `{ error: 'Unauthorized' }` with status 401; on database/fetch failure, a JSON error `{ error: 'Failed to fetch projects' }` with status 500.
 */
export async function GET() {
  try {
    await assertAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('[PROJECTS_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
