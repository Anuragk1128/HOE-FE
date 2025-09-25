"use client"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import useEmblaCarousel from 'embla-carousel-react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CategoryGrid } from "./category-grid"

const heroSlides = [
  {
    id: 1,
    title: "New Season Collection",
    description: "Discover our latest arrivals for the season",
    ctaText: "Shop Now",
    ctaLink: "/products",
    bgColor: "bg-gradient-to-b from-sky-700 to-sky-950"
  },
  {
    id: 2,
    image: "/hero-bg.png",
    alt: "New Arrivals",
    title: "New Season Collection",
    description: "Discover our latest arrivals for the season",
    ctaText: "Shop Now",
    ctaLink: "/products"
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/deamrxfwp/image/upload/v1758023506/hero_hoe_earring_2_hb0ncn.jpg",
    alt: "Special Offers",
    title: "Special Offers",
    description: "Limited time offers on selected item",
    ctaText: "View Deals",
    ctaLink: "/categories"
  },
  {
    id: 4,
    image: "https://res.cloudinary.com/deamrxfwp/image/upload/v1758466860/design_12_usezb9.jpg",
    alt: "Trending Now",
    title: "Trending Now",
    description: "Shop what's trending this season",
    ctaText: "Explore",
    ctaLink: "/brands"
  }
]

export function HeroSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const autoplayInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
    resetAutoplay()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
    resetAutoplay()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index)
    resetAutoplay()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    setSelectedIndex(emblaApi?.selectedScrollSnap() || 0)
  }, [emblaApi])

  // Auto-advance slides
  useEffect(() => {
    if (!emblaApi) return
    
    emblaApi.on('select', onSelect)
    
    // Start autoplay after 4 seconds on initial load
    const initialDelay = setTimeout(() => {
      autoplayInterval.current = setInterval(() => {
        emblaApi.scrollNext()
      }, 4000)
    }, 4000)
    
    return () => {
      emblaApi.off('select', onSelect)
      clearTimeout(initialDelay)
      if (autoplayInterval.current) {
        clearInterval(autoplayInterval.current)
      }
    }
  }, [emblaApi, onSelect])
  
  // Reset autoplay timer on manual navigation
  const resetAutoplay = useCallback(() => {
    if (autoplayInterval.current) {
      clearInterval(autoplayInterval.current)
    }
    autoplayInterval.current = setInterval(() => {
      emblaApi?.scrollNext()
    }, 4000)
  }, [emblaApi])

  return (
    <section className="bg-slate-800 text-white relative">
      <div className="relative overflow-hidden h-[60vh] min-h-[400px] md:h-[70vh] lg:h-[80vh]" ref={emblaRef}>
        <div className="flex h-full">
          {heroSlides.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative h-full">
              <div className={`absolute inset-0 ${slide.bgColor || ''}`}>
                {slide.image && (
                  <Image
                    src={slide.image}
                    alt={slide.alt || ''}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    priority
                    className="w-full h-full object-cover"
                  />
                )}
                <div className={`absolute inset-0 ${slide.bgColor ? 'bg-gradient-to-r from-black/30 to-black/20' : 'bg-gradient-to-r from-slate-900/60 to-slate-900/30'}`} />
              </div>
              <div className="container h-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className={`h-full flex flex-col ${slide.id === 1 ? 'justify-start pt-8 sm:pt-12 md:pt-16 lg:pt-20' : 'justify-center'} ${slide.id === 1 ? 'max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12' : 'max-w-2xl py-16 sm:py-20 lg:py-24'}`}>
                  <h1 className={`font-bold tracking-tight leading-tight text-white drop-shadow-lg ${slide.id === 1 ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'}`}>
                    {slide.title}
                  </h1>
                  <p className={`text-white/90 font-medium ${slide.id === 1 ? 'mt-1 sm:mt-2 md:mt-3 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl' : 'mt-3 sm:mt-4 text-base sm:text-lg md:text-xl max-w-xl'}`}>
                    {slide.description}
                  </p>
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center ${slide.id === 1 ? 'mt-2 sm:mt-3 md:mt-4 gap-1 sm:gap-2' : 'mt-6 sm:mt-8 gap-3'}`}>
                    <Button 
                      asChild 
                      className={`bg-orange-500 text-slate-900 hover:bg-gray-300 w-full sm:w-auto ${slide.id === 1 ? 'text-xs sm:text-sm md:text-base px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2' : 'text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4'}`}
                    >
                      <a href={slide.ctaLink}>{slide.ctaText}</a>
                    </Button>
                  
                  </div>
                </div>
                
                {/* Category Grid - Only show on first slide (blue slide) */}
                {slide.id === 1 && <CategoryGrid />}
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation buttons - Hidden on mobile, visible on md and up */}
        <button 
          className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 sm:p-3 rounded-full z-10 transition-all duration-200 hover:scale-110"
          onClick={scrollPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button 
          className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 sm:p-3 rounded-full z-10 transition-all duration-200 hover:scale-110"
          onClick={scrollNext}
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                index === selectedIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
