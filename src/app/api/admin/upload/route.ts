import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadImage } from '@/lib/supabase/storage'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as 'projects' | 'blog' | 'skills') ?? 'projects'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const validFolders = ['projects', 'blog', 'skills']
    if (!validFolders.includes(folder)) {
      return NextResponse.json({ error: 'Invalid folder. Use projects, blog, or skills.' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, GIF, or SVG.' }, { status: 415 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 5MB limit' }, { status: 413 })
    }

    const url = await uploadImage(file, folder)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('[UPLOAD_API]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
