import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Map from './Map';
import ReviewsSection from '@/components/ReviewsSection';

export default async function Home() {
  const { data: settings } = await supabase.from('settings').select('*').single();

  return (
    <main className="min-h-screen">
      <div
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('/seattle.jpg')" }}
      >
        {/* Subtle gradient only at bottom — no black overlay on the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"></div>

        <header className="relative bg-blue-900/70 text-white py-6 px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-2 shadow-lg">
              <span className="text-3xl">🧳</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{settings?.business_name}</h1>
              <p className="text-sm md:text-base text-blue-200">Safe luggage storage in Seattle</p>
            </div>
          </div>
          {settings?.is_closed && (
            <div className="bg-red-600 text-white text-center py-3 mt-4 rounded">
              ⚠ {settings?.closed_message || 'Currently closed'}
            </div>
          )}
          {settings?.special_hours && (
            <div className="bg-yellow-400 text-black text-center py-2 mt-2 rounded">
              {settings?.special_hours}
            </div>
          )}
        </header>

        <section className="relative max-w-4xl mx-auto py-20 px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] leading-tight">
            Store Your Bags. Explore Seattle.
          </h2>
          <p className="text-base md:text-xl text-white mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-medium">
            Drop off your luggage at our secure location in Belltown. Flat rate:{' '}
            <strong>${settings?.price_per_bag}/bag/day</strong>.
          </p>

          <Link
            href="/book"
            className="bg-blue-900 text-white px-8 py-4 md:px-10 md:py-5 rounded-lg text-lg md:text-xl font-semibold hover:bg-blue-800 inline-block shadow-xl"
          >
            Book Storage Now
          </Link>
        </section>
      </div>

      <section className="max-w-4xl mx-auto py-16 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl mb-2">Location</h3>
            <p className="text-gray-600">{settings?.address}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl mb-2">Hours</h3>
            <p className="text-gray-600">
              {settings?.opening_time} to {settings?.closing_time}
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl mb-2">Pricing</h3>
            <p className="text-gray-600">${settings?.price_per_bag} per bag / day</p>
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">About Ruhamah LuggageStore</h2>
          <p className="text-lg text-gray-700 mb-4">
            Ruhamah LuggageStore offers safe, affordable luggage storage in the heart of
            Seattle's Belltown neighborhood. Whether you're arriving early, departing late,
            or just want to explore the city hands-free, we've got you covered.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Our secure location is minutes from Pike Place Market, the Space Needle, and
            the Seattle Waterfront. Drop off your bags, enjoy the city, and pick them up
            whenever you're ready.
          </p>
          <ul className="text-lg text-gray-700 space-y-2 mt-6">
            <li>Secure, monitored storage area</li>
            <li>Flat rate of ${settings?.price_per_bag} per bag per day</li>
            <li>Open daily from {settings?.opening_time} to {settings?.closing_time}</li>
            <li>Instant online booking with QR code confirmation</li>
            <li>Walking distance to major Seattle attractions</li>
          </ul>
        </div>
      </section>

      <section className="bg-yellow-50 py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
          <ReviewsSection />
        </div>
      </section>

      <section className="max-w-4xl mx-auto py-16 px-4 md:px-8">
        <h2 className="text-3xl font-bold mb-6">Find Us on the Map</h2>
        <Map />
      </section>

      <footer className="bg-gray-900 text-white py-8 px-4 md:px-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h3 className="font-bold mb-3">{settings?.business_name || 'Ruhamah LuggageStore'}</h3>
              <p className="text-sm text-gray-400">
                {settings?.address || '2801 1st Ave Ste A, Seattle, WA 98121'}
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3">Services</h3>
              <ul className="space-y-1 text-sm text-gray-400">
                <li><Link href="/book" className="hover:text-white">Book Storage</Link></li>
                <li><Link href="/support" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Legal</h3>
              <ul className="space-y-1 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Contact</h3>
              <ul className="space-y-1 text-sm text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li>
                  <a href={`mailto:${settings?.contact_email || 'hello@updates.lugagestore.com'}`} className="hover:text-white break-all">
                    {settings?.contact_email || 'hello@updates.lugagestore.com'}
                  </a>
                </li>
                {settings?.contact_phone && (
                  <li>
                    <a href={`tel:${settings.contact_phone.replace(/[^0-9]/g, '')}`} className="hover:text-white">
                      {settings.contact_phone}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
            © 2026 {settings?.business_name || 'Ruhamah LuggageStore'}. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}