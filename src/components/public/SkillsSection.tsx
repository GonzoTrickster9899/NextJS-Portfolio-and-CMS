'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Code2 } from 'lucide-react'

type SkillCategory = 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'DEVOPS' | 'TOOLS' | 'LANGUAGES' | 'MOBILE' | 'OTHER'

interface Skill {
  id: string
  name: string
  category: SkillCategory
  iconUrl: string
  order: number
}

interface Props {
  skills: Skill[]
}

const CATEGORY_META: Record<SkillCategory, { label: string; colour: string; glow: string; dot: string }> = {
  FRONTEND:  { label: 'Frontend',   colour: 'bg-sky-500/10 text-sky-500 border-sky-500/25',         glow: 'shadow-sky-500/20',    dot: 'bg-sky-400' },
  BACKEND:   { label: 'Backend',    colour: 'bg-violet-500/10 text-violet-500 border-violet-500/25', glow: 'shadow-violet-500/20', dot: 'bg-violet-400' },
  DATABASE:  { label: 'Database',   colour: 'bg-amber-500/10 text-amber-500 border-amber-500/25',    glow: 'shadow-amber-500/20',  dot: 'bg-amber-400' },
  DEVOPS:    { label: 'DevOps',     colour: 'bg-orange-500/10 text-orange-500 border-orange-500/25', glow: 'shadow-orange-500/20', dot: 'bg-orange-400' },
  TOOLS:     { label: 'Tools',      colour: 'bg-primary/10 text-primary border-primary/25',           glow: 'shadow-primary/20',    dot: 'bg-primary' },
  LANGUAGES: { label: 'Languages',  colour: 'bg-rose-500/10 text-rose-500 border-rose-500/25',        glow: 'shadow-rose-500/20',   dot: 'bg-rose-400' },
  MOBILE:    { label: 'Mobile',     colour: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/25',  glow: 'shadow-indigo-500/20', dot: 'bg-indigo-400' },
  OTHER:     { label: 'Other',      colour: 'bg-muted text-muted-foreground border-border',            glow: 'shadow-muted',         dot: 'bg-muted-foreground' },
}

const CATEGORY_ORDER: SkillCategory[] = ['FRONTEND', 'BACKEND', 'LANGUAGES', 'DATABASE', 'DEVOPS', 'TOOLS', 'MOBILE', 'OTHER']

/**
 * Render a skill icon using the provided image URL or a compact fallback icon.
 *
 * @param iconUrl - The source URL for the icon; when absent or empty a `Code2` fallback icon is rendered.
 * @param name - Accessible alt text for the image.
 * @param size - Visual size of the icon: `'sm'` renders the small classes (`w-5 h-5`), `'md'` renders the medium classes (`w-6 h-6`).
 * @returns A JSX element containing the image (with `object-contain`) when `iconUrl` is present, otherwise a `Code2` fallback icon.
 */
function SkillIcon({ iconUrl, name, size = 'md' }: { iconUrl: string; name: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
  if (!iconUrl) {
    return <Code2 className={`${dim} opacity-60`} />
  }
  return (
    <div className={`relative ${dim} shrink-0`}>
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

/**
 * Renders an animated skill badge showing the skill's icon and name, with hover lift/glow and staggered entry/exit animations.
 *
 * @param skill - The skill to display; its `category` is used for styling and `iconUrl` is used for the badge icon.
 * @param index - Zero-based index used to compute the staggered entrance delay for animation timing.
 * @returns A JSX element representing the animated skill badge.
 */
function SkillBadge({ skill, index }: { skill: Skill; index: number }) {
  const meta = CATEGORY_META[skill.category]
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: -10 }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileHover={{ y: -6, scale: 1.08 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative cursor-default"
    >
      <div
        className={`
          relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
          glass-card border transition-all duration-300
          ${meta.colour}
          ${hovered ? `shadow-lg ${meta.glow}` : ''}
        `}
      >
        {/* Icon */}
        <SkillIcon iconUrl={skill.iconUrl} name={skill.name} />

        {/* Name */}
        <span className="text-sm font-semibold whitespace-nowrap">{skill.name}</span>
      </div>
    </motion.div>
  )
}

/**
 * Renders a clickable category filter pill containing a colored status dot, a label, and a numeric count.
 *
 * @param label - Visible text label for the category
 * @param active - If `true`, applies active styling to the pill
 * @param dot - Tailwind/CSS classes that determine the dot's color when the pill is inactive
 * @param count - Number to display on the right side of the pill
 * @param onClick - Callback invoked when the pill is clicked
 * @returns The category pill as a clickable button element
 */
function CategoryPill({
  label,
  active,
  dot,
  count,
  onClick,
}: {
  label: string
  active: boolean
  dot: string
  count: number
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
        ${active
          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
          : 'glass-card border-primary/15 text-muted-foreground hover:text-foreground hover:border-primary/30'
        }
      `}
    >
      <span className={`w-2 h-2 rounded-full ${active ? 'bg-primary-foreground' : dot}`} />
      {label}
      <span className={`text-xs tabular-nums ${active ? 'opacity-70' : 'text-primary'}`}>
        {count}
      </span>
    </motion.button>
  )
}

/**
 * Render the "Skills & Technologies" section with animated category filters, grouped or filtered skill badges, and category count cards.
 *
 * @param skills - Array of `Skill` objects to display; controls which categories are shown and the rendered badges.
 * @returns A JSX element containing the skills section, or `null` when `skills` is empty.
 */
export default function SkillsSection({ skills }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'ALL'>('ALL')

  if (skills.length === 0) return null

  const categories = CATEGORY_ORDER.filter((c) => skills.some((s) => s.category === c))

  const displayed = activeCategory === 'ALL'
    ? skills
    : skills.filter((s) => s.category === activeCategory)

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            <span className="w-6 h-px bg-primary" />
            Skills &amp; Technologies
            <span className="w-6 h-px bg-primary" />
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Tools of the Trade
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Technologies I work with across the full stack.
          </p>
        </motion.div>

        {/* Category filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          <CategoryPill
            label="All"
            active={activeCategory === 'ALL'}
            dot="bg-primary"
            count={skills.length}
            onClick={() => setActiveCategory('ALL')}
          />
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat]
            const count = skills.filter((s) => s.category === cat).length
            return (
              <CategoryPill
                key={cat}
                label={meta.label}
                active={activeCategory === cat}
                dot={meta.dot}
                count={count}
                onClick={() => setActiveCategory(cat)}
              />
            )
          })}
        </motion.div>

        {/* Skills grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          {activeCategory === 'ALL' ? (
            // Grouped by category
            <div className="space-y-10">
              {categories.map((cat, catIdx) => {
                const catSkills = skills.filter((s) => s.category === cat)
                const meta = CATEGORY_META[cat]
                return (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 + catIdx * 0.07 }}
                  >
                    {/* Category label row */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${meta.colour}`}>
                        {meta.label}
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent" />
                    </div>

                    {/* Badge row */}
                    <div className="flex flex-wrap gap-3">
                      {catSkills.map((skill, i) => (
                        <SkillBadge key={skill.id} skill={skill} index={i} />
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            // Flat filtered view
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-wrap gap-3"
              >
                {displayed.map((skill, i) => (
                  <SkillBadge key={skill.id} skill={skill} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        {/* Category count cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {categories.slice(0, 4).map((cat) => {
            const meta = CATEGORY_META[cat]
            const catSkills = skills.filter((s) => s.category === cat)
            return (
              <motion.div
                key={cat}
                whileHover={{ y: -3, scale: 1.02 }}
                onClick={() => setActiveCategory(cat)}
                className="glass-card rounded-2xl border border-primary/10 p-5 cursor-pointer hover:border-primary/25 transition-all duration-200 group"
              >
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${meta.colour.split(' ')[1]}`}>
                  {meta.label}
                </p>
                <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {catSkills.length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {catSkills.length === 1 ? 'skill' : 'skills'}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
