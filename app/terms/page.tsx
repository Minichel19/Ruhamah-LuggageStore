import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-6">Last updated: October 5, 2026</p>

        <div className="prose prose-lg max-w-none space-y-4 text-gray-700">
          <p>
            By using Ruhamah LuggageStore's services, you agree to these Terms of Service.
            Please read them carefully.
          </p>

          <h2 className="text-xl font-bold mt-6">1. Services</h2>
          <p>
            Ruhamah LuggageStore provides short-term luggage storage at our location:
            2801 1st Ave Ste A, Seattle, WA 98121. Storage is priced per bag per day as
            displayed at checkout.
          </p>

          <h2 className="text-xl font-bold mt-6">2. Booking and Payment</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All bookings require prepayment via our website</li>
            <li>Payment is processed securely through Stripe</li>
            <li>Prices are shown at checkout before you pay</li>
            <li>Bookings are confirmed by email with a QR code</li>
          </ul>

          <h2 className="text-xl font-bold mt-6">3. Bag Drop-off and Pick-up</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must present your QR code when dropping off and picking up bags</li>
            <li>Bags must be picked up by the pick-up date specified in your booking</li>
            <li>Photos of bags are taken at drop-off for security purposes</li>
          </ul>

          <h2 className="text-xl font-bold mt-6">4. Prohibited Items</h2>
          <p>You may NOT store:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Illegal items of any kind</li>
            <li>Firearms, weapons, or explosives</li>
            <li>Perishable food or live animals</li>
            <li>Hazardous materials</li>
            <li>Items valued over $2,000 per bag</li>
          </ul>

          <h2 className="text-xl font-bold mt-6">5. Liability</h2>
          <p>
            Ruhamah LuggageStore is not responsible for damage to or loss of items inside
            your bags. Our maximum liability for any bag is limited to $500 per bag. We
            strongly recommend not storing valuable items (jewelry, electronics, cash,
            passports) in your bags.
          </p>

          <h2 className="text-xl font-bold mt-6">6. Late Pick-up</h2>
          <p>
            If bags are not picked up by the scheduled pick-up date, an additional charge
            of $5 per bag per day will apply. Bags left over 30 days may be disposed of.
          </p>

          <h2 className="text-xl font-bold mt-6">7. Refund Policy</h2>
          <p>
            Refunds are available for cancellations made at least 24 hours before the
            drop-off date. Contact us at hello@updates.lugagestore.com to request a refund.
          </p>

          <h2 className="text-xl font-bold mt-6">8. Privacy</h2>
          <p>
            Your use of our services is also governed by our{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
          </p>

          <h2 className="text-xl font-bold mt-6">9. Contact</h2>
          <p>
            For questions about these Terms:<br/>
            Ruhamah LuggageStore<br/>
            2801 1st Ave Ste A, Seattle, WA 98121<br/>
            Email: hello@updates.lugagestore.com
          </p>
        </div>
      </div>
    </main>
  );
}