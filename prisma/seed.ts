import { PrismaClient, ProjectCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed experiences
  await prisma.experience.createMany({
    data: [
      {
        company: 'Acme Corp',
        role: 'Senior Full-Stack Engineer',
        duration: 'Jan 2023 – Present',
        description:
          'Led end-to-end development of a multi-tenant SaaS platform serving 50k+ users. Architected microservices with Node.js, Next.js, and PostgreSQL. Reduced API response times by 40% through query optimization and Redis caching.',
        techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
        order: 0,
        isCurrent: true,
      },
      {
        company: 'Startup XYZ',
        role: 'Full-Stack Developer',
        duration: 'Mar 2021 – Dec 2022',
        description:
          'Built and maintained React-based dashboards and Express REST APIs. Implemented CI/CD pipelines with GitHub Actions and deployed containerized services on AWS ECS.',
        techStack: ['React', 'Express', 'MongoDB', 'AWS', 'GitHub Actions'],
        order: 1,
        isCurrent: false,
      },
    ],
    skipDuplicates: true,
  })

  // Seed site config
  await prisma.siteConfig.createMany({
    data: [
      {
        key: 'hero_name',
        value: 'Your Name',
        description: 'Your full name shown in the hero section',
      },
      {
        key: 'hero_title',
        value: 'Software Engineer',
        description: 'Your job title or tagline',
      },
      {
        key: 'hero_bio',
        value:
          'I build fast, scalable, and beautiful web applications. Passionate about clean code, great UX, and solving real problems with technology.',
        description: 'Short bio shown in hero section',
      },
      {
        key: 'github_url',
        value: 'https://github.com/yourusername',
        description: 'GitHub profile URL',
      },
      {
        key: 'linkedin_url',
        value: 'https://linkedin.com/in/yourusername',
        description: 'LinkedIn profile URL',
      },
      {
        key: 'twitter_url',
        value: 'https://twitter.com/yourusername',
        description: 'Twitter/X profile URL',
      },
    ],
    skipDuplicates: true,
  })

  // Seed sample project
  await prisma.project.createMany({
    data: [
      {
        title: 'Portfolio CMS',
        slug: 'portfolio-cms',
        description:
          'A full-stack portfolio and blog management system built with Next.js 14, Supabase, and Prisma. Features a custom admin dashboard, markdown blog editor, and ISR-powered public site.',
        imageUrl: 'https://placehold.co/800x450/6366f1/ffffff?text=Portfolio+CMS',
        techStack: ['Next.js', 'Supabase', 'Prisma', 'Tailwind CSS', 'TypeScript'],
        githubLink: 'https://github.com/yourusername/portfolio',
        liveLink: 'https://yourportfolio.vercel.app',
        category: ProjectCategory.FULLSTACK,
        isFeatured: true,
        order: 0,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
