import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProjectForm from '@/components/admin/ProjectForm'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Edit Project' }

/**
 * Render the admin "Edit Project" page for the project identified by `id`.
 *
 * @param params - A promise that resolves to an object with `id`, the project identifier
 * @returns A React element containing the edit interface for the specified project. If no project is found for `id`, a 404 response is triggered.
 */
export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/admin/projects">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{project.title}</p>
        </div>
      </div>
      <div className="glass-card rounded-2xl border border-primary/10 p-6">
        <ProjectForm project={project} />
      </div>
    </div>
  )
}
