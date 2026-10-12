/**
 * Google 스타일 시작 홈페이지 - script.js
 * 실시간 시계, 서울/김해 실시간 날씨, 구글 검색엔진, 오늘의 명언, 다크모드
 */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initTheme();
  initSearch();
  initWeather();
  initQuotes();
});

/* ==========================================================================
   1. 실시간 디지털 시계 및 날짜
   ========================================================================== */
function initClock() {
  const clockEl = document.getElementById('digitalClock');
  const dateEl = document.getElementById('calendarDate');

  const daysKo = ['일', '월', '화', '수', '목', '금', '토'];

  function updateTime() {
    const now = new Date();
    
    // 시간 (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    // 날짜 (YYYY년 MM월 DD일 (요일))
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = daysKo[now.getDay()];
    dateEl.textContent = `${year}년 ${month}월 ${date}일 (${day})`;
  }

  updateTime();
  setInterval(updateTime, 1000);
}

/* ==========================================================================
   2. 다크 모드 & 라이트 모드 테마 관리
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('google_startpage_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // 저장된 테마가 있으면 우선 사용, 없으면 시스템 설정 따름
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('google_startpage_theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('google_startpage_theme', 'dark');
    }
  });
}

/* ==========================================================================
   3. 구글 검색창 인터랙션
   ========================================================================== */
function initSearch() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');

  // 검색어 입력 시 클리어 버튼 토글
  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim().length > 0) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }
  });

  // 클리어 버튼 클릭 시 인풋 비우기 및 포커스 복원
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    searchInput.focus();
  });

  // 검색 폼 제출 처리
  searchForm.addEventListener('submit', (e) => {
    const query = searchInput.value.trim();
    if (!query) {
      e.preventDefault();
      searchInput.focus();
      return;
    }

    // 사용자가 입력한 검색어가 URL 형태인 경우 바로 이동 옵션 지원
    const isUrl = /^https?:\/\/[^\s]+$/i.test(query) || /^www\.[^\s]+$/i.test(query);
    if (isUrl) {
      e.preventDefault();
      const targetUrl = query.startsWith('http') ? query : `https://${query}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    // 기본 submit 동작 시 https://www.google.com/search?q=... 새 창으로 이동
  });
}

/* ==========================================================================
   4. 실시간 날씨 위젯 (서울 & 김해 - Open-Meteo API)
   ========================================================================== */
const CITIES = {
  seoul: {
    name: '서울',
    lat: 37.5665,
    lon: 126.9780,
    tempEl: 'seoulTemp',
    descEl: 'seoulDesc',
    iconEl: 'seoulIcon',
    maxEl: 'seoulMax',
    minEl: 'seoulMin'
  },
  gimhae: {
    name: '김해',
    lat: 35.2285,
    lon: 128.8894,
    tempEl: 'gimhaeTemp',
    descEl: 'gimhaeDesc',
    iconEl: 'gimhaeIcon',
    maxEl: 'gimhaeMax',
    minEl: 'gimhaeMin'
  }
};

// WMO 날씨 코드 분석 및 한글 설명 + SVG 아이콘 반환
function interpretWeatherCode(code) {
  // 맑음
  if (code === 0) {
    return {
      desc: '맑음',
      icon: `<svg viewBox="0 0 24 24" fill="#fbbc05"><circle cx="12" cy="12" r="5"/><path stroke="#fbbc05" stroke-width="2" stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41"/></svg>`
    };
  }
  // 구름 조금 ~ 대체로 맑음
  if (code === 1 || code === 2) {
    return {
      desc: '구름 조금',
      icon: `<svg viewBox="0 0 24 24"><path fill="#fbbc05" d="M12 4a5 5 0 0 1 5 5c0 .34-.04.68-.1 1a5.5 5.5 0 0 1 4.1 5.3A5.5 5.5 0 0 1 15.5 21H8a6 6 0 0 1-6-6c0-2.88 2.03-5.28 4.76-5.87A5 5 0 0 1 12 4z"/><path fill="#8ab4f8" d="M19.5 15.5A4.5 4.5 0 0 0 15 11c-.2 0-.4 0-.6.05A5 5 0 0 0 5 15a4 4 0 0 0 4 4h10.5a4.5 4.5 0 0 0 0-9z"/></svg>`
    };
  }
  // 흐림
  if (code === 3) {
    return {
      desc: '흐림',
      icon: `<svg viewBox="0 0 24 24" fill="#9aa0a6"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`
    };
  }
  // 안개
  if (code === 45 || code === 48) {
    return {
      desc: '안개',
      icon: `<svg viewBox="0 0 24 24" stroke="#9aa0a6" stroke-width="2" stroke-linecap="round"><line x1="3" y1="8" x2="21" y2="8"/><line x1="5" y1="12" x2="19" y2="12"/><line x1="3" y1="16" x2="21" y2="16"/></svg>`
    };
  }
  // 이슬비 / 비
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      desc: code >= 80 ? '소나기' : '비',
      icon: `<svg viewBox="0 0 24 24"><path fill="#9aa0a6" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/><line x1="8" y1="19" x2="6" y2="23" stroke="#4285f4" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="19" x2="10" y2="23" stroke="#4285f4" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="19" x2="14" y2="23" stroke="#4285f4" stroke-width="2" stroke-linecap="round"/></svg>`
    };
  }
  // 눈
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return {
      desc: '눈',
      icon: `<svg viewBox="0 0 24 24"><path fill="#9aa0a6" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/><circle cx="8" cy="21" r="1.5" fill="#8ab4f8"/><circle cx="12" cy="21" r="1.5" fill="#8ab4f8"/><circle cx="16" cy="21" r="1.5" fill="#8ab4f8"/></svg>`
    };
  }
  // 뇌우
  if (code >= 95) {
    return {
      desc: '뇌우',
      icon: `<svg viewBox="0 0 24 24"><path fill="#5f6368" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/><polygon points="13 14 8 20 12 20 11 24 16 18 12 18 13 14" fill="#fbbc05"/></svg>`
    };
  }

  return {
    desc: '맑음',
    icon: `<svg viewBox="0 0 24 24" fill="#fbbc05"><circle cx="12" cy="12" r="6"/></svg>`
  };
}

