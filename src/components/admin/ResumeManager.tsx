'use client'

import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { Upload, Trash2, FileText, ExternalLink, CheckCircle2, Loader2, CloudUpload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadResumeAction, deleteResumeAction } from '@/lib/actions/resume'
import { useRouter } from 'next/navigation'

interface Props {
  currentUrl: string | null
}

/**
 * Renders a resume management UI that lets an admin view the currently published resume (if any),
 * stage a PDF via drag-and-drop or file picker, upload/replace the published resume, and remove it.
 *
 * @param currentUrl - The public URL of the currently uploaded resume, or `null` if no resume is published.
 * @returns The ResumeManager React component UI.
 */
export default function ResumeManager({ currentUrl }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [preview, setPreview] = useState<{ name: string; size: string } | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const validateAndStage = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10 MB')
      return
    }
    setPendingFile(file)
    setPreview({ name: file.name, size: formatSize(file.size) })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) validateAndStage(file)
    },
    [validateAndStage]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndStage(file)
  }

  const handleUpload = async () => {
    if (!pendingFile) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('resume', pendingFile)
      const result = await uploadResumeAction(formData)
      if (!result.success) {
        toast.error(result.error ?? 'Upload failed')
      } else {
        toast.success('Resume uploaded successfully!')
        setPendingFile(null)
        setPreview(null)
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Remove the current resume? Visitors will no longer be able to download it.')) return
    setIsDeleting(true)
    try {
      const result = await deleteResumeAction()
      if (!result.success) {
        toast.error(result.error ?? 'Delete failed')
      } else {
        toast.success('Resume removed')
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setIsDeleting(false)
    }
  }

  const clearStaged = () => {
    setPendingFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">

      {/* Current resume card */}
      <div className="glass-card rounded-2xl border border-primary/10 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-primary/10">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Current Resume</h2>
        </div>

        {currentUrl ? (
          <div className="p-6 flex items-center gap-4">
            {/* PDF icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm font-semibold text-foreground">Resume is live</p>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-xs">{currentUrl.split('?')[0].split('/').pop()}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary text-xs"
              >
                <a href={currentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Preview
                </a>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {isDeleting ? 'Removing…' : 'Remove'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No resume uploaded yet</p>
            <p className="text-xs mt-1">Upload a PDF below to make it downloadable on your site.</p>
          </div>
        )}
      </div>

      {/* Upload section */}
      <div className="glass-card rounded-2xl border border-primary/10 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-primary/10">
          <CloudUpload className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">{currentUrl ? 'Replace Resume' : 'Upload Resume'}</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/8 scale-[1.01]'
                : preview
                ? 'border-primary/40 bg-primary/5'
                : 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={handleFileChange}
            />

            {preview ? (
              /* Staged file preview */
              <div className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{preview.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{preview.size} · PDF ready to upload</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); clearStaged() }}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10 shrink-0"
                  title="Remove staged file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Empty drop zone */
              <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {isDragging ? 'Drop your PDF here' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or <span className="text-primary font-medium underline underline-offset-2 cursor-pointer">browse files</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">PDF only · Max 10 MB</p>
              </div>
            )}
          </div>

          {/* Upload button */}
          {preview && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full rounded-xl gap-2 bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:opacity-90 hover:-translate-y-0.5 transition-all"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {currentUrl ? 'Replace & Publish' : 'Upload & Publish'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Info panel */}
      <div className="rounded-xl border border-primary/10 bg-primary/5 px-5 py-4 text-sm text-muted-foreground space-y-1.5">
        <p className="font-medium text-foreground text-sm">How it works</p>
        <ul className="space-y-1 text-xs list-none">
          <li className="flex gap-2"><span className="text-primary mt-0.5">•</span> Upload a PDF (max 10 MB) — it replaces any previously uploaded resume.</li>
          <li className="flex gap-2"><span className="text-primary mt-0.5">•</span> The <strong>Download Resume</strong> button in the hero section will link directly to the uploaded file.</li>
          <li className="flex gap-2"><span className="text-primary mt-0.5">•</span> If no resume is uploaded, the button is hidden from the public site.</li>
        </ul>
      </div>
    </div>
  )
}
