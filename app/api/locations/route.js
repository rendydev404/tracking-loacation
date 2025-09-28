
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

export async function GET() {
  try {
    const fileData = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(fileData);
    return NextResponse.json(db.locations, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
