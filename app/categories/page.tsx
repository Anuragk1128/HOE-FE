import Link from "next/link"
import Image from "next/image"
import { CATEGORIES, type Category } from "@/data/products"

const categoryMeta: Record<Category, { image: string; description: string }> = {
  Shoes: {
    image: "/running-shoe-on-white.png",
    description: "Performance footwear for running, training, and trails.",
  },
  Apparel: {
    image: "/athletic-t-shirt-folded.png",
    description: "Comfortable, technical clothing for sport and lifestyle.",
  },
  Accessories: {
    image: "/backpack-on-white.png",
    description: "Bags and essentials to complement your daily carry.",
  },
  Electronics: {
    image: "/smartwatch-on-white.png",
    description: "Wearables and gadgets to track, train, and stay connected.",
  },
  Home: {
    image: "/throw-blanket-rolled.png",
    description: "Cozy picks to upgrade your home and downtime.",
  },
}

export default function Category() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold">Categories</h1>
          <div className="text-sm text-slate-600">{CATEGORIES.length} total</div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((c) => (
            <article key={c} id={`cat-${c.toLowerCase()}`} className="group rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md">
              <Link href={`/#cat-${c.toLowerCase()}`} className="block">
                <div className="overflow-hidden rounded-md">
                  <Image
                    src={categoryMeta[c].image}
                    alt={`${c} category image`}
                    width={800}
                    height={600}
                    className="h-48 w-full object-contain bg-slate-50 transition group-hover:scale-[1.02]"
                  />
                </div>
                <h2 className="mt-3 text-lg font-medium text-slate-900">{c}</h2>
                <p className="mt-1 text-sm text-slate-600">{categoryMeta[c].description}</p>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}