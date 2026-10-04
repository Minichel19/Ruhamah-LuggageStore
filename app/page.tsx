import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Map from './Map';

export default async function Home() {
  const { data: settings } = await supabase.from('settings').select('*').single();

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-blue-900 text-white py-6 px-8">
        <h1 className="text-3xl font-bold">{settings?.business_name}</h1>
        <p className="text-blue-200">Safe luggage storage in Seattle</p>
      </header>

      <section className="max-w-4xl mx-auto py-16 px-8">
        <h2 className="text-4xl font-bold mb-6">Store Your Bags. Explore Seattle.</h2>
        <p className="text-lg text-gray-700 mb-8">
          Drop off your luggage at our secure location in Belltown. Flat rate:{' '}
          <strong>${settings?.price_per_bag}/bag/day</strong>.
        </p>

        <Link href="/book" className="bg-blue-900 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-800 inline-block">
          Book Storage Now
        </Link>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-2">Location</h3>
            <p className="text-gray-600">{settings?.address}</p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">Hours</h3>
            <p className="text-gray-600">{settings?.opening_time} to {settings?.closing_time}</p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">Pricing</h3>
            <p className="text-gray-600">${settings?.price_per_bag} per bag / day</p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Find Us on the Map</h2>
          <Map />
        </div>
      </section>
    </main>
  );
}