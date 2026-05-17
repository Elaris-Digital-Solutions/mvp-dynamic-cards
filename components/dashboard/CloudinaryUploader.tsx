'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    cloudinary: any
  }
}

interface Props {
  onSuccess: (url: string) => void
  disabled?: boolean
  label: string
}

async function fetchSignature(callback: (signature: string) => void, paramsToSign: Record<string, string>) {
  const res = await fetch('/api/cloudinary-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paramsToSign }),
  })
  if (!res.ok) throw new Error('No se pudo obtener la firma de carga')
  const { signature } = await res.json()
  callback(signature)
}

export function CloudinaryUploader({ onSuccess, disabled, label }: Props) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.cloudinary) {
      const script = document.createElement('script')
      script.src = 'https://upload-widget.cloudinary.com/global/all.js'
      script.async = true
      script.onload = () => setLoaded(true)
      document.body.appendChild(script)
    } else {
      setLoaded(true)
    }
  }, [])

  const openWidget = () => {
    if (!loaded || !window.cloudinary) return

    window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        uploadSignature: fetchSignature,
        sources: ['local', 'url'],
        multiple: false,
        cropping: true,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          onSuccess(result.info.secure_url)
        }
      }
    ).open()
  }

  return (
    <button
      type="button"
      onClick={openWidget}
      disabled={disabled || !loaded}
      className="bg-gray-200 text-gray-800 text-sm py-1.5 px-3 rounded hover:bg-gray-300 disabled:opacity-50 transition"
    >
      {label}
    </button>
  )
}
