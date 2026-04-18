import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    await prisma.blogPost.update({
      where: { slug, published: true },
      data: { views: { increment: 1 } },
    })
    return NextResponse.json({ success: true })
  } catch {
    // Silently fail — view counting is non-critical
    return NextResponse.json({ success: false })
  }
}
