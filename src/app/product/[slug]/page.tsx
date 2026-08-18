import { supabase } from '../../../lib/supabase/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductActions from '../../../components/ProductActions'
import ImageCarousel from '../../../components/ImageCarousel'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*),
      images:product_images(*)
    `)
    .eq('slug', slug)
    .single()

  if (error || !product) {
    notFound()
  }

  const { data: relatedProducts } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('gender', product.gender)
    .neq('id', product.id)
    .limit(4)

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm text-gray-600">
          <Link href="/" className="hover:text-pink-600 font-medium">Home</Link>
          <span className="mx-2 text-gray-400">›</span>
          <Link href="/shop" className="hover:text-pink-600 font-medium">Shop</Link>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* Product Image - Using Image Carousel */}
          <div>
            <ImageCarousel 
              images={product.images || []} 
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded capitalize text-gray-800 font-medium">{product.gender}</span>
              {product.sale_price && (
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-medium">SALE</span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 text-sm mb-4">SKU: {product.sku}</p>
            
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {product.sale_price ? (
                <>
                  <span className="text-3xl font-bold text-pink-600">GHS {product.sale_price}</span>
                  <span className="text-xl text-gray-500 line-through">GHS {product.price}</span>
                  <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                    Save {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-pink-600">GHS {product.price}</span>
              )}
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{product.description || 'Premium quality fashion product from Nads Beauty Bar.'}</p>

            {/* Product Actions */}
            <ProductActions
              productId={product.id}
              name={product.name}
              price={product.price}
              salePrice={product.sale_price}
              variants={product.variants || []}
              images={product.images || []}
            />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((related) => {
                const primaryImage = related.images?.find((img: any) => img.is_primary) || related.images?.[0]
                
                return (
                  <Link
                    key={related.id}
                    href={`/product/${related.slug}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group"
                  >
                    <div className="bg-gray-100 h-40 flex items-center justify-center overflow-hidden">
                      {primaryImage ? (
                        <img 
                          src={primaryImage.image_url} 
                          alt={related.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <span className="text-4xl">👕</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-gray-900 group-hover:text-pink-600 transition">
                        {related.name}
                      </h3>
                      <p className="text-pink-600 font-bold">GHS {related.price}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}