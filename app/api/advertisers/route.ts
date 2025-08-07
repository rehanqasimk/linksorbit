import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "12eafe68f1fa43d5ab3a745a173a7837";
  const country = searchParams.get("country") || "DE";
  const page_size = searchParams.get("page_size") || "10";
  const page = searchParams.get("page") || "1";
  const format = searchParams.get("format") || "json";

  const api_key = process.env.API_KEY;
  const api_secret = process.env.API_SECRET;

  if (!api_key || !api_secret) {
    return NextResponse.json({ error: "API key/secret missing" }, { status: 500 });
  }

  const url = `https://api.yieldkit.com/v1/advertiser?api_key=${api_key}&api_secret=${api_secret}&site_id=${site_id}&country=${country}&page_size=${page_size}&page=${page}&format=${format}`;

  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from YieldKit API" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
