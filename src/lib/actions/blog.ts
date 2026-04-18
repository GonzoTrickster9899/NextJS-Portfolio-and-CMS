'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error('Unauthorized')
}

function calcReadingTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))
}

const BlogSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(10).max(300),
  content: z.string().min(50),
  thumbnail: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()),
  published: z.boolean().default(false),
})

export async function createPost(formData: FormData) {
  await assertAdmin()
  const raw = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    thumbnail: formData.get('thumbnail') || '',
    tags: JSON.parse(formData.get('tags') as string ?? '[]'),
    published: formData.get('published') === 'true',
  }
  const parsed = BlogSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  await prisma.blogPost.create({
    data: {
      ...parsed.data,
      thumbnail: parsed.data.thumbnail || null,
      readingTime: calcReadingTime(parsed.data.content),
      publishedAt: parsed.data.published ? new Date() : null,
    },
  })
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function updatePost(id: string, formData: FormData) {
  await assertAdmin()
  const raw = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    thumbnail: formData.get('thumbnail') || '',
    tags: JSON.parse(formData.get('tags') as string ?? '[]'),
    published: formData.get('published') === 'true',
  }
  const parsed = BlogSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const existing = await prisma.blogPost.findUnique({ where: { id } })

  await prisma.blogPost.update({
    where: { id },
    data: {
      ...parsed.data,
      thumbnail: parsed.data.thumbnail || null,
      readingTime: calcReadingTime(parsed.data.content),
      publishedAt:
        parsed.data.published && !existing?.publishedAt
          ? new Date()
          : existing?.publishedAt,
    },
  })
  revalidatePath('/blog')
  revalidatePath(`/blog/${parsed.data.slug}`)
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function deletePost(id: string) {
  await assertAdmin()
  await prisma.blogPost.delete({ where: { id } })
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}
