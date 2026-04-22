import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Clock, Calendar, Eye, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '@/components/ui/button'

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return posts.map((p) => ({ slug: p.slug }))
}

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    select: { title: true, excerpt: true, thumbnail: true },
  })
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: post.thumbnail ? [{ url: post.thumbnail }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, published: true },
  })
  if (!post) notFound()

  // Increment view count (fire-and-forget)
  prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {})

  return (
    <div className="pt-28 pb-24">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Button asChild variant="ghost" className="gap-2 text-muted-foreground mb-8 -ml-3 rounded-full">
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </Button>

          {/* Header */}
          <header className="mb-10">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-4 text-balance">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-6">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-5 text-sm text-muted-foreground glass-card border border-primary/20 rounded-2xl px-4 py-3 w-fit">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy') : 'Draft'}
              </span>
              <div className="w-px h-4 bg-border" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {post.readingTime} min read
              </span>
              <div className="w-px h-4 bg-border" />
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-primary" />
                {post.views.toLocaleString()} views
              </span>
            </div>
          </header>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-10" />

          {/* Markdown Content */}
          <div className="prose-portfolio">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // @ts-ignore
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      // @ts-ignore
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="!rounded-xl !my-6 !text-sm"
                      showLineNumbers
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                img({ src, alt }) {
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={alt ?? ''}
                      className="rounded-2xl w-full my-8 shadow-lg"
                      loading="lazy"
                    />
                  )
                },
                a({ href, children }) {
                  const isExternal = href?.startsWith('http')
                  return (
                    <a
                      href={href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="text-primary underline decoration-primary/30 underline-offset-3 hover:decoration-primary transition-colors"
                    >
                      {children}
                    </a>
                  )
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-primary/10 flex justify-center">
            <Button asChild variant="outline" className="rounded-full gap-2">
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4" /> More Articles
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
