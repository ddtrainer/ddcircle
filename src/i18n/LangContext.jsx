import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { translations } from './translations';

const LangContext = createContext(null);

const STORAGE_KEY = 'ddcircle.lang';

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'ko' ? saved : 'ko';
  });

  // body[data-lang]에 동기화 → 폰트가 EN/KO에 맞춰 바뀜
  useEffect(() => {
    document.body.setAttribute('data-lang', lang);
    document.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  }, [lang]);

  const setLang = useCallback((next) => {
    if (next === 'ko' || next === 'en') setLangState(next);
  }, []);

  // 번역 함수: t('key') 또는 t('key', { x: 2 })로 {x} 치환
  const t = useCallback((key, vars) => {
    const dict = translations[lang] || translations.ko;
    let str = dict[key] ?? key;
    if (vars && typeof str === 'string') {
      Object.keys(vars).forEach((k) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
      });
    }
    return str;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
