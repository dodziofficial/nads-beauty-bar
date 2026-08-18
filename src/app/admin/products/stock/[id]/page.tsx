'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function StockManagement() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [variants, setVariants] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [stockAction, setStockAction] = useState<'add' | 'remove' | 'adjust'>('add')
  const [quantity, setQuantity] = useState<number>(1)
  const [reason, setReason] = useState('')

  // Stock reason options for dropdown
  const stockReasons = [
    { value: 'new_shipment', label: '📦 New Shipment Received' },
    { value: 'supplier_restock', label: '🏭 Restock from Supplier' },
    { value: 'damaged', label: '💔 Damaged Item' },
    { value: 'customer_return', label: '🔄 Customer Return' },
    { value: 'wrong_size_return', label: '📏 Wrong Size/Color Return' },
    { value: 'defective', label: '⚠️ Defective Product' },
    { value: 'inventory_adjustment', label: '📊 Inventory Count Adjustment' },
    { value: 'seasonal_adjustment', label: '🍂 Seasonal Stock Adjustment' },
    { value: 'returned_to_supplier', label: '📤 Returned to Supplier' },
    { value: 'stock_count_correction', label: '🔢 Stock Count Correction' },
    { value: 'other', label: '📝 Other' },
  ]

  useEffect(() => {
    fetchProductData()
  }, [productId])

  const fetchProductData = async () => {
    try {
      setLoading(true)
      
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
      setProduct(productData)

      const { data: variantData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
      setVariants(variantData || [])
      
      if (variantData && variantData.length > 0) {
        setSelectedVariant(variantData[0].id)
      }

      const { data: transactionData } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          product_variants (
            size,
            color,
            variant_sku
          )
        `)
        .in('variant_id', variantData?.map(v => v.id) || [])
        .order('created_at', { ascending: false })
        .limit(20)
      
      setTransactions(transactionData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const variant = variants.find(v => v.id === selectedVariant)
      if (!variant) throw new Error('Variant not found')

      // Validate reason is selected
      if (!reason) {
        alert('Please select a reason for this stock change')
        setSubmitting(false)
        return
      }

      let newQuantity = variant.stock_quantity
      let transactionType = ''
      let changeAmount = 0
      let notes = ''

      const reasonLabel = stockReasons.find(r => r.value === reason)?.label || reason

      if (stockAction === 'add') {
        newQuantity = variant.stock_quantity + quantity
        transactionType = 'restock'
        changeAmount = quantity
        notes = `${reasonLabel} - Added ${quantity} units`
      } else if (stockAction === 'remove') {
        if (quantity > variant.stock_quantity) {
          throw new Error(`Cannot remove ${quantity} items. Only ${variant.stock_quantity} in stock.`)
        }
        newQuantity = variant.stock_quantity - quantity
        transactionType = 'adjustment'
        changeAmount = -quantity
        notes = `${reasonLabel} - Removed ${quantity} units`
      } else {
        if (quantity < 0) throw new Error('Quantity cannot be negative')
        const diff = quantity - variant.stock_quantity
        newQuantity = quantity
        transactionType = 'adjustment'
        changeAmount = diff
        notes = `${reasonLabel} - Adjusted to ${quantity} units (${diff > 0 ? '+' : ''}${diff})`
      }

      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newQuantity })
        .eq('id', selectedVariant)

      if (updateError) throw updateError

      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert({
          variant_id: selectedVariant,
          transaction_type: transactionType,
          quantity_change: changeAmount,
          previous_quantity: variant.stock_quantity,
          new_quantity: newQuantity,
          notes: notes,
          created_at: new Date().toISOString()
        })

      if (transactionError) throw transactionError

      alert(`✅ Stock updated successfully!\n\n${variant.color} / ${variant.size}\nPrevious: ${variant.stock_quantity}\nNew: ${newQuantity}\nReason: ${reasonLabel}`)
      
      fetchProductData()
      setQuantity(1)
      setReason('')
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
            <p className="text-gray-700">{product?.name}</p>
          </div>
          <button
            onClick={() => router.push('/admin/products')}
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            ← Back
          </button>
        </div>

        {/* Current Stock */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Current Stock</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {variants.map((variant) => (
              <div key={variant.id} className="border rounded-lg p-4">
                <p className="font-semibold text-gray-900">{variant.color} / {variant.size}</p>
                <p className={`text-2xl font-bold ${
                  variant.stock_quantity === 0 ? 'text-red-600' :
                  variant.stock_quantity <= 5 ? 'text-amber-600' :
                  'text-green-600'
                }`}>
                  {variant.stock_quantity}
                </p>
                <p className="text-xs text-gray-500">SKU: {variant.variant_sku}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Update Stock Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Update Stock</h2>
          <form onSubmit={handleStockUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Select Variant</label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                required
              >
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id} className="text-gray-900">
                    {variant.color} / {variant.size} (Current: {variant.stock_quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Action</label>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-gray-800">
                  <input
                    type="radio"
                    value="add"
                    checked={stockAction === 'add'}
                    onChange={(e) => setStockAction(e.target.value as any)}
                    className="text-pink-600"
                  />
                  Add Stock
                </label>
                <label className="flex items-center gap-2 text-gray-800">
                  <input
                    type="radio"
                    value="remove"
                    checked={stockAction === 'remove'}
                    onChange={(e) => setStockAction(e.target.value as any)}
                    className="text-pink-600"
                  />
                  Remove Stock
                </label>
                <label className="flex items-center gap-2 text-gray-800">
                  <input
                    type="radio"
                    value="adjust"
                    checked={stockAction === 'adjust'}
                    onChange={(e) => setStockAction(e.target.value as any)}
                    className="text-pink-600"
                  />
                  Set Exact Amount
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                {stockAction === 'adjust' ? 'New Quantity' : 'Quantity to ' + stockAction}
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Reason for Stock Change *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Select a reason...</option>
                {stockReasons.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Please select a reason for this stock change</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition font-medium disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Stock'}
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-600">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Variant</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Change</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Previous → New</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-2 text-sm text-gray-800">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{t.product_variants?.color}/{t.product_variants?.size}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          t.transaction_type === 'sale' ? 'bg-red-100 text-red-800' :
                          t.transaction_type === 'restock' ? 'bg-green-100 text-green-800' :
                          t.transaction_type === 'cancelled' ? 'bg-blue-100 text-blue-800' :
                          t.transaction_type === 'returned' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm font-bold">
                        <span className={t.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}>
                          {t.quantity_change > 0 ? '+' : ''}{t.quantity_change}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">{t.previous_quantity} → {t.new_quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{t.notes || '-'}</td>
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