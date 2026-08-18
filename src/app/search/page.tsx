'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query) {
      searchProducts(query)
    } else {
      setLoading(false)
    }
  }, [query])

  const searchProducts = async (searchQuery: string) => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*)
        `)
        .ilike('name', `%${searchQuery}%`)
        .eq('status', 'active')

      setProducts(data || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse text-gray-400">Searching...</div>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-4 text-gray-900">
        Search Results for: "{query}"
      </h1>
      <p className="text-gray-600 mb-8">
        Found {products.length} product{products.length !== 1 ? 's' : ''}
      </p>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-900">No products found</h3>
          <p className="text-gray-600 mt-2">
            Try adjusting your search terms or browse our categories.
          </p>
          <Link href="/shop" className="inline-block mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group"
              >
                <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                  {primaryImage ? (
                    <img 
                      src={primaryImage.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <span className="text-5xl">👕</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition">
                    {product.name}
                  </h3>
                  <p className="text-pink-600 font-bold">GHS {product.price}</p>
                  <p className="text-sm text-gray-600 capitalize">{product.gender}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-400">Loading search...</div>
          </div>
        }>
          <SearchResults />
        </Suspense>
      </div>

      <Footer />
    </main>
  )
}