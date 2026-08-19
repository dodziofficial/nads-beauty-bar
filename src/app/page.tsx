import { supabase } from '../lib/supabase/client'
import Link from 'next/link'
import Header from '@/components/Header'
import HomeSlideshow from '@/components/HomeSlideshow'
import Footer from '@/components/Footer'

// ... in the return statement:
<Footer />

export default async function Home() {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .limit(20)

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <Header />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto mt-8">
          <p className="font-bold">Database Connection Error</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />

      {/* Slideshow Section */}
      <section className="container mx-auto px-4 py-8">
        <HomeSlideshow />
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">NADS BEAUTY BAR</h2>
          <p className="text-xl md:text-2xl mb-6 font-light">WEARIT.LOVEIT.OWNIT.</p>
          <p className="text-base md:text-lg mb-10 max-w-2xl mx-auto opacity-90">
            Premium fashion • Professional Makeup • Beauty Services
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/men" className="bg-white text-gray-800 px-6 py-2 rounded-full hover:bg-gray-100 transition font-medium shadow-lg text-sm"> Men</Link>
            <Link href="/women" className="bg-white text-gray-800 px-6 py-2 rounded-full hover:bg-gray-100 transition font-medium shadow-lg text-sm"> Women</Link>
            <Link href="/boys" className="bg-white text-gray-800 px-6 py-2 rounded-full hover:bg-gray-100 transition font-medium shadow-lg text-sm"> Boys</Link>
            <Link href="/girls" className="bg-white text-gray-800 px-6 py-2 rounded-full hover:bg-gray-100 transition font-medium shadow-lg text-sm"> Girls</Link>
            <Link href="/unisex" className="bg-white text-gray-800 px-6 py-2 rounded-full hover:bg-gray-100 transition font-medium shadow-lg text-sm"> Unisex</Link>
            <Link href="/cosmetics" className="bg-white text-gray-800 px-6 py-2 rounded-full hover:bg-gray-100 transition font-medium shadow-lg text-sm"> Cosmetics</Link>
          </div>
        </div>
      </section>

      {/* Makeup & Beauty Services Section */}
<section className="py-16 bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100" id="services">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <span className="text-4xl block mb-2">💄</span>
      <h2 className="text-3xl font-bold text-gray-900">Makeup & Beauty Services</h2>
      <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
        Professional cosmetology services for every occasion — at our studio or in the comfort of your home.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {/* Service 1: Bridal Makeup */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
        <div className="h-48 overflow-hidden">
          <img
            src="/images/services/bridal-makeup.jpg"
            alt="Bridal Makeup"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900">Bridal Makeup</h3>
          <p className="text-gray-600 text-sm mt-2">
            Flawless bridal looks that last all day. Customized to your style and preference.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full">Home Service</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Studio</span>
          </div>
        </div>
      </div>

      {/* Service 2: Event Makeup */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
        <div className="h-48 overflow-hidden">
          <img
            src="/images/services/event-makeup.jpg"
            alt="Event Makeup"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900">Event Makeup</h3>
          <p className="text-gray-600 text-sm mt-2">
            Party, dinner, graduation, or special events. Look stunning with professional makeup.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full">Home Service</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Studio</span>
          </div>
        </div>
      </div>

      {/* Service 3: Home Service */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
        <div className="h-48 overflow-hidden">
          <img
            src="/images/services/home-service.jpg"
            alt="Home Service"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900">Home Service</h3>
          <p className="text-gray-600 text-sm mt-2">
            We come to you! Professional makeup and beauty services at your convenience.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Mobile Service</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">On-Site</span>
          </div>
        </div>
      </div>

      {/* Service 4: Skincare & Facials */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
        <div className="h-48 overflow-hidden">
          <img
            src="/images/services/skincare-facials.jpg"
            alt="Skincare & Facials"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900">Skincare & Facials</h3>
          <p className="text-gray-600 text-sm mt-2">
            Rejuvenating facials, skin consultations, and personalized skincare treatments.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Studio Only</span>
          </div>
        </div>
      </div>

      {/* Service 5: Lash & Brow */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
        <div className="h-48 overflow-hidden">
          <img
            src="/images/services/lash-brow.jpg"
            alt="Lash & Brow Services"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900">Lash & Brow Services</h3>
          <p className="text-gray-600 text-sm mt-2">
            Eyelash extensions, brow shaping, tinting, and lash lifts for a perfect look.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full">Studio</span>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Home Service</span>
          </div>
        </div>
      </div>

      {/* Service 6: Nail Services */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
        <div className="h-48 overflow-hidden">
          <img
            src="/images/services/nail-services.jpg"
            alt="Nail Services"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900">Nail Services</h3>
          <p className="text-gray-600 text-sm mt-2">
            Manicure, pedicure, gel nails, and nail art. Complete your beauty look.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Studio</span>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Home Service</span>
          </div>
        </div>
      </div>
    </div>

    {/* Call to Action */}
    <div className="text-center mt-10">
      <a
        href="tel:+233201404264"
        className="inline-block bg-pink-600 text-white px-8 py-3 rounded-full hover:bg-pink-700 transition font-medium shadow-lg"
      >
        📞 Book a Service
      </a>
      <p className="text-gray-500 text-sm mt-3">
        Call us to book your appointment today!
      </p>
    </div>
  </div>
</section>

      {/* Categories Section - WITH IMAGES AND COSMETICS */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Shop by Category</h2>
          <p className="text-gray-600 text-center mb-12">Find the perfect outfit for everyone</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {[
              { name: 'Men', image: '/images/categories/men.jpg', href: '/men' },
              { name: 'Women', image: '/images/categories/women.jpg', href: '/women' },
              { name: 'Boys', image: '/images/categories/boys.jpg', href: '/boys' },
              { name: 'Girls', image: '/images/categories/girls.jpg', href: '/girls' },
              { name: 'Unisex', image: '/images/categories/unisex.jpg', href: '/unisex' },
              { name: 'Cosmetics', image: '/images/categories/cosmetics.jpg', href: '/cosmetics' }
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative overflow-hidden rounded-2xl aspect-square shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="text-3xl mb-1">
                    {category.name === 'Men'}
                    {category.name === 'Women'}
                    {category.name === 'Boys'}
                    {category.name === 'Girls'}
                    {category.name === 'Unisex'}
                    {category.name === 'Cosmetics'}
                  </div>
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  <p className="text-sm opacity-80 group-hover:opacity-100 transition">Shop Collection →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Featured Products</h2>
          <p className="text-gray-600 text-center mb-12">Discover our latest arrivals</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {products?.map((product) => {
              const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
              return (
                <Link 
                  key={product.id} 
                  href={`/product/${product.slug}`}
                  className="group border rounded-lg overflow-hidden shadow hover:shadow-xl transition bg-white hover:bg-gray-50"
                >
                  <div className="bg-gray-100 h-56 flex items-center justify-center overflow-hidden">
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
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition">
                        {product.name}
                      </h3>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded capitalize text-gray-700 font-medium">{product.gender}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.short_description || 'Premium quality fashion'}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.sale_price ? (
                        <>
                          <span className="text-xl font-bold text-pink-600">GHS {product.sale_price}</span>
                          <span className="text-sm text-gray-500 line-through">GHS {product.price}</span>
                          <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            Save {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-pink-600">GHS {product.price}</span>
                      )}
                    </div>
                    {product.sale_price && (
                      <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded mt-1 font-medium">SALE</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {products?.length === 0 && (
            <p className="text-center text-gray-600">No products found. Add products in Supabase.</p>
          )}
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose Nads Beauty Bar</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-4">👗</div>
              <h3 className="font-bold text-lg text-gray-900">Quality Fashion</h3>
              <p className="text-gray-600 text-sm">Premium materials and stylish designs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💄</div>
              <h3 className="font-bold text-lg text-gray-900">Professional Makeup</h3>
              <p className="text-gray-600 text-sm">Expert beauty services for every occasion</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold text-lg text-gray-900">Affordable Prices</h3>
              <p className="text-gray-600 text-sm">Great value for premium fashion & beauty</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-bold text-lg text-gray-900">Easy WhatsApp Ordering</h3>
              <p className="text-gray-600 text-sm">Order quickly via WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}