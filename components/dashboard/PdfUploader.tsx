'use client'

import { useRef, useState } from 'react'
import { FileText, Upload, Trash2, ExternalLink, Loader2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MAX_SIZE = 10 * 1024 * 1024

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type PdfUploaderProps = {
  pdfMeta: { filename: string; size: number; url: string } | null
  isUploading: boolean
  isAtLimit: boolean
  onUpload: (file: File) => Promise<void>
  onDelete: () => Promise<void>
  username: string
}

export function PdfUploader({ pdfMeta, isUploading, isAtLimit, onUpload, onDelete, username }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('Solo se aceptan archivos PDF.')
      return
    }
    if (file.size > MAX_SIZE) {
      alert('El archivo no puede superar los 10 MB.')
      return
    }
    setPendingFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleConfirm = async () => {
    if (!pendingFile) return
    await onUpload(pendingFile)
    setPendingFile(null)
  }

  const handleCancel = () => setPendingFile(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete()
    setIsDeleting(false)
  }

  const proxyUrl = username ? `/api/pdf/${username}` : null

  return (
    <div className="rounded-xl border border-border/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm tracking-[0.15em] uppercase font-semibold">Brochure / PDF</p>
      </div>

      {/* Estado: archivo seleccionado pendiente de confirmar */}
      {!pdfMeta && pendingFile && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">{pendingFile.name}</span>
            <span className="shrink-0">— {formatBytes(pendingFile.size)}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isUploading}
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={isUploading}
            >
              {isUploading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <><Check className="w-3.5 h-3.5 mr-1.5" />Confirmar subida</>
              }
            </Button>
          </div>
        </div>
      )}

      {/* Estado: reemplazando PDF existente, pendiente de confirmar */}
      {pdfMeta && pendingFile && (
        <div className="space-y-2 pt-1">
          <p className="text-xs text-muted-foreground">Nuevo archivo seleccionado:</p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">{pendingFile.name}</span>
              <span className="shrink-0">— {formatBytes(pendingFile.size)}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isUploading}
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirm}
                disabled={isUploading}
              >
                {isUploading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <><Check className="w-3.5 h-3.5 mr-1.5" />Confirmar</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Estado: PDF activo */}
      {pdfMeta && !pendingFile && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">{pdfMeta.filename}</span>
            <span className="shrink-0">— {formatBytes(pdfMeta.size)}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {proxyUrl && !isDeleting && (
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={proxyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Ver
                </a>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading || isDeleting}
            >
              Reemplazar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
            >
              {isDeleting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />
              }
            </Button>
          </div>
        </div>
      )}

      {/* Estado: sin PDF */}
      {!pdfMeta && !pendingFile && (
        <div className="pt-1">
          {isAtLimit ? (
            <p className="text-xs text-muted-foreground">
              Has alcanzado el límite de 6 botones. Elimina uno para añadir tu brochure.
            </p>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-3.5 h-3.5 mr-2" />
              Subir brochure
            </Button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
