import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Shopify Analytics System',
  description: 'Multi-tenant Shopify data ingestion and analytics platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
