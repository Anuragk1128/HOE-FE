"use client"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import useEmblaCarousel from 'embla-carousel-react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const heroSlides = [
  {
    id: 1,
    image: "/hero-bg.png",
    alt: "New Arrivals",
    title: "New Season Collection",
    description: "Discover our latest arrivals for the season",
    ctaText: "Shop Now",
    ctaLink: "/new-arrivals"
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/deamrxfwp/image/upload/v1758023506/hero_hoe_earring_2_hb0ncn.jpg",
    alt: "Special Offers",
    title: "Special Offers",
    description: "Limited time offers on selected item",
    ctaText: "View Deals",
    ctaLink: "/sale"
  },
  {
    id: 3,
    image: "/backpack-on-white.png",
    alt: "Trending Now",
    title: "Trending Now",
    description: "Shop what's trending this season",
    ctaText: "Explore",
    ctaLink: "/trending"
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
    const startAutoplay = () => {
      autoplayInterval.current = setInterval(() => {
        emblaApi.scrollNext()
      }, 5000)
    }
    
    startAutoplay()
    
    return () => {
      emblaApi.off('select', onSelect)
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
    }, 5000)
  }, [emblaApi])

  return (
    <section className="bg-slate-800 text-white relative">
      <div className="relative overflow-hidden h-[60vh] min-h-[400px] md:h-[70vh] lg:h-[80vh]" ref={emblaRef}>
        <div className="flex h-full">
          {heroSlides.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative h-full">
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  priority
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-slate-900/30" />
              </div>
              <div className="container h-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-full flex flex-col justify-center max-w-2xl py-16 sm:py-20 lg:py-24">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    {slide.title}
                  </h1>
                  <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-slate-200 max-w-xl">
                    {slide.description}
                  </p>
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button 
                      asChild 
                      className="bg-gray-400 text-slate-900 hover:bg-gray-300 text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 w-full sm:w-auto"
                    >
                      <a href={slide.ctaLink}>{slide.ctaText}</a>
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="bg-white/90 text-slate-900 hover:bg-white text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 w-full sm:w-auto"
                    >
                      Learn more
                    </Button>
                  </div>
                </div>
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
