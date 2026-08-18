'use client'

import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import GhanaRegions from '@/components/GhanaRegions'

export default function CartPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()
  const [checkout, setCheckout] = useState(false)
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Generate order number
      const orderNumber = `NBB-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 10000)}`

      // ============================================
      // 1. CHECK STOCK BEFORE CREATING ORDER
      // ============================================
      for (const item of items) {
        if (!item.id) {
          throw new Error(`Invalid product ID for "${item.name}". Please remove and re-add this item.`)
        }

        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('stock_quantity, variant_sku')
          .eq('id', item.id)
          .maybeSingle()

        if (variantError) {
          console.error('Stock check error:', variantError)
          throw new Error(`Error checking stock for ${item.name}: ${variantError.message}`)
        }

        if (!variant) {
          throw new Error(`"${item.name}" is no longer available. Please remove it from your cart.`)
        }

        if (variant.stock_quantity < item.quantity) {
          throw new Error(`Not enough stock for "${item.name}". Available: ${variant.stock_quantity || 0}, Requested: ${item.quantity}`)
        }
      }

      // ============================================
      // 2. DEDUCT STOCK FROM DATABASE
      // ============================================
      const stockUpdates = []
      for (const item of items) {
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', item.id)
          .maybeSingle()

        if (variantError || !variant) {
          throw new Error(`Could not find stock for ${item.name}`)
        }

        const newStock = variant.stock_quantity - item.quantity

        const { error: updateError } = await supabase
          .from('product_variants')
          .update({ stock_quantity: newStock })
          .eq('id', item.id)

        if (updateError) {
          throw new Error(`Failed to update stock for ${item.name}`)
        }

        await supabase
          .from('inventory_transactions')
          .insert({
            variant_id: item.id,
            transaction_type: 'sale',
            quantity_change: -item.quantity,
            previous_quantity: variant.stock_quantity,
            new_quantity: newStock,
            notes: `Order #${orderNumber} - ${customer.name}`,
            created_at: new Date().toISOString()
          })

        stockUpdates.push({
          variant_id: item.id,
          previous: variant.stock_quantity,
          new: newStock,
          product_name: item.name
        })
      }

      // ============================================
      // 3. CREATE ORDER IN DATABASE
      // ============================================
      // Calculate totals
      const subtotal = totalPrice
      const deliveryFee = 30
      const grandTotal = subtotal + deliveryFee

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: customer.name,
          customer_phone: customer.phone,
          delivery_address: customer.address,
          city: customer.city,
          region: customer.region,
          delivery_notes: customer.notes,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total: grandTotal,
          status: 'pending',
          // Store items as JSON in the orders table
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size || 'N/A',
            color: item.color || 'N/A',
            variant_id: item.id || null,
            product_id: item.product_id || null,
            subtotal: item.price * item.quantity
          }))
        })
        .select()
        .single()

      if (orderError) {
        throw new Error(`Order creation failed: ${orderError.message}`)
      }

      // ============================================
      // 4. SAVE ORDER ITEMS TO order_items TABLE
      // ============================================
      console.log('Saving order items for order:', order.id)
      
      for (const item of items) {
        const subtotal = item.price * item.quantity
        
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.product_id || null,
            variant_id: item.id || null,
            product_name: item.name,
            size: item.size || 'N/A',
            color: item.color || 'N/A',
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: subtotal,
          })

        if (itemError) {
          console.error('Error saving order item:', itemError)
          // Don't throw, just log - order was already created
        }
      }

      // ============================================
      // 5. GENERATE WHATSAPP MESSAGE
      // ============================================
      let message = `Hi Nads Beauty Bar!\n\n`
      message += `Below is my order details:\n\n`
      message += `----------------------------------------\n`
      message += `ORDER SUMMARY\n`
      message += `----------------------------------------\n\n`

      items.forEach((item, i) => {
        message += `Item ${i+1}: ${item.name}\n`
        if (item.size && item.size !== 'N/A') message += `   Size: ${item.size}\n`
        if (item.color && item.color !== 'N/A') message += `   Color: ${item.color}\n`
        message += `   Quantity: ${item.quantity}\n`
        message += `   Price: GHS ${item.price}\n`
        message += `   Subtotal: GHS ${item.price * item.quantity}\n\n`
      })

      message += `----------------------------------------\n`
      message += `Subtotal: GHS ${subtotal}\n`
      message += `Delivery Fee: GHS ${deliveryFee}\n`
      message += `----------------------------------------\n`
      message += `TOTAL: GHS ${grandTotal}\n`
      message += `----------------------------------------\n\n`

      message += `Customer Details:\n`
      message += `----------------------------------------\n`
      message += `Name: ${customer.name}\n`
      message += `Phone: ${customer.phone}\n`
      message += `Address: ${customer.address}\n`
      message += `City: ${customer.city}\n`
      message += `Region: ${customer.region}\n`

      if (customer.notes) {
        message += `\nNotes: ${customer.notes}\n`
      }

      message += `\n----------------------------------------\n`
      message += `Thank you! Please confirm my order.`

      // ============================================
      // 6. SEND VIA WHATSAPP
      // ============================================
      const encodedMessage = encodeURIComponent(message)
      const whatsappNumber = '233201404264'
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank')

      alert(`✅ Order placed successfully!\n\nOrder #: ${orderNumber}\nStock deducted:\n${stockUpdates.map(s => `- ${s.product_name}: ${s.previous} → ${s.new}`).join('\n')}`)

      clearCart()
      setCheckout(false)
      router.push('/')

    } catch (error: any) {
      alert('❌ Error: ' + error.message)
      console.error('Checkout error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Browse our collection and add items you love!</p>
          <Link href="/" className="bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition inline-block font-medium">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                  ) : (
                    <span className="text-3xl">👕</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">GHS {item.price}</p>
                  {item.size && item.size !== 'N/A' && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700 font-medium">Size: {item.size}</span>
                  )}
                  {item.color && item.color !== 'N/A' && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-1 text-gray-700 font-medium">Color: {item.color}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 border rounded hover:bg-gray-100 text-gray-700"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-gray-900 font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 border rounded hover:bg-gray-100 text-gray-700"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h2>
              <div className="space-y-2 border-b pb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>GHS {totalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery</span>
                  <span>GHS 30</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg py-4">
                <span className="text-gray-900">Total</span>
                <span className="text-pink-600">GHS {totalPrice + 30}</span>
              </div>

              {!checkout ? (
                <button
                  onClick={() => setCheckout(true)}
                  className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition font-medium"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    required
                    className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                    value={customer.name}
                    onChange={(e) => setCustomer({...customer, name: e.target.value})}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    required
                    className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                    value={customer.phone}
                    onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                  />
                  <textarea
                    placeholder="Delivery Address *"
                    required
                    className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                    rows={2}
                    value={customer.address}
                    onChange={(e) => setCustomer({...customer, address: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                    value={customer.city}
                    onChange={(e) => setCustomer({...customer, city: e.target.value})}
                  />
                  <GhanaRegions
                    value={customer.region}
                    onChange={(value) => setCustomer({...customer, region: value})}
                    required
                    className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                  />
                  <textarea
                    placeholder="Additional Notes (optional)"
                    className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                    rows={2}
                    value={customer.notes}
                    onChange={(e) => setCustomer({...customer, notes: e.target.value})}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Placing Order...' : '📱 Place Order via WhatsApp'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckout(false)}
                    className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    ← Back to Cart
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}