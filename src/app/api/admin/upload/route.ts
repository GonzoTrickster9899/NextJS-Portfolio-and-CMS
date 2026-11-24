import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/admin'
import { uploadImage } from '@/lib/storage'

/**
 * Handle an authenticated multipart image upload and return the uploaded file URL.
 *
 * Validates that the requester is the admin identified by `process.env.ADMIN_EMAIL`, accepts a `file` and optional `folder` (`projects` default), enforces `folder` ∈ {`projects`, `blog`, `skills`}, restricts MIME types to JPEG/PNG/WebP/GIF/AVIF/SVG, and limits file size to 5 MB. Returns appropriate HTTP error responses for authentication, missing/invalid input, unsupported media type, oversized payload, or internal failures.
 *
 * @returns JSON with `{ url: string }` on success, or `{ error: string }` on failure; HTTP status codes reflect the error condition (401, 400, 415, 413, 500).
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await getAdminUser())) {
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
