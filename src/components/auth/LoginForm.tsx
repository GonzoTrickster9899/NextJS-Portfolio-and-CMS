'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  requestPasswordResetAction,
  resendCodeAction,
  resetPasswordAction,
  signInAction,
  signOutAction,
  verifyCodeAction,
} from '@/lib/actions/auth'
import type { PendingStep } from '@/lib/auth/verification'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ArrowLeft, KeyRound, Loader2, Lock, Mail, RefreshCw, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

/** Seconds before another code can be requested. */
const RESEND_COOLDOWN = 60
const MIN_PASSWORD_LENGTH = 12

const primaryButtonClass =
  'w-full rounded-full bg-gradient-to-r from-primary to-accent text-white gap-2 shadow-lg shadow-primary/25 mt-2'

type Step = 'credentials' | 'code' | 'forgot' | 'reset'

interface Props {
  /** A sign-in waiting for its emailed code, when the page is reloaded mid-way. */
  pending: { step: PendingStep; email: string } | null
}

/**
 * Render the admin login: email and password, then the one-time code Neon Auth
 * emails to the admin. Also sets or resets the password with an emailed code,
 * which is how the first password is set for an account created in the Neon
 * Console.
 *
 * After the password is accepted the form switches to the code step, where the
 * code can be entered, resent (once a minute) or abandoned. A correct code opens
 * `/admin`. If Neon Auth requires the email to be verified first, the code
 * verifies it and the password is sent again automatically, which emails a
 * second code for the sign-in itself.
 *
 * @returns The React element for the admin login form.
 */
export default function LoginForm({ pending }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(pending ? 'code' : 'credentials')
  const [reason, setReason] = useState<PendingStep>(pending?.step ?? 'sign-in')
  const [email, setEmail] = useState(pending?.email ?? '')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const backToCredentials = () => {
    setStep('credentials')
    setCode('')
    setPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setCooldown(0)
  }

  /** Sends the email and password; on success moves to the code step. */
  const submitCredentials = async () => {
    const result = await signInAction(email, password).catch(() => ({
      error: 'Sign in failed. Try again.',
    }))

    if ('error' in result) {
      toast.error(result.error)
      return false
    }

    setReason(result.reason)
    setCode('')
    setStep('code')
    setCooldown(RESEND_COOLDOWN)
    toast.success(`We sent a code to ${email.trim()}`)
    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await submitCredentials()
    setIsLoading(false)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await verifyCodeAction(code).catch(() => ({
      error: 'Could not verify the code. Try again.',
    }))

    if ('error' in result) {
      toast.error(result.error)
      if ('restart' in result && result.restart) backToCredentials()
      setIsLoading(false)
      return
    }

    if (result.status === 'email-verified') {
      // The password is still in memory unless the page was reloaded
      if (password) {
        toast.success('Email verified')
        await submitCredentials()
      } else {
        toast.success('Email verified. Sign in again.')
        backToCredentials()
      }
      setIsLoading(false)
      return
    }

    toast.success('Welcome back!')
    router.push('/admin')
    router.refresh()
  }

  const handleResend = async () => {
    setIsLoading(true)
    const result = await resendCodeAction().catch(() => ({
      error: 'Could not send the verification code. Try again shortly.',
      restart: false,
    }))
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      if (result.restart) backToCredentials()
      return
    }
    setCode('')
    setCooldown(RESEND_COOLDOWN)
    toast.success('New code sent')
  }

  const handleUseDifferentAccount = async () => {
    setIsLoading(true)
    await signOutAction().catch(() => undefined)
    setIsLoading(false)
    backToCredentials()
  }

  /** Emails a password reset code; returns whether it was sent. */
  const sendResetCode = async () => {
    const result = await requestPasswordResetAction(email).catch(() => ({
      error: 'Could not send the code. Try again shortly.',
    }))
    if (result.error) {
      toast.error(result.error)
      return false
    }
    setCode('')
    setCooldown(RESEND_COOLDOWN)
    toast.success("If that's the admin email, a code is on its way")
    return true
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    if (await sendResetCode()) setStep('reset')
    setIsLoading(false)
  }

  const handleResendReset = async () => {
    setIsLoading(true)
    await sendResetCode()
    setIsLoading(false)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    setIsLoading(true)
    const result = await resetPasswordAction(email, code, newPassword).catch(() => ({
      error: 'Could not save the password. Try again.',
    }))
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Password saved. Sign in with your new password.')
    backToCredentials()
  }

  const codeInput = (
    <div className="space-y-1.5">
      <Label htmlFor="code">Verification code</Label>
      <Input
        id="code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
        placeholder="000000"
        required
        autoFocus
        inputMode="numeric"
        autoComplete="one-time-code"
        className="text-center text-lg font-mono tracking-[0.4em]"
      />
      <p className="text-xs text-muted-foreground">
        The code expires in a few minutes. Check your spam folder if it hasn&apos;t arrived.
      </p>
    </div>
  )

  const codeFooter = (onBack: () => void, onResend: () => void) => (
    <div className="flex items-center justify-between pt-1 text-sm">
      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <button
        type="button"
        onClick={onResend}
        disabled={isLoading || cooldown > 0}
        className="flex items-center gap-1.5 text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:opacity-70"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
      </button>
    </div>
  )

  const sentTo = (
    <span className="font-medium text-foreground break-all">{email.trim()}</span>
  )

  const heading = {
    credentials: { title: 'Admin Access', subtitle: <>Lancelot Oleriana · Portfolio</> },
    code: {
      title: reason === 'verify-email' ? 'Verify your email' : 'Check your email',
      subtitle: <>Enter the code we sent to {sentTo}</>,
    },
    forgot: {
      title: 'Set a new password',
      subtitle: <>We&apos;ll email a code to the admin address</>,
    },
    reset: {
      title: 'Set a new password',
      subtitle: <>Enter the code sent to {sentTo} and choose a new password</>,
    },
  }[step]

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div className="glass-card rounded-3xl border border-primary/20 p-8 shadow-2xl shadow-primary/10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10 mb-4 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Night Thinker logo"
                width={40}
                height={40}
                className="object-contain dark:invert"
              />
            </div>
            <h1 className="text-xl font-bold">{heading.title}</h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">{heading.subtitle}</p>
          </div>

          {step === 'credentials' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setStep('forgot')}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" disabled={isLoading} className={primaryButtonClass} size="lg">
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                ) : (
                  <><Lock className="w-4 h-4" /> Sign In</>
                )}
              </Button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerify} className="space-y-4">
              {codeInput}

              <Button
                type="submit"
                disabled={isLoading || code.length < 4}
                className={primaryButtonClass}
                size="lg"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Verify</>
                )}
              </Button>

              {codeFooter(handleUseDifferentAccount, handleResend)}
            </form>
          )}

          {step === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <Button type="submit" disabled={isLoading} className={primaryButtonClass} size="lg">
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : (
                  <><Mail className="w-4 h-4" /> Send code</>
                )}
              </Button>

              <button
                type="button"
                onClick={backToCredentials}
                disabled={isLoading}
                className="flex items-center gap-1.5 pt-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              {codeInput}
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || code.length < 4}
                className={primaryButtonClass}
                size="lg"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : (
                  <><KeyRound className="w-4 h-4" /> Save password</>
                )}
              </Button>

              {codeFooter(backToCredentials, handleResendReset)}
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected admin area. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  )
}
