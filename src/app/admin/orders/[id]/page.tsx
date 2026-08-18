'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function OrderDetail() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      
      // Get order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError
      setOrder(orderData)

      // ============================================
      // FIX: Get order items with better query
      // ============================================
      // Try to get items from order_items table
      let { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      // If that fails or returns empty, check if items are stored in the orders table as JSON
      if (itemsError || !itemsData || itemsData.length === 0) {
        console.log('No items in order_items table, checking orders.items JSON field')
        
        // Check if items are stored in the orders table's items field (JSONB)
        if (orderData.items && Array.isArray(orderData.items)) {
          itemsData = orderData.items
        }
      }

      setOrderItems(itemsData || [])
      
      // Log for debugging
      console.log('Order items found:', itemsData?.length || 0)
      
    } catch (error) {
      console.error('Error fetching order:', error)
      alert('Error loading order')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (status: string) => {
    if (!confirm(`Change order status to "${status}"?`)) return
    
    setUpdating(true)
    try {
      const oldStatus = order.status

      const { error } = await supabase
        .from('orders')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      // Handle stock changes based on status
      if (status === 'confirmed' && (oldStatus === 'pending' || oldStatus === 'processing')) {
        await deductStock()
      }
      
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        await restoreStock('cancelled', 'Order cancelled by customer')
      }
      
      if (status === 'returned' && oldStatus !== 'returned') {
        await restoreStock('returned', 'Item returned by customer')
      }

      alert(`✅ Order status updated to "${status}"`)
      fetchOrder()
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    } finally {
      setUpdating(false)
    }
  }

  const deductStock = async () => {
    try {
      for (const item of orderItems) {
        // Skip if no variant_id
        if (!item.variant_id) continue
        
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', item.variant_id)
          .single()

        if (variantError) {
          console.error('Error finding variant:', variantError)
          continue
        }

        const newStock = variant.stock_quantity - item.quantity

        await supabase
          .from('product_variants')
          .update({ stock_quantity: newStock })
          .eq('id', item.variant_id)

        await supabase
          .from('inventory_transactions')
          .insert({
            variant_id: item.variant_id,
            transaction_type: 'sale',
            quantity_change: -item.quantity,
            previous_quantity: variant.stock_quantity,
            new_quantity: newStock,
            reference_id: orderId,
            reference_type: 'order',
            notes: `Order #${order.order_number} confirmed`
          })
      }
    } catch (error) {
      console.error('Error deducting stock:', error)
    }
  }

  const restoreStock = async (reason: string, notes: string) => {
    try {
      for (const item of orderItems) {
        if (!item.variant_id) continue
        
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', item.variant_id)
          .single()

        if (variantError) {
          console.error('Error finding variant:', variantError)
          continue
        }

        const newStock = variant.stock_quantity + item.quantity

        await supabase
          .from('product_variants')
          .update({ stock_quantity: newStock })
          .eq('id', item.variant_id)

        await supabase
          .from('inventory_transactions')
          .insert({
            variant_id: item.variant_id,
            transaction_type: reason === 'cancelled' ? 'cancelled' : 'returned',
            quantity_change: item.quantity,
            previous_quantity: variant.stock_quantity,
            new_quantity: newStock,
            reference_id: orderId,
            reference_type: 'order',
            notes: `Order #${order.order_number} ${reason} - ${notes}`
          })
      }
    } catch (error) {
      console.error('Error restoring stock:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Order not found</p>
          <Link href="/admin/orders" className="text-pink-600 hover:underline mt-4 inline-block">
            ← Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">Order #: {order.order_number}</p>
          </div>
          <Link href="/admin/orders" className="text-gray-700 hover:text-gray-900 font-medium">
            ← Back to Orders
          </Link>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer</h3>
              <p className="text-gray-900">{order.customer_name || 'Guest'}</p>
              <p className="text-gray-600 text-sm">{order.customer_phone || 'No phone'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Delivery Address</h3>
              <p className="text-gray-900">{order.delivery_address || 'N/A'}</p>
              <p className="text-gray-600 text-sm">{order.city}, {order.region}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Order Summary</h3>
              <p className="text-gray-900">Total: GHS {order.total}</p>
              <p className="text-gray-600 text-sm">Items: {orderItems.length}</p>
            </div>
          </div>
        </div>

        {/* Status Update */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Update Status</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => updateOrderStatus('pending')}
              className={`px-4 py-2 rounded border transition ${
                order.status === 'pending' 
                  ? 'bg-yellow-500 text-white border-yellow-500' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => updateOrderStatus('confirmed')}
              className={`px-4 py-2 rounded border transition ${
                order.status === 'confirmed' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Confirm (Deduct Stock)
            </button>
            <button
              onClick={() => updateOrderStatus('processing')}
              className={`px-4 py-2 rounded border transition ${
                order.status === 'processing' 
                  ? 'bg-purple-500 text-white border-purple-500' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => updateOrderStatus('out_for_delivery')}
              className={`px-4 py-2 rounded border transition ${
                order.status === 'out_for_delivery' 
                  ? 'bg-indigo-500 text-white border-indigo-500' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Out for Delivery
            </button>
            <button
              onClick={() => updateOrderStatus('delivered')}
              className={`px-4 py-2 rounded border transition ${
                order.status === 'delivered' 
                  ? 'bg-green-500 text-white border-green-500' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Delivered
            </button>
            <button
              onClick={() => updateOrderStatus('cancelled')}
              className={`px-4 py-2 rounded border transition ${
                order.status === 'cancelled' 
                  ? 'bg-red-500 text-white border-red-500' 
                  : 'border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              Cancel (Restore Stock)
            </button>
            <button
              onClick={() => updateOrderStatus('returned')}
              className={`px-4 py-2 rounded border transition ${
                order.status === 'returned' 
                  ? 'bg-orange-500 text-white border-orange-500' 
                  : 'border-orange-300 text-orange-700 hover:bg-orange-50'
              }`}
            >
              Returned (Restore Stock)
            </button>
          </div>
          {updating && <p className="text-gray-500 text-sm mt-3">Updating...</p>}
          <p className="text-sm text-gray-500 mt-3">
            Current Status: <span className="font-medium text-gray-800">{order.status}</span>
          </p>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900 p-6 pb-2">Order Items</h3>
          
          {orderItems.length === 0 ? (
            <p className="text-gray-500 px-6 pb-6">No items found for this order.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Size</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Color</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Qty</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orderItems.map((item: any, index: number) => (
                  <tr key={item.id || index}>
                    <td className="px-6 py-4 text-gray-900">{item.product_name || 'Product'}</td>
                    <td className="px-6 py-4 text-gray-600">{item.size || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{item.color || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-900">{item.quantity || 1}</td>
                    <td className="px-6 py-4 text-gray-900">GHS {item.unit_price || item.price || 0}</td>
                    <td className="px-6 py-4 text-gray-900">GHS {item.subtotal || (item.quantity * item.unit_price) || 0}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-right font-bold text-gray-900">Subtotal:</td>
                  <td className="px-6 py-4 text-gray-900">GHS {order.subtotal || 0}</td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-right font-bold text-gray-900">Delivery Fee:</td>
                  <td className="px-6 py-4 text-gray-900">GHS {order.delivery_fee || 0}</td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-right font-bold text-gray-900">Total:</td>
                  <td className="px-6 py-4 text-gray-900 font-bold">GHS {order.total || 0}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}