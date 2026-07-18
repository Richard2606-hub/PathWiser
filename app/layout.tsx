import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PathWiser · Career OS Navigation Platform',
  description:
    'An evidence-based Career OS that uses the Career Twin Engine to match your trajectory shape against real anonymised paths — surfacing realistic ranges of outcomes, not false predictions. Built for candidates, employers, and universities across Asia.',
  authors: [{ name: 'PathWiser · Talentbank Tech Hackathon 2026' }],
  openGraph: {
    title: 'PathWiser',
    description: 'Navigate your career, wiser.',
    type: 'website',
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
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='18' fill='%230d1117'/><text x='50' y='62' font-family='monospace' font-size='48' font-weight='800' text-anchor='middle' fill='%23facc15'>[T]</text></svg>"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
