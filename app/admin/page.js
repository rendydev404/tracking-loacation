'use client';

import { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import Swal from 'sweetalert2';

const ADMIN_PASSWORD = 'gemini123';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Password salah!');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan Password"
              className="w-full px-4 py-2 text-gray-700 bg-gray-200 border rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div>
            <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(data);
    } catch (error) {
      console.error("Gagal mengambil lokasi:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLocations();
      const interval = setInterval(fetchLocations, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const mapCenter = useMemo(() => {
    if (selectedLocation) return { lat: selectedLocation.lat, lng: selectedLocation.lng };
    if (locations.length > 0) return { lat: locations[0].lat, lng: locations[0].lng };
    return { lat: -6.200000, lng: 106.816666 };
  }, [selectedLocation, locations]);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Anda yakin?',
      text: "Data lokasi ini akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
          if (res.ok) {
            Swal.fire('Dihapus!','Data lokasi telah berhasil dihapus.','success');
            fetchLocations();
            if (selectedLocation && selectedLocation.id === id) {
              setSelectedLocation(null);
            }
          } else {
            throw new Error('Gagal menghapus dari server.');
          }
        } catch (error) {
          Swal.fire('Gagal!','Terjadi kesalahan saat menghapus data.','error');
        }
      }
    });
  };

  const handleView = (loc) => {
    setSelectedLocation(loc);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-indigo-800">Tracking Dashboard</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Data Target Terekam</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor WA</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat Terdeteksi</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locations.map((loc) => (
                    <tr key={loc.id} className={selectedLocation?.id === loc.id ? 'bg-indigo-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{loc.phone_number}</td>
                      <td className="px-6 py-4 whitespace-normal text-sm text-gray-600">{loc.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(loc.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                        <button onClick={() => handleView(loc)} className="text-indigo-600 hover:text-indigo-900">Lihat</button>
                        <button onClick={() => handleDelete(loc.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Peta Lokasi</h2>
            {isLoaded ? (
              <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={14}>
                {locations.map((loc) => (
                  <Marker 
                    key={loc.id} 
                    position={{ lat: loc.lat, lng: loc.lng }} 
                    animation={selectedLocation?.id === loc.id ? window.google.maps.Animation.BOUNCE : null}
                  />
                ))}
              </GoogleMap>
            ) : <div>Memuat Peta...</div>}
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-500">
          Peta oleh Google Maps | Data Alamat © kontributor OpenStreetMap
        </div>
      </main>
    </div>
  );
}
