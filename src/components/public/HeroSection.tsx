'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Github, Linkedin, Download, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroData {
  name: string
  title: string
  bio: string
  githubUrl: string
  linkedinUrl: string
  resumeUrl: string
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

// Static decorative tech cards — no emoji, clean text labels
const TECH_BADGES = [
  { label: 'Full Stack',        sublabel: 'Development',      position: { top: '4%',   left: '40%'  }, delay: 0.6 },
  { label: 'UI/UX and Graphic', sublabel: 'Design', position: { top: '18%',  right: '-10%'}, delay: 0.7 },
  { label: 'System Design',     sublabel: 'Architecture',       position: { top: '55%',  left: '-12%' }, delay: 0.8 },
  { label: 'DevOps',            sublabel: 'Deployment',      position: { bottom: '22%', right: '-8%'}, delay: 0.9 },
  { label: 'Project',           sublabel: 'Management',     position: { bottom: '12%', left: '-6%' }, delay: 1.0 },
]

export default function HeroSection({ data }: { data: HeroData }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0 mesh-bg" aria-hidden />

      {/* Background blobs */}
      <motion.div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl"
        variants={blobVariants}
        animate="animate"
      />
      <motion.div
        className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-accent/15 to-primary/15 blur-3xl"
        animate={{ scale: [1, 1.06, 0.97, 1], transition: { duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 } }}
      />

      <div className="section-container relative z-10 py-12 lg:py-24 grid lg:grid-cols-2 gap-12 items-center w-full">

        {/* Left: Content */}
        <div className="max-w-2xl">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-primary/30 text-primary mb-6">
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
              <Button asChild variant="outline" size="lg" className="rounded-full gap-2 glass-card border-primary/20 hover:border-primary/40 hover:-translate-y-0.5 transition-all">
                <Link href="/contact">Get In Touch</Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 mt-10">
              <span className="text-sm text-muted-foreground">Find me on</span>
              <div className="flex items-center gap-2">
                {data.githubUrl && (
                  <a href={data.githubUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-110 transition-all" aria-label="GitHub">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {data.linkedinUrl && (
                  <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-110 transition-all" aria-label="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
              {data.resumeUrl && (
                <>
                  <div className="h-4 w-px bg-border" />
                  <a
                    href={data.resumeUrl}
                    download="resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
                  >
                    <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                    Resume
                  </a>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Right: Person image + floating tech cards */}
        <div className="hidden lg:flex relative justify-center items-center h-[640px] w-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[380px] h-[380px] rounded-full bg-gradient-to-br from-primary/30 to-accent/20 blur-3xl" />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-primary/20" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-primary/10 border-dashed" />

          <motion.div
            className="relative z-10 w-[320px] h-[420px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Image
              src="/hero-person.png"
              alt="Developer"
              fill
              className="object-contain object-bottom drop-shadow-2xl"
              priority
            />
          </motion.div>

          {TECH_BADGES.map((badge) => (
            <motion.div
              key={badge.label}
              className="absolute glass-card rounded-2xl px-4 py-3 flex items-center gap-3 border border-primary/20 shadow-xl backdrop-blur-md min-w-[160px] z-20"
              style={badge.position as React.CSSProperties}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: badge.delay, duration: 0.6 }}
              whileHover={{ scale: 1.06, y: -4, zIndex: 50 }}
            >
              {/* Coloured dot accent instead of emoji */}
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-accent shrink-0" />
              <div className="flex flex-col">
                <p className="text-sm font-bold text-foreground leading-none mb-1">{badge.label}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-primary/70 leading-none">
                  {badge.sublabel}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-xs text-muted-foreground">Scroll</span>
        <motion.div
          className="w-0.5 h-6 bg-gradient-to-b from-primary/60 to-transparent rounded-full"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
