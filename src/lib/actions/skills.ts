'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error('Unauthorized')
}

const SkillSchema = z.object({
  name: z.string().min(1).max(60),
  category: z.enum(['FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', 'TOOLS', 'LANGUAGES', 'MOBILE', 'OTHER']),
  iconUrl: z.string().url().or(z.literal('')).default(''),
  order: z.number().int().default(0),
})

export async function createSkill(formData: FormData) {
  await assertAdmin()
  const raw = {
    name: formData.get('name'),
    category: formData.get('category'),
    iconUrl: formData.get('iconUrl') || '',
    order: Number(formData.get('order') ?? 0),
  }
  const parsed = SkillSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }
  await prisma.skill.create({ data: parsed.data })
  revalidatePath('/')
  revalidatePath('/admin/skills')
}

export async function updateSkill(id: string, formData: FormData) {
  await assertAdmin()
  const raw = {
    name: formData.get('name'),
    category: formData.get('category'),
    iconUrl: formData.get('iconUrl') || '',
    order: Number(formData.get('order') ?? 0),
  }
  const parsed = SkillSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }
  await prisma.skill.update({ where: { id }, data: parsed.data })
  revalidatePath('/')
  revalidatePath('/admin/skills')
}

export async function deleteSkill(id: string) {
  await assertAdmin()
  await prisma.skill.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/skills')
}
