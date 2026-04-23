import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProjectForm from '@/components/admin/ProjectForm'

export const metadata: Metadata = { title: 'New Project' }

/**
 * Renders the "New Project" admin page with a header (back button, title, subtitle) and a card containing the project form.
 *
 * @returns The JSX element for the New Project page layout.
 */
export default function NewProjectPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/admin/projects">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Project</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Add a new project to your portfolio</p>
        </div>
      </div>
      <div className="glass-card rounded-2xl border border-primary/10 p-6">
        <ProjectForm />
      </div>
    </div>
  )
}
