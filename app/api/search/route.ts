import { NextRequest, NextResponse } from 'next/server';

interface GeocodeResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
  state?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<GeocodeResult[] | { error: string }>> {
  const apiKey = process.env.WEATHER_API_KEY;
  const query = request.nextUrl.searchParams.get('q');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`,
      { next: { revalidate: 3600 } } // 1시간 캐싱
    );

    if (!response.ok) {
      throw new Error('Geocoding API request failed');
    }

    const data = await response.json();

    const results: GeocodeResult[] = data.map((item: any) => ({
      name: item.name,
      country: item.country,
      state: item.state,
      lat: item.lat,
      lon: item.lon,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json({ error: '검색 결과를 찾을 수 없습니다.' }, { status: 500 });
  }
}
