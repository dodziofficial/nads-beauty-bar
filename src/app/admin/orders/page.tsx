'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AdminOrders() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      fetchOrders()
    }
  }, [router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!confirm(`Change order status to "${newStatus}"?`)) return

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error
      alert(`✅ Order status updated to "${newStatus}"`)
      fetchOrders()
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
              <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            </div>
          </div>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-50 rounded-lg transition text-gray-700">
              📊 Dashboard
            </Link>
            <Link href="/admin/products" className="block px-4 py-2 hover:bg-gray-50 rounded-lg transition text-gray-700">
              📦 Products
            </Link>
            <Link href="/admin/orders" className="block px-4 py-2 bg-pink-50 text-pink-600 rounded-lg font-medium">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders</h1>
          
          {loading ? (
            <p className="text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600">No orders yet.</p>
              <p className="text-sm text-gray-500 mt-2">Orders will appear here when customers place them.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Order #</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 text-gray-900 font-medium">{order.order_number || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-700">{order.customer_name || 'Guest'}</td>
                      <td className="px-6 py-4 text-gray-900">GHS {order.total || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'out_for_delivery' ? 'bg-indigo-100 text-indigo-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'returned' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </Link>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                updateOrderStatus(order.id, e.target.value)
                                e.target.value = ''
                              }
                            }}
                            className="text-sm border rounded px-2 py-1 text-gray-700 focus:ring-2 focus:ring-pink-500"
                            defaultValue=""
                          >
                            <option value="">Update Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirm (Deduct Stock)</option>
                            <option value="processing">Processing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancel (Restore Stock)</option>
                            <option value="returned">Returned (Restore Stock)</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}