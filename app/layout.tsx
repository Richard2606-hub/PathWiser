import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'PathWiser · Career OS Navigation Platform',
  description:
    'An evidence-based Career OS that compares your trajectory shape with consented community evidence or clearly disclosed modelled paths—surfacing realistic ranges, not individual predictions.',
  authors: [{ name: 'PathWiser · Talentbank Tech Hackathon 2026' }],
  openGraph: {
    title: 'PathWiser',
    description: 'Career evidence for better decisions.',
    type: 'website',
    images: [
      {
        url: '/og-pathwiser.png',
        width: 1200,
        height: 630,
        alt: 'PathWiser connects career evidence for candidates, employers and universities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PathWiser',
    description: 'Career evidence for better decisions.',
    images: ['/og-pathwiser.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%234f46e5'/><text x='50' y='62' font-family='Arial,sans-serif' font-size='42' font-weight='800' text-anchor='middle' fill='white'>PW</text></svg>"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
