import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/public/HeroSection'
import ProjectCard from '@/components/public/ProjectCard'
import BlogCard from '@/components/public/BlogCard'
import ExperienceTimeline from '@/components/public/ExperienceTimeline'
import SectionHeading from '@/components/public/SectionHeading'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Software engineer specializing in full-stack web development.',
}

// ISR — revalidate every 60 seconds
export const revalidate = 60

async function getHomeData() {
  const [configs, featuredProjects, recentPosts, experiences] = await Promise.all([
    prisma.siteConfig.findMany({
      where: {
        key: {
          in: ['hero_name', 'hero_title', 'hero_bio', 'github_url', 'linkedin_url'],
        },
      },
    }),
    prisma.project.findMany({
      where: { isFeatured: true },
      orderBy: { order: 'asc' },
      take: 3,
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    }),
    prisma.experience.findMany({
      orderBy: { order: 'asc' },
    }),
  ])

  const cfg = Object.fromEntries(configs.map((c) => [c.key, c.value]))
  return { cfg, featuredProjects, recentPosts, experiences }
}

export default async function HomePage() {
  const { cfg, featuredProjects, recentPosts, experiences } = await getHomeData()

  const heroData = {
    name: cfg.hero_name ?? 'Your Name',
    title: cfg.hero_title ?? 'Software Engineer',
    bio:
      cfg.hero_bio ??
      'I build fast, scalable, and beautiful web applications. Passionate about clean code, great UX, and solving real problems with technology.',
    githubUrl: cfg.github_url ?? '',
    linkedinUrl: cfg.linkedin_url ?? '',
  }

  return (
    <>
      {/* ── Hero ── */}
      <HeroSection data={heroData} />

      {/* ── Featured Projects ── */}
      {featuredProjects.length > 0 && (
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background pointer-events-none" />
          <div className="section-container relative">
            <div className="flex items-end justify-between mb-12">
              <SectionHeading
                label="Featured Work"
                title="Projects I'm Proud Of"
                subtitle="A selection of my best work, spanning full-stack applications and open-source tools."
                className="mb-0"
              />
              <Button asChild variant="ghost" className="hidden sm:flex gap-1 text-primary shrink-0">
                <Link href="/portfolio">
                  All projects <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>

            <div className="flex justify-center mt-8 sm:hidden">
              <Button asChild variant="outline" className="rounded-full gap-2">
                <Link href="/portfolio">
                  View All Projects <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Experience ── */}
      {experiences.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="section-container">
            <SectionHeading
              label="Experience"
              title="Where I've Worked"
              subtitle="My professional journey and the companies I've had the privilege to work with."
            />
            <div className="max-w-3xl">
              <ExperienceTimeline experiences={experiences} />
            </div>
          </div>
        </section>
      )}

      {/* ── Recent Blog Posts ── */}
      {recentPosts.length > 0 && (
        <section className="py-24">
          <div className="section-container">
            <div className="flex items-end justify-between mb-12">
              <SectionHeading
                label="Writing"
                title="From The Blog"
                subtitle="Thoughts on software engineering, tooling, and things I'm learning."
                className="mb-0"
              />
              <Button asChild variant="ghost" className="hidden sm:flex gap-1 text-primary shrink-0">
                <Link href="/blog">
                  All posts <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ── */}
      <section className="py-24">
        <div className="section-container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-px shadow-2xl shadow-primary/20">
            <div className="relative rounded-3xl bg-gradient-to-br from-primary/90 to-accent/90 backdrop-blur-xl px-8 py-16 text-center text-white overflow-hidden">
              {/* Decorative blobs inside card */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />

              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Let&apos;s Build Something Together
                </h2>
                <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                  Have a project in mind or just want to chat? I&apos;m always open to
                  interesting conversations and opportunities.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white text-primary hover:bg-white/90 gap-2 shadow-lg font-semibold"
                >
                  <Link href="/contact">
                    Get In Touch <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
