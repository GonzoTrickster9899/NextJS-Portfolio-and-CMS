'use client'

import { motion } from 'framer-motion'
import { Briefcase, MapPin } from 'lucide-react'
import type { Experience } from '@prisma/client'

/**
 * Render a vertical timeline of professional experiences.
 *
 * @param experiences - Array of experience objects to render as individual timeline entries
 * @returns A React element containing the rendered experience timeline
 */
export default function ExperienceTimeline({
  experiences,
}: {
  experiences: Experience[]
}) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

      <div className="space-y-8">
        {experiences.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative pl-16"
          >
            {/* Dot */}
            <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Briefcase className="w-4 h-4 text-white" />
            </div>

            {/* Card */}
            <div className="glass-card rounded-2xl p-5 border border-primary/15 hover:border-primary/30 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                <div>
                  <h3 className="font-bold text-base">{exp.role}</h3>
                  <p className="text-primary font-medium text-sm">{exp.company}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground glass-card border border-primary/15 rounded-full px-3 py-1">
                  {exp.isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  )}
                  {exp.duration}
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-4">
                {exp.description}
              </p>

              {exp.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {exp.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-0.5 rounded-md bg-primary/5 text-primary/80 border border-primary/15 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
