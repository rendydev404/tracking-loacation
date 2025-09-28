import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Fungsi untuk mendapatkan alamat dari Nominatim (tidak berubah)
async function getAddressFromCoordinates(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'AplikasiTracking/1.0' } });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data?.display_name || "Gagal mendapatkan alamat dari OpenStreetMap";
  } catch (error) {
    console.error("Error fetching Nominatim data:", error);
    return "Gagal menghubungi servis alamat";
  }
}

export async function POST(request) {
  try {
    const { lat, lng, phoneNumber } = await request.json();
    if (!lat || !lng || !phoneNumber) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const address = await getAddressFromCoordinates(lat, lng);

    // Masukkan data ke tabel 'locations' di Supabase
    const { data, error } = await supabase
      .from('locations')
      .insert([{ 
        phone_number: phoneNumber, 
        lat: lat, 
        lng: lng, 
        address: address 
      }]);

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return NextResponse.json({ message: 'Lokasi berhasil disimpan' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}