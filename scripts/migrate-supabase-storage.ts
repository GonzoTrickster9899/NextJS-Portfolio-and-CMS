/**
 * One-off migration: copy every file the database references in Supabase Storage
 * into Neon Object Storage, then rewrite those URLs in the database.
 *
 * Run it AFTER the database itself has been copied to Neon (`npm run db:push`,
 * then `npm run db:copy-from-supabase`), with `.env.local` pointing at Neon
 * (DATABASE_URL + NEON_STORAGE_*):
 *
 *   npm run storage:migrate -- --dry-run   # show what would change
 *   npm run storage:migrate                # copy files and rewrite URLs
 *
 * Supabase public objects are downloaded over plain HTTPS, so no Supabase
 * credentials are needed. Object keys are kept (e.g. `projects/123-abc.png`),
 * so the script is safe to re-run.
 */
import { Prisma, PrismaClient } from '@prisma/client'
import { putObject, getPublicUrl } from '../src/lib/storage'

const prisma = new PrismaClient()
const dryRun = process.argv.includes('--dry-run')

// https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<key>[?query]
const SUPABASE_URL_RE =
  /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s"'()<>[\]]+/gi
const PUBLIC_PREFIX = '/storage/v1/object/public/'

/** Old URL (without query string) → new Neon URL (without query string) */
const migrated = new Map<string, string>()
const failed = new Set<string>()

function stripQuery(url: string): { base: string; query: string } {
  const i = url.indexOf('?')
  return i === -1 ? { base: url, query: '' } : { base: url.slice(0, i), query: url.slice(i) }
}

/** Extracts the object key (path after the bucket name) from a Supabase public URL. */
function objectKey(base: string): string {
  const afterPrefix = new URL(base).pathname.split(PUBLIC_PREFIX)[1] ?? ''
  const [, ...keyParts] = afterPrefix.split('/') // drop the bucket name
  return keyParts.map(decodeURIComponent).join('/')
}

async function copyObject(base: string): Promise<void> {
  if (migrated.has(base) || failed.has(base)) return

  const key = objectKey(base)
  const newUrl = getPublicUrl(key.split('/').map(encodeURIComponent).join('/'))

  if (dryRun) {
    migrated.set(base, newUrl)
    return
  }

  try {
    const res = await fetch(base)
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
    const body = new Uint8Array(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') ?? 'application/octet-stream'
    const cacheControl =
      key === 'resume/resume.pdf' ? 'no-cache' : 'public, max-age=31536000, immutable'

    await putObject(key, body, contentType, cacheControl)
    migrated.set(base, newUrl)
    console.log(`  copied ${key} (${body.byteLength} bytes)`)
  } catch (err) {
    failed.add(base)
    console.error(`  FAILED ${base}: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/** Copies every Supabase file referenced in `text` and returns `text` with URLs rewritten. */
async function rewrite(text: string): Promise<string> {
  const matches = text.match(SUPABASE_URL_RE) ?? []
  for (const url of matches) await copyObject(stripQuery(url).base)

  return text.replace(SUPABASE_URL_RE, (url) => {
    const { base, query } = stripQuery(url)
    const next = migrated.get(base)
    return next ? next + query : url
  })
}

async function main() {
  console.log(dryRun ? 'Dry run: nothing will be written.\n' : '')
  let rows = 0

  const projects = await prisma.project.findMany({ select: { id: true, title: true, imageUrl: true } })
  for (const p of projects) {
    const imageUrl = await rewrite(p.imageUrl)
    if (imageUrl === p.imageUrl) continue
    rows++
    console.log(`Project "${p.title}": imageUrl → ${imageUrl}`)
    if (!dryRun) await prisma.project.update({ where: { id: p.id }, data: { imageUrl } })
  }

  const posts = await prisma.blogPost.findMany({
    select: { id: true, title: true, thumbnail: true, content: true },
  })
  for (const post of posts) {
    const thumbnail = post.thumbnail ? await rewrite(post.thumbnail) : post.thumbnail
    const content = await rewrite(post.content)
    if (thumbnail === post.thumbnail && content === post.content) continue
    rows++
    console.log(`BlogPost "${post.title}": thumbnail/content rewritten`)
    if (!dryRun) await prisma.blogPost.update({ where: { id: post.id }, data: { thumbnail, content } })
  }

  const skills = await prisma.skill.findMany({ select: { id: true, name: true, iconUrl: true } })
  for (const s of skills) {
    const iconUrl = await rewrite(s.iconUrl)
    if (iconUrl === s.iconUrl) continue
    rows++
    console.log(`Skill "${s.name}": iconUrl → ${iconUrl}`)
    if (!dryRun) await prisma.skill.update({ where: { id: s.id }, data: { iconUrl } })
  }

  const configs = await prisma.siteConfig.findMany({ select: { id: true, key: true, value: true } })
  for (const c of configs) {
    const value = await rewrite(c.value)
    if (value === c.value) continue
    rows++
    console.log(`SiteConfig "${c.key}" → ${value}`)
    if (!dryRun) await prisma.siteConfig.update({ where: { id: c.id }, data: { value } })
  }

  console.log(
    `\n${dryRun ? 'Would copy' : 'Copied'} ${migrated.size} file(s), ` +
      `${dryRun ? 'would update' : 'updated'} ${rows} row(s), ${failed.size} failure(s).`
  )
  if (failed.size > 0) {
    console.log('Rows that reference a failed file were left pointing at Supabase. Fix and re-run.')
    process.exitCode = 1
  }
}

main()
  .catch((err) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
      console.error(
        '\nThe database in DATABASE_URL has no app tables yet, so there is nothing to migrate.\n' +
          'Copy the data first:\n' +
          '  npm run db:push               # create the tables on Neon\n' +
          '  npm run db:copy-from-supabase # copy rows from Supabase (see README)\n' +
          'then run this script again.\n'
      )
    } else {
      console.error(err)
    }
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
