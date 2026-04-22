'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { uploadResume, deleteResume } from '@/lib/supabase/storage'

const RESUME_KEY = 'resume_url'

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error('Unauthorized')
  return user
}

export async function getResumeUrl(): Promise<string | null> {
  const config = await prisma.siteConfig.findUnique({ where: { key: RESUME_KEY } })
  return config?.value ?? null
}

export async function uploadResumeAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await assertAdmin()

    const file = formData.get('resume') as File | null
    if (!file) return { success: false, error: 'No file provided' }
    if (file.type !== 'application/pdf') return { success: false, error: 'Only PDF files are accepted' }
    if (file.size > 10 * 1024 * 1024) return { success: false, error: 'File must be under 10 MB' }

    const url = await uploadResume(file)

    // Upsert the URL in SiteConfig
    await prisma.siteConfig.upsert({
      where: { key: RESUME_KEY },
      update: { value: url },
      create: {
        key: RESUME_KEY,
        value: url,
        description: 'Public URL of the uploaded resume PDF',
      },
    })

    revalidatePath('/')
    revalidatePath('/admin/resume')
    return { success: true, url }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed'
    return { success: false, error: msg }
  }
}

export async function deleteResumeAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin()
    await deleteResume()
    await prisma.siteConfig.deleteMany({ where: { key: RESUME_KEY } })
    revalidatePath('/')
    revalidatePath('/admin/resume')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Delete failed'
    return { success: false, error: msg }
  }
}
