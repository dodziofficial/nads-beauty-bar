'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AdminProducts() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      fetchProducts()
    }
  }, [router])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      alert('✅ Product deleted successfully!')
      fetchProducts()
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active'
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      
      alert(`✅ Product ${newStatus === 'active' ? 'activated' : 'archived'}!`)
      fetchProducts()
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    }
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen p-6">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">NB</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
            </div>
          </div>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-50 rounded-lg transition text-gray-700">
              📊 Dashboard
            </Link>
            <Link href="/admin/products" className="block px-4 py-2 bg-pink-50 text-pink-600 rounded-lg font-medium">
              📦 Products
            </Link>
            <Link href="/admin/orders" className="block px-4 py-2 hover:bg-gray-50 rounded-lg transition text-gray-700">
              🛍️ Orders
            </Link>
            <Link href="/admin/categories" className="block px-4 py-2 hover:bg-gray-50 rounded-lg transition text-gray-700">
              📂 Categories
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('adminAuth')
                router.push('/admin/login')
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition text-red-600"
            >
              🚪 Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <Link
              href="/admin/products/new"
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition font-medium"
            >
              + Add Product
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading products...</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Gender</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Variants</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products && products.length > 0 ? (
                    products.map((product) => {
                      const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0) || 0
                      const variantCount = product.variants?.length || 0
                      const isLowStock = totalStock > 0 && totalStock <= 5
                      
                      return (
                        <tr key={product.id}>
                          <td className="px-6 py-4 text-gray-900 font-medium">{product.name}</td>
                          <td className="px-6 py-4 capitalize text-gray-700">{product.gender}</td>
                          <td className="px-6 py-4 text-gray-900">GHS {product.price}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              totalStock === 0 ? 'bg-red-100 text-red-800' :
                              isLowStock ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {totalStock === 0 ? 'Out of Stock' : `${totalStock} units`}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{variantCount}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/admin/products/edit/${product.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                ✏️ Edit
                              </Link>
                              <Link
                                href={`/admin/products/stock/${product.id}`}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                📦 Stock
                              </Link>
                              <button
                                onClick={() => handleToggleStatus(product.id, product.status)}
                                className={`text-sm font-medium ${
                                  product.status === 'active' 
                                    ? 'text-yellow-600 hover:text-yellow-800' 
                                    : 'text-green-600 hover:text-green-800'
                                }`}
                              >
                                {product.status === 'active' ? '📁 Archive' : '✅ Activate'}
                              </button>
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                        No products yet. Add your first product!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}