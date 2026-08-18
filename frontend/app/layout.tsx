import type { Metadata } from 'next';
import './globals.css';
import BackendWarmup from '@/components/backend-warmup';

import { StoreConfigProvider } from '@/components/store-config-provider';
import { GlobalLanguageBridge, I18nProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'E-Commerce Platform',
    template: '%s | E-Commerce Platform',
  },
  description:
    'Modern ecommerce platform with live inventory, secure checkout, delivery tracking, wishlist, reviews and returns.',
  applicationName: 'E-Commerce Platform',
  keywords: ['ecommerce','online shopping','Bangladesh','delivery','E-Commerce Platform'],
  openGraph: {
    type: 'website',
    title: 'E-Commerce Platform',
    description: 'Modern shopping with live inventory, secure checkout and delivery tracking.',
    siteName: 'E-Commerce Platform',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      style={{ background: '#132235', color: '#f7fbff', colorScheme: 'dark' }}
    >
      <body style={{ margin: 0, background: '#132235', color: '#f7fbff' }}>
        <I18nProvider>
          <GlobalLanguageBridge />
          <StoreConfigProvider>
            <BackendWarmup />
            {children}
            
          </StoreConfigProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
