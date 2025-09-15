import { Card } from "./ui/card"
import Image from "next/image"
import Link from "next/link"
import { AnimateOnScroll } from "@/components/gsap/animate-on-scroll"

export default function Cards(){
    return(
        <section className="bg-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-8">
            <Card className="overflow-hidden">
                <AnimateOnScroll y={24}>
                  <h1 className="item-center font-bold justify-center text-center text-2xl hover:underline "> Our Collections</h1>
                </AnimateOnScroll>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-200">
                    
                    <AnimateOnScroll y={24}>
                    <Link href="/collections/necklaces" className="block group">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
                            <Image
                                src="https://res.cloudinary.com/deamrxfwp/image/upload/v1756814847/iramodel3_achoxj.png"
                                alt="Necklaces"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h2 className="px-1 py-2 text-black text-sm font-medium text-center truncate">Jewelleries</h2>
                    </Link>
                    </AnimateOnScroll>

                    <AnimateOnScroll y={24} delay={0.05}>
                    <Link href="/collections/gymwear" className="block group">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
                            <Image
                                src="https://res.cloudinary.com/deamrxfwp/image/upload/v1757049823/sale_pup46c.jpg"
                                alt="Gymwear"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h2 className="px-1 py-2 text-black text-sm font-medium text-center truncate">Sportswear</h2>
                    </Link>
                    </AnimateOnScroll>

                    <AnimateOnScroll y={24} delay={0.1}>
                    <Link href="/collections/under-999" className="block group">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
                            <Image
                                src="https://res.cloudinary.com/deamrxfwp/image/upload/v1757165705/hero-bg_yscglj.png"
                                alt="Under ₹999"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h2 className="px-1 py-2 text-black text-sm font-medium text-center truncate">Under ₹999</h2>
                    </Link>
                    </AnimateOnScroll>

                    <AnimateOnScroll y={24} delay={0.15}>
                    <Link href="/collections/earrings" className="block group">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
                            <Image 
                                src="https://res.cloudinary.com/deamrxfwp/image/upload/v1756880393/ira_3x2_bqqfcm.jpg"
                                alt="Earrings"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h2 className="px-1 py-2 text-black text-sm font-medium text-center truncate">Checkout our Earrings</h2>
                    </Link>
                    </AnimateOnScroll>
                </div>
            </Card>

            {/* Price range collections */}
            <div className="mt-4">
                <Card className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-200">
                        <AnimateOnScroll y={24}>
                        <Link href="/collections/under-2000" className="block group">
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
                                <Image
                                    src="https://res.cloudinary.com/deamrxfwp/image/upload/v1757165705/hero-bg_yscglj.png"
                                    alt="Under ₹2000"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h2 className="px-1 py-2 text-black text-sm font-medium text-center truncate">Under ₹2000</h2>
                        </Link>
                        </AnimateOnScroll>
                        <AnimateOnScroll y={24} delay={0.08}>
                        <Link href="/collections/under-3000" className="block group">
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
                                <Image
                                    src="https://res.cloudinary.com/deamrxfwp/image/upload/v1757048158/gym_women_hmzn6x.jpg"
                                    alt="Under ₹3000"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h2 className="px-1 py-2 text-black text-sm font-medium text-center truncate">Under ₹3000</h2>
                        </Link>
                        </AnimateOnScroll>
                    </div>
                </Card>

            </div>
        </div>
        </section>
    )
}