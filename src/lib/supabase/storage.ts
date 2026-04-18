import { createClient } from './server'

const BUCKET = 'portfolio-images'

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
