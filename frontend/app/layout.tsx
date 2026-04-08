import type { Metadata } from 'next'
import { montserrat } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Identidad Digital',
  description: 'Crea tu identidad digital de alto impacto con nuestras plantillas profesionales',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${montserrat.className} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
