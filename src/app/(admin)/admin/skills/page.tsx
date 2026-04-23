import { Metadata } from 'next'
import Image from 'next/image'
import { Code2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import SkillForm from '@/components/admin/SkillForm'
import DeleteSkillButton from '@/components/admin/DeleteSkillButton'

export const metadata: Metadata = { title: 'Manage Skills' }

const CATEGORY_LABELS: Record<string, string> = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Database',
  DEVOPS: 'DevOps',
  TOOLS: 'Tools',
  LANGUAGES: 'Languages',
  MOBILE: 'Mobile',
  OTHER: 'Other',
}

const CATEGORY_COLOURS: Record<string, string> = {
  FRONTEND: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  BACKEND: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  DATABASE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  DEVOPS: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  TOOLS: 'bg-primary/10 text-primary border-primary/20',
  LANGUAGES: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  MOBILE: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  OTHER: 'bg-muted text-muted-foreground border-border',
}

function SkillIconDisplay({ iconUrl, name }: { iconUrl: string; name: string }) {
  if (!iconUrl) {
    return <Code2 className="w-5 h-5 text-muted-foreground/50" />
  }
  return (
    <div className="relative w-7 h-7">
      <Image
        src={iconUrl}
        alt={name}
        fill
        className="object-contain"
        unoptimized
      />
    </div>
  )
}

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }, { name: 'asc' }],
  })

  // Group by category
  const grouped = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
        <p className="text-muted-foreground mt-1">
          Manage your skill badges — displayed as an animated section on the home page.
          Upload an icon image (PNG, SVG) for each skill.
        </p>
      </div>

      {/* Add new skill form */}
      <div className="glass-card rounded-2xl border border-primary/10 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">+</span>
          </div>
          <h2 className="font-semibold">Add New Skill</h2>
        </div>
        <SkillForm />
      </div>

      {/* Skills grouped by category */}
      {skills.length === 0 ? (
        <div className="glass-card rounded-2xl border border-primary/10 p-16 text-center text-muted-foreground">
          <Code2 className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No skills yet</p>
          <p className="text-sm mt-1">Add your first skill using the form above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {skills.length} skills across {Object.keys(grouped).length} categories
            </p>
          </div>

          {Object.entries(grouped).map(([category, categorySkills]) => (
            <div key={category} className="glass-card rounded-2xl border border-primary/10 overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-primary/10 bg-primary/3">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${CATEGORY_COLOURS[category]}`}
                >
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-xs text-muted-foreground">{categorySkills.length} skills</span>
              </div>

              {/* Skill rows */}
              <div className="divide-y divide-primary/5">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary/5 transition-colors group"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/15 flex items-center justify-center shrink-0 overflow-hidden">
                      <SkillIconDisplay iconUrl={skill.iconUrl} name={skill.name} />
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{skill.name}</p>
                      {!skill.iconUrl && (
                        <p className="text-xs text-amber-500 mt-0.5">No icon uploaded</p>
                      )}
                    </div>

                    {/* Order badge */}
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0 hidden sm:block">
                      #{skill.order}
                    </span>

                    {/* Delete */}
                    <DeleteSkillButton id={skill.id} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
