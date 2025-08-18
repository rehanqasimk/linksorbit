import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('site_id') || '12eafe68f1fa43d5ab3a745a173a7837';
    const pageSize = searchParams.get('page_size') || '10';
    const page = searchParams.get('page') || '1';
    const format = 'json';

    const apiKey = process.env.API_KEY;
    const apiSecret = process.env.API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'API key/secret missing' },
        { status: 500 }
      );
    }

    const url = new URL('https://api.yieldkit.com/v1/incentive');
    url.searchParams.append('api_key', apiKey);
    url.searchParams.append('api_secret', apiSecret);
    url.searchParams.append('site_id', siteId);
    url.searchParams.append('page_size', pageSize);
    url.searchParams.append('page', page);
    url.searchParams.append('format', format);

    const res = await fetch(url.toString(), {
      headers: {
        accept: 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from YieldKit API' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error in incentives API:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
