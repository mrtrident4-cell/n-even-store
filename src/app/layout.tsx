import type { Metadata } from 'next'
import { Bodoni_Moda, Inter } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { CustomerProvider } from '@/contexts/CustomerContext'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'N-EVEN | Modern Fashion Store',
  description: 'Premium quality clothing at honest prices. Shop the latest styles.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodoni.variable} ${inter.variable}`}>
        <CustomerProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </CustomerProvider>
      </body>
    </html>
  )
}

