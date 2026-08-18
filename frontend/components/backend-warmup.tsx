'use client';

import { useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

export default function BackendWarmup() {
  useEffect(() => {
    let cancelled = false;

    async function wakeBackend() {
      try {
        await fetch(
          `${API_BASE_URL}/ops/health`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );
      } catch {
        // Silent by design.
        // Normal API requests have retry handling.
      }
    }

    wakeBackend();

    // If user keeps the site open,
    // lightly keep the backend active.
    const timer = window.setInterval(() => {
      if (!cancelled) {
        wakeBackend();
      }
    }, 10 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
