import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RobiQuest 2026 — Live Auction Arena | RoboCell',
  description: 'Conducted by RoboCell • Tech, Transform, Thrive • Official Dynamic Live Auction Arena',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#000000] text-white antialiased min-h-screen font-['Poppins',sans-serif] selection:bg-[#16A085]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
