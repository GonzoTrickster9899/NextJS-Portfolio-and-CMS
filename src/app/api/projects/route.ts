import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
