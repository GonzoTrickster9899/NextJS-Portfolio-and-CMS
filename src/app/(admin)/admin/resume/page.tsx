import { Metadata } from 'next'
import { getResumeUrl } from '@/lib/actions/resume'
import ResumeManager from '@/components/admin/ResumeManager'

export const metadata: Metadata = { title: 'Manage Resume' }

export default async function ResumePage() {
  const currentUrl = await getResumeUrl()

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resume</h1>
        <p className="text-muted-foreground mt-1">
          Upload your resume PDF. It will be publicly downloadable from the hero section.
        </p>
      </div>

      <ResumeManager currentUrl={currentUrl} />
    </div>
  )
}
