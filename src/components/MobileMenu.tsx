'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden flex flex-col gap-1.5 p-2 hover:text-pink-600 transition"
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-gray-800 transition ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-gray-800 transition ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-gray-800 transition ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={closeMenu}
              className="text-gray-800 hover:text-pink-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col items-center gap-6 pt-8 text-lg">
            <Link href="/" onClick={closeMenu} className="hover:text-pink-600 transition font-medium text-gray-800">
              Home
            </Link>
            <Link href="/shop" onClick={closeMenu} className="hover:text-pink-600 transition font-medium text-gray-800">
              Shop
            </Link>
            <Link href="/men" onClick={closeMenu} className="hover:text-pink-600 transition font-medium text-gray-800">
              Men
            </Link>
            <Link href="/women" onClick={closeMenu} className="hover:text-pink-600 transition font-medium text-gray-800">
              Women
            </Link>
            <Link href="/boys" onClick={closeMenu} className="hover:text-pink-600 transition font-medium text-gray-800">
              Boys
            </Link>
            <Link href="/girls" onClick={closeMenu} className="hover:text-pink-600 transition font-medium text-gray-800">
              Girls
            </Link>
            <Link href="/unisex" onClick={closeMenu} className="hover:text-pink-600 transition font-medium text-gray-800">
              Unisex
            </Link>
            <Link href="/cosmetics" onClick={closeMenu} className="hover:text-pink-600 transition font-medium text-gray-800">
              Cosmetics
            </Link>
            <a
              href="tel:+233201404264"
              onClick={closeMenu}
              className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition font-medium"
            >
              📞 Call Us
            </a>
          </nav>
        </div>
      )}
    </>
  )
}