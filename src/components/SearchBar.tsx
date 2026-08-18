'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-40 md:w-48 lg:w-56 px-3 py-1.5 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-600"
      >
        🔍
      </button>
    </form>
  )
}