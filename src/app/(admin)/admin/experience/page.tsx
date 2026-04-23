import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ExperienceForm from '@/components/admin/ExperienceForm'
import DeleteExperienceButton from '@/components/admin/DeleteExperienceButton'
import { Briefcase } from 'lucide-react'

export const metadata: Metadata = { title: 'Manage Experience' }

/**
 * Server component that renders the "Manage Experience" page.
 *
 * Fetches experience entries ordered by their `order` field, renders an "Add New Entry" form,
 * and displays current experience entries (each with role, company, duration, and delete control)
 * when any exist.
 *
 * @returns A React element for the experience management page containing the add-entry form and an ordered list of existing experiences (if any).
 */
export default async function ExperiencePage() {
  const experiences = await prisma.experience.findMany({ orderBy: { order: 'asc' } })

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Experience</h1>
        <p className="text-muted-foreground mt-1">Manage your work history timeline</p>
      </div>

      {/* Add new form */}
      <div className="glass-card rounded-2xl border border-primary/10 p-6">
        <h2 className="font-semibold mb-4">Add New Entry</h2>
        <ExperienceForm />
      </div>

      {/* Existing entries */}
      {experiences.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Current Entries</h2>
          {experiences.map((exp) => (
            <div key={exp.id} className="glass-card rounded-2xl border border-primary/10 p-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{exp.role}</p>
                  {exp.isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Current</span>}
                </div>
                <p className="text-primary text-sm">{exp.company}</p>
                <p className="text-xs text-muted-foreground">{exp.duration}</p>
              </div>
              <DeleteExperienceButton id={exp.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
