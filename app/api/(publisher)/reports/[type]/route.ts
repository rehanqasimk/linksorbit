import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

export async function GET(
  req: Request,
  context: { params: Promise<{ type: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { siteId } = session.user;
    
    if (!siteId) {
      return NextResponse.json(
        { error: 'No site ID found for your account' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    let startDate = searchParams.get('start_date');
    let endDate = searchParams.get('end_date');
    const format = 'json';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    // Format dates properly with timezone for the API
    startDate = new Date(startDate).toISOString();
    endDate = new Date(endDate).toISOString();

    const apiKey = process.env.API_KEY;
    const apiSecret = process.env.API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'API key/secret missing' },
        { status: 500 }
      );
    }

    const params = await context.params;
    const type = params.type;
    
    let endpoint = '';
    if (type === 'sales') {
      endpoint = 'sales';
    } else if (type === 'modified') {
      endpoint = 'modified';
    } else {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      );
    }

    const url = new URL(`https://account2.yieldkit.com/api/v3/reports/commissions/${endpoint}`);
    url.searchParams.append('format', format);
    url.searchParams.append('start_date', startDate);
    url.searchParams.append('end_date', endDate);
    url.searchParams.append('site_id', siteId!);

    const res = await fetch(url.toString(), {
      headers: {
        accept: 'application/json',
        'x-api-key': apiKey,
        'x-api-secret': apiSecret,
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
    console.error('Error in reports API:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
