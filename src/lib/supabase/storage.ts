import { createClient } from './server'

const BUCKET = 'portfolio-images'
const RESUME_BUCKET = 'portfolio-images'
const RESUME_PATH = 'resume/resume.pdf'

/**
 * Uploads a file to the specified storage folder and returns its public URL.
 *
 * @param file - The file to upload
 * @param folder - Destination subfolder within the storage bucket (`'projects'`, `'blog'`, or `'skills'`)
 * @returns The public URL of the uploaded object
 * @throws Error if the upload fails
 */
export async function uploadImage(
  file: File,
  folder: 'projects' | 'blog' | 'skills'
): Promise<string> {
  const supabase = await createClient()
  const ext = file.name.split('.').pop()
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return data.publicUrl
}

/**
 * Uploads a skill icon image to the skills folder in storage.
 *
 * @param file - The image file to upload
 * @returns The public URL of the uploaded icon
 */
export async function uploadSkillIcon(file: File): Promise<string> {
  return uploadImage(file, 'skills')
}

/**
 * Remove the storage object identified by a Supabase public URL.
 *
 * @param url - The public URL of the stored object; if the bucket/path cannot be derived from `url`, the function returns without performing any deletion
 */
export async function deleteImage(url: string): Promise<void> {
  const supabase = await createClient()
  const path = url.split(`${BUCKET}/`)[1]
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}

/**
 * Uploads a PDF to the repository resume path and returns its public URL with a cache-busting timestamp.
 *
 * @param file - The PDF file to upload as the resume
 * @returns The public URL of the uploaded resume with a `?t=<timestamp>` query parameter to bust caches
 * @throws Error if the upload operation fails
 */
export async function uploadResume(file: File): Promise<string> {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(RESUME_PATH, file, {
      cacheControl: '0',
      upsert: true,
      contentType: 'application/pdf',
    })

  if (error) throw new Error(`Resume upload failed: ${error.message}`)

  const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(RESUME_PATH)
  return `${data.publicUrl}?t=${Date.now()}`
}

/**
 * Deletes the resume PDF from the configured resume storage path.
 *
 * Removes the object at RESUME_PATH in the resume bucket. If the object does not exist, the function completes without error.
 */
export async function deleteResume(): Promise<void> {
  const supabase = await createClient()
  await supabase.storage.from(RESUME_BUCKET).remove([RESUME_PATH])
}
