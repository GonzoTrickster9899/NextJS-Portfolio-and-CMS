import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProjectForm from '@/components/admin/ProjectForm'

export const metadata: Metadata = { title: 'New Project' }

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl space-y-6">
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
      <div className="glass-card rounded-2xl border border-border/50 p-6">
        <ProjectForm />
      </div>
    </div>
  )
}
