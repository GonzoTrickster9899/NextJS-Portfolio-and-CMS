import { createClient } from './server'

const BUCKET = 'portfolio-images'
const RESUME_BUCKET = 'portfolio-images'
const RESUME_PATH = 'resume/resume.pdf'

export async function uploadImage(
  file: File,
  folder: 'projects' | 'blog'
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

export async function deleteImage(url: string): Promise<void> {
  const supabase = await createClient()
  const path = url.split(`${BUCKET}/`)[1]
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}

export async function uploadResume(file: File): Promise<string> {
  const supabase = await createClient()

  // Always overwrite at a fixed path so there's only ever one resume
  const { error } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(RESUME_PATH, file, {
      cacheControl: '0',
      upsert: true,
      contentType: 'application/pdf',
    })

  if (error) throw new Error(`Resume upload failed: ${error.message}`)

  // Add a cache-busting timestamp to the public URL so browsers re-fetch
  const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(RESUME_PATH)
  return `${data.publicUrl}?t=${Date.now()}`
}

export async function deleteResume(): Promise<void> {
  const supabase = await createClient()
  await supabase.storage.from(RESUME_BUCKET).remove([RESUME_PATH])
}
