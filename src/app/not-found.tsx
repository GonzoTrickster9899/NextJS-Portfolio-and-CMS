import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

/**
 * Render a centered 404 "Page Not Found" UI with a prominent status, explanatory text, and a button to navigate home.
 *
 * @returns A React element displaying a full-viewport centered 404 page with a styled "404" card, title, description, and a "Go Home" button linking to `/`.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg px-4">
      <div className="text-center space-y-6">
        <div className="glass-card inline-flex rounded-3xl px-8 py-6 border border-primary/15 mb-4">
          <span className="text-8xl font-black gradient-text">404</span>
        </div>
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="rounded-full gap-2 bg-gradient-to-r from-primary to-accent text-white">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
