import Link from 'next/link'
import { Github, Linkedin, Twitter, Code2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getSocialLinks() {
  try {
    const configs = await prisma.siteConfig.findMany({
      where: { key: { in: ['github_url', 'linkedin_url', 'twitter_url'] } },
    })
    return Object.fromEntries(configs.map((c) => [c.key, c.value]))
  } catch {
    return {}
  }
}

export default async function Footer() {
  const social = await getSocialLinks()

  return (
    <footer className="border-t border-primary/10 bg-background/50 backdrop-blur-sm">
      <div className="section-container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Built with Next.js & Supabase
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            {[
              { href: '/', label: 'Home' },
              { href: '/portfolio', label: 'Portfolio' },
              { href: '/blog', label: 'Blog' },
              { href: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social */}
          <div className="flex items-center gap-3">
            {social.github_url && (
              <a
                href={social.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {social.linkedin_url && (
              <a
                href={social.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {social.twitter_url && (
              <a
                href={social.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary/10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} — All rights reserved.
        </div>
      </div>
    </footer>
  )
}
