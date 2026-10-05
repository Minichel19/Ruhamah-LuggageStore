import Link from 'next/link';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-8">
          Have a question? We're here to help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">📍 Address</h2>
            <p className="text-gray-700">
              Ruhamah LuggageStore<br/>
              2801 1st Ave Ste A<br/>
              Seattle, WA 98121
            </p>

            <h2 className="text-xl font-bold mb-4 mt-8">📞 Phone</h2>
            <p className="text-gray-700">
              <a href="tel:+12065551234" className="text-blue-600 hover:underline">
                (206) 555-1234
              </a>
            </p>

            <h2 className="text-xl font-bold mb-4 mt-8">✉️ Email</h2>
            <p className="text-gray-700">
              <a href="mailto:hello@updates.lugagestore.com" className="text-blue-600 hover:underline">
                hello@updates.lugagestore.com
              </a>
            </p>

            <h2 className="text-xl font-bold mb-4 mt-8">🕐 Hours</h2>
            <p className="text-gray-700">
              Monday – Sunday<br/>
              8:00 AM – 8:00 PM
            </p>

            <h2 className="text-xl font-bold mb-4 mt-8">💬 WhatsApp</h2>
            <p className="text-gray-700">
              Click the green WhatsApp button at the bottom-right of any page.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">🗺️ Find Us</h2>
            <div className="rounded-lg overflow-hidden shadow">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2689.3!2d-122.3455!3d47.6154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDM2JzU1LjQiTiAxMjLCsDIwJzQ0LjAiVw!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <h2 className="text-xl font-bold mb-4">Need immediate help?</h2>
          <p className="text-gray-700 mb-4">
            Chat with us on WhatsApp — we typically respond within minutes during business hours.
          </p>
          <a
            href="https://wa.me/12065551234?text=Hi! I have a question about luggage storage."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold inline-block"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}