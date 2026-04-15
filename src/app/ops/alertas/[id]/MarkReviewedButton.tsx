'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { markAlertReviewed } from '../actions'

export function MarkReviewedButton({ alertId }: { alertId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const result = await markAlertReviewed(alertId)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Alerta marcada como revisada')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
      Marcar como revisada
    </Button>
  )
}
