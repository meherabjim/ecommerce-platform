import type { Metadata } from 'next';
import './globals.css';
import { StoreConfigProvider } from '@/components/store-config-provider';
import ContactFloatingActions from '@/components/contact-floating-actions';
import { GlobalLanguageBridge, I18nProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Neuro Commerce',
    template: '%s | Neuro Commerce',
  },
  description:
    'Modern ecommerce platform with live inventory, secure checkout, delivery tracking, wishlist, reviews and returns.',
  applicationName: 'Neuro Commerce',
  keywords: [
    'ecommerce',
    'online shopping',
    'Bangladesh',
    'delivery',
    'Neuro Commerce',
  ],
  openGraph: {
    type: 'website',
    title: 'Neuro Commerce',
    description:
      'Modern shopping with live inventory, secure checkout and delivery tracking.',
    siteName: 'Neuro Commerce',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning style={{background:"#132235",color:"#f7fbff",colorScheme:"dark"}}>
      <body style={{margin:0,background:"#132235",color:"#f7fbff"}}><I18nProvider><GlobalLanguageBridge/><StoreConfigProvider>{children}<ContactFloatingActions/></StoreConfigProvider></I18nProvider></body>
    </html>
  );
}



