import { NextResponse } from 'next/server';
import { scrapePecota } from '@/app/lib/scrape-pecota';

export async function GET() {
  const result = await scrapePecota();
  return NextResponse.json(result);
}
