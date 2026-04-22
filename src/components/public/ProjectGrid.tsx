'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectCard from './ProjectCard'
import type { Project, ProjectCategory } from '@prisma/client'

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Frontend', value: 'FRONTEND' },
  { label: 'Backend', value: 'BACKEND' },
  { label: 'Full-Stack', value: 'FULLSTACK' },
  { label: 'DevOps', value: 'DEVOPS' },
  { label: 'Mobile', value: 'MOBILE' },
  { label: 'Other', value: 'OTHER' },
]

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState('ALL')

  const filtered =
    active === 'ALL'
      ? projects
      : projects.filter((p) => p.category === active)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.value
          return (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value)}
              className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white shadow-md shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground glass-card border border-primary/15 hover:border-primary/30'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                />
              )}
              <span className="relative">{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <ProjectCard project={project} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 text-muted-foreground"
        >
          <p className="text-lg font-medium">No projects in this category yet.</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </motion.div>
      )}
    </div>
  )
}
