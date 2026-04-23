import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Star } from 'lucide-react'
import DeleteProjectButton from '@/components/admin/DeleteProjectButton'

export const metadata: Metadata = { title: 'Manage Projects' }

/**
 * Admin page that displays all projects with controls to create, edit, and delete entries.
 *
 * @returns The React element for the admin projects page showing project count, a creation button, and a list of project rows with thumbnail, metadata, and action controls.
 */
export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">{projects.length} total</p>
        </div>
        <Button asChild className="rounded-full gap-2 bg-gradient-to-r from-primary to-accent text-white">
          <Link href="/admin/projects/new">
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </Button>
      </div>

      <div className="glass-card rounded-2xl border border-primary/10 overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No projects yet.</p>
            <Button asChild className="mt-4 rounded-full gap-2">
              <Link href="/admin/projects/new">
                <Plus className="w-4 h-4" /> Create your first project
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-primary/5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{project.title}</p>
                    {project.isFeatured && (
                      <Star className="w-3.5 h-3.5 text-primary fill-primary shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {project.category.toLowerCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">
                      /{project.slug}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild variant="ghost" size="icon" className="rounded-full w-8 h-8">
                    <Link href={`/admin/projects/${project.id}/edit`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  <DeleteProjectButton id={project.id} title={project.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
