import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const projects = await prisma.project.findMany({
      where: {
        ...(category && category !== 'ALL' ? { category: category as any } : {}),
        ...(featured === 'true' ? { isFeatured: true } : {}),
      },
      orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        techStack: true,
        githubLink: true,
        liveLink: true,
        category: true,
        isFeatured: true,
        order: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ projects }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('[PROJECTS_API]', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
