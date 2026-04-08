import { NextRequest, NextResponse } from 'next/server';
import { scrapeJobFromUrl, isValidJobUrl } from '@/utils/urlScraper';
import { detectPlatform, getAllPlatforms } from '@/utils/jobPlatforms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({
        code: 1,
        message: 'Missing URL',
      });
    }

    if (!isValidJobUrl(url)) {
      return NextResponse.json({
        code: 2,
        message: 'Unsupported job platform',
        supportedPlatforms: getAllPlatforms().map(p => p.name),
      });
    }

    const platform = detectPlatform(url);
    const job = await scrapeJobFromUrl(url);

    return NextResponse.json({
      code: 0,
      data: {
        ...job,
        platform: platform?.name || 'Unknown',
      },
    });
  } catch (error) {
    console.error('Scrape API error:', error);
    return NextResponse.json({
      code: 500,
      message: `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

export async function GET() {
  return NextResponse.json({
    platforms: getAllPlatforms(),
  });
}
