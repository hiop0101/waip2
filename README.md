# 🌤️ Galaxy Weather App

갤럭시 스마트폰의 날씨 앱 스타일로 제작한 현대적인 날씨 정보 애플리케이션입니다.

## ✨ 주요 기능

- 🌍 **지역 검색**: 도시, 지역, 나라 이름으로 날씨 검색
- 🎨 **동적 배경**: 날씨 상태에 따라 자동으로 배경색 변경
- 📍 **위치 기반**: GPS를 통한 현재 위치 날씨 자동 표시
- ❄️ **실시간 정보**: 기온, 체감온도, 습도, 풍속, 기압 표시
- 🔄 **새로고침**: 언제든 최신 날씨 정보 업데이트
- 🛡️ **보안**: API 키는 서버에서만 사용 (클라이언트에 노출 안 함)

## 🛠️ 기술 스택

- **Frontend**: React + Next.js (TypeScript)
- **Styling**: Tailwind CSS
- **API**: OpenWeather API
- **Backend**: Next.js Route Handlers

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone https://github.com/hiop0101/waip2.git
cd waip2
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env.local` 파일 생성 후 API 키 입력:
```
WEATHER_API_KEY=your_openweather_api_key
```

[OpenWeather](https://openweathermap.org/api)에서 무료 API 키 발급받기

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 📁 프로젝트 구조

```
waip2/
├── app/
│   ├── page.tsx              # 메인 페이지
│   ├── api/
│   │   ├── weather/route.ts  # 날씨 정보 API
│   │   ├── config/route.ts   # 설정 API
│   │   └── search/route.ts   # 지역 검색 API
│   ├── globals.css
│   └── layout.tsx
├── public/
├── .env.local               # API 키 (gitignore 처리됨)
├── next.config.ts
└── package.json
```

## 🎨 UI/UX 특징

- **갤럭시 One UI 스타일**: 미니멀하고 우아한 디자인
- **글라스모피즘**: 반투명 카드와 블러 효과
- **반응형**: 모바일, 태블릿, 데스크톱 최적화
- **부드러운 애니메이션**: Fade-in 효과와 터치 피드백

## 🌦️ 날씨에 따른 배경색 변화

- ☀️ **맑음**: 파란색 그래디언트
- ☁️ **구름**: 회색 톤
- 🌧️ **비**: 짙은 회색
- ❄️ **눈**: 밝은 블루-화이트
- ⛈️ **천둥**: 어두운 톤

## 🔐 보안

- API 키는 `.env.local`에만 저장
- 클라이언트에서 직접 접근 불가
- 모든 API 호출은 Next.js Route Handler를 통해 서버에서 처리
- `.gitignore`로 환경변수 파일 보호

## 📱 기능 사용법

### 1. 날씨 확인
- 앱 실행 시 자동으로 현재 위치 날씨 표시
- GPS 허용 필수

### 2. 지역 검색
- 상단 검색창에 도시/지역/나라 입력
- 자동 완성된 결과에서 선택

### 3. 정보 확인
- 기온, 체감온도, 습도, 풍속, 기압 한눈에 확인
- 🔄 버튼으로 정보 새로고침
- ⚙️ 버튼으로 API 키 변경

## 📄 라이선스

MIT

## 👨‍💻 작성자

[hiop0101](https://github.com/hiop0101)