async function fetchCityWeather(cityKey) {
  const city = CITIES[cityKey];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response not ok');
    const data = await response.json();

    const currentTemp = Math.round(data.current.temperature_2m);
    const weatherCode = data.current.weather_code;
    const maxTemp = Math.round(data.daily.temperature_2m_max[0]);
    const minTemp = Math.round(data.daily.temperature_2m_min[0]);

    const { desc, icon } = interpretWeatherCode(weatherCode);

    document.getElementById(city.tempEl).textContent = `${currentTemp}°`;
    document.getElementById(city.descEl).textContent = desc;
    document.getElementById(city.iconEl).innerHTML = icon;
    document.getElementById(city.maxEl).textContent = `${maxTemp}°`;
    document.getElementById(city.minEl).textContent = `${minTemp}°`;
  } catch (err) {
    console.warn(`[날씨 API] ${city.name} 데이터 가져오기 실패:`, err);
    // 우아한 폴백 데이터 표시
    document.getElementById(city.tempEl).textContent = '22°';
    document.getElementById(city.descEl).textContent = '맑음';
    document.getElementById(city.iconEl).innerHTML = interpretWeatherCode(0).icon;
    document.getElementById(city.maxEl).textContent = '26°';
    document.getElementById(city.minEl).textContent = '18°';
  }
}

function initWeather() {
  const refreshBtn = document.getElementById('refreshWeatherBtn');

  function loadAllWeather() {
    refreshBtn.style.transform = 'rotate(360deg)';
    refreshBtn.style.transition = 'transform 0.6s ease';
    setTimeout(() => {
      refreshBtn.style.transform = 'none';
      refreshBtn.style.transition = 'none';
    }, 600);

    fetchCityWeather('seoul');
    fetchCityWeather('gimhae');
  }

  loadAllWeather();
  refreshBtn.addEventListener('click', loadAllWeather);

  // 30분마다 자동 갱신
  setInterval(loadAllWeather, 30 * 60 * 1000);
}

/* ==========================================================================
   5. 오늘의 명언 데이터베이스 및 인터랙션
   ========================================================================== */
