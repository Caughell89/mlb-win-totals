import { NextResponse } from 'next/server';
import { scrapeWinTotals } from '@/app/lib/scrape-wintotals';

export async function GET() {
  const result = await scrapeWinTotals();
  return NextResponse.json(result);
}
