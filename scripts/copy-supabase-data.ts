/**
 * One-off migration: copy the app's tables from the old Supabase database into Neon.
 *
 * Copies Project, BlogPost, Message, Experience, SiteConfig and Skill rows with
 * their original ids and timestamps. Supabase Auth users are not copied (create
 * the admin account in Neon Auth instead), and uploaded files are handled
 * separately by `npm run storage:migrate`.
 *
 *   1. npm run db:push                              # create the tables on Neon
 *   2. set SUPABASE_DATABASE_URL (see README)
 *   3. npm run db:copy-from-supabase -- --dry-run   # show row counts only
 *   4. npm run db:copy-from-supabase                # copy the rows
 *
 * Reads from SUPABASE_DATABASE_URL and writes to DIRECT_URL (or DATABASE_URL).
 * Rows whose id or unique key already exists on Neon are skipped, so the script
 * is safe to re-run.
 */
import { Prisma, PrismaClient } from '@prisma/client'

const dryRun = process.argv.includes('--dry-run')
const BATCH_SIZE = 500

function fail(message: string): never {
  console.error(`\n${message}\n`)
  process.exit(1)
}

/** host[:port] + database name, for logs and the same-database check (no credentials) */
function describe(url: string): string {
  try {
    const u = new URL(url)
    return `${u.host}${u.pathname}`
  } catch {
    fail('A database URL is not a valid postgresql:// connection string.')
  }
}

const sourceUrl = process.env.SUPABASE_DATABASE_URL
const targetUrl = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!sourceUrl) {
  fail(
    'SUPABASE_DATABASE_URL is not set. Set it to your old Supabase connection string, e.g. in PowerShell:\n' +
      '  $env:SUPABASE_DATABASE_URL = "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"'
  )
}
if (!targetUrl) fail('DIRECT_URL / DATABASE_URL is not set. Point it at your Neon database in .env.local.')
if (describe(sourceUrl) === describe(targetUrl)) {
  fail('SUPABASE_DATABASE_URL and DIRECT_URL point at the same database. Nothing to copy.')
}

const source = new PrismaClient({ datasourceUrl: sourceUrl })
const target = new PrismaClient({ datasourceUrl: targetUrl })

function isMissingTable(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021'
}

/** Fails with a readable message if `db` lacks the app tables. */
async function checkTables(db: PrismaClient, label: string, hint: string): Promise<void> {
  try {
    await db.project.count()
  } catch (err) {
    if (isMissingTable(err)) fail(`The ${label} database has no app tables. ${hint}`)
    throw err
  }
}

async function copyTable<T>(
  name: string,
  read: () => Promise<T[]>,
  countTarget: () => Promise<number>,
  write: (rows: T[]) => Promise<{ count: number }>
): Promise<void> {
  const rows = await read()
  const before = await countTarget()

  if (dryRun) {
    console.log(`${name.padEnd(11)} ${rows.length} row(s) in Supabase, ${before} already on Neon`)
    return
  }

  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    inserted += (await write(rows.slice(i, i + BATCH_SIZE))).count
  }

  const skipped = rows.length - inserted
  console.log(
    `${name.padEnd(11)} copied ${inserted} of ${rows.length}` +
      (skipped ? ` (${skipped} skipped: same id or unique key already on Neon)` : '')
  )
}

async function main() {
  console.log(`From: ${describe(sourceUrl!)}  (Supabase)`)
  console.log(`To:   ${describe(targetUrl!)}  (Neon)`)
  console.log(dryRun ? 'Dry run: nothing will be written.\n' : '')

  await checkTables(source, 'Supabase', 'Check that SUPABASE_DATABASE_URL points at the old project.')
  await checkTables(target, 'Neon', 'Run `npm run db:push` first to create them.')

  await copyTable(
    'Project',
    () => source.project.findMany(),
    () => target.project.count(),
    (data) => target.project.createMany({ data, skipDuplicates: true })
  )
  await copyTable(
    'BlogPost',
    () => source.blogPost.findMany(),
    () => target.blogPost.count(),
    (data) => target.blogPost.createMany({ data, skipDuplicates: true })
  )
  await copyTable(
    'Message',
    () => source.message.findMany(),
    () => target.message.count(),
    (data) => target.message.createMany({ data, skipDuplicates: true })
  )
  await copyTable(
    'Experience',
    () => source.experience.findMany(),
    () => target.experience.count(),
    (data) => target.experience.createMany({ data, skipDuplicates: true })
  )
  await copyTable(
    'SiteConfig',
    () => source.siteConfig.findMany(),
    () => target.siteConfig.count(),
    (data) => target.siteConfig.createMany({ data, skipDuplicates: true })
  )
  await copyTable(
    'Skill',
    () => source.skill.findMany(),
    () => target.skill.count(),
    (data) => target.skill.createMany({ data, skipDuplicates: true })
  )

  console.log(dryRun ? '\nDry run complete.' : '\nDone. Next: npm run storage:migrate')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => Promise.all([source.$disconnect(), target.$disconnect()]))
