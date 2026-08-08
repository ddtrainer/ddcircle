// 공유 카드(OG) 다국어화 — Vercel Edge Middleware.
//
// 카카오톡·페이스북·텔레그램의 링크 미리보기는 크롤러가 만든다. 크롤러는 자바스크립트를
// 실행하지 않고 응답 HTML의 <meta property="og:*">만 읽으므로, SPA가 아무리 언어를 바꿔도
// 미리보기 문구는 index.html에 박힌 한 가지 언어로 고정된다. 언어별로 다른 카드를 보내려면
// 서버가 HTML을 내보낼 때 태그 자체를 바꿔주는 수밖에 없다.
//
// 공유 링크에는 보내는 사람의 언어가 ?lang= 으로 실려 있다(AppContext의 inviteLink 참고).
// 그 값이 없으면 크롤러의 Accept-Language, 그것도 없으면 영어로 떨어진다.
//
// 실패하면 아무것도 반환하지 않아 원래의 정적 index.html이 그대로 나간다 — 이 미들웨어가
// 죽어도 서비스는 멈추지 않는다.

export const config = { matcher: '/' };

const FALLBACK = 'en';

// og:title / og:description — 번역이 있는 6개 언어. 나머지는 영어로 나간다.
const OG = {
  ko: {
    title: 'DDCircle — 1분 운동, 깊은 심호흡, 서로의 에너지',
    desc: '매일 3분, 함께 호흡하는 작은 의식. 1분 짧게 운동하고 깊게 심호흡하고 서로의 에너지를 나눠요.',
  },
  en: {
    title: 'DDCircle — 1-minute move, deep breath, shared energy',
    desc: 'Three minutes a day, a small ritual we share. Move for a minute, breathe deeply, and share energy with each other.',
  },
  vi: {
    title: 'DDCircle — vận động 1 phút, hít thở sâu, sẻ chia năng lượng',
    desc: 'Ba phút mỗi ngày, một nghi thức nhỏ ta cùng giữ. Vận động một phút, hít thở thật sâu và trao nhau năng lượng.',
  },
  zh: {
    title: 'DDCircle — 1分钟运动、深呼吸、分享能量',
    desc: '每天三分钟，一起坚持的小仪式。活动一分钟，深深呼吸，彼此分享能量。',
  },
  id: {
    title: 'DDCircle — gerak 1 menit, napas dalam, berbagi energi',
    desc: 'Tiga menit setiap hari, ritual kecil yang kita jalani bersama. Bergerak semenit, bernapas dalam, dan saling berbagi energi.',
  },
  es: {
    title: 'DDCircle — 1 minuto de movimiento, respiración profunda, energía compartida',
    desc: 'Tres minutos al día, un pequeño ritual que compartimos. Muévete un minuto, respira hondo y comparte energía con los demás.',
  },
};

function pickLang(param, acceptLanguage) {
  if (param && OG[param]) return param;
  // Accept-Language: "ko-KR,ko;q=0.9,en;q=0.8" → 앞에서부터 지원 언어를 찾는다
  if (acceptLanguage) {
    for (const part of acceptLanguage.split(',')) {
      const code = part.split(';')[0].trim().toLowerCase().split('-')[0];
      if (OG[code]) return code;
    }
  }
  return FALLBACK;
}

// 속성값 안에 들어가므로 따옴표와 꺾쇠만 막으면 충분하다
function attr(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// content="..." 부분만 교체 — 해당 meta 태그가 없으면 원문을 그대로 둔다
function setMeta(html, attrName, key, value) {
  const re = new RegExp(
    `(<meta\\s+${attrName}=["']${key}["']\\s+content=["'])[^"']*(["'])`,
    'i',
  );
  return re.test(html) ? html.replace(re, `$1${attr(value)}$2`) : html;
}

export default async function middleware(request) {
  try {
    const url = new URL(request.url);
    const lang = pickLang(
      url.searchParams.get('lang'),
      request.headers.get('accept-language'),
    );
    if (lang === 'ko') return; // 정적 index.html이 이미 한국어 — 건드릴 필요 없음

    // matcher가 '/'뿐이라 이 요청은 미들웨어를 다시 타지 않는다
    const res = await fetch(new URL('/index.html', url.origin));
    if (!res.ok) return;
    let html = await res.text();

    const { title, desc } = OG[lang] || OG[FALLBACK];
    html = setMeta(html, 'property', 'og:title', title);
    html = setMeta(html, 'property', 'og:description', desc);
    html = setMeta(html, 'name', 'twitter:title', title);
    html = setMeta(html, 'name', 'twitter:description', desc);
    html = setMeta(html, 'name', 'description', desc);

    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        // 언어마다 다른 HTML이 나가므로 중간 캐시가 섞지 않도록 명시
        'vary': 'accept-language',
        'cache-control': 'public, max-age=0, s-maxage=300',
      },
    });
  } catch {
    return; // 어떤 이유로든 실패하면 정적 파일이 그대로 서빙된다
  }
}
