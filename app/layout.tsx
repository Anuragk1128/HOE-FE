import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AppChrome } from '@/components/app-chrome'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from '@/components/auth/auth-provider'
import { CartProvider } from '@/contexts/cart-context'
import { WishlistProvider } from '@/contexts/wishlist-context'

export const metadata: Metadata = {
  title: 'House Of Evolve',
  description: 'Our brands offer variety of products',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <AppChrome>{children}</AppChrome>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
