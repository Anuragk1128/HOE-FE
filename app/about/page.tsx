import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Story</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          From a vision to a thriving marketplace, our journey is about bringing quality products to your doorstep.
        </p>
      </section>

      {/* Founders Journey */}
      <section className="mb-16">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="p-8 md:w-1/2">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Humble Beginnings</h2>
              <p className="text-slate-600 mb-4">
                Founded in July 2025 by Shubham Gupta, House of Evolve (HOE) started with a simple yet powerful vision: 
                to create a curated marketplace that brings together the finest products from trusted brands under one roof.
              </p>
              <p className="text-slate-600 mb-6">
                What began as a passion project has quickly evolved into a trusted destination for quality-conscious shoppers 
                looking for unique and reliable products.
              </p>
              <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
                <p className="text-amber-800 italic">
                  "We believe in quality, authenticity, and creating meaningful connections between brands and customers."
                </p>
                <p className="text-amber-700 font-medium mt-2">- Shubham Gupta, Founder</p>
              </div>
            </div>
            <div className="md:w-1/2 bg-slate-100 flex items-center justify-center p-8">
           
            </div>
          </div>
        </div>
      </section>

      {/* Our Brands */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Our Brands</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Jerseymise</h3>
            <p className="text-slate-600 mb-4">
              Premium sportswear that combines comfort, style, and performance for athletes and casual wearers alike.
            </p>
            <Link href="/brands/sportswear" className="text-amber-600 hover:underline font-medium">
              Explore Jerseymise →
            </Link>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Ira</h3>
            <p className="text-slate-600 mb-4">
              Elegant and timeless jewelry pieces that add a touch of sophistication to every occasion.
            </p>
            <Link href="/brands/ira" className="text-amber-600 hover:underline font-medium">
              Explore Ira →
            </Link>
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="bg-slate-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Growing Together</h2>
        <p className="text-slate-600 max-w-3xl mx-auto mb-6">
          We're just getting started! As we continue to grow, we're excited to welcome more vendors who share our 
          commitment to quality and customer satisfaction. Our goal is to become the go-to marketplace for 
          discovering exceptional brands and products.
        </p>
        <Link 
          href="/contact-us" 
          className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
        >
          Join Our Journey
        </Link>
      </section>
    </div>
  );
}