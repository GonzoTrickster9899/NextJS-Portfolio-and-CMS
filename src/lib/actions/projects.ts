'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { assertAdmin } from '@/lib/auth/admin'

const ProjectSchema = z.object({
  title: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(1000),
  imageUrl: z.string().url(),
  techStack: z.array(z.string()).min(1),
  githubLink: z.string().url().optional().or(z.literal('')),
  liveLink: z.string().url().optional().or(z.literal('')),
  category: z.enum(['FRONTEND', 'BACKEND', 'FULLSTACK', 'DEVOPS', 'MOBILE', 'OTHER']),
  isFeatured: z.boolean().default(false),
  order: z.number().int().default(0),
})

export async function createProject(formData: FormData) {
  await assertAdmin()
  const raw = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    imageUrl: formData.get('imageUrl'),
    techStack: JSON.parse(formData.get('techStack') as string ?? '[]'),
    githubLink: formData.get('githubLink'),
    liveLink: formData.get('liveLink'),
    category: formData.get('category'),
    isFeatured: formData.get('isFeatured') === 'true',
    order: Number(formData.get('order') ?? 0),
  }
  const parsed = ProjectSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }
  await prisma.project.create({ data: parsed.data })
  revalidatePath('/portfolio')
  revalidatePath('/admin/projects')
  redirect('/admin/projects')
}

export async function updateProject(id: string, formData: FormData) {
  await assertAdmin()
  const raw = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    imageUrl: formData.get('imageUrl'),
    techStack: JSON.parse(formData.get('techStack') as string ?? '[]'),
    githubLink: formData.get('githubLink'),
    liveLink: formData.get('liveLink'),
    category: formData.get('category'),
    isFeatured: formData.get('isFeatured') === 'true',
    order: Number(formData.get('order') ?? 0),
  }
  const parsed = ProjectSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }
  await prisma.project.update({ where: { id }, data: parsed.data })
  revalidatePath('/portfolio')
  revalidatePath('/admin/projects')
  redirect('/admin/projects')
}

export async function deleteProject(id: string) {
  await assertAdmin()
  await prisma.project.delete({ where: { id } })
  revalidatePath('/portfolio')
  revalidatePath('/admin/projects')
}
