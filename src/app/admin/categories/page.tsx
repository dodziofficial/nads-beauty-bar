'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AdminCategories() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    gender: 'unisex',
    description: '',
    image_url: '',
    slug: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      fetchCategories()
    }
  }, [router])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      // Get categories from the categories table
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      // Get product counts per category
      const { data: products } = await supabase
        .from('products')
        .select('category_id')
        .eq('status', 'active')

      const counts: Record<string, number> = {}
      products?.forEach(p => {
        if (p.category_id) {
          counts[p.category_id] = (counts[p.category_id] || 0) + 1
        }
      })

      // Merge counts with categories
      const merged = (categoryData || []).map(cat => ({
        ...cat,
        count: counts[cat.id] || 0
      }))

      setCategories(merged)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug: slug,
            gender: formData.gender,
            description: formData.description,
            image_url: formData.image_url || `/images/categories/${slug}.jpg`,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id)

        if (error) throw error
        alert('✅ Category updated!')
      } else {
        // Insert new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            slug: slug,
            gender: formData.gender,
            description: formData.description,
            image_url: formData.image_url || `/images/categories/${slug}.jpg`,
            status: 'active'
          })

        if (error) throw error
        alert('✅ Category created!')
      }

      setShowForm(false)
      setEditingCategory(null)
      setFormData({ name: '', gender: 'unisex', description: '', image_url: '', slug: '' })
      fetchCategories()
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      gender: category.gender || 'unisex',
      description: category.description || '',
      image_url: category.image_url || '',
      slug: category.slug || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (category: any) => {
    if (!confirm(`Delete category "${category.name}"? This will not delete products.`)) return
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)

      if (error) throw error
      alert('✅ Category deleted!')
      fetchCategories()
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
            <Link href="/admin/categories" className="block px-4 py-2 bg-pink-50 text-pink-600 rounded-lg font-medium">
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingCategory(null)
                setFormData({ name: '', gender: 'unisex', description: '', image_url: '', slug: '' })
              }}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition font-medium"
            >
              {showForm ? '✕ Cancel' : '+ Add Category'}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Accessories, Cosmetics, Jewelry"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Slug (URL identifier)</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                    placeholder="auto-generated from name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Gender Association</label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
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
                  <label className="block text-sm font-medium text-gray-800 mb-1">Description</label>
                  <textarea
                    rows={2}
                    className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of this category"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Image URL</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-pink-500"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="/images/categories/category-name.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to use default: /images/categories/{formData.slug || 'category'}.jpg</p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={cat.image_url || `/images/categories/${cat.slug}.jpg`} 
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder-category.jpg'
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-lg font-medium text-gray-900">{cat.name}</span>
                      <p className="text-sm text-gray-500">{cat.count} products</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                    <Link
                      href={`/${cat.slug || cat.gender}`}
                      className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {categories.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">No categories yet. Click "Add Category" to create one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}