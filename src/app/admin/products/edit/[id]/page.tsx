'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface Variant {
  id: string
  size: string
  color: string
  stock_quantity: number
  price_override: string
  variant_sku: string
}

export default function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
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
    status: 'active'
  })

  // Load product data when page loads
  useEffect(() => {
    if (productId) {
      fetchProductData()
    }
  }, [productId])

  // Fetch categories
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

  const fetchProductData = async () => {
    try {
      setLoading(true)
      
      // 1. Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError) throw productError

      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        sale_price: product.sale_price?.toString() || '',
        gender: product.gender || 'men',
        sku: product.sku || '',
        brand: product.brand || '',
        material: product.material || '',
        status: product.status || 'active'
      })

      // Set selected category
      setSelectedCategory(product.category_id || '')

      // 2. Get variants
      const { data: variantData, error: variantError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)

      if (variantError) throw variantError

      setVariants(variantData.map(v => ({
        id: v.id,
        size: v.size || '',
        color: v.color || '',
        stock_quantity: v.stock_quantity || 0,
        price_override: v.price_override?.toString() || '',
        variant_sku: v.variant_sku || ''
      })))

      // 3. Get existing images
      const { data: imageData, error: imageError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true })

      if (imageError) throw imageError
      setExistingImages(imageData || [])

    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Error loading product data')
    } finally {
      setLoading(false)
    }
  }

  // Add new variant row
  const addVariant = () => {
    setVariants([
      ...variants,
      { id: `new-${Date.now()}`, size: '', color: '', stock_quantity: 0, price_override: '', variant_sku: '' }
    ])
  }

  // Remove variant
  const removeVariant = async (id: string) => {
    if (variants.length <= 1) {
      alert('You need at least one variant')
      return
    }

    if (!id.startsWith('new-')) {
      if (!confirm('Delete this variant?')) return
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id)
      
      if (error) {
        alert('Error deleting variant: ' + error.message)
        return
      }
    }

    setVariants(variants.filter(v => v.id !== id))
  }

  // Update variant field
  const updateVariant = (id: string, field: string, value: any) => {
    setVariants(variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  // ============================================
  // IMAGE HANDLING FUNCTIONS
  // ============================================
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

  const removeExistingImage = async (imageId: string) => {
    if (!confirm('Remove this image?')) return
    
    try {
      // Get the image record to get the file path
      const { data: image } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('id', imageId)
        .single()

      if (image) {
        // Extract filename from URL
        const urlParts = image.image_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        
        // Delete from storage
        await supabase.storage
          .from('product-images')
          .remove([fileName])
      }

      // Delete from database
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      // Remove from local state
      setExistingImages(existingImages.filter(img => img.id !== imageId))
      alert('✅ Image removed successfully!')
    } catch (error: any) {
      alert('❌ Error removing image: ' + error.message)
    }
  }

  const setPrimaryImage = async (imageId: string) => {
    try {
      // Update all images for this product to not be primary
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)

      // Set the selected image as primary
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId)

      if (error) throw error

      // Update local state
      setExistingImages(existingImages.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })))

      alert('✅ Primary image updated!')
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setUploading(true)

    try {
      // Validate variants
      const invalidVariants = variants.filter(v => !v.size || !v.color)
      if (invalidVariants.length > 0) {
        alert('Please fill in both Size and Color for all variants')
        setSubmitting(false)
        setUploading(false)
        return
      }

      // Validate prices
      const priceNum = parseFloat(formData.price)
      const salePriceNum = formData.sale_price ? parseFloat(formData.sale_price) : null

      if (isNaN(priceNum) || priceNum <= 0) {
        alert('Please enter a valid price (must be greater than 0)')
        setSubmitting(false)
        setUploading(false)
        return
      }

      if (salePriceNum !== null && salePriceNum >= priceNum) {
        alert('⚠️ Sale price must be LOWER than the regular price.')
        setSubmitting(false)
        setUploading(false)
        return
      }

      // 1. Update product with category_id
      const { error: productError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: priceNum,
          sale_price: salePriceNum,
          gender: formData.gender,
          sku: formData.sku,
          brand: formData.brand,
          material: formData.material,
          status: formData.status,
          category_id: selectedCategory || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (productError) throw productError

      // 2. Update variants
      for (const variant of variants) {
        const variantSku = `${formData.sku}-${variant.color.substring(0, 3).toUpperCase()}-${variant.size.toUpperCase()}`

        if (variant.id.startsWith('new-')) {
          const { error } = await supabase
            .from('product_variants')
            .insert({
              product_id: productId,
              variant_sku: variantSku,
              size: variant.size,
              color: variant.color,
              stock_quantity: parseInt(variant.stock_quantity.toString()) || 0,
              price_override: variant.price_override ? parseFloat(variant.price_override) : null,
              status: 'active',
            })

          if (error) console.error('Error adding variant:', error)
        } else {
          const { error } = await supabase
            .from('product_variants')
            .update({
              variant_sku: variantSku,
              size: variant.size,
              color: variant.color,
              stock_quantity: parseInt(variant.stock_quantity.toString()) || 0,
              price_override: variant.price_override ? parseFloat(variant.price_override) : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', variant.id)

          if (error) console.error('Error updating variant:', error)
        }
      }

      // 3. Upload new images
      if (images.length > 0) {
        // Get current highest sort order
        const maxSortOrder = existingImages.length > 0 
          ? Math.max(...existingImages.map(img => img.sort_order || 0))
          : -1

        for (let i = 0; i < images.length; i++) {
          const image = images[i]
          const fileExt = image.name.split('.').pop()
          const fileName = `${productId}-${Date.now()}-${i}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, image)

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName)

            const isPrimary = existingImages.length === 0 && i === 0
            const sortOrder = maxSortOrder + i + 1

            await supabase
              .from('product_images')
              .insert({
                product_id: productId,
                image_url: publicUrl,
                alt_text: formData.name,
                is_primary: isPrimary,
                sort_order: sortOrder,
              })
          }
        }
      }

      alert('✅ Product updated successfully!')
      router.push('/admin/products')
    } catch (error: any) {
      alert('❌ Error: ' + (error.message || 'Something went wrong'))
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-700">SKU: {formData.sku}</p>
          </div>
          <button
            onClick={() => router.push('/admin/products')}
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Information */}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Status</label>
                <select
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 text-gray-900"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="draft">Draft</option>
                </select>
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
              Tip: You can add, edit, or delete variants. Changes will be saved when you submit.
            </p>
          </div>

          {/* ============================================ */}
          {/* IMAGE UPLOAD SECTION */}
          {/* ============================================ */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Product Images</h2>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
                <div className="grid grid-cols-4 gap-4">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.image_url}
                        alt={img.alt_text || 'Product image'}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(img.id)}
                          className={`text-white text-xs px-2 py-1 rounded ${
                            img.is_primary ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          {img.is_primary ? '⭐ Primary' : 'Set Primary'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Upload New Images</h3>
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
              
              {/* New Image Previews */}
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
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition disabled:opacity-50 font-medium"
          >
            {submitting ? 'Saving Changes...' : '💾 Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}