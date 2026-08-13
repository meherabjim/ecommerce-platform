'use client';

import { useState } from 'react';

type Props = {
  latitude?: number | string | null;
  longitude?: number | string | null;
  locationSource?: string;

  onChange: (
    latitude: number | null,
    longitude: number | null,
    locationSource: string,
  ) => void;
};

export default function LocationPicker({
  latitude,
  longitude,
  locationSource,
  onChange,
}: Props) {
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState('');

  const hasLocation =
    latitude !== null &&
    latitude !== undefined &&
    latitude !== '' &&
    longitude !== null &&
    longitude !== undefined &&
    longitude !== '';

  const lat = hasLocation ? Number(latitude) : null;
  const lng = hasLocation ? Number(longitude) : null;

  function getLocation() {
    if (!navigator.geolocation) {
      setMessage('Location is not supported by this browser.');
      return;
    }

    setLoading(true);
    setMessage('Requesting location permission...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLat =
          Number(position.coords.latitude.toFixed(7));

        const nextLng =
          Number(position.coords.longitude.toFixed(7));

        onChange(
          nextLat,
          nextLng,
          'GPS',
        );

        setMessage(
          `Exact location captured. Accuracy about ${Math.round(
            position.coords.accuracy,
          )} metres.`,
        );

        setLoading(false);
      },

      (error) => {
        if (error.code === 1) {
          setMessage(
            'Location permission denied. You can still use the written address.',
          );
        } else {
          setMessage(
            'Could not get current location.',
          );
        }

        setLoading(false);
      },

      {
        enableHighAccuracy:true,
        timeout:15000,
        maximumAge:30000,
      },
    );
  }

  const mapUrl =
    hasLocation
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : '';

  const mapEmbed =
    hasLocation
      ? `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`
      : '';

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-black">
            Exact delivery location
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Optional. Helps the rider navigate directly to you.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={getLocation}
          className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading
            ? 'Finding location...'
            : '📍 Use current location'}
        </button>
      </div>

      {message && (
        <p className="mt-3 text-xs font-semibold text-slate-600">
          {message}
        </p>
      )}

      {hasLocation && (
        <div className="mt-4">
          <div className="overflow-hidden rounded-2xl border bg-white">
            <iframe
              title="Delivery location"
              src={mapEmbed}
              className="h-56 w-full"
              loading="lazy"
            />
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-3">
            <div className="text-xs text-slate-500">
              <p>Latitude: {lat}</p>
              <p>Longitude: {lng}</p>
              <p>
                Source: {locationSource || 'GPS'}
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border bg-white px-3 py-2 text-xs font-bold"
              >
                Open Map
              </a>

              <button
                type="button"
                onClick={() =>
                  onChange(
                    null,
                    null,
                    'NONE',
                  )
                }
                className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600"
              >
                Remove location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
