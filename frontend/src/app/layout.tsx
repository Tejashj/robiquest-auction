import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RobiQuest 2026 — Live Auction Arena | RoboCell',
  description: 'Conducted by RoboCell • Tech, Transform, Thrive • Official 4-Team Live Auction Arena for RobiQuest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#03060f] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
