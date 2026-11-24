'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { assertAdmin } from '@/lib/auth/admin'

const SkillSchema = z.object({
  name: z.string().min(1).max(60),
  category: z.enum(['FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', 'TOOLS', 'LANGUAGES', 'MOBILE', 'OTHER']),
  iconUrl: z.string().url().or(z.literal('')).default(''),
  order: z.number().int().default(0),
})

/**
 * Create a new skill from form data, validate the input, persist it, and revalidate relevant cache paths.
 *
 * @param formData - Form data with fields: `name` (string, 1–60 chars), `category` (one of FRONTEND | BACKEND | DATABASE | DEVOPS | TOOLS | LANGUAGES | MOBILE | OTHER), `iconUrl` (string URL or `''`), and `order` (integer)
 * @returns `undefined` on success; if validation fails, an object `{ error: Record<string, string[]> }` mapping field names to validation messages
 */
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

/**
 * Updates an existing skill record with validated form input and revalidates relevant cache paths.
 *
 * @param id - The ID of the skill to update
 * @param formData - Form data with fields: `name`, `category`, `iconUrl` (optional), and `order` (optional)
 * @returns `{ error: Record<string, string[] | undefined> }` when validation fails; otherwise `undefined`
 */
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

/**
 * Delete a skill record by its ID and revalidate the homepage and admin skills cache paths.
 *
 * @param id - The skill `id` to delete
 * @throws Error('Unauthorized') if the current user is not the configured admin
 */
export async function deleteSkill(id: string) {
  await assertAdmin()
  await prisma.skill.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/skills')
}
