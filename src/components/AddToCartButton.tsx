'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'

interface AddToCartButtonProps {
  productId: string
  name: string
  price: number
  size?: string
  color?: string
  image?: string
}

export default function AddToCartButton({ 
  productId, 
  name, 
  price, 
  size, 
  color, 
  image 
}: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    const cartItem = {
      id: `${productId}-${size || 'default'}-${color || 'default'}`,
      product_id: productId,
      name: name,
      price: price,
      quantity: quantity,
      size: size || 'N/A',
      color: color || 'N/A',
      image: image || ''
    }
    
    addToCart(cartItem)
    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex border rounded">
        <button 
          className="px-4 py-2 hover:bg-gray-100 transition"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
        >
          −
        </button>
        <input 
          type="number" 
          className="w-16 text-center border-x outline-none" 
          value={quantity} 
          readOnly 
        />
        <button 
          className="px-4 py-2 hover:bg-gray-100 transition"
          onClick={() => setQuantity(quantity + 1)}
        >
          +
        </button>
      </div>
      <button 
        onClick={handleAddToCart}
        className={`px-8 py-3 rounded transition font-medium flex-1 ${
          added 
            ? 'bg-green-600 text-white' 
            : 'bg-pink-600 text-white hover:bg-pink-700'
        }`}
      >
        {added ? '✅ Added to Cart!' : 'Add to Cart 🛒'}
      </button>
    </div>
  )
}