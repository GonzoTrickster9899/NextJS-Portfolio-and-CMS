'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar, ArrowUpRight, FileText } from 'lucide-react'
import { format } from 'date-fns'
import type { BlogPost } from '@prisma/client'

interface Props {
  post: BlogPost
  index?: number
}

export default function BlogCard({ post, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="glass-card rounded-2xl overflow-hidden border border-primary/15 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 h-full flex flex-col">
          {/* Thumbnail */}
          {post.thumbnail ? (
            <div className="relative h-48 overflow-hidden bg-muted">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 flex items-center justify-center">
              <FileText className="w-10 h-10 text-primary/20" />
            </div>
          )}

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-md bg-primary/8 text-primary border border-primary/15 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h2 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {post.title}
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.publishedAt
                    ? format(new Date(post.publishedAt), 'MMM d, yyyy')
                    : 'Draft'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readingTime} min read
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1 translate-x-1 group-hover:translate-y-0 group-hover:translate-x-0 duration-300" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
