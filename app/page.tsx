import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Map from './Map';
import ReviewsSection from '@/components/ReviewsSection';
import QuickBook from '@/components/QuickBook';

export default async function Home() {
  const { data: settings } = await supabase.from('settings').select('*').single();

  return (
    <main className="min-h-screen">
      <div
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('/seattle.jpg')" }}
      >
        {/* Subtle gradient only at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"></div>

        <header className="relative bg-blue-900/70 text-white py-6 px-4 md:px-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-2 shadow-lg">
                <span className="text-3xl">🧳</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{settings?.business_name}</h1>
                <p className="text-sm md:text-base text-blue-200">Safe luggage storage in Seattle</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {settings?.contact_phone && (
                <a
                  href={`tel:${settings.contact_phone.replace(/[^0-9]/g, '')}`}
                  className="bg-white text-blue-900 px-4 py-2 rounded font-semibold hover:bg-blue-50 text-sm"
                >
                  📞 Call Us
                </a>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings?.address || '2801 1st Ave Ste A, Seattle, WA 98121')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-500 text-white px-4 py-2 rounded font-semibold hover:bg-yellow-600 text-sm"
              >
                📍 Directions
              </a>
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

      {/* Quick Book Date Picker */}
      <QuickBook pricePerBag={Number(settings?.price_per_bag) || 5} />

      {/* Google Reviews Badge */}
      <section className="bg-white py-6 px-4 md:px-8 border-b">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 text-center">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.business_name || 'Ruhamah LuggageStore Seattle')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-gray-900">5.0</span>
                <span className="text-yellow-500 text-lg">★★★★★</span>
              </div>
              <div className="text-sm text-gray-500">Review us on Google</div>
            </div>
          </a>

          <div className="hidden md:block h-12 w-px bg-gray-300"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">${settings?.price_per_bag}/day</div>
            <div className="text-sm text-gray-500">Flat rate per bag</div>
          </div>

          <div className="hidden md:block h-12 w-px bg-gray-300"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">🔒 Secure</div>
            <div className="text-sm text-gray-500">Monitored storage</div>
          </div>
        </div>
      </section>

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

      {/* Store Photo — only shows if uploaded from admin */}
      {settings?.store_photo_url && (
        <section className="max-w-4xl mx-auto py-16 px-4 md:px-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Store</h2>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img
              src={settings.store_photo_url}
              alt="Ruhamah LuggageStore"
              className="w-full h-auto"
            />
          </div>
          <p className="text-center text-gray-600 mt-4">
            Visit us at {settings?.address || '2801 1st Ave Ste A, Seattle, WA 98121'}
          </p>
        </section>
      )}

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