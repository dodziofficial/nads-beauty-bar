'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'

interface Slide {
  id: string
  type: 'product' | 'service'
  title: string
  description: string
  image: string
  link: string
  buttonText: string
}

export default function HomeSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlides()
  }, [])

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (slides.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const fetchSlides = async () => {
    try {
      // Fetch featured products
      const { data: products } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*)
        `)
        .eq('featured', true)
        .eq('status', 'active')
        .limit(3)

      // Build slides from products
      const productSlides: Slide[] = products?.map((product) => {
        const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
        return {
          id: product.id,
          type: 'product',
          title: product.name,
          description: product.short_description || 'Premium quality fashion product from Nads Beauty Bar.',
          image: primaryImage?.image_url || '/images/placeholder-product.jpg',
          link: `/product/${product.slug}`,
          buttonText: 'Shop Now →'
        }
      }) || []

      // Add service slides
      const serviceSlides: Slide[] = [
        {
          id: 'service-1',
          type: 'service',
          title: '💄 Professional Makeup Services',
          description: 'From bridal makeup to event glam, our expert artists create stunning looks for every occasion.',
          image: '/images/slideshow/makeup-service.jpg',
          link: '#services',
          buttonText: 'Book Now →'
        },
        {
          id: 'service-2',
          type: 'service',
          title: '🏠 Home Beauty Services',
          description: 'We come to you! Enjoy professional makeup, skincare, and beauty services in the comfort of your home.',
          image: '/images/slideshow/home-service.jpg',
          link: '#services',
          buttonText: 'Book Now →'
        },
        {
          id: 'service-3',
          type: 'service',
          title: '✨ Skincare & Facials',
          description: 'Rejuvenating facials and personalized skincare treatments for glowing, healthy skin.',
          image: '/images/slideshow/skincare-service.jpg',
          link: '#services',
          buttonText: 'Learn More →'
        },
        // ============================================
        // NEW: Cosmetics Slide
        // ============================================
        {
          id: 'service-4',
          type: 'service',
          title: '💄 Cosmetics & Accessories',
          description: 'Discover our premium collection of perfumes, chains, beads, and elegant accessories.',
          image: '/images/categories/cosmetics.jpg',
          link: '/cosmetics',
          buttonText: 'Explore Cosmetics →'
        }
      ]

      // Combine slides
      const allSlides = [...productSlides, ...serviceSlides]
      setSlides(allSlides)
    } catch (error) {
      console.error('Error fetching slides:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-200 h-[500px] rounded-lg flex items-center justify-center animate-pulse">
        <span className="text-gray-400">Loading slides...</span>
      </div>
    )
  }

  if (slides.length === 0) {
    return null
  }

  const slide = slides[currentSlide]

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gray-900">
      {/* Slide Image */}
      <div className="relative h-[500px] w-full">
        {slide.image ? (
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover opacity-70"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
            <span className="text-6xl">👕</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          {slide.type === 'product' ? (
            <span className="inline-block bg-pink-500 text-white text-xs px-3 py-1 rounded-full mb-3 font-medium">
              🛍️ Featured Product
            </span>
          ) : (
            <span className="inline-block bg-purple-500 text-white text-xs px-3 py-1 rounded-full mb-3 font-medium">
              💄 Beauty Service
            </span>
          )}
          <h2 className="text-3xl md:text-5xl font-bold mb-3">{slide.title}</h2>
          <p className="text-gray-200 text-sm md:text-base max-w-2xl mb-4 line-clamp-3">{slide.description}</p>
          <Link
            href={slide.link}
            className="inline-block bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full font-medium transition transform hover:scale-105 shadow-lg"
          >
            {slide.buttonText}
          </Link>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition z-10"
      >
        ❮
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition z-10"
      >
        ❯
      </button>
    </div>
  )
}