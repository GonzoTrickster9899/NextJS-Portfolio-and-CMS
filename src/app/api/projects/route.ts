import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Handles GET requests to return a paginated list of projects with optional category filtering.
 *
 * @returns An object `{ projects, total, page, limit }` where `projects` is an array of project records matching the optional `category` filter, `total` is the total number of matching projects, `page` is the current page number, and `limit` is the page size.
 *
 * On failure, responds with a JSON error object and a 500 status code.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50)
    const page = Math.max(Number(searchParams.get('page') ?? 1), 1)
    const skip = (page - 1) * limit

    const where = category ? { category: category as any } : {}

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        take: limit,
        skip,
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json(
      { projects, total, page, limit },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  } catch (error) {
    console.error('[PROJECTS_API]', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
