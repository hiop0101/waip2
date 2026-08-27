'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

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

// 날씨 상태에 따른 그래디언트 결정
const getWeatherGradient = (description: string) => {
  const desc = description.toLowerCase();

  if (desc.includes('rain') || desc.includes('drizzle')) {
    return 'from-slate-400 via-slate-500 to-slate-600';
  }
  if (desc.includes('cloud')) {
    return 'from-gray-300 via-gray-400 to-gray-500';
  }
  if (desc.includes('clear') || desc.includes('sunny')) {
    return 'from-blue-300 via-blue-400 to-blue-500';
  }
  if (desc.includes('snow')) {
    return 'from-blue-200 via-white to-blue-300';
  }
  if (desc.includes('thunder') || desc.includes('storm')) {
    return 'from-gray-500 via-slate-600 to-gray-700';
  }
  return 'from-blue-300 via-blue-400 to-blue-500';
};

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('__NOT_LOADED__');
  const [inputApiKey, setInputApiKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; country: string; state?: string; lat: number; lon: number }>>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);

  // API 키 로드
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        // 먼저 환경변수 키 확인
        const configRes = await fetch('/api/config');
        const config = await configRes.json();

        if (config.hasApiKey) {
          console.log('환경변수 API 키 사용');
          setApiKey('__ENV_KEY__');
          return;
        }

        // 환경변수 없으면 localStorage 확인
        const savedKey = localStorage.getItem('weather_api_key');
        if (savedKey) {
          console.log('저장된 API 키 사용');
          setApiKey(savedKey);
          return;
        }

        // 둘 다 없으면 모달 표시
        console.log('API 키 없음 - 모달 표시');
        setShowApiModal(true);
        setLoading(false);
      } catch (error) {
        console.error('API 키 로드 실패:', error);
        setShowApiModal(true);
        setLoading(false);
      }
    };

    loadApiKey();
  }, []);

  const handleSaveApiKey = () => {
    if (inputApiKey.trim().length < 20) {
      alert('올바른 형식의 API KEY를 입력해주세요');
      return;
    }
    setApiKey(inputApiKey.trim());
    localStorage.setItem('weather_api_key', inputApiKey.trim());
    setShowApiModal(false);
    setInputApiKey('');
    fetchWeatherData(inputApiKey.trim());
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = (lat: number, lon: number) => {
    setShowSearchResults(false);
    setSearchQuery('');
    setSearchResults([]);
    fetchWeatherByCoords(lat, lon);
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      const url = apiKey === '__ENV_KEY__'
        ? `/api/weather?lat=${lat}&lon=${lon}`
        : `/api/weather?lat=${lat}&lon=${lon}&key=${apiKey}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('날씨 정보를 불러올 수 없습니다.');

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (key: string) => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const url = key === '__ENV_KEY__'
              ? `/api/weather?lat=${latitude}&lon=${longitude}`
              : `/api/weather?lat=${latitude}&lon=${longitude}&key=${key}`;

            const response = await fetch(url);

            if (!response.ok) throw new Error('날씨 정보를 불러올 수 없습니다.');

            const data = await response.json();
            setWeather(data);
            setLoading(false);
          },
          () => {
            fetchDefaultWeather(key);
          }
        );
      } else {
        fetchDefaultWeather(key);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const fetchDefaultWeather = async (key: string) => {
    try {
      const url = key === '__ENV_KEY__'
        ? `/api/weather`
        : `/api/weather?key=${key}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('날씨 정보를 불러올 수 없습니다.');
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey === '__NOT_LOADED__') return; // 아직 로드 중

    if (apiKey && apiKey !== '') {
      fetchWeatherData(apiKey);
    } else {
      setShowApiModal(true);
      setLoading(false);
    }
  }, [apiKey]);

  const gradientClass = weather ? `from-${getWeatherGradient(weather.description).split(' ')[0].split('-')[1]} to-${getWeatherGradient(weather.description).split(' ')[2].split('-')[1]}` : 'from-blue-300 to-blue-500';

  return (
    <div
      className={`min-h-screen w-screen flex items-center justify-center transition-all duration-500 ${
        weather ? `bg-gradient-to-b ${getWeatherGradient(weather.description)}` : 'bg-gradient-to-b from-blue-300 to-blue-500'
      }`}
    >
      {/* API KEY 모달 */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-5">
          <div className="rounded-3xl p-8 max-w-sm w-full shadow-2xl bg-white/95 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-3 text-gray-900">API 키 설정</h2>
            <p className="text-sm mb-6 leading-relaxed text-gray-700">
              날씨 정보를 가져오기 위해 API 키가 필요합니다.<br />
              <a
                href="https://openweathermap.org/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                OpenWeather
              </a>
              에서 무료로 발급받으세요.
            </p>
            <div className="mb-6">
              <input
                type="password"
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveApiKey()}
                placeholder="API 키를 입력하세요"
                className="w-full px-4 py-3 rounded-2xl border-0 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={handleSaveApiKey}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-200 active:scale-95"
            >
              저장
            </button>
          </div>
        </div>
      )}

      {/* 메인 컨테이너 */}
      <div className="w-full h-screen flex flex-col justify-between items-center px-5 py-8 md:py-12">
        {/* 검색창 */}
        <div className="relative w-full max-w-md z-40">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="도시, 지역, 나라 검색..."
              className="w-full px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            />
            {searching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* 검색 결과 */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/30">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectLocation(result.lat, result.lon)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-100 transition-colors border-b border-white/20 last:border-b-0 active:bg-blue-200"
                >
                  <div className="font-semibold text-gray-900">{result.name}</div>
                  <div className="text-sm text-gray-600">
                    {result.state ? `${result.state}, ` : ''}{result.country}
                  </div>
                </button>
              ))}
            </div>
          )}

          {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/30">
              <p className="text-gray-600 text-center text-sm">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
        {/* 상단 - 날씨 정보 */}
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-md mt-8">
          {loading && (
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-white text-lg font-light">위치를 감지 중입니다...</p>
            </div>
          )}

          {error && (
            <div className="text-center text-white">
              <p className="text-4xl mb-2">⚠️</p>
              <p className="text-lg font-semibold mb-2">날씨를 불러올 수 없습니다</p>
              <p className="text-sm font-light opacity-80">{error}</p>
            </div>
          )}

          {weather && !loading && !error && (
            <div className="w-full flex flex-col items-center gap-2 animate-fade-in">
              {/* 아이콘 */}
              <div className="mb-4">
                <Image
                  src={weather.icon}
                  alt={weather.description}
                  width={140}
                  height={140}
                  priority
                  className="drop-shadow-2xl"
                />
              </div>

              {/* 온도 - 가장 크고 강조 */}
              <div className="text-center mb-2">
                <div className="text-8xl font-light text-white drop-shadow-lg">
                  {weather.temperature}°
                </div>
              </div>

              {/* 날씨 설명 */}
              <div className="text-center mb-6">
                <p className="text-white text-lg font-light capitalize drop-shadow-md">
                  {weather.description}
                </p>
              </div>

              {/* 도시 정보 */}
              <div className="text-center">
                <div className="text-white text-3xl font-light drop-shadow-lg">
                  {weather.location}
                </div>
                {weather.country && (
                  <p className="text-white/70 text-sm font-light mt-1">{weather.country}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 하단 - 추가 정보 카드 */}
        {weather && !loading && !error && (weather.feelsLike || weather.humidity || weather.windSpeed || weather.pressure) && (
          <div className="w-full max-w-md space-y-3 mb-4">
            {/* 첫 번째 행 */}
            <div className="grid grid-cols-2 gap-3">
              {weather.feelsLike !== undefined && (
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                  <p className="text-white/60 text-xs font-semibold tracking-widest mb-2">체감온도</p>
                  <p className="text-white text-2xl font-light">{weather.feelsLike}°</p>
                </div>
              )}
              {weather.humidity !== undefined && (
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                  <p className="text-white/60 text-xs font-semibold tracking-widest mb-2">습도</p>
                  <p className="text-white text-2xl font-light">{weather.humidity}%</p>
                </div>
              )}
            </div>

            {/* 두 번째 행 */}
            <div className="grid grid-cols-2 gap-3">
              {weather.windSpeed !== undefined && (
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                  <p className="text-white/60 text-xs font-semibold tracking-widest mb-2">풍속</p>
                  <p className="text-white text-2xl font-light">{weather.windSpeed}</p>
                  <p className="text-white/60 text-xs font-light">m/s</p>
                </div>
              )}
              {weather.pressure !== undefined && (
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                  <p className="text-white/60 text-xs font-semibold tracking-widest mb-2">기압</p>
                  <p className="text-white text-2xl font-light">{weather.pressure}</p>
                  <p className="text-white/60 text-xs font-light">hPa</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 하단 - 컨트롤 버튼 */}
        <div className="flex gap-4">
          {weather && !loading && (
            <button
              onClick={() => fetchWeatherData(apiKey)}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl hover:bg-white/30 transition-all duration-200 active:scale-90"
              title="새로고침"
            >
              🔄
            </button>
          )}
          <button
            onClick={() => setShowApiModal(true)}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl hover:bg-white/30 transition-all duration-200 active:scale-90"
            title="설정"
          >
            ⚙️
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
