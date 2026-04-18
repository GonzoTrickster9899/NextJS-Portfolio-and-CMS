'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error('Unauthorized')
}

const ExperienceSchema = z.object({
  company: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  duration: z.string().min(1).max(100),
  description: z.string().min(10),
  techStack: z.array(z.string()),
  order: z.number().int().default(0),
  isCurrent: z.boolean().default(false),
})

export async function createExperience(formData: FormData) {
  await assertAdmin()
  const raw = {
    company: formData.get('company'),
    role: formData.get('role'),
    duration: formData.get('duration'),
    description: formData.get('description'),
    techStack: JSON.parse(formData.get('techStack') as string ?? '[]'),
    order: Number(formData.get('order') ?? 0),
    isCurrent: formData.get('isCurrent') === 'true',
  }
  const parsed = ExperienceSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }
  await prisma.experience.create({ data: parsed.data })
  revalidatePath('/')
  revalidatePath('/admin/experience')
}

export async function deleteExperience(id: string) {
  await assertAdmin()
  await prisma.experience.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/experience')
}
