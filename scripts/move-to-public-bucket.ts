/**
 * Fix for a bucket that was created with the default "Private" access level
 * (images then fail with 403 AccessDenied). Neon can't change a bucket's access
 * level, so this copies every object into a bucket created as "Public read" and
 * points the database URLs at it.
 *
 *   1. Neon Console → Object storage → New bucket, access level "Public read"
 *   2. npm run storage:move-bucket -- --to <new-bucket> --dry-run
 *   3. npm run storage:move-bucket -- --to <new-bucket>
 *   4. Set NEON_STORAGE_BUCKET=<new-bucket> in .env.local and on Vercel, then
 *      restart the dev server / redeploy
 *
 * Copies from the current NEON_STORAGE_BUCKET, keeping keys, Content-Type and
 * Cache-Control. The old bucket is left untouched; delete it in the Console once
 * the site works. Safe to re-run.
 */
import { PrismaClient } from '@prisma/client'
import {
  S3Client,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'

function fail(message: string): never {
  console.error(`\n${message}\n`)
  process.exit(1)
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) fail(`Missing environment variable ${name} (set it in .env.local).`)
  return value
}

function argValue(flag: string): string | undefined {
  const args = process.argv.slice(2)
  const inline = args.find((a) => a.startsWith(`${flag}=`))
  if (inline) return inline.slice(flag.length + 1)
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}

const dryRun = process.argv.includes('--dry-run')
const to = argValue('--to')
const from = process.env.NEON_STORAGE_BUCKET || 'portfolio-images'
const endpoint = requireEnv('NEON_STORAGE_ENDPOINT').replace(/\/+$/, '')

if (!to || to.startsWith('--')) fail('Usage: npm run storage:move-bucket -- --to <new-bucket> [--dry-run]')
if (to === from) fail(`--to is the current bucket ("${from}"). Pass the new Public read bucket instead.`)
if (process.env.NEON_STORAGE_PUBLIC_URL) {
  fail('NEON_STORAGE_PUBLIC_URL is set, so URLs may not use the bucket path. Unset it before running this script.')
}

const s3 = new S3Client({
  endpoint,
  region: requireEnv('NEON_STORAGE_REGION'),
  credentials: {
    accessKeyId: requireEnv('NEON_STORAGE_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('NEON_STORAGE_SECRET_ACCESS_KEY'),
  },
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
})
const prisma = new PrismaClient()

function httpStatus(err: unknown): number | undefined {
  return (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
}

async function checkBucketExists(bucket: string): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }))
  } catch (err) {
    if (httpStatus(err) === 404) {
      fail(`Bucket "${bucket}" doesn't exist. Create it in the Neon Console (Object storage → New bucket) with access level "Public read".`)
    }
    throw err
  }
}

/** Uploads a tiny probe object and fetches it without credentials, as browsers do. */
async function isPublicRead(bucket: string): Promise<boolean> {
  const key = `.public-read-check-${Date.now()}`
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: 'ok', ContentType: 'text/plain' }))
  try {
    return (await fetch(`${endpoint}/${bucket}/${key}`)).ok
  } finally {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch(() => {})
  }
}

async function listObjects(bucket: string): Promise<{ key: string; size: number }[]> {
  const objects: { key: string; size: number }[] = []
  let ContinuationToken: string | undefined
  do {
    const page = await s3.send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken }))
    for (const o of page.Contents ?? []) if (o.Key) objects.push({ key: o.Key, size: o.Size ?? -1 })
    ContinuationToken = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (ContinuationToken)
  return objects
}

/** True if `bucket` already holds `key` with the given size (so a re-run can skip it). */
async function alreadyCopied(bucket: string, key: string, size: number): Promise<boolean> {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return head.ContentLength === size
  } catch (err) {
    if (httpStatus(err) === 404) return false
    throw err
  }
}

async function copyObject(key: string): Promise<void> {
  const src = await s3.send(new GetObjectCommand({ Bucket: from, Key: key }))
  if (!src.Body) throw new Error('empty response body')
  await s3.send(
    new PutObjectCommand({
      Bucket: to,
      Key: key,
      Body: await src.Body.transformToByteArray(),
      ContentType: src.ContentType,
      CacheControl: src.CacheControl,
      ContentDisposition: src.ContentDisposition,
      Metadata: src.Metadata,
    })
  )
}

async function rewriteUrls(): Promise<number> {
  const oldBase = `${endpoint}/${from}/`
  const newBase = `${endpoint}/${to}/`
  const swap = (s: string) => s.split(oldBase).join(newBase)
  let rows = 0

  for (const p of await prisma.project.findMany({ select: { id: true, imageUrl: true } })) {
    if (!p.imageUrl.includes(oldBase)) continue
    rows++
    if (!dryRun) await prisma.project.update({ where: { id: p.id }, data: { imageUrl: swap(p.imageUrl) } })
  }
  for (const b of await prisma.blogPost.findMany({ select: { id: true, thumbnail: true, content: true } })) {
    if (!b.thumbnail?.includes(oldBase) && !b.content.includes(oldBase)) continue
    rows++
    if (!dryRun) {
      await prisma.blogPost.update({
        where: { id: b.id },
        data: { thumbnail: b.thumbnail ? swap(b.thumbnail) : b.thumbnail, content: swap(b.content) },
      })
    }
  }
  for (const s of await prisma.skill.findMany({ select: { id: true, iconUrl: true } })) {
    if (!s.iconUrl.includes(oldBase)) continue
    rows++
    if (!dryRun) await prisma.skill.update({ where: { id: s.id }, data: { iconUrl: swap(s.iconUrl) } })
  }
  for (const c of await prisma.siteConfig.findMany({ select: { id: true, value: true } })) {
    if (!c.value.includes(oldBase)) continue
    rows++
    if (!dryRun) await prisma.siteConfig.update({ where: { id: c.id }, data: { value: swap(c.value) } })
  }
  return rows
}

async function main() {
  console.log(`From bucket: ${from}`)
  console.log(`To bucket:   ${to}`)
  console.log(dryRun ? 'Dry run: no files are copied and no database rows change.\n' : '')

  await checkBucketExists(to!)
  if (!(await isPublicRead(to!))) {
    fail(
      `Bucket "${to}" isn't publicly readable either (anonymous reads are denied).\n` +
        'Delete it and create it again in the Neon Console with access level "Public read".'
    )
  }
  console.log(`✓ "${to}" is publicly readable`)

  const objects = await listObjects(from)
  let copied = 0
  let skipped = 0
  const failed: string[] = []

  for (const { key, size } of objects) {
    if (await alreadyCopied(to!, key, size)) {
      skipped++
      continue
    }
    if (dryRun) {
      console.log(`  would copy ${key}`)
      copied++
      continue
    }
    try {
      await copyObject(key)
      copied++
      console.log(`  copied ${key}`)
    } catch (err) {
      failed.push(key)
      console.error(`  FAILED ${key}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log(
    `\n${dryRun ? 'Would copy' : 'Copied'} ${copied} object(s), ${skipped} already in "${to}", ${failed.length} failure(s).`
  )
  if (failed.length > 0) {
    fail('Some objects failed to copy, so the database was not changed. Re-run the script to retry.')
  }

  const rows = await rewriteUrls()
  console.log(`${dryRun ? 'Would update' : 'Updated'} ${rows} database row(s) to use "${to}".`)

  if (!dryRun) {
    console.log(
      `\nNext: set NEON_STORAGE_BUCKET="${to}" in .env.local and on Vercel, then restart the dev server / redeploy.\n` +
        `The old "${from}" bucket is untouched; delete it in the Neon Console once the site works.`
    )
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
