'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { assertAdmin } from '@/lib/auth/admin'
import { uploadResume, deleteResume } from '@/lib/storage'

const RESUME_KEY = 'resume_url'

/**
 * Retrieve the public resume PDF URL stored in the site's configuration.
 *
 * @returns The stored resume URL, or `null` if no resume URL is configured.
 */
export async function getResumeUrl(): Promise<string | null> {
  const config = await prisma.siteConfig.findUnique({ where: { key: RESUME_KEY } })
  return config?.value ?? null
}

/**
 * Validates and uploads a resume PDF, persists its public URL in siteConfig, and revalidates affected routes.
 *
 * @param formData - A FormData object expected to contain a `resume` File entry (PDF, under 10 MB)
 * @returns An object with `success: true` and `url` when the upload and persistence succeed; otherwise `success: false` and an `error` message describing the failure
 */
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

/**
 * Deletes the stored resume PDF from storage, removes its public URL record, and revalidates affected routes.
 *
 * Operation requires an admin-authenticated user; non-admin callers will receive a failure response.
 *
 * @returns An object with `success: true` on success; if the operation fails, `success: false` and `error` contains an error message.
 */
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
