'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getSignedDocumentUrl } from '@/app/portal/actions'

interface DownloadSignedButtonProps {
  documentId: string
}

export function DownloadSignedButton({ documentId }: DownloadSignedButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const result = await getSignedDocumentUrl(documentId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.url) {
        // Open signed URL in new tab — browser handles the download
        window.open(result.url, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      className="bg-emerald-600 hover:bg-emerald-700 text-white"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Descargar firmado
    </Button>
  )
}
