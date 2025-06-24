import type { Metadata } from 'next'
import { Toaster } from "sonner"
import './globals.css'

export const metadata: Metadata = {
  title: 'SERUMICH',
  keywords: ['SERUMICH', 'Sistema de Entrega Recepción', 'Actas', 'Administración', 'Anexos'],
  authors: [{ name: 'SERUMICH Team', url: 'https://serumich.com' }],
  openGraph: {
    title: 'SERUMICH',
    description: 'Sistema de Entrega Recepción',
    url: 'https://serumich.com',
    siteName: 'SERUMICH',
    images: [
      {
        url: 'https://serumich.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SERUMICH - Sistema de Entrega Recepción',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className="h-full">
      <body className='h-full bg-gray-50'>
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  )
}
