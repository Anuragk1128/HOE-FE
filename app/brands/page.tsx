import Image from "next/image"
import Link from "next/link"
import { BRANDS, PRODUCTS, type Brand } from "@/data/products"

function brandImage(brand: Brand): string {
  const product = PRODUCTS.find((p) => p.brand === brand)
  return product?.image ?? "/logo.png"
}

function brandDescription(brand: Brand): string {
  const count = PRODUCTS.filter((p) => p.brand === brand).length
  if (count > 0) return `${brand} — ${count} product${count > 1 ? "s" : ""} available.`
  return `${brand} products coming soon.`
}

export default function Brands() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold">Brands</h1>
          <div className="text-sm text-slate-600">{BRANDS.length} total</div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BRANDS.map((b) => (
            <article key={b} id={`brand-${b.toLowerCase()}`} className="group rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md">
              <Link href={`/#brand-${b.toLowerCase()}`} className="block">
                <div className="overflow-hidden rounded-md">
                  <Image
                    src={brandImage(b)}
                    alt={`${b} brand image`}
                    width={800}
                    height={600}
                    className="h-48 w-full object-contain bg-slate-50 transition group-hover:scale-[1.02]"
                  />
                </div>
                <h2 className="mt-3 text-lg font-medium text-slate-900">{b}</h2>
                <p className="mt-1 text-sm text-slate-600">{brandDescription(b)}</p>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}