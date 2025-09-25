"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const products1 = [
  {
    id: 5,
    title: "Designer Necklace",
    image: "https://res.cloudinary.com/deamrxfwp/image/upload/v1758023506/hero_hoe_earring_2_hb0ncn.jpg",
    link: "/products/necklace-1"
  },
  {
    id: 6,
    title: "Elegant Earrings", 
    image: "https://res.cloudinary.com/dvbx2tqcg/image/upload/v1758006064/design_2.1_post_2_axbl7o.jpg",
    link: "/products/earrings-1"
  },
  {
    id: 7,
    title: "Sportswear Set",
    image: "https://res.cloudinary.com/deamrxfwp/image/upload/v1758195205/colored_xepyyp.webp", 
    link: "/products/sportswear-1"
  },
  {
    id: 8,
    title: "Golden Bangles",
    image: "https://res.cloudinary.com/dvbx2tqcg/image/upload/v1758090951/design_7.4_ropsps.jpg",
    link: "/products/bangles-1"
  }
]

const categories = [
  {
    id: 1,
    title: "Necklaces",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=150&fit=crop",
    link: "/collections/necklaces",
    discount: "Up to 50% off"
  },
  {
    id: 2,
    title: "Earrings", 
    image: "https://res.cloudinary.com/dvbx2tqcg/image/upload/v1758006064/design_2.1_post_2_axbl7o.jpg",
    link: "/collections/earrings",
    discount: "Up to 40% off"
  },
  {
    id: 3,
    title: "Sportswear",
    image: "https://res.cloudinary.com/deamrxfwp/image/upload/v1758195205/colored_xepyyp.webp", 
    link: "/collections/sportswear",
    discount: "Up to 60% off"
  },
  {
    id: 4,
    title: "Bangles",
    image: "https://res.cloudinary.com/dvbx2tqcg/image/upload/v1758090951/design_7.4_ropsps.jpg",
    link: "/collections/bangles", 
    discount: "Up to 45% off"
  }
]

export function CategoryGrid() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const cards2Ref = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    // Initial animation - cards slide in from bottom
    gsap.fromTo([...cardsRef.current, ...cards2Ref.current], 
      {
        y: 50,
        opacity: 0,
        scale: 0.8
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)"
      }
    )

    // Hover animations for first set
    cardsRef.current.forEach((card, index) => {
      if (!card) return
      
      const handleMouseEnter = () => {
        gsap.to(card, {
          scale: 1.05,
          y: -5,
          duration: 0.3,
          ease: "power2.out"
        })
      }

      const handleMouseLeave = () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        })
      }

      card.addEventListener('mouseenter', handleMouseEnter)
      card.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter)
        card.removeEventListener('mouseleave', handleMouseLeave)
      }
    })

    // Hover animations for second set
    cards2Ref.current.forEach((card, index) => {
      if (!card) return
      
      const handleMouseEnter = () => {
        gsap.to(card, {
          scale: 1.05,
          y: -5,
          duration: 0.3,
          ease: "power2.out"
        })
      }

      const handleMouseLeave = () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        })
      }

      card.addEventListener('mouseenter', handleMouseEnter)
      card.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter)
        card.removeEventListener('mouseleave', handleMouseLeave)
      }
    })
  }, [])

  return (
    <div className="absolute bottom-8 right-4 sm:bottom-12 sm:right-6 md:bottom-16 md:right-8 lg:bottom-20 lg:right-24 z-20" ref={containerRef}>
      {/* Single Large Card */}
      <div className="w-44 sm:w-52 md:w-60 lg:w-72 xl:w-[680px]">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 shadow-lg">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl font-bold text-center mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 text-gray-900">
            Shop by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-5">
            {categories.map((category, index) => (
              <Link 
                key={category.id} 
                href={category.link}
                className="group"
              >
                <div 
                  ref={(el) => {
                    if (el) cardsRef.current[index] = el
                  }}
                  className="relative bg-gradient-to-b from-orange-400 to-orange-600 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Golden borders */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300"></div>
                  
                  {/* Image */}
                  <div className="relative h-16 sm:h-20 md:h-24 lg:h-28 xl:h-48 p-1 sm:p-1.5 md:p-2 lg:p-2.5 xl:p-3">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover rounded-md"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
                    />
                  </div>
                  
                  {/* Title */}
                  <div className="p-1 sm:p-1.5 md:p-2 lg:p-2.5 xl:p-3 text-center">
                    <h4 className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base font-semibold text-white">
                      {category.title}
                    </h4>
                    <p className="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm text-yellow-200 mt-0.5 sm:mt-1 md:mt-1 lg:mt-1.5 xl:mt-1.5">
                      {category.discount}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
