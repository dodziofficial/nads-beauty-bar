'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function DeliverySettings() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [deliveryFees, setDeliveryFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFee, setEditFee] = useState<string>('')
  const [newRegion, setNewRegion] = useState('')
  const [newFee, setNewFee] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      fetchDeliveryFees()
    }
  }, [router])

  const fetchDeliveryFees = async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('delivery_fees')
        .select('*')
        .order('region')
      setDeliveryFees(data || [])
    } catch (error) {
      console.error('Error fetching delivery fees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('delivery_fees')
        .update({ fee: parseFloat(editFee) })
        .eq('id', id)

      if (error) throw error
      
      alert('✅ Delivery fee updated!')
      setEditingId(null)
      fetchDeliveryFees()
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('delivery_fees')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      
      alert(`✅ Delivery fee ${!currentStatus ? 'activated' : 'deactivated'}!`)
      fetchDeliveryFees()
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    }
  }

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('delivery_fees')
        .insert({
          region: newRegion,
          fee: parseFloat(newFee)
        })

      if (error) throw error
      
      alert('✅ Delivery fee added!')
      setNewRegion('')
      setNewFee('')
      setShowAddForm(false)
      fetchDeliveryFees()
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
            <Link href="/admin/orders" className="block px-4 py-2 hover:bg-gray-50 rounded-lg transition text-gray-700">
              🛍️ Orders
            </Link>
            <Link href="/admin/categories" className="block px-4 py-2 hover:bg-gray-50 rounded-lg transition text-gray-700">
              📂 Categories
            </Link>
            <Link href="/admin/delivery" className="block px-4 py-2 bg-pink-50 text-pink-600 rounded-lg font-medium">
              🚚 Delivery
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
            <h1 className="text-3xl font-bold text-gray-900">🚚 Delivery Fee Settings</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition font-medium"
            >
              {showAddForm ? '✕ Cancel' : '+ Add Region'}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Region</h2>
              <form onSubmit={handleAddFee} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Region Name"
                  required
                  className="border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Delivery Fee (GHS)"
                  required
                  step="0.01"
                  className="border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition font-medium"
                >
                  Add Region
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Region</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Delivery Fee</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deliveryFees.map((fee) => (
                    <tr key={fee.id}>
                      <td className="px-6 py-4 text-gray-900">{fee.region}</td>
                      <td className="px-6 py-4">
                        {editingId === fee.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              value={editFee}
                              onChange={(e) => setEditFee(e.target.value)}
                              className="w-24 border rounded px-2 py-1 text-gray-900 focus:ring-2 focus:ring-pink-500"
                            />
                            <button
                              onClick={() => handleUpdateFee(fee.id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-900">GHS {fee.fee}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          fee.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {fee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(fee.id)
                              setEditFee(fee.fee.toString())
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(fee.id, fee.is_active)}
                            className={`text-sm font-medium ${
                              fee.is_active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'
                            }`}
                          >
                            {fee.is_active ? 'Deactivate' : 'Activate'}
                          </button>
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