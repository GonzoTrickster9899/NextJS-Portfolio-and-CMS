import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

/**
 * Neon Object Storage (S3-compatible).
 *
 * Env vars use a NEON_STORAGE_ prefix rather than AWS_*, because Vercel reserves
 * AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION for its own runtime.
 * The bucket must be created with the `public_read` access level so uploaded
 * images and the resume can be served by URL.
 */
const BUCKET = process.env.NEON_STORAGE_BUCKET || 'portfolio-images'
const RESUME_PATH = 'resume/resume.pdf'

let client: S3Client | undefined

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}

function getClient(): S3Client {
  client ??= new S3Client({
    endpoint: requireEnv('NEON_STORAGE_ENDPOINT'),
    region: requireEnv('NEON_STORAGE_REGION'),
    credentials: {
      accessKeyId: requireEnv('NEON_STORAGE_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('NEON_STORAGE_SECRET_ACCESS_KEY'),
    },
    // Neon Object Storage only supports path-style addressing
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
  })
  return client
}

/**
 * Base URL that public objects are served from: `<endpoint>/<bucket>`, or
 * `NEON_STORAGE_PUBLIC_URL` when set (e.g. a CDN in front of the bucket).
 */
function publicBaseUrl(): string {
  const base =
    process.env.NEON_STORAGE_PUBLIC_URL ||
    `${requireEnv('NEON_STORAGE_ENDPOINT').replace(/\/+$/, '')}/${BUCKET}`
  return base.replace(/\/+$/, '')
}

/**
 * Returns the public URL for an object key in the bucket.
 */
export function getPublicUrl(key: string): string {
  return `${publicBaseUrl()}/${key}`
}

/**
 * Writes an object to the bucket, replacing any object with the same key.
 *
 * @throws Error if the upload fails
 */
export async function putObject(
  key: string,
  body: Uint8Array,
  contentType: string,
  cacheControl: string
): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    })
  )
}

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
  const ext = file.name.split('.').pop()
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  try {
    // Keys are unique per upload, so the object can be cached indefinitely
    await putObject(
      key,
      new Uint8Array(await file.arrayBuffer()),
      file.type,
      'public, max-age=31536000, immutable'
    )
  } catch (err) {
    throw new Error(`Upload failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  return getPublicUrl(key)
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
 * Remove the storage object identified by its public URL.
 *
 * @param url - The public URL of the stored object; if it does not belong to this bucket, the function returns without performing any deletion
 */
export async function deleteImage(url: string): Promise<void> {
  const prefix = `${publicBaseUrl()}/`
  if (!url.startsWith(prefix)) return
  const key = decodeURIComponent(url.slice(prefix.length).split('?')[0])
  if (!key) return
  await getClient().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

/**
 * Uploads a PDF to the fixed resume path and returns its public URL with a cache-busting timestamp.
 *
 * @param file - The PDF file to upload as the resume
 * @returns The public URL of the uploaded resume with a `?t=<timestamp>` query parameter to bust caches
 * @throws Error if the upload operation fails
 */
export async function uploadResume(file: File): Promise<string> {
  try {
    await putObject(
      RESUME_PATH,
      new Uint8Array(await file.arrayBuffer()),
      'application/pdf',
      'no-cache'
    )
  } catch (err) {
    throw new Error(`Resume upload failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  return `${getPublicUrl(RESUME_PATH)}?t=${Date.now()}`
}

/**
 * Deletes the resume PDF from the fixed resume path.
 *
 * Deleting a key that does not exist succeeds, so this completes without error when there is no resume.
 */
export async function deleteResume(): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: RESUME_PATH }))
}
