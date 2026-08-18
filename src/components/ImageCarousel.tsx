'use client'

import { useState } from 'react'

interface ImageCarouselProps {
  images: Array<{
    id: string
    image_url: string
    alt_text?: string
    is_primary?: boolean
  }>
  productName: string
}

export default function ImageCarousel({ images, productName }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
        <span className="text-8xl">👕</span>
      </div>
    )
  }

  const currentImage = images[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div 
        className="bg-gray-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden cursor-pointer"
        onClick={() => setIsFullscreen(!isFullscreen)}
      >
        <img
          src={currentImage.image_url}
          alt={currentImage.alt_text || productName}
          className={`w-full h-full object-cover rounded-lg transition-transform duration-300 ${
            isFullscreen ? 'scale-150' : 'scale-100'
          }`}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
            >
              ❮
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
            >
              ❯
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Fullscreen Toggle */}
        <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition">
          {isFullscreen ? '⛶' : '⛶'}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              onClick={() => goToImage(index)}
              className={`bg-gray-100 rounded-lg h-20 flex items-center justify-center cursor-pointer overflow-hidden transition border-2 ${
                currentIndex === index ? 'border-pink-500' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || productName}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh]">
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || productName}
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition"
            >
              ✕
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition"
                >
                  ❮
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition"
                >
                  ❯
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}