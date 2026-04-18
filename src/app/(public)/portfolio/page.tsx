import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProjectGrid from '@/components/public/ProjectGrid'
import SectionHeading from '@/components/public/SectionHeading'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'A collection of projects I have built across the full stack.',
}

export const revalidate = 60

export default async function PortfolioPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="pt-28 pb-24">
      <div className="section-container">
        <SectionHeading
          label="Portfolio"
          title="Things I've Built"
          subtitle={`${projects.length} projects across frontend, backend, full-stack, and DevOps.`}
        />
        <ProjectGrid projects={projects} />
      </div>
    </div>
  )
}
