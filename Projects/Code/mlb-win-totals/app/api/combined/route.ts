import { NextResponse } from 'next/server';
import { getCombinedData } from '@/app/lib/get-combined-data';

export async function GET() {
  const data = await getCombinedData();
  return NextResponse.json(data);
}
