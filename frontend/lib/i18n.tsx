'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '@/lib/api';

export type Language = 'en' | 'bn';

type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  en: {
    language: 'Language', english: 'English', bangla: 'বাংলা', home: 'Home', shop: 'Shop', categories: 'Categories',
    newArrivals: 'New arrivals', offers: 'Offers', search: 'Search products, brands and categories', account: 'My account',
    orders: 'My orders', wishlist: 'Wishlist', notifications: 'Notifications', login: 'Login', logout: 'Logout', cart: 'Cart',
    support: 'Customer care', track: 'Track order', allCategories: 'All categories', price: 'Price', chooseVariant: 'Choose variant',
    addToCart: 'Add to cart', save: 'Save', reviews: 'Customer reviews', verifiedReviews: 'verified reviews', inStock: 'in stock',
    outOfStock: 'Out of stock', delivery: 'Zone-based delivery', protected: 'Protected purchase', loading: 'Loading product...',
    product: 'Product', catalog: 'Catalog management', productsVariants: 'Products & variants', media: 'Product media',
    uploadMedia: 'Upload image / video', mediaHelp: 'Add multiple product images and videos. First image becomes the main gallery image.',
    addMediaUrl: 'Add media URL', image: 'Image', video: 'Video', remove: 'Remove', createProduct: 'Create product',
    saveChanges: 'Save changes', featured: 'Featured product', contact: 'Contact', helpCenter: 'Help center', about: 'About us',
    freeDelivery: 'Free delivery', securePayment: 'Secure payment', easyReturns: 'Easy returns', customerSupport: 'Customer support',
    quickLinks: 'Quick links', customerService: 'Customer service', contactUs: 'Contact us', followUs: 'Follow us',
  },
  bn: {
    language: 'ভাষা', english: 'English', bangla: 'বাংলা', home: 'হোম', shop: 'শপ', categories: 'ক্যাটাগরি',
    newArrivals: 'নতুন পণ্য', offers: 'অফার', search: 'পণ্য, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন', account: 'আমার অ্যাকাউন্ট',
    orders: 'আমার অর্ডার', wishlist: 'ইচ্ছেতালিকা', notifications: 'নোটিফিকেশন', login: 'লগইন', logout: 'লগআউট', cart: 'কার্ট',
    support: 'কাস্টমার কেয়ার', track: 'অর্ডার ট্র্যাক করুন', allCategories: 'সব ক্যাটাগরি', price: 'মূল্য', chooseVariant: 'ভ্যারিয়েন্ট বেছে নিন',
    addToCart: 'কার্টে যোগ করুন', save: 'সেভ করুন', reviews: 'ক্রেতার রিভিউ', verifiedReviews: 'ভেরিফাইড রিভিউ', inStock: 'স্টকে আছে',
    outOfStock: 'স্টক শেষ', delivery: 'এলাকাভিত্তিক ডেলিভারি', protected: 'নিরাপদ কেনাকাটা', loading: 'পণ্য লোড হচ্ছে...',
    product: 'পণ্য', catalog: 'ক্যাটালগ ম্যানেজমেন্ট', productsVariants: 'পণ্য ও ভ্যারিয়েন্ট', media: 'পণ্যের ছবি ও ভিডিও',
    uploadMedia: 'ছবি / ভিডিও আপলোড', mediaHelp: 'একাধিক ছবি ও ভিডিও যোগ করুন। প্রথম ছবিটি মূল গ্যালারি ছবি হিসেবে দেখাবে।',
    addMediaUrl: 'মিডিয়া URL যোগ করুন', image: 'ছবি', video: 'ভিডিও', remove: 'মুছুন', createProduct: 'পণ্য তৈরি করুন',
    saveChanges: 'পরিবর্তন সেভ করুন', featured: 'ফিচার্ড পণ্য', contact: 'যোগাযোগ', helpCenter: 'সহায়তা কেন্দ্র', about: 'আমাদের সম্পর্কে',
    freeDelivery: 'ফ্রি ডেলিভারি', securePayment: 'নিরাপদ পেমেন্ট', easyReturns: 'সহজ রিটার্ন', customerSupport: 'কাস্টমার সাপোর্ট',
    quickLinks: 'দ্রুত লিংক', customerService: 'কাস্টমার সার্ভিস', contactUs: 'যোগাযোগ করুন', followUs: 'আমাদের অনুসরণ করুন',
  },
};

