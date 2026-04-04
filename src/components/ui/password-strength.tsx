'use client'

import { Progress } from '@/components/ui/progress'

function getScore(password: string): number {
  let score = 0
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 15
  if (/[A-Z]/.test(password)) score += 20
  if (/\d/.test(password)) score += 20
  if (/[^A-Za-z0-9]/.test(password)) score += 20
  return score
}

function getLabel(score: number): string {
  if (score <= 25) return 'Débil'
  if (score <= 50) return 'Regular'
  if (score <= 75) return 'Buena'
  return 'Fuerte'
}

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const score = getScore(password)
  const label = getLabel(score)

  return (
    <div aria-live="polite" className="flex flex-col gap-1.5">
      <Progress value={score} className="h-1.5 [&>[data-slot=progress-indicator]]:transition-all" style={{ ['--progress-color' as string]: undefined }}>
      </Progress>
      <p className="text-xs text-muted-foreground">
        Seguridad: <strong className={score > 50 ? 'text-foreground' : 'text-destructive'}>{label}</strong>
      </p>
    </div>
  )
}
