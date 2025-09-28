import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: 'ID lokasi dibutuhkan' }, { status: 400 });
    }

    // Hapus baris dari tabel 'locations' yang cocok dengan id
    const { error } = await supabase
      .from('locations')
      .delete()
      .match({ id: id });

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    return NextResponse.json({ message: 'Lokasi berhasil dihapus' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
