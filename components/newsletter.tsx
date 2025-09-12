'use client';
import { Mail, Gift, Bell, Shield } from 'lucide-react';
import { useState, FormEvent } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="w-full bg-black text-white py-12 sm:py-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white mb-8 sm:mb-12">
          <Mail className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Stay Updated</h2>
          <p className="text-base sm:text-xl opacity-90">Get the latest deals and product updates delivered to your inbox</p>
        </div>

        <div className="w-full max-w-3xl mx-auto mb-10 sm:mb-12">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-0">
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full min-w-0 px-4 sm:px-6 py-3 sm:py-4 rounded-full sm:rounded-l-full sm:rounded-r-none text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-amber-500 text-white px-5 sm:px-6 py-3 sm:py-4 rounded-full sm:rounded-r-full sm:rounded-l-none hover:bg-amber-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-black"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-white text-center">
          <div className="flex flex-col items-center px-2">
            <Gift className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-80" />
            <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Exclusive Deals</h3>
            <p className="opacity-80 text-sm sm:text-base">Get access to subscriber-only discounts and early sales</p>
          </div>
          <div className="flex flex-col items-center px-2">
            <Bell className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-80" />
            <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">New Arrivals</h3>
            <p className="opacity-80 text-sm sm:text-base">Be the first to know about new products and collections</p>
          </div>
          <div className="flex flex-col items-center px-2 lg:col-span-1">
            <Shield className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-80" />
            <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Privacy Protected</h3>
            <p className="opacity-80 text-sm sm:text-base">Your email is safe with us. No spam, unsubscribe anytime</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
