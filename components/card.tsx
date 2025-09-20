import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import Image from "next/image"
import Link from "next/link"
import { AnimateOnScroll } from "@/components/gsap/animate-on-scroll"
import { Badge } from "./ui/badge"

export default function Cards() {
    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sky-700 to-white">
            <div className="mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <AnimateOnScroll y={24}>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Our Collections
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover our curated selection of premium jewelry and sportswear
                        </p>
                    </AnimateOnScroll>
                </div>

                {/* Main Collections Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <AnimateOnScroll y={24}>
                        <Link href="/collections/necklaces" className="group">
                            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Image
                                        src="https://res.cloudinary.com/deamrxfwp/image/upload/v1756814847/iramodel3_achoxj.png"
                                        alt="Necklaces Collection"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                </div>
                                <CardContent className="p-4">
                                    <CardTitle className="text-lg font-semibold text-center text-gray-900">
                                        Jewelleries
                                    </CardTitle>
                                    <CardDescription className="text-center mt-2 text-gray-600">
                                        Elegant pieces for every occasion
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    </AnimateOnScroll>

                    <AnimateOnScroll y={24} delay={0.1}>
                        <Link href="/collections/gymwear" className="group">
                            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Image
                                        src="https://res.cloudinary.com/deamrxfwp/image/upload/v1757049823/sale_pup46c.jpg"
                                        alt="Gymwear Collection"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                </div>
                                <CardContent className="p-4">
                                    <CardTitle className="text-lg font-semibold text-center text-gray-900">
                                        Sportswear
                                    </CardTitle>
                                    <CardDescription className="text-center mt-2 text-gray-600">
                                        Performance wear for active lifestyle
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    </AnimateOnScroll>

                    <AnimateOnScroll y={24} delay={0.2}>
                        <Link href="/collections/under-999" className="group">
                            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Badge className="absolute top-3 left-3 z-10 bg-green-500 hover:bg-green-600">
                                        Best Value
                                    </Badge>
                                    <Image
                                        src="https://res.cloudinary.com/deamrxfwp/image/upload/v1757165705/hero-bg_yscglj.png"
                                        alt="Under ₹999 Collection"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                </div>
                                <CardContent className="p-4">
                                    <CardTitle className="text-lg font-semibold text-center text-gray-900">
                                        Under ₹999
                                    </CardTitle>
                                    <CardDescription className="text-center mt-2 text-gray-600">
                                        Affordable luxury for everyone
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    </AnimateOnScroll>

                    <AnimateOnScroll y={24} delay={0.3}>
                        <Link href="/collections/earrings" className="group">
                            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Image 
                                        src="https://res.cloudinary.com/deamrxfwp/image/upload/v1756880393/ira_3x2_bqqfcm.jpg"
                                        alt="Earrings Collection"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                </div>
                                <CardContent className="p-4">
                                    <CardTitle className="text-lg font-semibold text-center text-gray-900">
                                        Premium Earrings
                                    </CardTitle>
                                    <CardDescription className="text-center mt-2 text-gray-600">
                                        Handcrafted designs that shine
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    </AnimateOnScroll>
                </div>

                {/* Price Range Collections */}
                <div className="mb-8">
                    <AnimateOnScroll y={24}>
                        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
                            Shop by Budget
                        </h2>
                    </AnimateOnScroll>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <AnimateOnScroll y={24}>
                            <Link href="/collections/under-2000" className="group">
                                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                                    <div className="relative aspect-[3/2] overflow-hidden">
                                        <Badge className="absolute top-4 left-4 z-10 bg-blue-500 hover:bg-blue-600">
                                            Popular
                                        </Badge>
                                        <Image
                                            src="https://res.cloudinary.com/deamrxfwp/image/upload/v1757165705/hero-bg_yscglj.png"
                                            alt="Under ₹2000 Collection"
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <CardTitle className="text-xl font-bold text-white mb-2">
                                                Under ₹2,000
                                            </CardTitle>
                                            <CardDescription className="text-gray-200">
                                                Quality pieces without breaking the bank
                                            </CardDescription>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </AnimateOnScroll>

                        <AnimateOnScroll y={24} delay={0.1}>
                            <Link href="/collections/under-3000" className="group">
                                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                                    <div className="relative aspect-[3/2] overflow-hidden">
                                        <Badge className="absolute top-4 left-4 z-10 bg-purple-500 hover:bg-purple-600">
                                            Premium
                                        </Badge>
                                        <Image
                                            src="https://res.cloudinary.com/deamrxfwp/image/upload/v1757048158/gym_women_hmzn6x.jpg"
                                            alt="Under ₹3000 Collection"
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <CardTitle className="text-xl font-bold text-white mb-2">
                                                Under ₹3,000
                                            </CardTitle>
                                            <CardDescription className="text-gray-200">
                                                Premium collection for discerning taste
                                            </CardDescription>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </AnimateOnScroll>
                    </div>
                </div>
            </div>
        </section>
    )
}
