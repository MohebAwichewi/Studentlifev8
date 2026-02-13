export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', fontFamily: '"Inter", sans-serif', lineHeight: '1.6', color: '#334155' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', color: '#0f172a' }}>Privacy Policy</h1>
      <p style={{ color: '#64748b', marginBottom: '40px' }}>Last Updated: December 28, 2025</p>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px', color: '#1e293b' }}>1. Introduction (SEC-01)</h2>
        <p>
          WIN ("we", "our") is committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your data in compliance with GDPR and local regulations.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px', color: '#1e293b' }}>2. Location Data (SEC-02)</h2>
        <p>
          We collect location data solely to show you relevant student offers nearby.
          <strong> We do not store your historical location history.</strong> Only your last known location is processed temporarily to fetch relevant results, after which it is discarded.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px', color: '#1e293b' }}>3. Your Rights (SEC-03)</h2>
        <p>Under GDPR, you have the right to:</p>
        <ul style={{ listStyle: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li><strong>Request deletion</strong> of your account and all associated data ("Right to be Forgotten").</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px', color: '#1e293b' }}>4. Contact Us</h2>
        <p>
          To exercise your rights or for any privacy-related inquiries, please contact our Data Protection Officer at:
          <br />
          <a href="mailto:privacy@studentlife.tn" style={{ color: '#6246ea', fontWeight: '600', textDecoration: 'none' }}>privacy@studentlife.tn</a>
        </p>
      </section>

      <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#94a3b8' }}>
        &copy; 2025 WIN. All rights reserved.
      </div>
    </div>
  )
}