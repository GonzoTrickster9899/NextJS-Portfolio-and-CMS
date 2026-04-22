import { Metadata } from 'next'
import { Mail, MapPin, Clock } from 'lucide-react'
import ContactForm from '@/components/public/ContactForm'
import SectionHeading from '@/components/public/SectionHeading'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch — I am always open to interesting projects and conversations.',
}

export const revalidate = 3600 // re-fetch config once per hour

/**
 * Loads contact-related site configuration keys from the database.
 *
 * Retrieves entries for `contact_email`, `contact_location`, and `contact_response_time` and returns them mapped by key.
 *
 * @returns An object mapping each found config key to its value (e.g. `{ contact_email: '...' }`); returns an empty object if none are found or if the query fails.
 */
async function getContactConfig() {
  try {
    const configs = await prisma.siteConfig.findMany({
      where: { key: { in: ['contact_email', 'contact_location', 'contact_response_time'] } },
    })
    return Object.fromEntries(configs.map((c) => [c.key, c.value]))
  } catch {
    return {}
  }
}

/**
 * Render the Contact page populated with site-configured contact details and a contact form.
 *
 * @returns A React element representing the contact page layout, including contact info items and the contact form.
 */
export default async function ContactPage() {
  const cfg = await getContactConfig()

  const INFO_ITEMS = [
    {
      icon: Mail,
      label: 'Email',
      value: cfg.contact_email ?? process.env.ADMIN_EMAIL ?? 'hello@yourdomain.com',
      href: `mailto:${cfg.contact_email ?? process.env.ADMIN_EMAIL ?? 'hello@yourdomain.com'}`,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: cfg.contact_location ?? 'Philippines',
      href: null,
    },
    {
      icon: Clock,
      label: 'Response Time',
      value: cfg.contact_response_time ?? 'Within 24–48 hours',
      href: null,
    },
  ]

  return (
    <div className="pt-28 pb-24">
      <div className="section-container">
        <div>
          <SectionHeading
            label="Contact"
            title="Let's Work Together"
            subtitle="Have a project in mind, a question, or just want to say hello? Drop me a message."
          />

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Left — Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-primary/15 space-y-5">
                {INFO_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-foreground">{item.value}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Decorative quote */}
              <div className="glass-card rounded-2xl p-6 border border-primary/20 bg-primary/5">
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  &ldquo;The best software is built through great collaboration.
                  I&apos;m always excited to hear about new challenges and opportunities.&rdquo;
                </p>
              </div>
            </div>

            {/* Right — Form */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
