import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">NADS BEAUTY BAR</h3>
            <p className="text-gray-400 text-sm">WEARIT.LOVEIT.OWNIT.</p>
            <p className="text-gray-400 text-sm mt-2">Akobalm Street, Sepe Timpon, Kumasi</p>
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
              <li><Link href="/unisex" className="hover:text-white transition">Unisex</Link></li>
              <li><Link href="/cosmetics" className="hover:text-white transition">Cosmetics</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 +233201404264</li>
              <li>💬 +233201404264</li>
              <li>📧 nadsbeautybars@gmail.com</li>
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
          <p>© 2026 NADS BEAUTY BAR. All rights reserved.</p>
          <p className="mt-1 text-xs text-gray-500">
            Developed by <span className="text-pink-400 font-medium">Dodzi</span> • 
            Tel: <a href="tel:+233244620614" className="hover:text-white transition">+233 244 620 614</a> • 
            Email: <a href="mailto:dodzibuzz@gmail.com" className="hover:text-white transition">dodzibuzz@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  )
}