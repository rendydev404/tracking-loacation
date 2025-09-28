import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.join(process.cwd(), 'db.json');

// --- FUNGSI BARU MENGGUNAKAN OPENSTREETMAP (NOMINATIM) ---
async function getAddressFromCoordinates(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  console.log("Mencari alamat di OpenStreetMap...");

  try {
    const response = await fetch(url, {
      headers: {
        // Kebijakan Nominatim memerlukan User-Agent yang spesifik
        'User-Agent': 'AplikasiTracking/1.0 (dibuat oleh Gemini)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    } else {
      console.log("Nominatim response error:", data);
      return "Gagal mendapatkan alamat dari OpenStreetMap";
    }
  } catch (error) {
    console.error("Error fetching Nominatim data:", error);
    return "Gagal menghubungi servis alamat OpenStreetMap";
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { lat, lng, phoneNumber } = body;

    if (!lat || !lng || !phoneNumber) {
      return NextResponse.json({ message: 'Data tidak lengkap: lat, lng, dan phoneNumber dibutuhkan' }, { status: 400 });
    }

    const address = await getAddressFromCoordinates(lat, lng);

    const fileData = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(fileData);

    const newLocation = {
      recordId: crypto.randomUUID(),
      phoneNumber,
      lat,
      lng,
      address,
      timestamp: new Date().toISOString(),
    };

    db.locations.push(newLocation);

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ message: 'Lokasi berhasil disimpan' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}