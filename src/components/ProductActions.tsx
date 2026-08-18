'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'

interface ProductActionsProps {
  productId: string
  name: string
  price: number
  salePrice?: number | null
  variants: any[]
  images?: any[]
}

export default function ProductActions({ 
  productId, 
  name, 
  price, 
  salePrice,
  variants,
  images 
}: ProductActionsProps) {
  const { addToCart, items } = useCart()
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // Get unique sizes and colors
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))]
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))]

  // Get selected variant
  const selectedVariant = variants.find(v => 
    v.size === selectedSize && v.color === selectedColor
  )

  // Check stock status
  const hasAnyStock = variants.some(v => v.stock_quantity > 0)
  const selectedVariantStock = selectedVariant?.stock_quantity || 0
  const hasSelectedVariantStock = selectedVariantStock > 0

  // Out of stock checks
  const isProductOutOfStock = variants.length > 0 && !hasAnyStock
  const isSelectedVariantOutOfStock = variants.length > 0 && 
    selectedSize && 
    selectedColor && 
    !hasSelectedVariantStock
  const isOutOfStock = isProductOutOfStock || isSelectedVariantOutOfStock

  // Check if size/color needs to be selected
  const needsSelection = variants.length > 0 && (!selectedSize || !selectedColor)

  // Button disabled state
  const isAddToCartDisabled = isOutOfStock || needsSelection

  // Check if this item is already in cart
  const isInCart = items.some(item => {
    if (variants.length > 0 && selectedSize && selectedColor) {
      return item.product_id === productId && 
             item.size === selectedSize && 
             item.color === selectedColor
    }
    return item.product_id === productId
  })

  useEffect(() => {
    if (selectedVariant && selectedVariant.stock_quantity > 0) {
      setQuantity(1)
    }
  }, [selectedVariant])

  // ============================================
  // HELPER FUNCTION: Get the correct price
  // ============================================
  const getItemPrice = (variant?: any) => {
    // 1. If variant has price_override, use it
    if (variant?.price_override) {
      return variant.price_override
    }
    
    // 2. If product has a sale price (and it's lower than regular price), use it
    if (salePrice && salePrice > 0 && salePrice < price) {
      return salePrice
    }
    
    // 3. Otherwise use the regular price
    return price
  }

  const handleAddToCart = () => {
    if (variants.length > 0) {
      if (!selectedSize) {
        alert('Please select a size')
        return
      }
      if (!selectedColor) {
        alert('Please select a color')
        return
      }
      
      const variant = variants.find(v => 
        v.size === selectedSize && v.color === selectedColor
      )
      
      if (!variant || variant.stock_quantity <= 0) {
        alert('This variant is out of stock')
        return
      }
      
      if (quantity > variant.stock_quantity) {
        alert(`Only ${variant.stock_quantity} items available in stock`)
        return
      }
      
      // Get the correct price using the helper function
      const itemPrice = getItemPrice(variant)
      
      addToCart({
        id: variant.id,
        product_id: productId,
        name: name,
        price: itemPrice,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
        image: images?.[0]?.image_url
      })
    } else {
      // Simple product without variants
      const itemPrice = getItemPrice()
      
      addToCart({
        id: productId,
        product_id: productId,
        name: name,
        price: itemPrice,
        quantity: quantity,
        size: 'N/A',
        color: 'N/A',
        image: images?.[0]?.image_url
      })
    }
    
    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity < 1) return
    if (selectedVariant && newQuantity > selectedVariant.stock_quantity) {
      alert(`Only ${selectedVariant.stock_quantity} items available in stock`)
      return
    }
    setQuantity(newQuantity)
  }

  const handleWhatsAppOrder = () => {
    if (!isInCart) {
      alert('Please add the product to your cart first before ordering via WhatsApp.')
      return
    }

    if (variants.length > 0) {
      if (!selectedSize) {
        alert('Please select a size')
        return
      }
      if (!selectedColor) {
        alert('Please select a color')
        return
      }
    }
    
    const variant = variants.find(v => 
      v.size === selectedSize && v.color === selectedColor
    )
    
    // Calculate price with sale using the helper function
    const itemPrice = getItemPrice(variant)
    const total = itemPrice * quantity
    
    let message = `Hi Nads Beauty Bar!\n\n`
    message += `I want to order:\n\n`
    message += `Product: ${name}\n`
    if (selectedSize) message += `Size: ${selectedSize}\n`
    if (selectedColor) message += `Color: ${selectedColor}\n`
    message += `Quantity: ${quantity}\n`
    message += `Price: GHS ${itemPrice}\n`
    message += `Total: GHS ${total}\n\n`
    message += `Please confirm my order.`
    
    const encodedMessage = encodeURIComponent(message)
    const whatsappNumber = '233201404264'
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank')
  }

  const getButtonText = () => {
    if (isOutOfStock) return '❌ Out of Stock'
    if (needsSelection) return 'Select options'
    if (added) return '✅ Added to Cart!'
    return 'Add to Cart 🛒'
  }

  const getWhatsAppText = () => {
    if (isOutOfStock) return '❌ Out of Stock'
    if (needsSelection) return 'Select options'
    if (isInCart) return '📱 Buy via WhatsApp'
    return '⚠️ Add to Cart First'
  }

  return (
    <div className="space-y-4">
      {/* Sizes */}
      {sizes.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-gray-800">Available Sizes</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const hasStock = variants.some(v => v.size === size && v.stock_quantity > 0)
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!hasStock || isProductOutOfStock}
                  className={`px-4 py-2 rounded border-2 transition ${
                    selectedSize === size
                      ? 'border-pink-600 bg-pink-50 text-pink-700 font-medium'
                      : hasStock && !isProductOutOfStock
                      ? 'border-gray-300 text-gray-700 hover:border-pink-400 hover:bg-pink-50'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                  }`}
                >
                  {size}
                  {!hasStock && ' (Out of Stock)'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-gray-800">Available Colors</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const hasStock = selectedSize 
                ? variants.some(v => v.color === color && v.size === selectedSize && v.stock_quantity > 0)
                : variants.some(v => v.color === color && v.stock_quantity > 0)
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  disabled={!hasStock || isProductOutOfStock}
                  className={`px-4 py-2 rounded border-2 transition ${
                    selectedColor === color
                      ? 'border-pink-600 bg-pink-50 text-pink-700 font-medium'
                      : hasStock && !isProductOutOfStock
                      ? 'border-gray-300 text-gray-700 hover:border-pink-400 hover:bg-pink-50'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                  }`}
                >
                  {color}
                  {!hasStock && ' (Out of Stock)'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stock Status */}
      <div className="text-sm">
        {isProductOutOfStock ? (
          <span className="text-red-700 font-semibold">❌ Out of Stock</span>
        ) : variants.length > 0 && selectedSize && selectedColor ? (
          selectedVariantStock > 0 ? (
            <span className="text-green-700 font-semibold">✅ In Stock ({selectedVariantStock} available)</span>
          ) : (
            <span className="text-red-700 font-semibold">❌ Out of Stock</span>
          )
        ) : variants.length > 0 && !selectedSize ? (
          <span className="text-amber-700">Please select size and color</span>
        ) : hasAnyStock ? (
          <span className="text-green-700 font-semibold">✅ In Stock</span>
        ) : (
          <span className="text-red-700 font-semibold">❌ Out of Stock</span>
        )}
      </div>

      {/* Out of Stock Warning */}
      {isOutOfStock && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          <span className="font-bold">❌ Out of Stock</span>
          <p className="text-sm">This product is currently out of stock. Please check back later.</p>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex flex-wrap gap-4">
        <div className="flex border rounded">
          <button 
            className="px-4 py-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-800"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isAddToCartDisabled}
          >
            −
          </button>
          <input 
            type="number" 
            className="w-16 text-center border-x outline-none text-gray-800 font-medium" 
            value={quantity} 
            readOnly 
          />
          <button 
            className="px-4 py-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-800"
            onClick={() => handleQuantityChange(1)}
            disabled={(selectedVariant && quantity >= selectedVariant.stock_quantity) || isAddToCartDisabled}
          >
            +
          </button>
        </div>
        <button 
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled}
          className={`px-8 py-3 rounded transition font-medium flex-1 ${
            added 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : isAddToCartDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-pink-600 text-white hover:bg-pink-700'
          } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {getButtonText()}
        </button>
      </div>

      {/* WhatsApp Buy Button */}
      <button 
        onClick={handleWhatsAppOrder}
        disabled={isAddToCartDisabled}
        className={`w-full px-8 py-3 rounded transition font-medium ${
          isAddToCartDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isInCart
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-yellow-500 text-white hover:bg-yellow-600'
        } disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {getWhatsAppText()}
      </button>

      {!isInCart && !isOutOfStock && !needsSelection && (
        <p className="text-xs text-amber-600 text-center font-medium">
          Please add to cart first before ordering via WhatsApp
        </p>
      )}
    </div>
  )
}