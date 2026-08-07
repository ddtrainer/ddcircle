import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { en, loadLocale, getLocale, isSupported, detectLocale, FALLBACK } from './locales';

const LangContext = createContext(null);

const STORAGE_KEY = 'ddcircle.lang';

// 저장된 언어 → 없으면 기기 언어 → 그래도 없으면 영어.
// (이전 버전은 기본이 한국어였는데, 글로벌 앱이라 기기 언어를 따르는 게 맞다.
//  이미 한국어를 쓰던 사용자는 저장값이 있으므로 그대로 유지된다.)
function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isSupported(saved)) return saved;
  } catch { /* ignore */ }
  return detectLocale();
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  // 활성 언어 사전. 로드 전에는 영어로 표시되다가 도착하면 교체된다(빈 화면 없음).
  const [dict, setDict] = useState(() => (initialLang() === 'en' ? en : null));

  // 언어가 바뀌면 해당 사전을 불러온다. 늦게 도착한 응답이 최신 선택을 덮지 않도록 가드.
  useEffect(() => {
    let cancelled = false;
    loadLocale(lang).then((d) => { if (!cancelled) setDict(d); });
    return () => { cancelled = true; };
  }, [lang]);

  // 문서 속성 동기화 — 폰트(body[data-lang])와 RTL 배치(dir)에 쓰인다.
  useEffect(() => {
    const meta = getLocale(lang);
    document.body.setAttribute('data-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
  }, [lang]);

  const setLang = useCallback((next) => {
    if (isSupported(next)) setLangState(next);
  }, []);

  // 번역 함수 — 해당 언어에 값이 없으면 영어로, 그것도 없으면 키 자체를 돌려준다.
  // 부분 번역 상태에서도 화면이 비지 않게 하는 안전장치.
  const t = useCallback((key, vars) => {
    let str = (dict && dict[key]) ?? en[key] ?? key;
    if (vars && typeof str === 'string') {
      Object.keys(vars).forEach((k) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
      });
    }
    return str;
  }, [dict]);

  const value = useMemo(() => ({
    lang,
    setLang,
    t,
    dir: getLocale(lang).dir,
    // 기존 코드가 lang === 'ko' 로 분기하던 곳을 위한 보조값.
    // 한국어 외 언어는 영어 문안을 쓰도록 한다(법적 문서 등).
    isKo: lang === 'ko',
  }), [lang, setLang, t]);

  return (
    <LangContext.Provider value={value}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}

export { FALLBACK };
