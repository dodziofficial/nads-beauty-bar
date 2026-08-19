import { supabase } from '../../lib/supabase/client'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// ============================================
// MAKE DYNAMIC - ALWAYS FETCH FRESH DATA
// ============================================
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function GirlsPage() {
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('gender', 'girls')
    .eq('status', 'active')

  return (
    <main className="min-h-screen bg-gray-50">
      <Header activeGender="girls" />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">👧 Girls' Collection</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => {
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
                    <span className="text-5xl">👧</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {product.sale_price ? (
                      <>
                        <span className="text-pink-600 font-bold">GHS {product.sale_price}</span>
                        <span className="text-sm text-gray-500 line-through">GHS {product.price}</span>
                        <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          Save {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-pink-600 font-bold">GHS {product.price}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 capitalize mt-1">Girls</p>
                </div>
              </Link>
            )
          })}
        </div>
        {products?.length === 0 && (
          <p className="text-center text-gray-500 py-12">No products in this category yet.</p>
        )}
      </div>

      <Footer />
    </main>
  )
}