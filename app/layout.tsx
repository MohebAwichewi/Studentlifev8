import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Configure fonts exactly as requested
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space",
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "WIN",
  description: "Spend less, Live more.",
=======
  metadataBase: new URL('https://student.life'),
  title: {
    default: "Student.LIFE | Exclusive Student Discounts & Offers",
    template: "%s | Student.LIFE"
  },
  description: "The ultimate student companion app. Access exclusive discounts, discover local hot-spots, and live your best student life in the UK. Spend less, Live more.",
  keywords: ["Student Discounts", "UK Students", "University Offers", "Student Life", "Deals", "Vouchers", "Student.Life"],
  authors: [{ name: "Student.LIFE Team" }],
  creator: "Student.LIFE",
  publisher: "Student.LIFE",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://student.life',
    title: "Student.LIFE | Exclusive Student Discounts",
    description: "Unlock exclusive student offers, experiences, and more. Spend less, Live more.",
    siteName: 'Student.LIFE',
    images: [
      {
        url: '/hero-bg.jpg', // Using existing asset as fallback OG image
        width: 1200,
        height: 630,
        alt: 'Student.LIFE App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Student.LIFE | Exclusive Student Discounts",
    description: "Spend less, Live more with specific student discounts.",
    images: ['/hero-bg.jpg'],
    creator: '@studentlife_uk', // Placeholder handle
  },
  verification: {
    google: "r-NDbk6OSlOs02Bb7UHmWQxPKa1RRVt5B8JgcEtuJds",
  },
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#FF3B30" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WIN" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96x96.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128x128.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />

        {/* FontAwesome CDN */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={`${inter.className} ${spaceGrotesk.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Student.LIFE",
              "url": "https://student.life",
              "logo": "https://student.life/icon.png",
              "description": "Unlock exclusive student offers, experiences, and more.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "London",
                "addressCountry": "UK"
              },
              "sameAs": [
                "https://tiktok.com/@studentlife",
                "https://instagram.com/studentlife"
              ]
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}