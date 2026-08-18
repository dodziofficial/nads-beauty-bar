import { supabase } from '../../lib/supabase/client'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default async function BoysPage() {
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('gender', 'boys')
    .eq('status', 'active')

  return (
    <main className="min-h-screen bg-gray-50">
      <Header activeGender="boys" />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">👦 Boys' Collection</h1>
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
                    <span className="text-5xl">👦</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition">
                    {product.name}
                  </h3>
                  <p className="text-pink-600 font-bold">GHS {product.price}</p>
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