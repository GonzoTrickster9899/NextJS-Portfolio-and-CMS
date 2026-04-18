import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tag = searchParams.get('tag')
    const limit = Number(searchParams.get('limit') ?? 20)

    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
        ...(tag ? { tags: { has: tag } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: Math.min(limit, 50),
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        tags: true,
        readingTime: true,
        views: true,
        publishedAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ posts }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('[BLOG_API]', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
