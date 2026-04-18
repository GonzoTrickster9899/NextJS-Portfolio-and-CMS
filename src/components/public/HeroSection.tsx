'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Github, Linkedin, Download, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroData {
  name: string
  title: string
  bio: string
  githubUrl: string
  linkedinUrl: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
}

const blobVariants = {
  animate: {
    scale: [1, 1.08, 0.96, 1],
    rotate: [0, 8, -4, 0],
    transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
  },
}

export default function HeroSection({ data }: { data: HeroData }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0 mesh-bg" aria-hidden />

      <motion.div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl"
        variants={blobVariants}
        animate="animate"
      />
      
      {/* ── Main Layout Container ── */}
      <div className="section-container relative z-10 py-12 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Content */}
        <div className="max-w-2xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-primary/20 text-primary mb-6">
                <Sparkles className="w-3 h-3" />
                Available for new opportunities
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.05] mb-4"
            >
              Hey, I&apos;m <span className="gradient-text">{data.name}</span>
            </motion.h1>

            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-gradient-to-r from-primary to-accent" />
                <span className="text-xl sm:text-2xl font-medium text-muted-foreground">
                  {data.title}
                </span>
              </div>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-10 text-balance"
            >
              {data.bio}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-0.5">
                <Link href="/portfolio">
                  View My Work <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full gap-2 glass-card border-border/60 hover:border-primary/40 hover:-translate-y-0.5 transition-all">
                <Link href="/contact">Get In Touch</Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 mt-10">
              <span className="text-sm text-muted-foreground">Find me on</span>
              <div className="flex items-center gap-2">
                {data.githubUrl && (
                  <a href={data.githubUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-110 transition-all">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {data.linkedinUrl && (
                  <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-110 transition-all">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
              <div className="h-4 w-px bg-border" />
              <a href="/resume.pdf" download className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-3.5 h-3.5" /> Resume
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Floating Tech Badges (Only visible on large screens) */}
        <div className="hidden lg:flex relative justify-center items-center h-[600px] w-full">
          {TECH_BADGES.map((badge, i) => (
            <motion.div
              key={badge.label}
              className="absolute glass-card rounded-2xl px-5 py-4 flex items-center gap-4 border border-border/50 shadow-xl backdrop-blur-md min-w-[200px]"
              style={badge.position}
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5, zIndex: 50 }}
            >
              <span className="text-2xl">{badge.icon}</span>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-foreground leading-none mb-1">{badge.label}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">
                  {badge.sublabel}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        <span className="text-xs text-muted-foreground">Scroll</span>
        <motion.div className="w-0.5 h-6 bg-gradient-to-b from-primary/60 to-transparent rounded-full" animate={{ scaleY: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
      </motion.div>
    </section>
  )
}

const TECH_BADGES = [
  { 
    icon: '⚡', 
    label: 'Next.js 14', 
    sublabel: 'App Router', 
    position: { top: '5%', left: '15%', transform: 'rotate(-2deg)' } 
  },
  { 
    icon: '🎨', 
    label: 'Tailwind CSS', 
    sublabel: 'Modern Styling', 
    position: { top: '25%', left: '45%', transform: 'rotate(3deg)' } 
  },
  { 
    icon: '🗄️', 
    label: 'Supabase', 
    sublabel: 'DB & Auth', 
    position: { top: '50%', left: '5%', transform: 'rotate(-1deg)' } 
  },
  { 
    icon: '🚀', 
    label: 'Vercel', 
    sublabel: 'Deployment', 
    position: { top: '72%', left: '40%', transform: 'rotate(4deg)' } 
  },
  { 
    icon: '🔷', 
    label: 'TypeScript', 
    sublabel: 'Type Safety', 
    position: { top: '92%', left: '10%', transform: 'rotate(-3deg)' } 
  },
]