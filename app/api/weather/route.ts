import { NextRequest, NextResponse } from 'next/server';

interface WeatherData {
  location: string;
  temperature: number;
  icon: string;
  description: string;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  country?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<WeatherData | { error: string }>> {
  // 쿼리에서 API 키를 받거나 환경변수에서 가져오기
  const keyParam = request.nextUrl.searchParams.get('key');
  const apiKey = keyParam || process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // 사용자의 좌표 가져오기 (또는 기본값 사용 - 서울)
    const lat = request.nextUrl.searchParams.get('lat') || '37.5665';
    const lon = request.nextUrl.searchParams.get('lon') || '126.9780';

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ko`,
      { next: { revalidate: 600 } } // 10분 캐싱
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key');
      }
      throw new Error('Weather API request failed');
    }

    const data = await response.json();

    return NextResponse.json({
      location: data.name,
      temperature: Math.round(data.main.temp),
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      description: data.weather[0].description,
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: parseFloat(data.wind.speed.toFixed(1)),
      pressure: data.main.pressure,
      country: data.sys.country,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch weather';
    if (message.includes('Invalid API key')) {
      return NextResponse.json({ error: 'API KEY가 올바르지 않습니다.' }, { status: 401 });
    }
    return NextResponse.json({ error: '날씨 정보를 불러올 수 없습니다.' }, { status: 500 });
  }
}