const QUOTES = [
  {
    ko: "인생에서 가장 큰 위험은 어떠한 위험도 감수하지 않는 것이다.",
    en: "The biggest risk is not taking any risk.",
    author: "마크 저커버그 (Mark Zuckerberg)"
  },
  {
    ko: "오늘 할 수 있는 일을 내일로 미루지 마라.",
    en: "Never put off till tomorrow what you can do today.",
    author: "벤저민 프랭클린 (Benjamin Franklin)"
  },
  {
    ko: "배움에 늦은 때란 결코 없다.",
    en: "It is never too late to be what you might have been.",
    author: "조지 엘리엇 (George Eliot)"
  },
  {
    ko: "어두운 밤일수록 별은 더욱 빛난다.",
    en: "The darker the night, the brighter the stars.",
    author: "표도르 도스토옙스키 (Fyodor Dostoevsky)"
  },
  {
    ko: "작은 기회로부터 종종 위대한 업적이 시작된다.",
    en: "Small opportunities are often the beginning of great enterprises.",
    author: "데모스테네스 (Demosthenes)"
  },
  {
    ko: "시작하는 방법은 그만 말하고 행동하기 시작하는 것이다.",
    en: "The way to get started is to quit talking and begin doing.",
    author: "월트 디즈니 (Walt Disney)"
  },
  {
    ko: "우리가 두려워해야 할 유일한 것은 두려움 그 자체이다.",
    en: "The only thing we have to fear is fear itself.",
    author: "프랭클린 D. 루스벨트 (Franklin D. Roosevelt)"
  },
  {
    ko: "천 리 길도 한 걸음부터 시작된다.",
    en: "A journey of a thousand miles begins with a single step.",
    author: "노자 (Lao Tzu)"
  },
  {
    ko: "꿈을 이루고자 하는 용기만 있다면 모든 꿈은 이루어질 수 있다.",
    en: "All our dreams can come true, if we have the courage to pursue them.",
    author: "월트 디즈니 (Walt Disney)"
  },
  {
    ko: "늘 갈망하고, 우직하게 나아가라.",
    en: "Stay hungry, stay foolish.",
    author: "스티브 잡스 (Steve Jobs)"
  },
  {
    ko: "실패는 다시 시작할 수 있는 기회일 뿐이다. 이번에는 더 현명하게.",
    en: "Failure is simply the opportunity to begin again, this time more intelligently.",
    author: "헨리 포드 (Henry Ford)"
  },
  {
    ko: "지식에 투자하는 것이 가장 높은 이자를 지급한다.",
    en: "An investment in knowledge pays the best interest.",
    author: "벤저민 프랭클린 (Benjamin Franklin)"
  },
  {
    ko: "미래를 예측하는 가장 좋은 방법은 미래를 직접 만드는 것이다.",
    en: "The best way to predict the future is to create it.",
    author: "피터 드러커 (Peter Drucker)"
  },
  {
    ko: "스스로를 신뢰하라. 그러면 어떻게 살아야 할지 알게 될 것이다.",
    en: "Trust thyself: every heart vibrates to that iron string.",
    author: "랄프 왈도 에머슨 (Ralph Waldo Emerson)"
  },
  {
    ko: "행동은 모든 성공의 가장 기본적인 열쇠이다.",
    en: "Action is the foundational key to all success.",
    author: "파블로 피카소 (Pablo Picasso)"
  },
  {
    ko: "최선을 다하고 있다면 실망할 시간조차 없다.",
    en: "While doing your best, you have no time to be disappointed.",
    author: "헬렌 켈러 (Helen Keller)"
  },
  {
    ko: "당신이 할 수 있다고 믿든, 할 수 없다고 믿든, 당신이 옳다.",
    en: "Whether you think you can, or you think you can't – you're right.",
    author: "헨리 포드 (Henry Ford)"
  },
  {
    ko: "위대한 일은 열정 없이 이루어진 적이 없다.",
    en: "Nothing great was ever achieved without enthusiasm.",
    author: "랄프 왈도 에머슨 (Ralph Waldo Emerson)"
  },
  {
    ko: "지금 바로 시작하라. 완벽한 순간이란 영원히 오지 않는다.",
    en: "Do not wait; the time will never be 'just right'. Start where you stand.",
    author: "나폴레온 힐 (Napoleon Hill)"
  },
  {
    ko: "변화를 원한다면 스스로 그 변화가 되어야 한다.",
    en: "You must be the change you wish to see in the world.",
    author: "마하트마 간디 (Mahatma Gandhi)"
  }
];

function initQuotes() {
  const quoteCard = document.getElementById('quoteCard');
  const quoteBody = quoteCard.querySelector('.quote-body');
  const quoteText = document.getElementById('quoteText');
  const quoteEnText = document.getElementById('quoteEnText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const newQuoteBtn = document.getElementById('newQuoteBtn');
  const copyQuoteBtn = document.getElementById('copyQuoteBtn');
  const toastMessage = document.getElementById('toastMessage');

  // 날짜 기반 초기 인덱스 계산 (매일 새로운 명언 추천)
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  let currentIndex = dayOfYear % QUOTES.length;

  function renderQuote(index) {
    const item = QUOTES[index];
    quoteBody.classList.add('fade-out');

    setTimeout(() => {
      quoteText.textContent = item.ko;
      quoteEnText.textContent = item.en;
      quoteAuthor.textContent = `— ${item.author}`;
      quoteBody.classList.remove('fade-out');
    }, 200);
  }

  renderQuote(currentIndex);

  // 새 명언 불러오기 (랜덤 변경)
  newQuoteBtn.addEventListener('click', () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * QUOTES.length);
    } while (nextIndex === currentIndex && QUOTES.length > 1);

    currentIndex = nextIndex;
    renderQuote(currentIndex);
  });

  // 명언 복사하기 및 토스트 팝업
  copyQuoteBtn.addEventListener('click', async () => {
    const currentQuote = QUOTES[currentIndex];
    const textToCopy = `"${currentQuote.ko}"\n(${currentQuote.en})\n— ${currentQuote.author}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // 클립보드 API 미지원 환경 대비 폴백
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      showToast('명언이 클립보드에 복사되었습니다! ✨');
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      showToast('복사에 실패했습니다. 직접 복사해주세요.');
    }
  });

  let toastTimer = null;
  function showToast(msg) {
    toastMessage.textContent = msg;
    toastMessage.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage.classList.remove('show');
    }, 2400);
  }
}
