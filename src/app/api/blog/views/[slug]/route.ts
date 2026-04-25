import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple in-memory deduplication — keyed by IP + slug, expires after 1 hour.
// Resets on cold start (serverless), which is acceptable for view counting.
const recentViews = new Map<string, number>()
const DEDUPE_TTL_MS = 60 * 60 * 1000 // 1 hour

/**
 * Extracts the client's IP address from a NextRequest's headers.
 *
 * Prefers the first value of `x-forwarded-for`, falls back to `x-real-ip`, and
 * returns `"unknown"` if neither header is present.
 *
 * @returns The client IP as a string, or `"unknown"` if it cannot be determined.
 */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

/**
 * Handle POST requests to increment a blog post's view count while deduplicating repeated views from the same client IP within an hour.
 *
 * @param req - The incoming NextRequest; the client IP is read from `x-forwarded-for` or `x-real-ip`.
 * @param params - Promise resolving to an object with the route `slug` identifying the blog post.
 * @returns JSON indicating result: `{ success: true }` when the view was counted, `{ success: true, deduplicated: true }` when the increment is skipped due to a recent view from the same IP, or `{ success: false }` on error.
 */
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
