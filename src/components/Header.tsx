'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

interface HeaderProps {
  activeGender?: string
}

export default function Header({ activeGender }: HeaderProps) {
  const { totalItems } = useCart()
  const pathname = usePathname()

  // Determine which gender is active based on the URL path or prop
  const getActiveGender = () => {
    if (activeGender) return activeGender
    if (pathname === '/men') return 'men'
    if (pathname === '/women') return 'women'
    if (pathname === '/boys') return 'boys'
    if (pathname === '/girls') return 'girls'
    if (pathname === '/unisex') return 'unisex'
    if (pathname === '/cosmetics') return 'cosmetics'
    return ''
  }

  const active = getActiveGender()

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Image
              src="/images/logo/nads-logo.png"
              alt="NADS BEAUTY BAR"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">NADS BEAUTY BAR</h1>
            <p className="text-xs text-gray-600">WEARIT.LOVEIT.OWNIT.</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6 font-medium">
          <Link href="/" className={`hover:text-pink-600 transition ${pathname === '/' ? 'text-pink-600 font-bold' : 'text-gray-800'}`}>
            Home
          </Link>
          <Link href="/shop" className={`hover:text-pink-600 transition ${pathname === '/shop' ? 'text-pink-600 font-bold' : 'text-gray-800'}`}>
            Shop
          </Link>
          <Link href="/men" className={`hover:text-pink-600 transition ${active === 'men' ? 'text-pink-600 font-bold' : 'text-gray-800'}`}>
            Men
          </Link>
          <Link href="/women" className={`hover:text-pink-600 transition ${active === 'women' ? 'text-pink-600 font-bold' : 'text-gray-800'}`}>
            Women
          </Link>
          <Link href="/boys" className={`hover:text-pink-600 transition ${active === 'boys' ? 'text-pink-600 font-bold' : 'text-gray-800'}`}>
            Boys
          </Link>
          <Link href="/girls" className={`hover:text-pink-600 transition ${active === 'girls' ? 'text-pink-600 font-bold' : 'text-gray-800'}`}>
            Girls
          </Link>
          <Link href="/unisex" className={`hover:text-pink-600 transition ${active === 'unisex' ? 'text-pink-600 font-bold' : 'text-gray-800'}`}>
            Unisex
          </Link>
          <Link href="/cosmetics" className={`hover:text-pink-600 transition ${active === 'cosmetics' ? 'text-pink-600 font-bold' : 'text-gray-800'}`}>
            💄 Cosmetics
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex gap-4 items-center">
          <a
            href="tel:+233201404264"
            className="hidden md:flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition text-sm font-medium"
          >
            📞 Call Us
          </a>
          
          <button className="hover:text-pink-600 transition text-xl">🔍</button>
          <Link href="/cart" className="hover:text-pink-600 transition text-xl relative">
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}