import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Map from './Map';

export default async function Home() {
  const { data: settings } = await supabase.from('settings').select('*').single();

  return (
    <main className="min-h-screen">
      <div
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('/seattle.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <header className="relative bg-blue-900/80 text-white py-6 px-8">
          <h1 className="text-3xl font-bold">{settings?.business_name}</h1>
          <p className="text-blue-200">Safe luggage storage in Seattle</p>
        </header>

        <section className="relative max-w-4xl mx-auto py-24 px-8 text-center">
          <h2 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
            Store Your Bags. Explore Seattle.
          </h2>
          <p className="text-xl text-white mb-8 drop-shadow">
            Drop off your luggage at our secure location in Belltown. Flat rate:{' '}
            <strong>${settings?.price_per_bag}/bag/day</strong>.
          </p>

          <Link
            href="/book"
            className="bg-blue-900 text-white px-10 py-5 rounded-lg text-xl font-semibold hover:bg-blue-800 inline-block shadow-xl"
          >
            Book Storage Now
          </Link>
        </section>
      </div>

      <section className="max-w-4xl mx-auto py-16 px-8">
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

      <section className="bg-blue-50 py-16 px-8">
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

      <section className="max-w-4xl mx-auto py-16 px-8">
        <h2 className="text-3xl font-bold mb-6">Find Us on the Map</h2>
        <Map />
      </section>
    </main>
  );
}