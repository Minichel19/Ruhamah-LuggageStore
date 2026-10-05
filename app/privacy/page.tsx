import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-6">Last updated: October 5, 2026</p>

        <div className="prose prose-lg max-w-none space-y-4 text-gray-700">
          <p>
            Ruhamah LuggageStore ("we," "our," or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your information when
            you use our website or services.
          </p>

          <h2 className="text-xl font-bold mt-6">Information We Collect</h2>
          <p>When you make a booking, we collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your name</li>
            <li>Email address</li>
            <li>Phone number (optional)</li>
            <li>Booking details (dates, number of bags)</li>
            <li>Payment information (processed securely by Stripe)</li>
            <li>Photos of bags taken at drop-off (for security purposes)</li>
          </ul>

          <h2 className="text-xl font-bold mt-6">How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Process your booking and payment</li>
            <li>Send booking confirmations and pick-up reminders</li>
            <li>Provide customer support</li>
            <li>Improve our services</li>
          </ul>

          <h2 className="text-xl font-bold mt-6">Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We share
            information only with:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Stripe</strong> — for payment processing</li>
            <li><strong>Supabase</strong> — for secure data storage</li>
            <li><strong>Resend</strong> — for transactional emails</li>
          </ul>

          <h2 className="text-xl font-bold mt-6">Data Security</h2>
          <p>
            We use industry-standard security measures including encryption (HTTPS), secure
            authentication, and access controls. However, no method of transmission over the
            internet is 100% secure.
          </p>

          <h2 className="text-xl font-bold mt-6">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Request a copy of your personal data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2 className="text-xl font-bold mt-6">Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use
            tracking cookies.
          </p>

          <h2 className="text-xl font-bold mt-6">Contact Us</h2>
          <p>
            For privacy-related questions, contact us at:<br/>
            Ruhamah LuggageStore<br/>
            2801 1st Ave Ste A, Seattle, WA 98121<br/>
            Email: hello@updates.lugagestore.com
          </p>
        </div>
      </div>
    </main>
  );
}