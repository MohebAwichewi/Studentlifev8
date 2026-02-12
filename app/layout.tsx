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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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