# 🌤️ Galaxy Weather App

> **[🌐 앱 보기](https://hiop0101.github.io/waip2/)**

갤럭시 스마트폰의 날씨 앱 스타일로 제작한 현대적인 날씨 정보 애플리케이션입니다.

## ✨ 주요 기능

- 🌍 지역 검색: 도시, 지역, 나라 이름으로 날씨 검색
- 🎨 동적 배경: 날씨 상태에 따라 자동으로 배경색 변경
- 📍 위치 기반: GPS를 통한 현재 위치 날씨 자동 표시
- ❄️ 실시간 정보: 기온, 체감온도, 습도, 풍속, 기압 표시
- 🔄 새로고침: 언제든 최신 날씨 정보 업데이트
- 🛡️ 보안: API 키는 서버에서만 사용

## 🛠️ 기술 스택

- React + Next.js (TypeScript)
- Tailwind CSS
- OpenWeather API

## 📦 설치

```bash
git clone https://github.com/hiop0101/waip2.git
cd waip2
npm install
```

## 🔐 환경변수

`.env.local` 파일 생성:
```
WEATHER_API_KEY=your_api_key
```

[OpenWeather](https://openweathermap.org/api)에서 무료 키 발급

## 🚀 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인
