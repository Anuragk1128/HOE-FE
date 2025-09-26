import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: September 13, 2025</p>

        <section className="mb-12">
          <p className="mb-4">
            At HOE (House of Evolve), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect.</h2>
          <p className="mb-4">We collect several types of information from and about users of our website, including:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Personal Information:</strong> Name, email address, phone number, shipping/billing address, and payment information.</li>
            <li><strong>Account Information:</strong> Username, password, and other registration details.</li>
            <li><strong>Order Information:</strong> Details about products you purchase and your purchase history.</li>
            <li><strong>Device and Usage Information:</strong> IP address, browser type, operating system, and browsing behavior.</li>
            <li><strong>Cookies and Tracking Technologies:</strong> We use cookies to enhance your experience on our site.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We may use the information we collect for various purposes, including:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your account or transactions</li>
            <li>Provide customer support</li>
            <li>Improve our products and services</li>
            <li>Send promotional materials and special offers</li>
            <li>Prevent fraudulent activities and enhance security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">3. How We Share Your Information</h2>
          <p className="mb-4">We may share your information with:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Service providers who assist in our business operations</li>
            <li>Payment processors to complete transactions</li>
            <li>Shipping carriers to deliver your orders</li>
            <li>Legal authorities when required by law</li>
            <li>Business partners for joint marketing efforts</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">4. Your Rights and Choices</h2>
          <p className="mb-4">You have certain rights regarding your personal information, including the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access and receive a copy of your personal data</li>
            <li>Rectify any inaccurate or incomplete information</li>
            <li>Request deletion of your personal data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p>To exercise these rights, please contact us at <Link href="mailto:admin@houseofevolve.in" className="text-primary hover:underline"> admin@houseofevolve.in</Link>.</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission or electronic storage is completely secure, so we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">6. Children's Privacy</h2>
          <p className="mb-4">
            Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy. We encourage you to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="mb-2">If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="mb-1">Email: <Link href="mailto:admin@houseofevolve.in" className="text-primary hover:underline">admin@houseofevolve.in</Link></p>
          <p>Address: Sector 62 Noida, Uttar Pradesh, India 201301</p>
        </section>
      </div>
    </main>
  )
}