const uiPhrases: Record<string, string> = {
  'Home': 'হোম',
  'Shop': 'শপ',
  'New arrivals': 'নতুন পণ্য',
  'New Arrivals': 'নতুন পণ্য',
  'Offers': 'অফার',
  'All products': 'সব পণ্য',
  'All Products': 'সব পণ্য',
  'All categories': 'সব ক্যাটাগরি',
  'All Categories': 'সব ক্যাটাগরি',
  'Category': 'ক্যাটাগরি',
  'Categories': 'ক্যাটাগরি',
  'Brand': 'ব্র্যান্ড',
  'Brands': 'ব্র্যান্ড',
  'Price': 'মূল্য',
  'Search': 'খুঁজুন',
  'Search products': 'পণ্য খুঁজুন',
  'My account': 'আমার অ্যাকাউন্ট',
  'My Account': 'আমার অ্যাকাউন্ট',
  'My orders': 'আমার অর্ডার',
  'My Orders': 'আমার অর্ডার',
  'Orders': 'অর্ডার',
  'Wishlist': 'ইচ্ছেতালিকা',
  'Notifications': 'নোটিফিকেশন',
  'Returns': 'রিটার্ন',
  'Returns & refunds': 'রিটার্ন ও রিফান্ড',
  'Payments': 'পেমেন্ট',
  'Addresses': 'ঠিকানা',
  'Saved addresses': 'সংরক্ষিত ঠিকানা',
  'Profile': 'প্রোফাইল',
  'Security': 'নিরাপত্তা',
  'Settings': 'সেটিংস',
  'Preferences': 'পছন্দসমূহ',
  'Login': 'লগইন',
  'Sign in': 'সাইন ইন',
  'Sign In': 'সাইন ইন',
  'Logout': 'লগআউট',
  'Register': 'রেজিস্টার',
  'Create account': 'অ্যাকাউন্ট তৈরি করুন',
  'Create an account': 'অ্যাকাউন্ট তৈরি করুন',
  'Email': 'ইমেইল',
  'Password': 'পাসওয়ার্ড',
  'Current password': 'বর্তমান পাসওয়ার্ড',
  'New password': 'নতুন পাসওয়ার্ড',
  'Confirm password': 'পাসওয়ার্ড নিশ্চিত করুন',
  'Forgot password?': 'পাসওয়ার্ড ভুলে গেছেন?',
  'Cart': 'কার্ট',
  'Checkout': 'চেকআউট',
  'Continue shopping': 'কেনাকাটা চালিয়ে যান',
  'Place order': 'অর্ডার করুন',
  'Place order securely': 'নিরাপদে অর্ডার করুন',
  'Order summary': 'অর্ডারের সারসংক্ষেপ',
  'Subtotal': 'সাবটোটাল',
  'Shipping': 'ডেলিভারি চার্জ',
  'Total': 'মোট',
  'Estimated total': 'আনুমানিক মোট',
  'Delivery address': 'ডেলিভারি ঠিকানা',
  'Full name': 'পূর্ণ নাম',
  'Phone': 'ফোন',
  'District': 'জেলা',
  'Area': 'এলাকা',
  'Full Address': 'পূর্ণ ঠিকানা',
  'Full address': 'পূর্ণ ঠিকানা',
  'Landmark': 'ল্যান্ডমার্ক',
  'Payment': 'পেমেন্ট',
  'Cash on delivery': 'ক্যাশ অন ডেলিভারি',
  'Track order': 'অর্ডার ট্র্যাক করুন',
  'Delivery tracking': 'ডেলিভারি ট্র্যাকিং',
  'Confirmed': 'নিশ্চিত',
  'Processing': 'প্রসেসিং',
  'Packed': 'প্যাক করা হয়েছে',
  'Ready For Pickup': 'পিকআপের জন্য প্রস্তুত',
  'Shipped': 'শিপ করা হয়েছে',
  'In Transit': 'পথে আছে',
  'Out For Delivery': 'ডেলিভারির জন্য বের হয়েছে',
  'Delivered': 'ডেলিভার হয়েছে',
  'Cancel order': 'অর্ডার বাতিল করুন',
  'No orders yet': 'এখনও কোনো অর্ডার নেই',
  'No notifications yet': 'এখনও কোনো নোটিফিকেশন নেই',
  'No products found': 'কোনো পণ্য পাওয়া যায়নি',
  'Add to cart': 'কার্টে যোগ করুন',
  'Buy now': 'এখনই কিনুন',
  'Choose variant': 'ভ্যারিয়েন্ট বেছে নিন',
  'In stock': 'স্টকে আছে',
  'Out of stock': 'স্টক শেষ',
  'Customer reviews': 'ক্রেতার রিভিউ',
  'Write a review': 'রিভিউ লিখুন',
  'Review available after delivery': 'ডেলিভারির পর রিভিউ দেওয়া যাবে',
  'Featured products': 'ফিচার্ড পণ্য',
  'Featured Products': 'ফিচার্ড পণ্য',
  'Shop by category': 'ক্যাটাগরি অনুযায়ী কেনাকাটা',
  'Shop by Category': 'ক্যাটাগরি অনুযায়ী কেনাকাটা',
  'Browse faster': 'দ্রুত খুঁজুন',
  'Curated for you': 'আপনার জন্য বাছাই করা',
  'View all': 'সব দেখুন',
  'Shop all': 'সব পণ্য দেখুন',
  'Shop now': 'এখনই কিনুন',
  'Learn more': 'আরও জানুন',
  'Explore': 'দেখুন',
  'Fast delivery': 'দ্রুত ডেলিভারি',
  'Zone-based shipping': 'এলাকাভিত্তিক ডেলিভারি',
  'Secure shopping': 'নিরাপদ কেনাকাটা',
  'Protected account flow': 'নিরাপদ অ্যাকাউন্ট ব্যবস্থা',
  'Easy returns': 'সহজ রিটার্ন',
  'Track return status': 'রিটার্ন স্ট্যাটাস দেখুন',
  'Live stock': 'লাইভ স্টক',
  'Variant-level availability': 'ভ্যারিয়েন্টভিত্তিক স্টক',
  'Limited offer': 'সীমিত সময়ের অফার',
  'Need help?': 'সহায়তা প্রয়োজন?',
  'Frequently asked questions': 'সাধারণ জিজ্ঞাসা',
  'What customers say': 'ক্রেতারা যা বলেন',
  'Customer portal': 'কাস্টমার পোর্টাল',
  'Admin Panel': 'অ্যাডমিন প্যানেল',
  'Dashboard': 'ড্যাশবোর্ড',
  'Products': 'পণ্য',
  'Catalog': 'ক্যাটালগ',
  'Inventory': 'ইনভেন্টরি',
  'Customers': 'ক্রেতা',
  'Delivery': 'ডেলিভারি',
  'Shipments': 'শিপমেন্ট',
  'Shipping management': 'শিপিং ব্যবস্থাপনা',
  'Promotions': 'প্রমোশন',
  'Reports': 'রিপোর্ট',
  'Reviews': 'রিভিউ',
  'Finance': 'ফাইন্যান্স',
  'CMS': 'সিএমএস',
  'Users': 'ইউজার',
  'Save': 'সেভ করুন',
  'Save changes': 'পরিবর্তন সেভ করুন',
  'Save all settings': 'সব সেটিংস সেভ করুন',
  'Saving...': 'সেভ হচ্ছে...',
  'Loading...': 'লোড হচ্ছে...',
  'Edit': 'এডিট',
  'Delete': 'মুছুন',
  'Remove': 'মুছুন',
  'Create': 'তৈরি করুন',
  'Update': 'আপডেট করুন',
  'Status': 'স্ট্যাটাস',
  'Active': 'সক্রিয়',
  'Inactive': 'নিষ্ক্রিয়',
  'Search products, brands and categories': 'পণ্য, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন',
  'Quick links': 'দ্রুত লিংক',
  'Customer service': 'কাস্টমার সার্ভিস',
  'Contact us': 'যোগাযোগ করুন',
  'Follow us': 'আমাদের অনুসরণ করুন',
  'Help center': 'সহায়তা কেন্দ্র',
  'About us': 'আমাদের সম্পর্কে',
  'About': 'আমাদের সম্পর্কে',
  'Contact': 'যোগাযোগ',
  'Privacy policy': 'প্রাইভেসি পলিসি',
  'Terms & conditions': 'শর্তাবলি',
  'Return & refund': 'রিটার্ন ও রিফান্ড',
  'Delivery information': 'ডেলিভারি তথ্য',
  'How to order': 'কীভাবে অর্ডার করবেন',
  'Customer support': 'কাস্টমার সাপোর্ট',
  'Free delivery': 'ফ্রি ডেলিভারি',
  'Secure payment': 'নিরাপদ পেমেন্ট',
  'Messenger': 'মেসেঞ্জার',
  'WhatsApp': 'হোয়াটসঅ্যাপ',
  'Call now': 'কল করুন',
  'Call us': 'কল করুন',
  'Everything you need, in one modern store.': 'আপনার প্রয়োজনের সবকিছু, এক আধুনিক স্টোরে।',
  'Discover products, save favorites, checkout securely, track delivery and manage returns from one connected account.': 'পণ্য খুঁজুন, পছন্দের পণ্য সেভ করুন, নিরাপদে চেকআউট করুন, ডেলিভারি ট্র্যাক করুন এবং রিটার্ন পরিচালনা করুন—এক অ্যাকাউন্ট থেকেই।',
  'SUPER OFFER': 'সুপার অফার',
  'LIVE INVENTORY': 'লাইভ ইনভেন্টরি',
  'Product catalog': 'পণ্যের ক্যাটালগ',
  'Find your next favorite.': 'আপনার পরবর্তী পছন্দের পণ্য খুঁজুন।',
  'Search, filter and compare live products and available variants.': 'লাইভ পণ্য ও উপলভ্য ভ্যারিয়েন্ট খুঁজুন, ফিল্টার করুন এবং তুলনা করুন।',
  'Search name, brand or category...': 'পণ্য, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন...',
  'Featured first': 'ফিচার্ড আগে',
  'Price: low to high': 'দাম: কম থেকে বেশি',
  'Price: high to low': 'দাম: বেশি থেকে কম',
  'Newest': 'নতুন আগে',
  'Offers first': 'অফার আগে',
  'Reset': 'রিসেট',
  'Your cart': 'আপনার কার্ট',
  'Shopping bag': 'শপিং ব্যাগ',
  'Your cart is empty': 'আপনার কার্ট খালি',
  'Browse products': 'পণ্য দেখুন',
  'Proceed to checkout': 'চেকআউটে যান',
  'Calculated at checkout': 'চেকআউটে হিসাব হবে',
  'Apply at checkout': 'চেকআউটে প্রয়োগ করুন',
  'Guest cart': 'গেস্ট কার্ট',
};

