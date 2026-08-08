// 앱의 언어 코드(useLang의 lang) → Intl.DateTimeFormat 등에 쓰는 BCP-47 로케일 태그.
// 대부분은 코드가 그대로 유효한 태그지만, 필리핀어(tl)는 표준 서브태그가 fil이라
// 매핑이 필요하고, 중국어는 zh-CN을 명시해야 간체 표기가 안정적으로 나온다.
const INTL_LOCALE_MAP = { tl: 'fil-PH', zh: 'zh-CN' };

export function toIntlLocale(lang) {
  return INTL_LOCALE_MAP[lang] || lang || 'en';
}

// 일~토 순서의 한 글자(narrow) 요일 라벨 — 달력 헤더용.
// 1970-01-04는 일요일이라 기준일로 삼는다.
export function weekdayNarrowLabels(lang) {
  const formatter = new Intl.DateTimeFormat(toIntlLocale(lang), { weekday: 'narrow' });
  return [0, 1, 2, 3, 4, 5, 6].map((i) => formatter.format(new Date(1970, 0, 4 + i)));
}
