import { cn } from '@/lib/utils/cn'

interface Props {
  label?: string
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
}

export default function SectionHeading({
  label,
  title,
  subtitle,
  centered = false,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'mb-12',
        centered && 'text-center',
        className
      )}
    >
      {label && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          <span className="w-6 h-px bg-primary" />
          {label}
          <span className="w-6 h-px bg-primary" />
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-muted-foreground text-lg max-w-2xl leading-relaxed text-balance">
          {subtitle}
        </p>
      )}
    </div>
  )
}
