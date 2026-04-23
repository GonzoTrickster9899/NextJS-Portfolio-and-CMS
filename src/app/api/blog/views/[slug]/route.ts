import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple in-memory deduplication — keyed by IP + slug, expires after 1 hour.
// Resets on cold start (serverless), which is acceptable for view counting.
const recentViews = new Map<string, number>()
const DEDUPE_TTL_MS = 60 * 60 * 1000 // 1 hour

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const ip = getClientIp(req)
    const key = `${ip}:${slug}`
    const now = Date.now()

    // Deduplicate: skip if this IP viewed this post recently
    const lastViewed = recentViews.get(key)
    if (lastViewed && now - lastViewed < DEDUPE_TTL_MS) {
      return NextResponse.json({ success: true, deduplicated: true })
    }

    recentViews.set(key, now)

    await prisma.blogPost.update({
      where: { slug, published: true },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch {
    // Non-critical — silently swallow errors
    return NextResponse.json({ success: false })
  }
}