function translateUiText(raw: string): string {
  const leading = raw.match(/^\s*/)?.[0] || '';
  const trailing = raw.match(/\s*$/)?.[0] || '';
  const core = raw.trim();
  if (!core) return raw;
  const exact = uiPhrases[core];
  if (exact) return `${leading}${exact}${trailing}`;

  const patterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [/^(\d+) unread$/i, (m) => `${m[1]}টি অপঠিত`],
    [/^BDT\s*([\d,.]+)$/i, (m) => `৳${m[1]}`],
    [/^Qty:\s*(\d+)$/i, (m) => `পরিমাণ: ${m[1]}`],
    [/^(\d+) delivered$/i, (m) => `${m[1]}টি ডেলিভার হয়েছে`],
    [/^Min BDT\s*([\d,.]+)$/i, (m) => `ন্যূনতম ৳${m[1]}`],
  ];
  for (const [regex, replacer] of patterns) {
    const match = core.match(regex);
    if (match) return `${leading}${replacer(match)}${trailing}`;
  }
  return raw;
}

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('storeLanguage');
    if (saved === 'bn' || saved === 'en') {
      setLanguageState(saved);
      document.documentElement.lang = saved === 'bn' ? 'bn' : 'en';
      return;
    }
    api.get('/cms/public/settings').then((response) => {
      const preferred = response.data?.['store.locale']?.defaultLanguage;
      const initial: Language = preferred === 'bn' ? 'bn' : 'en';
      setLanguageState(initial);
      document.documentElement.lang = initial === 'bn' ? 'bn' : 'en';
    }).catch(() => {
      setLanguageState('en');
      document.documentElement.lang = 'en';
    });
  }, []);

  function setLanguage(value: Language) {
    setLanguageState(value);
    localStorage.setItem('storeLanguage', value);
    document.documentElement.lang = value === 'bn' ? 'bn' : 'en';
  }

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: (key: string) => dictionaries[language][key] || dictionaries.en[key] || key,
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function GlobalLanguageBridge() {
  const { language } = useI18n();

  useEffect(() => {
    if (language !== 'bn') {
      document.querySelectorAll<HTMLElement>('[data-i18n-original]').forEach((el) => {
        const original = el.dataset.i18nOriginal;
        if (original !== undefined) {
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            el.placeholder = original;
          } else {
            el.textContent = original;
          }
          delete el.dataset.i18nOriginal;
        }
      });
      return;
    }

    const translateElement = (el: HTMLElement) => {
      if (el.closest('[data-no-auto-translate="true"]')) return;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        const original = el.placeholder;
        const translated = translateUiText(original);
        if (translated !== original) {
          el.dataset.i18nOriginal = original;
          el.placeholder = translated;
        }
        return;
      }
      if (el.children.length > 0) return;
      const original = el.textContent || '';
      const translated = translateUiText(original);
      if (translated !== original) {
        el.dataset.i18nOriginal = original;
        el.textContent = translated;
      }
    };

    const translateTree = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>('p,span,a,button,label,h1,h2,h3,h4,h5,h6,option,summary,th,td,input,textarea').forEach(translateElement);
    };

    translateTree(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            translateElement(node);
            translateTree(node);
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  return null;
}

export function useI18n() {
  return useContext(I18nContext);
}
