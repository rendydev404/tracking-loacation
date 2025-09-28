'use client';

import { useEffect, useState } from 'react';

export default function TrackPage({ params }) {
  const { id } = params;
  const [message, setMessage] = useState('Requesting location access...');

  useEffect(() => {
    if (!id) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setMessage('Location captured. Saving...');
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch('/api/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lat: latitude, lng: longitude, id }),
          });

          if (response.ok) {
            setMessage('Location saved successfully. You can close this page now.');
          } else {
            throw new Error('Failed to save location.');
          }
        } catch (error) {
          setMessage(`Error: ${error.message}`);
        }
      },
      (error) => {
        setMessage(`Error getting location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
      }
    );
  }, [id]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Location Tracking</h1>
        <p>{message}</p>
      </div>
    </main>
  );
}
