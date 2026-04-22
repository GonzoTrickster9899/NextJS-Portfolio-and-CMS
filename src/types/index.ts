import type { Project, BlogPost, Message, Experience, ProjectCategory } from '@prisma/client'

// Re-export Prisma types for convenience
export type { Project, BlogPost, Message, Experience, ProjectCategory }

// API response wrappers
export interface ApiResponse<T> {
  data?: T
  error?: string
  details?: Record<string, string[]>
}

// Site config map
export interface SiteConfig {
  hero_name: string
  hero_title: string
  hero_bio: string
  github_url: string
  linkedin_url: string
  twitter_url: string
}

// Skill (matches updated Prisma model)
export interface SkillData {
  id: string
  name: string
  category: string
  iconUrl: string
  order: number
  createdAt: Date
  updatedAt: Date
}

// Project form data
export interface ProjectFormData {
  title: string
  slug: string
  description: string
  imageUrl: string
  techStack: string[]
  githubLink?: string
  liveLink?: string
  category: ProjectCategory
  isFeatured: boolean
  order: number
}

// Blog form data
export interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  thumbnail?: string
  tags: string[]
  published: boolean
}

// Navigation link
export interface NavLink {
  href: string
  label: string
  external?: boolean
}

// Stats for admin dashboard
export interface DashboardStats {
  totalProjects: number
  publishedPosts: number
  totalPosts: number
  unreadMessages: number
  totalExperiences: number
}
