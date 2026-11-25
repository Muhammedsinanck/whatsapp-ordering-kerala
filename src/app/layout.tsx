import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kerala WhatsApp Store Builder | Mini Shopify for WhatsApp Commerce',
  description: 'Launch your custom WhatsApp ordering store in Kerala in 2 minutes. Simple Google login, custom templates, UPI QR checkout, and direct WhatsApp ordering.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
