'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface Variant {
  id: string
  size: string
  color: string
  stock_quantity: number
  price_override: string
}

export default function AddProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [variants, setVariants] = useState<Variant[]>([
    { id: crypto.randomUUID(), size: '', color: '', stock_quantity: 0, price_override: '' }
  ])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    gender: 'men',
    sku: '',
    brand: '',
    material: '',
  })

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('name')
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  // Add new variant row
  const addVariant = () => {
    setVariants([
      ...variants,
      { id: crypto.randomUUID(), size: '', color: '', stock_quantity: 0, price_override: '' }
    ])
  }

  // Remove variant row
  const removeVariant = (id: string) => {
    if (variants.length <= 1) {
      alert('You need at least one variant')
      return
    }
    setVariants(variants.filter(v => v.id !== id))
  }

  // Update variant field
  const updateVariant = (id: string, field: string, value: any) => {
    setVariants(variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages([...images, ...files])
    
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...previews])
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
    
    const newPreviews = [...imagePreviews]
    newPreviews.splice(index, 1)
    setImagePreviews(newPreviews)
  }

  // ============================================
  // UPDATED handleSubmit WITH CATEGORY
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate variants
      const invalidVariants = variants.filter(v => !v.size || !v.color)
      if (invalidVariants.length > 0) {
        alert('Please fill in both Size and Color for all variants')
        setLoading(false)
        return
      }

      // Validate prices
      const priceNum = parseFloat(formData.price)
      const salePriceNum = formData.sale_price ? parseFloat(formData.sale_price) : null

      if (isNaN(priceNum) || priceNum <= 0) {
        alert('Please enter a valid price (must be greater than 0)')
        setLoading(false)
        return
      }

      if (salePriceNum !== null && salePriceNum >= priceNum) {
        alert('⚠️ Sale price must be LOWER than the regular price.')
        setLoading(false)
        return
      }

      // ============================================
      // FIX: Generate unique slug
      // ============================================
      let slug = formData.name.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '')
      
      // Check if slug exists, if so, add a random suffix
      const { data: existingProduct } = await supabase
        .from('products')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle()

      if (existingProduct) {
        slug = `${slug}-${Date.now().toString().slice(-6)}`
      }

      // ============================================
      // FIX: Generate unique SKU
      // ============================================
      let sku = formData.sku || `NBB-${Date.now()}`
      
      // Check if SKU exists
      const { data: existingSku } = await supabase
        .from('products')
        .select('sku')
        .eq('sku', sku)
        .maybeSingle()

      if (existingSku) {
        sku = `NBB-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      }

      // 1. Create product with category_id
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          slug: slug,
          description: formData.description,
          price: priceNum,
          sale_price: salePriceNum,
          gender: formData.gender,
          sku: sku,
          brand: formData.brand,
          material: formData.material,
          category_id: selectedCategory || null,
          status: 'active',
        })
        .select()
        .single()

      if (productError) {
        console.error('Product error:', productError)
        if (productError.code === '23505') { // Unique violation
          alert('❌ A product with this name or SKU already exists. Please use a different name.')
        } else {
          alert('❌ Failed to create product: ' + productError.message)
        }
        setLoading(false)
        return
      }

      // 2. Create variants with stock - handle duplicate SKUs
      let variantErrors = []
      for (const variant of variants) {
        let variantSku = `${sku}-${variant.color.substring(0, 3).toUpperCase()}-${variant.size.toUpperCase()}`
        
        // Check if variant SKU exists
        const { data: existingVariant } = await supabase
          .from('product_variants')
          .select('variant_sku')
          .eq('variant_sku', variantSku)
          .maybeSingle()

        if (existingVariant) {
          variantSku = `${sku}-${variant.color.substring(0, 3).toUpperCase()}-${variant.size.toUpperCase()}-${Date.now().toString().slice(-4)}`
        }
        
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert({
            product_id: product.id,
            variant_sku: variantSku,
            size: variant.size,
            color: variant.color,
            stock_quantity: parseInt(variant.stock_quantity.toString()) || 0,
            price_override: variant.price_override ? parseFloat(variant.price_override) : null,
            status: 'active',
          })

        if (variantError) {
          console.error('Variant error:', variantError)
          variantErrors.push(`${variant.color}/${variant.size}: ${variantError.message}`)
        }
      }

      // 3. Upload images if any
      let imageErrors = []
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          try {
            const image = images[i]
            const fileExt = image.name.split('.').pop()
            const fileName = `${product.id}-${Date.now()}-${i}.${fileExt}`
            
            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(fileName, image)

            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName)

              await supabase
                .from('product_images')
                .insert({
                  product_id: product.id,
                  image_url: publicUrl,
                  alt_text: formData.name,
                  is_primary: i === 0,
                  sort_order: i,
                })
            } else {
              imageErrors.push(`Image ${i+1}: ${uploadError.message}`)
            }
          } catch (err) {
            console.error('Image upload error:', err)
            imageErrors.push(`Image ${i+1}: Upload failed`)
          }
        }
      }

      // Show success with any warnings
      let message = `✅ Product "${formData.name}" added successfully with ${variants.length} variants!`
      
      if (variantErrors.length > 0) {
        message += `\n\n⚠️ Variant errors:\n${variantErrors.join('\n')}`
      }
      if (imageErrors.length > 0) {
        message += `\n\n⚠️ Image errors:\n${imageErrors.join('\n')}`
      }
      
      alert(message)
      router.push('/admin/products')
    } catch (error: any) {
      alert('❌ Error: ' + (error.message || 'Something went wrong'))
      console.error('Full error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <button
            onClick={() => router.push('/admin/products')}
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Product Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 text-gray-900"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">SKU</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 text-gray-900"
                  placeholder="Auto-generated if left blank"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Description</label>
              <textarea
                rows={4}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 text-gray-900"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Price (GHS) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 text-gray-900"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Regular price (must be higher than sale price)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Sale Price (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 text-gray-900"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if not on sale (must be lower than regular price)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Gender *</label>
                <select
                  required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 text-gray-900"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="unisex">Unisex</option>
                  <option value="cosmetics">Cosmetics</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Brand</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 text-gray-900"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                />
              </div>
            </div>

            {/* Category Selection - NEW */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Category</label>
              {loadingCategories ? (
                <p className="text-gray-500 text-sm">Loading categories...</p>
              ) : (
                <select
                  className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">Categorize this product for better organization</p>
            </div>
          </div>

          {/* Variants Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Variants (Sizes, Colors & Stock)</h2>
              <button
                type="button"
                onClick={addVariant}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition text-sm font-medium"
              >
                + Add Variant
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Size</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Color</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Stock</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Price Override</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {variants.map((variant) => (
                    <tr key={variant.id}>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="e.g. S, M, L"
                          className="w-full border rounded px-3 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-pink-500"
                          value={variant.size}
                          onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="e.g. Black, White"
                          className="w-full border rounded px-3 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-pink-500"
                          value={variant.color}
                          onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="w-20 border rounded px-3 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-pink-500"
                          value={variant.stock_quantity}
                          onChange={(e) => updateVariant(variant.id, 'stock_quantity', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Leave blank for default"
                          className="w-28 border rounded px-3 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-pink-500"
                          value={variant.price_override}
                          onChange={(e) => updateVariant(variant.id, 'price_override', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Tip: You can add multiple variants for different sizes and colors.
            </p>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Product Images</h2>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-pink-500 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="text-4xl mb-2">📸</div>
                <p className="text-gray-700">Click to upload images</p>
                <p className="text-sm text-gray-500">Select multiple images</p>
              </label>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition disabled:opacity-50 font-medium"
          >
            {loading ? 'Adding Product...' : '➕ Add Product with Variants'}
          </button>
        </form>
      </div>
    </div>
  )
}