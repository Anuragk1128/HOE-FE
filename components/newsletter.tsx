'use client';
import { Mail, Gift, Bell, Shield } from 'lucide-react';
import { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="py-16 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white mb-12">
          <Mail className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl opacity-90">Get the latest deals and product updates delivered to your inbox</p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-l-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-8 py-4 rounded-r-full transition-colors duration-200"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white text-center">
          <div className="flex flex-col items-center">
            <Gift className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="font-semibold text-lg mb-2">Exclusive Deals</h3>
            <p className="opacity-80">Get access to subscriber-only discounts and early sales</p>
          </div>
          <div className="flex flex-col items-center">
            <Bell className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="font-semibold text-lg mb-2">New Arrivals</h3>
            <p className="opacity-80">Be the first to know about new products and collections</p>
          </div>
          <div className="flex flex-col items-center">
            <Shield className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="font-semibold text-lg mb-2">Privacy Protected</h3>
            <p className="opacity-80">Your email is safe with us. No spam, unsubscribe anytime</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
