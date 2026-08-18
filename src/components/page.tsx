import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface GenderPageProps {
  params: Promise<{
    gender: string
  }>
}

export default async function GenderPage({ params }: GenderPageProps) {
  const { gender } = await params
  
  // Validate gender
  const validGenders = ['men', 'women', 'boys', 'girls']
  if (!validGenders.includes(gender)) {
    notFound()
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('gender', gender)
    .eq('status', 'active')

  const genderNames: Record<string, string> = {
    men: "Men's",
    women: "Women's",
    boys: "Boys'",
    girls: "Girls'"
  }

  const genderEmojis: Record<string, string> = {
    men: '👔',
    women: '👗',
    boys: '👦',
    girls: '👧'
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">NB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">NADS BEAUTY BAR</h1>
              <p className="text-xs text-gray-500">WEARIT.LOVEIT.OWNIT.</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 font-medium">
            <Link href="/" className="hover:text-pink-600 transition text-gray-700">Home</Link>
            <Link href="/shop" className="hover:text-pink-600 transition text-gray-700">Shop</Link>
            <Link href="/men" className={`hover:text-pink-600 transition ${gender === 'men' ? 'text-pink-600' : 'text-gray-700'}`}>Men</Link>
            <Link href="/women" className={`hover:text-pink-600 transition ${gender === 'women' ? 'text-pink-600' : 'text-gray-700'}`}>Women</Link>
            <Link href="/boys" className={`hover:text-pink-600 transition ${gender === 'boys' ? 'text-pink-600' : 'text-gray-700'}`}>Boys</Link>
            <Link href="/girls" className={`hover:text-pink-600 transition ${gender === 'girls' ? 'text-pink-600' : 'text-gray-700'}`}>Girls</Link>
          </nav>
          <div className="flex gap-4">
            <button className="hover:text-pink-600 transition text-xl">🔍</button>
            <button className="hover:text-pink-600 transition text-xl relative">
              🛒
              <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{genderEmojis[gender]} {genderNames[gender]} Collection</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                <span className="text-5xl">{genderEmojis[gender]}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-pink-600 font-bold">GHS {product.price}</p>
              </div>
            </Link>
          ))}
        </div>
        {products?.length === 0 && (
          <p className="text-center text-gray-500 py-12">No products in this category yet.</p>
        )}
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">NADS BEAUTY BAR</h3>
              <p className="text-gray-400 text-sm">WEARIT.LOVEIT.OWNIT.</p>
              <p className="text-gray-400 text-sm mt-2">Akobalm Balm Street, Sepe Timpon</p>
              <p className="text-gray-400 text-sm">Near Benab Oil</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/shop" className="hover:text-white transition">Shop All</Link></li>
                <li><Link href="/men" className="hover:text-white transition">Men</Link></li>
                <li><Link href="/women" className="hover:text-white transition">Women</Link></li>
                <li><Link href="/boys" className="hover:text-white transition">Boys</Link></li>
                <li><Link href="/girls" className="hover:text-white transition">Girls</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📞 +233201404264</li>
                <li>💬 +233201404264</li>
                <li>📧 beautybarnads@gmail.com</li>
                <li>📷 @Nads__beauty</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="https://instagram.com/Nads__beauty" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Instagram</a>
                <a href="https://facebook.com/Nads Beauty Bar" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 NADS BEAUTY BAR. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}