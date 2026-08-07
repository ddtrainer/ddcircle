// 지원 언어 레지스트리 — Pi Network 사용자 규모가 큰 지역 위주로 15개.
//
// 영어는 항상 번들에 포함되는 폴백이라 정적 import, 나머지는 선택될 때만 지연 로드한다
// (15개를 전부 번들에 넣으면 첫 로딩이 무거워짐).
// dir: 'rtl'인 언어(아랍어·우르두어)는 화면 배치가 오른쪽→왼쪽으로 뒤집힌다.
// font: 해당 문자를 표시할 시스템 폰트 스택. 기기에 내장된 폰트를 쓰므로 추가 다운로드가 없다.
import en from './en.js';

export const FALLBACK = 'en';
export { en };

// label은 각 언어 사용자가 자기 언어로 읽을 수 있도록 '원어 표기'를 쓴다.
export const LOCALES = [
  { code: 'en', label: 'English',           dir: 'ltr' },
  { code: 'ko', label: '한국어',             dir: 'ltr' },
  { code: 'zh', label: '中文（简体）',        dir: 'ltr' },
  { code: 'vi', label: 'Tiếng Việt',        dir: 'ltr' },
  { code: 'id', label: 'Bahasa Indonesia',  dir: 'ltr' },
  { code: 'hi', label: 'हिन्दी',              dir: 'ltr' },
  { code: 'tr', label: 'Türkçe',            dir: 'ltr' },
  { code: 'es', label: 'Español',           dir: 'ltr' },
  { code: 'pt', label: 'Português',         dir: 'ltr' },
  { code: 'ar', label: 'العربية',             dir: 'rtl' },
  { code: 'ja', label: '日本語',              dir: 'ltr' },
  { code: 'th', label: 'ไทย',                dir: 'ltr' },
  { code: 'tl', label: 'Filipino',          dir: 'ltr' },
  { code: 'bn', label: 'বাংলা',               dir: 'ltr' },
  { code: 'ur', label: 'اردو',               dir: 'rtl' },
];

export const LOCALE_CODES = LOCALES.map((l) => l.code);

export function getLocale(code) {
  return LOCALES.find((l) => l.code === code) || LOCALES[0];
}

export function isSupported(code) {
  return LOCALE_CODES.includes(code);
}

// 지연 로더 — Vite가 정적으로 분석할 수 있도록 각 경로를 문자열 리터럴로 적는다.
const loaders = {
  ko: () => import('./ko.js'),
  zh: () => import('./zh.js'),
  vi: () => import('./vi.js'),
  id: () => import('./id.js'),
  hi: () => import('./hi.js'),
  tr: () => import('./tr.js'),
  es: () => import('./es.js'),
  pt: () => import('./pt.js'),
  ar: () => import('./ar.js'),
  ja: () => import('./ja.js'),
  th: () => import('./th.js'),
  tl: () => import('./tl.js'),
  bn: () => import('./bn.js'),
  ur: () => import('./ur.js'),
};

// 해당 언어 사전을 불러온다. 영어는 이미 번들에 있고, 아직 번역 파일이 없거나
// 로드에 실패하면 빈 객체를 돌려준다 → t()가 영어로 폴백한다.
export async function loadLocale(code) {
  if (code === 'en' || !loaders[code]) return en;
  try {
    const mod = await loaders[code]();
    return mod.default || {};
  } catch {
    return {}; // 번역 파일 없음 → 영어 폴백
  }
}

// 브라우저/기기 언어 → 지원 언어 매칭. 'zh-CN' 같은 지역 코드도 앞부분으로 맞춘다.
export function detectLocale(navLangs) {
  const list = navLangs || (typeof navigator !== 'undefined'
    ? (navigator.languages || [navigator.language])
    : []);
  for (const raw of list) {
    if (!raw) continue;
    const lower = String(raw).toLowerCase();
    if (isSupported(lower)) return lower;
    const base = lower.split('-')[0];
    if (isSupported(base)) return base;
    // 중국어 번체(zh-TW/zh-HK)도 간체 사전으로 안내 — 없는 것보다 낫다
    if (base === 'zh') return 'zh';
    // 필리핀 타갈로그는 tl/fil 두 코드가 쓰인다
    if (base === 'fil') return 'tl';
  }
  return FALLBACK;
}
