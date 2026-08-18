'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    lowStock: 0,
    outOfStock: 0
  })
  const [loading, setLoading] = useState(true)
  const [backupLoading, setBackupLoading] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      fetchStats()
    }
  }, [router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Get total active products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Get total orders (all orders, not just delivered)
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      // Get delivered orders for revenue
      const { data: deliveredOrders } = await supabase
        .from('orders')
        .select('total')
        .eq('status', 'delivered')

      const totalRevenue = deliveredOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

      // Get ALL variants to check stock
      const { data: variants } = await supabase
        .from('product_variants')
        .select('stock_quantity, product_id')

      // Count low stock (1-5 units)
      const lowStockCount = variants?.filter(v => v.stock_quantity > 0 && v.stock_quantity <= 5).length || 0
      
      // Count out of stock (0 units)
      const outOfStockCount = variants?.filter(v => v.stock_quantity === 0).length || 0

      setStats({
        products: productsCount || 0,
        orders: ordersCount || 0,
        revenue: totalRevenue,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // BACKUP FUNCTION
  // ============================================
  const handleBackup = async () => {
    if (!confirm('📦 This will download a complete backup of your data (products, orders, customers, etc.). Continue?')) return
    
    setBackupLoading(true)
    
    try {
      const tables = [
        'products',
        'product_variants', 
        'product_images',
        'orders',
        'order_items',
        'customers',
        'categories',
        'inventory_transactions'
      ]
      
      const backupData: any = {
        exported_at: new Date().toISOString(),
        store: 'NADS BEAUTY BAR'
      }
      
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*')
        if (error) {
          console.warn(`⚠️ Could not backup ${table}:`, error.message)
          backupData[table] = []
        } else {
          backupData[table] = data || []
        }
      }
      
      // Add stats to backup
      backupData.stats = stats
      
      // Create JSON file
      const json = JSON.stringify(backupData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Download
      const a = document.createElement('a')
      a.href = url
      a.download = `nads-beauty-bar-backup-${new Date().toISOString().slice(0,10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      const totalRecords = Object.values(backupData).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
      alert(`✅ Backup completed successfully!\n\n📊 Total records backed up: ${totalRecords}\n📁 File: nads-beauty-bar-backup-${new Date().toISOString().slice(0,10)}.json`)
    } catch (error: any) {
      alert('❌ Error creating backup: ' + error.message)
      console.error('Backup error:', error)
    } finally {
      setBackupLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
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
              <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            </div>
          </div>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="block px-4 py-2 bg-pink-50 text-pink-600 rounded-lg font-medium">
              📊 Dashboard
            </Link>
            <Link href="/admin/products" className="block px-4 py-2 hover:bg-gray-50 rounded-lg transition text-gray-700">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
          
          {loading ? (
            <p className="text-gray-600">Loading stats...</p>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm text-gray-500">Total Products</h3>
                  <p className="text-3xl font-bold text-pink-600">{stats.products}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm text-gray-500">Total Orders</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.orders}</p>
                  <p className="text-xs text-gray-500 mt-1">All orders in system</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm text-gray-500">Revenue</h3>
                  <p className="text-3xl font-bold text-green-600">GHS {stats.revenue}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm text-gray-500">Low Stock</h3>
                  <p className="text-3xl font-bold text-yellow-600">{stats.lowStock}</p>
                  <p className="text-xs text-gray-500">Items with ≤5 units</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm text-gray-500">Out of Stock</h3>
                  <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
                  <p className="text-xs text-gray-500">Items with 0 units</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link
                    href="/admin/products/new"
                    className="bg-pink-600 text-white p-4 rounded-lg text-center hover:bg-pink-700 transition font-medium"
                  >
                    ➕ Add Product
                  </Link>
                  <Link
                    href="/admin/orders"
                    className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition font-medium"
                  >
                    📋 View Orders
                  </Link>
                  <Link
                    href="/admin/products"
                    className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition font-medium"
                  >
                    📦 Manage Products
                  </Link>
                  <button
                    onClick={handleBackup}
                    disabled={backupLoading}
                    className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition font-medium disabled:opacity-50"
                  >
                    {backupLoading ? '⏳ Backing up...' : '💾 Backup'}
                  </button>
                </div>
              </div>

              {/* Backup Info */}
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">💾 Backup Information</h3>
                <p className="text-sm text-gray-600">
                  Click the <strong>"Backup"</strong> button above to download a complete backup of your store data including:
                </p>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Products & Variants</li>
                  <li>Product Images</li>
                  <li>Orders & Order Items</li>
                  <li>Customers</li>
                  <li>Categories</li>
                  <li>Inventory Transactions</li>
                </ul>
                <p className="text-xs text-gray-400 mt-2">
                  📁 Files are downloaded as JSON and can be used to restore your data if needed.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}