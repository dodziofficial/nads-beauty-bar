import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import FloatingCallButton from '@/components/FloatingCallButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NADS BEAUTY BAR - Wear It. Love It. Own It.',
  description: 'Premium fashion for men, women, boys and girls.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
          <FloatingCallButton />
        </CartProvider>
      </body>
    </html>
  )
}