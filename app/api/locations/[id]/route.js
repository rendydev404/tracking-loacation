import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ message: 'ID lokasi dibutuhkan' }, { status: 400 });
    }

    const fileData = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(fileData);

    const initialLength = db.locations.length;
    const updatedLocations = db.locations.filter(loc => loc.recordId !== id);

    if (updatedLocations.length === initialLength) {
      console.log(`Lokasi dengan recordId: ${id} tidak ditemukan untuk dihapus.`);
      return NextResponse.json({ message: 'Lokasi tidak ditemukan' }, { status: 404 });
    }

    db.locations = updatedLocations;
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    console.log(`Lokasi dengan recordId: ${id} berhasil dihapus.`);
    return NextResponse.json({ message: 'Lokasi berhasil dihapus' }, { status: 200 });

  } catch (error) {
    console.error("Error dalam API hapus:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
