// DD 레벨별 인앱 가이드 콘텐츠 (영상/방법/효과)
// 중요: 기존에 작동 중인 운동 SVG 애니메이션·호흡 프리셋은 절대 수정하지 않음.
// 방법(method)/효과(effect) 텍스트는 공식 '운동·호흡 가이드북' 원문 그대로 반영.
//   - 가이드북에 없는 'Dash Lv.1 러닝 버전'만 앱 자체 작성(앞으로 달리기 기준).
// video: null 이면 영상 없이 텍스트 가이드만 노출 (placeholder).
// searchKeywords: 가이드북 '추천 영상' 검색어. 영상 준비 전 사용자가 직접 찾아볼 수 있음.
// method: 단일 버전이면 문자열 배열. 여러 버전이면 methodSections 사용
//   ([{ heading, steps: [] }]). effect: 문자열 또는 문자열 배열(배열이면 목록 표시).

export const DEEP_GUIDE = {
  1: {
    title: '① 입문 · 자연호흡',
    video: null,
    intro: '입문자를 위한 가장 안전하고 보편적인 호흡법. 호흡에 의식을 집중하는 것만으로도 마음이 진정됩니다. 들숨보다 날숨을 길게 하면 좋습니다.',
    method: [
      '편안하게 앉거나 누워서 등을 곧게 폅니다.',
      '입을 다물고 코로만 호흡합니다.',
      '들숨과 날숨을 평소처럼 자연스럽게 이어갑니다.',
      '호흡에만 집중하고, 잡생각이 들면 다시 호흡으로 돌아옵니다.',
      '2분 동안 유지합니다.',
    ],
    effect: [
      '자율신경계 안정화로 즉각적인 마음 진정',
      '부교감신경 활성화 → 스트레스 호르몬(코르티솔) 감소',
      '명상 입문자가 호흡 알아차림(awareness)을 익히는 가장 안전한 방법',
      '일상 어디서나 즉시 적용 가능한 기본 회복 도구',
    ],
    searchKeywords: ['자연 호흡 명상', '5분 호흡 명상 입문'],
  },
  2: {
    title: '② 기본 · 신경 안정 호흡 (4-7-8)',
    video: null,
    intro: "미국 앤드류 와일 박사가 개발한 '신경계 천연 안정제'. 불면증과 불안 완화에 임상적으로 검증된 호흡법입니다.",
    method: [
      '혀끝을 윗니 뒤 입천장에 가볍게 댑니다.',
      '입으로 모든 공기를 "후~" 소리내며 완전히 내뱉습니다.',
      '입을 다물고 코로 4초 들이쉽니다.',
      '7초 동안 숨을 참습니다.',
      '입으로 "후~" 소리내며 8초 동안 내쉽니다.',
      '이 사이클을 4~6회 반복합니다 (약 2분).',
    ],
    effect: [
      '불면증 개선 — 잠들기 전 실행 시 빠른 입면 효과',
      '불안 발작·공황장애 완화에 임상적으로 검증됨',
      '7초 숨 참기가 산소·이산화탄소 균형을 맞춰 신경 안정',
      '발표·시험 직전 긴장 완화에 즉효',
    ],
    searchKeywords: ['4-7-8 호흡법', 'Dr. Andrew Weil 4-7-8 breathing'],
  },
  3: {
    title: '③ 숙련 · 멘탈 강화 호흡 (박스 브리딩)',
    video: null,
    intro: '미국 네이비 씰(특수부대)이 극한 상황에서 사용하는 호흡법. 집중력과 평정심을 동시에 끌어올립니다.',
    method: [
      '등을 곧게 펴고 어깨에 힘을 뺍니다.',
      '4초 동안 코로 들이쉽니다 (배가 부풀어 오르도록).',
      '4초 동안 숨을 멈춥니다.',
      '4초 동안 코나 입으로 내쉽니다.',
      '4초 동안 다시 숨을 멈춥니다.',
      '정사각형(박스)을 그리듯 이 4단계를 2분 동안 반복합니다.',
    ],
    effect: [
      '극한 스트레스 상황에서 평정심 유지 능력 향상',
      '집중력과 평정심을 동시에 끌어올림',
      '발표·시험·중요한 결정 전 마음을 가라앉히는 데 효과적',
      '혈압 안정화 및 두뇌 산소 공급 최적화',
    ],
    searchKeywords: ['박스 브리딩', 'Box breathing Navy SEAL'],
  },
  4: {
    title: '④ 전문 · 면역력 강화 호흡 (윔호프)',
    video: null,
    intro: "네덜란드 '아이스맨' 윔 호프가 개발한 호흡 기법. 면역력 강화와 자가 스트레스 조절 능력을 키우는 고급 호흡법입니다.",
    method: [
      '편안하게 앉거나 눕습니다.',
      '과호흡 단계: 깊게 들이쉬고 힘 빼며 내쉬기를 30회 반복합니다 (약 1분).',
      '마지막 날숨 후 가능한 만큼 숨을 참습니다 (30초~1분).',
      '회복 호흡: 크게 들이쉬고 15초 참은 후 내쉽니다.',
      '1사이클로 마무리합니다 (2분 내외).',
    ],
    effect: [
      '면역 반응 강화 — 과학 논문으로 검증됨',
      '스트레스 호르몬(아드레날린) 자가 조절 능력 향상',
      '염증 반응 억제 및 에너지 레벨 폭발적 상승',
      '추위·통증에 대한 저항력 증가',
      '심신 회복력(Resilience) 최고 수준 도달',
    ],
    searchKeywords: ['윔호프 호흡법', 'Wim Hof breathing'],
    safetyNotice: '반드시 앉거나 누운 상태에서 실시하세요. 어지러움이 발생할 수 있으므로 물속, 운전 중, 서 있는 상태에서는 절대 금지입니다.',
  },
};

export const DASH_GUIDE = {
  1: {
    title: '① 입문 · 걷기 / 러닝 / 스트레칭',
    video: null,
    methodSections: [
      {
        heading: '제자리 걷기 버전',
        steps: [
          '제자리에서 다리를 번갈아 들어올리며 걷습니다.',
          '무릎을 허리 높이까지 올리려고 노력합니다.',
          '팔도 자연스럽게 흔들어 줍니다.',
          '1분 동안 일정한 리듬으로 유지합니다.',
          '호흡은 자연스럽게 코로 들이쉬고 입으로 내쉽니다.',
        ],
      },
      {
        // 가이드북에 없는 러닝 버전 — 앱 자체 작성 (앞으로 달리기)
        heading: '러닝 버전',
        steps: [
          '가벼운 제자리 뜀뛰기로 발목과 무릎을 충분히 풀어줍니다.',
          '시선은 정면을 향하고 상체를 살짝 앞으로 기울입니다.',
          '팔꿈치를 90도로 굽혀 앞뒤로 리듬감 있게 흔듭니다.',
          '발 앞쪽으로 가볍게 착지하며 일정한 속도로 달립니다.',
          '코로 들이쉬고 입으로 내쉬며 1분 동안 유지합니다.',
        ],
      },
      {
        heading: '스트레칭 버전',
        steps: [
          '목 좌우 천천히 돌리기 (15초)',
          '어깨 위로 올렸다 내리기 (15초)',
          '허리 좌우 트위스트 (15초)',
          '양팔 위로 뻗어 옆구리 스트레칭 (15초)',
        ],
      },
    ],
    effect: [
      '운동 입문자도 부담 없이 시작 가능',
      '혈액순환 즉시 개선 → 손발 시린 느낌 완화',
      '굳어있던 관절과 근육을 깨우는 워밍업 효과',
      '사무직·재택근무자의 장시간 앉기 부담 해소',
    ],
    searchKeywords: ['1분 스트레칭', '제자리 걷기 운동'],
  },
  2: {
    title: '② 기본 · 스쿼트 / 팔굽혀펴기',
    video: null,
    methodSections: [
      {
        heading: '스쿼트 버전',
        steps: [
          '발을 어깨너비로 벌리고 발끝은 살짝 바깥쪽을 향합니다.',
          '의자에 앉듯 엉덩이를 뒤로 빼며 무릎을 굽힙니다.',
          '무릎이 발끝보다 앞으로 나가지 않게 주의합니다.',
          '허벅지가 바닥과 평행이 될 때까지 내려갔다 올라옵니다.',
          '1분 동안 천천히 반복합니다 (20~25회 목표).',
        ],
      },
      {
        heading: '팔굽혀펴기 버전',
        steps: [
          '손은 어깨너비보다 약간 넓게 바닥에 짚습니다.',
          '입문자는 무릎을 굽힌 상태로 시작해도 좋습니다.',
          '가슴이 바닥에 닿을 정도로 천천히 내려갑니다.',
          '팔로 밀어 올리며 시작 자세로 돌아옵니다.',
          '1분 동안 가능한 만큼 반복합니다.',
        ],
      },
    ],
    effect: [
      '하체·상체 대근육 활성화 → 기초대사량 증가',
      '1분 안에 심박수가 올라가 운동 효과 즉시 발휘',
      '자세 교정과 코어 근력 강화 동시 효과',
      '책상 앞 짧은 휴식 시간에 최적',
    ],
    searchKeywords: ['스쿼트 정확한 자세', '무릎 팔굽혀펴기'],
  },
  3: {
    title: '③ 숙련 · 버피 / 점핑잭',
    video: null,
    methodSections: [
      {
        heading: '버피 버전',
        steps: [
          '선 자세에서 시작합니다.',
          '쭈그려 앉으며 손을 바닥에 짚습니다.',
          '다리를 뒤로 차며 플랭크 자세를 만듭니다.',
          '다시 다리를 끌어당기며 일어섭니다.',
          '점프하며 머리 위로 손뼉을 칩니다.',
          '1분 동안 반복합니다 (10~15회 목표).',
        ],
      },
      {
        heading: '점핑잭 버전',
        steps: [
          '차렷 자세에서 시작합니다.',
          '점프하며 다리는 어깨너비로 벌리고 팔은 머리 위로 들어올립니다.',
          '다시 점프하며 차렷 자세로 돌아옵니다.',
          '리듬을 유지하며 1분 동안 빠르게 반복합니다.',
        ],
      },
    ],
    effect: [
      '전신 유산소 + 근력 운동 동시 효과',
      '심박수 급격히 상승 → 짧은 시간 최대 칼로리 소모',
      '엔도르핀 분비로 운동 후 강한 성취감',
      '1분 안에 "운동했다"는 확실한 느낌과 자신감 획득',
    ],
    searchKeywords: ['버피 운동 방법', '점핑잭 정확한 자세'],
  },
  4: {
    title: '④ 전문 · HIIT 미니 (20초×3세트)',
    video: null,
    method: [
      '세트 1 (0~20초): 버피를 최대한 빠르게 반복합니다.',
      '휴식 없이 바로 다음 세트로 이어집니다.',
      '세트 2 (20~40초): 마운틴 클라이머 — 플랭크 자세에서 무릎을 가슴으로 빠르게 번갈아 당깁니다.',
      '세트 3 (40~60초): 점핑잭을 전력으로 반복합니다.',
      '각 세트는 자신의 최대 강도로 실시합니다.',
    ],
    effect: [
      '1분이 일반 운동 10분 이상에 해당하는 압축 효과',
      '운동 후 24시간 동안 칼로리 소모 지속 (애프터번 효과)',
      '심폐지구력·근지구력 동시 향상',
      '시간 부족한 현대인을 위한 최적의 운동',
      '혈당 조절 능력과 인슐린 민감도 개선',
    ],
    searchKeywords: ['1분 HIIT', '60 second HIIT workout'],
    safetyNotice: '최고 강도 운동입니다. 심혈관 질환이 있거나 부상이 있는 분은 의사와 상담 후 시작하세요. 워밍업 없이 갑자기 진행하지 마세요.',
  },
};

// 언어별 번역 맵 — 'ko'(기본)는 위 DEEP_GUIDE/DASH_GUIDE 원문 그대로 사용.
// 각 언어 객체는 title/intro/method|methodSections/effect/safetyNotice 중 원문에 있는 필드만 담고,
// video/searchKeywords는 번역하지 않으므로 항상 한국어 원문 값을 그대로 쓴다(getGuide에서 병합).
// 번역이 없는 언어·레벨은 getGuide가 한국어 원문으로 자동 폴백한다(빈 화면보다 낫다).
export const DEEP_GUIDE_TRANSLATIONS = {
  "en": {
    "1": {
      "title": "① Beginner · Natural Breathing",
      "intro": "The safest, most universal practice for beginners. Simply bringing attention to your breath settles the mind. Letting the exhale run longer than the inhale helps.",
      "method": [
        "Sit or lie down comfortably with your back straight.",
        "Keep your mouth closed and breathe through your nose only.",
        "Let the inhale and exhale flow as naturally as they normally do.",
        "Rest your attention on the breath; when thoughts wander, come back to it.",
        "Continue for 2 minutes."
      ],
      "effect": [
        "Settles the autonomic nervous system for immediate calm",
        "Activates the parasympathetic system → lowers the stress hormone cortisol",
        "The safest way for a beginner to learn breath awareness",
        "A basic recovery tool you can reach for anywhere, anytime"
      ]
    },
    "2": {
      "title": "② Basic · Calm Nerves Breath (4-7-8)",
      "intro": "A \"natural tranquilliser for the nervous system\", developed by Dr. Andrew Weil. Clinically supported for easing insomnia and anxiety.",
      "method": [
        "Rest the tip of your tongue lightly behind your upper front teeth.",
        "Empty your lungs completely through your mouth with a \"whoosh\" sound.",
        "Close your mouth and inhale through your nose for 4 seconds.",
        "Hold your breath for 7 seconds.",
        "Exhale through your mouth for 8 seconds with a \"whoosh\".",
        "Repeat the cycle 4–6 times (about 2 minutes)."
      ],
      "effect": [
        "Eases insomnia — helps you fall asleep faster when done before bed",
        "Clinically supported for calming anxiety and panic attacks",
        "The 7-second hold balances oxygen and CO₂ to steady the nerves",
        "Works quickly to release tension before a talk or an exam"
      ]
    },
    "3": {
      "title": "③ Advanced · Mental Strength Breath (Box Breathing)",
      "intro": "The technique US Navy SEALs use under extreme pressure. It raises focus and composure at the same time.",
      "method": [
        "Straighten your back and let your shoulders drop.",
        "Inhale through your nose for 4 seconds, letting your belly expand.",
        "Hold your breath for 4 seconds.",
        "Exhale through your nose or mouth for 4 seconds.",
        "Hold again for 4 seconds.",
        "Repeat these four steps for 2 minutes, as if tracing a square."
      ],
      "effect": [
        "Builds the ability to stay composed under extreme stress",
        "Raises focus and calm together",
        "Effective for settling yourself before a talk, an exam, or a big decision",
        "Steadies blood pressure and optimises oxygen supply to the brain"
      ]
    },
    "4": {
      "title": "④ Expert · Immunity Breath (Wim Hof)",
      "intro": "A method developed by the Dutch \"Iceman\", Wim Hof. An advanced practice for strengthening immunity and self-regulating stress.",
      "method": [
        "Sit or lie down comfortably.",
        "Power breathing: inhale deeply and let the exhale fall away — 30 times (about 1 minute).",
        "After the final exhale, hold your breath as long as is comfortable (30 seconds–1 minute).",
        "Recovery breath: inhale fully, hold for 15 seconds, then release.",
        "Finish after one cycle (about 2 minutes)."
      ],
      "effect": [
        "Strengthens the immune response — supported by published research",
        "Improves self-regulation of the stress hormone adrenaline",
        "Dampens inflammation and lifts energy levels sharply",
        "Increases tolerance to cold and pain",
        "Builds mental and physical resilience to its highest level"
      ],
      "safetyNotice": "Always practise sitting or lying down. Dizziness can occur, so never do this in water, while driving, or while standing."
    }
  },
  "es": {
    "1": {
      "title": "① Introducción · Respiración Natural",
      "intro": "La forma de respirar más segura y universal para principiantes. Simplemente dirigir la conciencia a tu respiración calma la mente. Es recomendable que la exhalación sea más larga que la inhalación.",
      "method": [
        "Siéntate o acuéstate cómodamente con la espalda recta.",
        "Mantén la boca cerrada y respira solo por la nariz.",
        "Deja que la inhalación y la exhalación fluyan de forma natural y espontánea.",
        "Concentra tu atención en la respiración; cuando los pensamientos divaguen, vuelve a ella.",
        "Mantén la práctica durante 2 minutos."
      ],
      "effect": [
        "Estabiliza el sistema nervioso autónomo para una calma inmediata",
        "Activa el sistema parasimpático → reduce el cortisol (hormona del estrés)",
        "La forma más segura para que un principiante aprenda la conciencia del aliento",
        "Una herramienta de recuperación básica que puedes usar en cualquier momento y lugar"
      ]
    },
    "2": {
      "title": "② Básico · Respiración para Calmar los Nervios (4-7-8)",
      "intro": "El 'tranquilizante natural del sistema nervioso', desarrollado por el Dr. Andrew Weil. Respaldada clínicamente para aliviar el insomnio y la ansiedad.",
      "method": [
        "Coloca la punta de la lengua ligeramente detrás de los dientes superiores.",
        "Exhala todo el aire de los pulmones completamente por la boca con un sonido 'jua~'.",
        "Cierra la boca e inhala por la nariz durante 4 segundos.",
        "Aguanta la respiración durante 7 segundos.",
        "Exhala por la boca durante 8 segundos con un sonido 'jua~'.",
        "Repite este ciclo de 4 a 6 veces (aproximadamente 2 minutos)."
      ],
      "effect": [
        "Alivia el insomnio — ayuda a conciliar el sueño más rápidamente antes de acostarse",
        "Respaldada clínicamente para calmar la ansiedad y los ataques de pánico",
        "La pausa de 7 segundos equilibra el oxígeno y el dióxido de carbono para estabilizar los nervios",
        "Funciona rápidamente para aliviar la tensión antes de una presentación o examen"
      ]
    },
    "3": {
      "title": "③ Avanzado · Respiración para Fortaleza Mental (Box Breathing)",
      "intro": "La técnica que utiliza la Marina de EE.UU. (Navy SEAL) bajo presión extrema. Eleva la concentración y la serenidad al mismo tiempo.",
      "method": [
        "Endereza la espalda y relaja los hombros.",
        "Inhala por la nariz durante 4 segundos, dejando que el abdomen se expanda.",
        "Aguanta la respiración durante 4 segundos.",
        "Exhala por la nariz o la boca durante 4 segundos.",
        "Aguanta la respiración durante otros 4 segundos.",
        "Repite estos cuatro pasos durante 2 minutos, como si estuvieras trazando un cuadrado."
      ],
      "effect": [
        "Desarrolla la capacidad de mantener la serenidad bajo estrés extremo",
        "Eleva la concentración y la calma simultáneamente",
        "Efectivo para tranquilizarte antes de una presentación, un examen o una decisión importante",
        "Estabiliza la presión arterial y optimiza el suministro de oxígeno al cerebro"
      ]
    },
    "4": {
      "title": "④ Experto · Respiración para Fortalecer la Inmunidad (Wim Hof)",
      "intro": "Un método desarrollado por el 'Hombre de Hielo' holandés, Wim Hof. Una práctica avanzada para fortalecer la inmunidad y autorregular el estrés.",
      "method": [
        "Siéntate o acuéstate cómodamente.",
        "Respiración potente: inhala profundamente y deja que la exhalación caiga — 30 veces (aproximadamente 1 minuto).",
        "Después de la última exhalación, aguanta la respiración el tiempo que sea cómodo (30 segundos a 1 minuto).",
        "Respiración de recuperación: inhala completamente, aguanta durante 15 segundos, luego exhala.",
        "Finaliza después de un ciclo (aproximadamente 2 minutos)."
      ],
      "effect": [
        "Fortalece la respuesta inmunológica — respaldado por investigación científica publicada",
        "Mejora la autorregulación de la adrenalina (hormona del estrés)",
        "Reduce la inflamación y eleva los niveles de energía drásticamente",
        "Aumenta la tolerancia al frío y al dolor",
        "Construye la resiliencia mental y física en su nivel más alto"
      ],
      "safetyNotice": "Siempre practica sentado o acostado. Puede ocurrir mareo, así que nunca lo hagas en el agua, mientras conduces o mientras estás de pie."
    }
  },
  "vi": {
    "1": {
      "title": "① Người mới · Hô hấp tự nhiên",
      "intro": "Kỹ thuật hô hấp an toàn và phổ biến nhất dành cho người mới bắt đầu. Chỉ cần tập trung ý thức vào hô hấp cũng có thể làm dịu tâm trí của bạn. Nên để hơi thở ra dài hơn hơi thở vào.",
      "method": [
        "Ngồi hoặc nằm thoải mái với lưng thẳng.",
        "Đóng miệng và chỉ hô hấp qua mũi.",
        "Để hơi thở vào và ra chảy tự nhiên như bình thường.",
        "Tập trung vào hô hấp; khi có suy nghĩ lạc, hãy quay trở lại hô hấp.",
        "Duy trì trong 2 phút."
      ],
      "effect": [
        "Làm dịu hệ thần kinh tự động để bình tâm ngay lập tức",
        "Kích hoạt hệ thần kinh phó giao cảm → giảm hormone căng thẳng (cortisol)",
        "Cách an toàn nhất để người mới bắt đầu thiền học cách nhận thức hô hấp",
        "Công cụ phục hồi cơ bản bạn có thể sử dụng bất cứ lúc nào, ở bất cứ đâu"
      ]
    },
    "2": {
      "title": "② Cơ bản · Hô hấp Ổn định Thần kinh (4-7-8)",
      "intro": "'Thuốc tự nhiên ổn định hệ thần kinh' được phát triển bởi Tiến sĩ Andrew Weil từ Mỹ. Kỹ thuật hô hấp được chứng minh lâm sàng giúp làm dịu chứng mất ngủ và lo lắng.",
      "method": [
        "Đặt đầu lưỡi nhẹ nhàng phía sau những chiếc răng trên.",
        "Thở ra hoàn toàn qua miệng với âm thanh 'hhh'.",
        "Đóng miệng và hít vào qua mũi trong 4 giây.",
        "Giữ hơi thở trong 7 giây.",
        "Thở ra qua miệng với âm thanh 'hhh' trong 8 giây.",
        "Lặp lại chu kỳ này 4-6 lần (khoảng 2 phút)."
      ],
      "effect": [
        "Cải thiện chứng mất ngủ — giúp ngủ nhanh hơn khi thực hiện trước khi đi ngủ",
        "Được chứng minh lâm sàng giúp làm dịu cơn hoảng loạn và rối loạn lo âu",
        "Nắm giữ 7 giây cân bằng oxy và carbon dioxide để ổn định thần kinh",
        "Có hiệu quả nhanh chóng để giải tỏa căng thẳng trước bài thuyết trình hoặc kỳ thi"
      ]
    },
    "3": {
      "title": "③ Thành thạo · Hô hấp Tăng cường Tinh thần (Hô hấp Hộp)",
      "intro": "Kỹ thuật hô hấp được các đặc nhiệm Navy SEAL Mỹ sử dụng trong tình huống cực đoan. Nâng cao sự tập trung và bình tĩnh cùng một lúc.",
      "method": [
        "Thẳng lưng và thả lỏng vai.",
        "Hít vào qua mũi trong 4 giây (bụng phồng lên).",
        "Giữ hơi thở trong 4 giây.",
        "Thở ra qua mũi hoặc miệng trong 4 giây.",
        "Giữ hơi thở lại trong 4 giây.",
        "Lặp lại 4 bước này trong 2 phút, như vẽ một hình vuông."
      ],
      "effect": [
        "Cải thiện khả năng duy trì bình tĩnh trong tình huống căng thẳng cực đoan",
        "Nâng cao sự tập trung và bình tĩnh cùng một lúc",
        "Hiệu quả trong việc xoa dịu tâm trí trước bài thuyết trình, kỳ thi hoặc quyết định quan trọng",
        "Ổn định huyết áp và tối ưu hóa lưu lượng oxy đến não"
      ]
    },
    "4": {
      "title": "④ Chuyên gia · Hô hấp Tăng cường Miễn dịch (Wim Hof)",
      "intro": "Kỹ thuật hô hấp được phát triển bởi 'Người Băng' Wim Hof từ Hà Lan. Một kỹ thuật hô hấp nâng cao để tăng cường miễn dịch và phát triển khả năng tự điều chỉnh căng thẳng.",
      "method": [
        "Ngồi hoặc nằm thoải mái.",
        "Giai đoạn hô hấp sâu: lặp lại hít vào sâu và thở ra với lực 30 lần (khoảng 1 phút).",
        "Sau hơi thở cuối cùng, giữ hơi thở lâu nhất có thể (30 giây đến 1 phút).",
        "Hô hấp phục hồi: hít vào sâu, giữ trong 15 giây, rồi thả ra.",
        "Hoàn thành sau một chu kỳ (khoảng 2 phút)."
      ],
      "effect": [
        "Tăng cường đáp ứng miễn dịch — được chứng minh bằng nghiên cứu khoa học",
        "Cải thiện khả năng tự điều chỉnh hormone căng thẳng (adrenaline)",
        "Ngăn chặn viêm và tăng năng lượng đột phá",
        "Tăng khả năng chịu đựng lạnh và đau",
        "Đạt mức cao nhất của khả năng phục hồi tinh thần và thể chất"
      ],
      "safetyNotice": "Luôn thực hiện khi đang ngồi hoặc nằm. Vì có thể bị chóng mặt, tuyệt đối không thực hiện trong nước, khi lái xe, hoặc khi đứng."
    }
  },
  "zh": {
    "1": {
      "title": "① 入门 · 自然呼吸",
      "intro": "最安全、最通用的初学者呼吸法。只要将意识集中在呼吸上，心灵就能获得平静。让呼气比吸气更长时间效果更好。",
      "method": [
        "舒服地坐着或躺着，保持背部挺直。",
        "闭上嘴巴，只用鼻子呼吸。",
        "让吸气和呼气自然地流动，和平时一样。",
        "将注意力集中在呼吸上；如果思绪飘离，就温和地将注意力带回呼吸。",
        "坚持2分钟。"
      ],
      "effect": [
        "自主神经系统稳定，立即获得心灵平静",
        "激活副交感神经 → 减少压力激素（皮质醇）",
        "初学者学习呼吸觉知最安全的方法",
        "随时随地都能使用的基本恢复工具"
      ]
    },
    "2": {
      "title": "② 基本 · 神经安定呼吸（4-7-8）",
      "intro": "美国医学博士安德鲁·韦尔开发的'天然神经系统安定剂'。这种呼吸法在临床上已被证实可以缓解失眠和焦虑。",
      "method": [
        "将舌尖轻轻抵在上排牙齿后方的口腔顶部。",
        "用'呼~'的声音从嘴里完全呼出所有空气。",
        "闭上嘴巴，用鼻子吸4秒钟。",
        "屏住呼吸7秒钟。",
        "用'呼~'的声音从嘴里呼气8秒钟。",
        "重复这个循环4-6次（约2分钟）。"
      ],
      "effect": [
        "改善失眠——睡前进行可快速入眠",
        "在临床上被证实可缓解焦虑发作和惊恐障碍",
        "7秒的屏息可平衡氧气和二氧化碳，使神经系统稳定",
        "演讲或考试前快速缓解紧张"
      ]
    },
    "3": {
      "title": "③ 熟练 · 心理强化呼吸（方形呼吸法）",
      "intro": "美国海军特种部队在极端压力下使用的呼吸法。它可以同时提升专注力和镇定力。",
      "method": [
        "挺直背部，放松肩膀。",
        "用鼻子吸4秒钟（让腹部鼓起）。",
        "屏住呼吸4秒钟。",
        "用鼻子或嘴用4秒钟呼气。",
        "再屏住呼吸4秒钟。",
        "像画一个正方形一样，重复这4个步骤2分钟。"
      ],
      "effect": [
        "在极端压力下保持镇定的能力提升",
        "同时提升专注力和平静心境",
        "演讲、考试或重要决定前有效稳定心绪",
        "血压稳定并优化脑部氧气供应"
      ]
    },
    "4": {
      "title": "④ 专家 · 免疫力强化呼吸（威姆霍夫呼吸法）",
      "intro": "荷兰'冰人'威姆·霍夫开发的呼吸技巧。这是一种强化免疫力和自我压力调节能力的高级呼吸法。",
      "method": [
        "舒服地坐着或躺下。",
        "过度换气阶段：深深吸气，用力呼气，重复30次（约1分钟）。",
        "最后一次呼气后，尽可能长地屏住呼吸（30秒至1分钟）。",
        "恢复呼吸：深深吸气，屏住15秒，然后呼出。",
        "1个循环后结束（约2分钟）。"
      ],
      "effect": [
        "免疫反应强化——已被科学论文验证",
        "压力激素（肾上腺素）自我调节能力提升",
        "抑制炎症反应，能量水平急剧上升",
        "对寒冷和疼痛的抗性增加",
        "心身恢复力达到最高水平"
      ],
      "safetyNotice": "必须在坐着或躺着的状态下进行。可能会产生眩晕，因此在水中、驾驶中或站立状态下绝对禁止。"
    }
  },
  "id": {
    "1": {
      "title": "① Pemula · Pernapasan Alami",
      "intro": "Teknik pernapasan paling aman dan universal untuk pemula. Hanya dengan memusatkan kesadaran pada napas, pikiran akan menjadi tenang. Baik untuk membuat napas keluar lebih panjang dari napas masuk.",
      "method": [
        "Duduk atau berbaring dengan nyaman, punggung lurus.",
        "Tutup mulut dan bernapas melalui hidung saja.",
        "Biarkan napas masuk dan keluar mengalir dengan alami seperti biasanya.",
        "Pusatkan perhatian pada napas; jika pikiran berkeliaran, kembalikan pada napas.",
        "Pertahankan selama 2 menit."
      ],
      "effect": [
        "Menstabilkan sistem saraf otonom untuk ketenangan langsung",
        "Mengaktifkan saraf parasimpatik → menurunkan hormon stres (kortisol)",
        "Cara paling aman bagi pemula untuk belajar kesadaran napas",
        "Alat pemulihan dasar yang bisa Anda gunakan kapan saja, di mana saja"
      ]
    },
    "2": {
      "title": "② Dasar · Pernapasan Penenang Saraf (4-7-8)",
      "intro": "\"Penenang alami sistem saraf\" yang dikembangkan oleh Dr. Andrew Weil. Terbukti secara klinis efektif untuk meringankan insomnia dan kecemasan.",
      "method": [
        "Letakkan ujung lidah dengan lembut di belakang gigi depan atas.",
        "Kosongkan semua udara dari paru-paru melalui mulut dengan suara \"whoosh\".",
        "Tutup mulut dan hirup melalui hidung selama 4 detik.",
        "Tahan napas selama 7 detik.",
        "Hembuskan melalui mulut selama 8 detik dengan suara \"whoosh\".",
        "Ulangi siklus ini 4-6 kali (sekitar 2 menit)."
      ],
      "effect": [
        "Meringankan insomnia — membantu Anda tertidur lebih cepat jika dilakukan sebelum tidur",
        "Terbukti secara klinis untuk menenangkan kecemasan dan serangan panik",
        "Tahan napas 7 detik menyeimbangkan oksigen dan CO₂ untuk menstabilkan saraf",
        "Bekerja cepat meredakan ketegangan sebelum presentasi atau ujian"
      ]
    },
    "3": {
      "title": "③ Lanjutan · Pernapasan Penguatan Mental (Box Breathing)",
      "intro": "Teknik yang digunakan oleh Navy SEAL Amerika di bawah tekanan ekstrem. Meningkatkan fokus dan ketenangan di saat yang bersamaan.",
      "method": [
        "Tegakkan punggung dan lepaskan ketegangan dari bahu.",
        "Hirup melalui hidung selama 4 detik, biarkan perut mengembang.",
        "Tahan napas selama 4 detik.",
        "Hembuskan melalui hidung atau mulut selama 4 detik.",
        "Tahan lagi selama 4 detik.",
        "Ulangi keempat langkah ini selama 2 menit, seolah-olah menggambar persegi."
      ],
      "effect": [
        "Membangun kemampuan tetap tenang di bawah stres ekstrem",
        "Meningkatkan fokus dan ketenangan bersama-sama",
        "Efektif untuk menenangkan diri sebelum presentasi, ujian, atau keputusan besar",
        "Menstabilkan tekanan darah dan mengoptimalkan pasokan oksigen ke otak"
      ]
    },
    "4": {
      "title": "④ Ahli · Pernapasan Penguatan Imunitas (Wim Hof)",
      "intro": "Metode yang dikembangkan oleh \"Iceman\" Belanda, Wim Hof. Praktik lanjutan untuk memperkuat imunitas dan kemampuan mengatur stres sendiri.",
      "method": [
        "Duduk atau berbaring dengan nyaman.",
        "Pernapasan kuat: hirup dalam-dalam dan biarkan napas keluar dengan mudah — ulangi 30 kali (sekitar 1 menit).",
        "Setelah napas keluar terakhir, tahan napas selama mungkin (30 detik-1 menit).",
        "Napas pemulihan: hirup penuh, tahan selama 15 detik, lalu lepaskan.",
        "Selesaikan setelah satu siklus (sekitar 2 menit)."
      ],
      "effect": [
        "Memperkuat respons imun — didukung oleh penelitian yang dipublikasikan",
        "Meningkatkan pengaturan diri hormon stres adrenalin",
        "Menekan peradangan dan meningkatkan tingkat energi dengan tajam",
        "Meningkatkan toleransi terhadap dingin dan rasa sakit",
        "Membangun ketahanan mental dan fisik ke tingkat tertinggi"
      ],
      "safetyNotice": "Selalu lakukan dalam posisi duduk atau berbaring. Pusing dapat terjadi, jadi jangan pernah melakukan ini di dalam air, saat berkendara, atau saat berdiri."
    }
  },
  "hi": {
    "1": {
      "title": "① प्रवेश · स्वाभाविक श्वास",
      "intro": "शुरुआत करने वाले के लिए सबसे सुरक्षित और सर्वव्यापी श्वास तकनीक। अपनी श्वास पर ध्यान केंद्रित करने मात्र से आपका मन शांत हो जाता है। सांस लेने की तुलना में सांस छोड़ते समय लंबी सांस लेना अच्छा है।",
      "method": [
        "आराम से बैठें या लेटें, अपनी पीठ को सीधा रखें।",
        "मुंह बंद रखें और केवल नाक से सांस लें।",
        "सांस को स्वाभाविक रूप से प्रवाहित होने दें, जैसे आप सामान्य रूप से करते हैं।",
        "अपनी श्वास पर ध्यान केंद्रित रखें; जब विचार आएं, तो श्वास पर लौट आएं।",
        "2 मिनट के लिए जारी रखें।"
      ],
      "effect": [
        "स्वायत्त तंत्रिका तंत्र को स्थिर करके तुरंत मन को शांत करता है",
        "पैरासिम्पेथेटिक तंत्रिका को सक्रिय करता है → तनाव हार्मोन (कोर्टिसोल) कम करता है",
        "ध्यान के शुरुआती के लिए श्वास जागरूकता सीखने का सबसे सुरक्षित तरीका",
        "आपके दैनिक जीवन में कहीं भी तुरंत लागू किया जा सकने वाला बुनियादी पुनः प्राप्ति उपकरण"
      ]
    },
    "2": {
      "title": "② बुनियादी · तंत्रिका शांति श्वास (4-7-8)",
      "intro": "अमेरिकी डॉ. एंड्रयू वेल द्वारा विकसित 'तंत्रिका तंत्र के लिए प्राकृतिक शांतिदायक'। अनिद्रा और चिंता से राहत के लिए नैदानिक रूप से सिद्ध श्वास तकनीक है।",
      "method": [
        "अपनी जीभ की नोक को ऊपरी दाँतों के पीछे की तालु पर हल्का स्पर्श करें।",
        "मुंह से सभी हवा को 'फूँ~' की आवाज़ के साथ पूरी तरह बाहर निकालें।",
        "मुंह बंद करें और नाक से 4 सेकंड के लिए सांस लें।",
        "7 सेकंड के लिए अपनी सांस रोकें।",
        "मुंह से 'फूँ~' की आवाज़ के साथ 8 सेकंड के लिए सांस छोड़ें।",
        "इस चक्र को 4-6 बार दोहराएं (लगभग 2 मिनट)।"
      ],
      "effect": [
        "अनिद्रा में सुधार — सोने से पहले करने से तेजी से सो जाने में मदद",
        "चिंता के दौरे और घबराहट से राहत के लिए नैदानिक रूप से सिद्ध",
        "7 सेकंड की सांस रोकना ऑक्सीजन और कार्बन डाइऑक्साइड के संतुलन को बनाए रखकर तंत्रिकाओं को शांत करता है",
        "प्रस्तुति या परीक्षा से पहले तनाव से तुरंत राहत"
      ]
    },
    "3": {
      "title": "③ अनुभवी · मानसिक शक्ति श्वास (बॉक्स श्वास)",
      "intro": "अमेरिकी नेवी सील्स (विशेष बल) द्वारा चरम परिस्थितियों में उपयोग की जाने वाली श्वास तकनीक। यह एकाग्रता और मानसिक शांति दोनों को एक साथ बढ़ाती है।",
      "method": [
        "अपनी पीठ को सीधा रखें और कंधों को आराम दें।",
        "4 सेकंड के लिए नाक से सांस लें (पेट फूले)।",
        "4 सेकंड के लिए अपनी सांस रोकें।",
        "4 सेकंड के लिए नाक या मुंह से सांस छोड़ें।",
        "4 सेकंड के लिए फिर से सांस रोकें।",
        "इन 4 चरणों को 2 मिनट के लिए दोहराएं, जैसे एक वर्ग बना रहे हों।"
      ],
      "effect": [
        "चरम तनाव की स्थिति में शांत रहने की क्षमता बढ़ाता है",
        "एकाग्रता और मानसिक शांति को एक साथ बढ़ाता है",
        "प्रस्तुति, परीक्षा या महत्वपूर्ण निर्णय से पहले अपने आप को शांत करने में प्रभावी",
        "रक्तचाप को स्थिर करता है और मस्तिष्क में ऑक्सीजन की आपूर्ति को अनुकूलित करता है"
      ]
    },
    "4": {
      "title": "④ विशेषज्ञ · प्रतिरक्षा शक्ति श्वास (विम हॉफ)",
      "intro": "नीदरलैंड के 'आइसमैन' विम हॉफ द्वारा विकसित श्वास तकनीक। प्रतिरक्षा शक्ति बढ़ाने और स्व-तनाव नियंत्रण क्षमता विकसित करने की उन्नत श्वास विधि है।",
      "method": [
        "आराम से बैठें या लेटें।",
        "अतिश्वास चरण: गहरी सांस लें और बलपूर्वक छोड़ें - इसे 30 बार दोहराएं (लगभग 1 मिनट)।",
        "अंतिम सांस छोड़ने के बाद जितनी हो सके सांस रोकें (30 सेकंड से 1 मिनट)।",
        "पुनः प्राप्ति श्वास: गहरी सांस लें, 15 सेकंड रोकें, फिर छोड़ें।",
        "1 चक्र के बाद समाप्त करें (लगभग 2 मिनट)।"
      ],
      "effect": [
        "प्रतिरक्षा प्रतिक्रिया को मजबूत करता है — वैज्ञानिक शोधपत्रों द्वारा सिद्ध",
        "तनाव हार्मोन (एड्रेनालाईन) के स्व-नियंत्रण की क्षमता में सुधार",
        "सूजन प्रतिक्रिया को दबाता है और ऊर्जा स्तर में विस्फोटक वृद्धि",
        "ठंड और दर्द के प्रति प्रतिरोध क्षमता बढ़ाता है",
        "मानसिक और शारीरिक सुदृढ़ता को उच्चतम स्तर तक पहुंचाता है"
      ],
      "safetyNotice": "हमेशा बैठे या लेटे हुए अवस्था में करें। चक्कर आ सकते हैं, इसलिए पानी में, ड्राइविंग करते समय या खड़े होकर कभी न करें।"
    }
  },
  "tr": {
    "1": {
      "title": "① Başlangıç · Doğal Nefes Alma",
      "intro": "Başlangıççılar için en güvenli ve evrensel nefes alma yöntemi. Sadece nefesinize dikkat vererek gözlemlemek bile zihninizi sakinleştirir. Çıkış nefesinizi içeri nefesinizden daha uzun yapmak faydalıdır.",
      "method": [
        "Rahatça oturun veya yatın ve sırtınızı düz tutun.",
        "Ağzınızı kapalı tutun ve sadece burununuzdan nefes alın.",
        "İçeri nefesinizi ve dışarı nefesinizi normalde yaptığınız gibi doğal olarak devam ettirin.",
        "Nefesinize odaklanın; değişen düşünceler gelirse, nefes almaya geri dönün.",
        "2 dakika boyunca devam edin."
      ],
      "effect": [
        "Otonom sinir sisteminin dengelenmesi ile anlık zihinsel huzur",
        "Parasempatik sinir sisteminin aktivasyonu → stres hormonu (kortizol) azalması",
        "Meditasyon başlangıççısının nefes farkındalığını öğrenmenin en güvenli yöntemi",
        "Her yerden istediğiniz an kullanabileceğiniz temel iyileşme aracı"
      ]
    },
    "2": {
      "title": "② Temel · Sinir Sakinleştirici Nefes (4-7-8)",
      "intro": "Amerikalı Dr. Andrew Weil tarafından geliştirilen 'sinir sistemi için doğal sakinleştirici'. Uyku sorunu ve kaygı hafifletmesinde klinik olarak kanıtlanmış bir nefes alma yöntemidir.",
      "method": [
        "Dilinizin ucunu üst ön dişlerinizin arkasında damak üzerine hafifçe koyun.",
        "Ağzınızdan 'huu~' sesi çıkartarak tüm havayı tamamen dışarı atın.",
        "Ağzınızı kapalı tutun ve burununuzdan 4 saniye içeri nefes alın.",
        "7 saniye nefes tutun.",
        "Ağzınızdan 'huu~' sesi çıkartarak 8 saniye boyunca dışarı nefes verin.",
        "Bu döngüyü 4~6 kez tekrarlayın (yaklaşık 2 dakika)."
      ],
      "effect": [
        "Uyku sorununun iyileştirilmesi — yatmadan önce yapıldığında hızlı uykuya geçiş",
        "Kaygı atakları ve panik bozukluğunun hafifletilmesinde klinik olarak kanıtlanmıştır",
        "7 saniye tutma oksijen ve karbondioksit dengesini ayarlayarak sinir sistemini sakinleştirir",
        "Sunum veya sınav öncesi gerginliği hemen hafifletir"
      ]
    },
    "3": {
      "title": "③ İleri Seviye · Zihinsel Güç Nefesi (Kutu Nefesi)",
      "intro": "ABD Navy SEAL'in aşırı stres koşullarında kullandığı nefes alma yöntemi. Odaklanmayı ve sakinliği aynı anda yükseltir.",
      "method": [
        "Sırtınızı düz tutun ve omuzlarınızı gevşetin.",
        "Burununuzdan 4 saniye içeri nefes alın (karnınız şişsin).",
        "4 saniye nefes tutun.",
        "Burununuzdan veya ağzınızdan 4 saniye boyunca nefes verin.",
        "Tekrar 4 saniye nefes tutun.",
        "Kare çizmeyi anımsat eder şekilde bu 4 adımı 2 dakika boyunca tekrarlayın."
      ],
      "effect": [
        "Aşırı stres durumlarında sakinliği koruma yeteneği artar",
        "Odaklanma ve huzuru aynı anda yükseltir",
        "Sunum, sınav veya önemli bir karar öncesi zihninizi sakinleştirmede etkilidir",
        "Kan basıncının istikrar kazanması ve beyin oksijen tedarikinin optimize edilmesi"
      ]
    },
    "4": {
      "title": "④ Uzman Seviyesi · Bağışıklık Güçlendirici Nefes (Wim Hof)",
      "intro": "Hollandalı 'Buz Adam' Wim Hof tarafından geliştirilen nefes alma tekniği. Bağışıklık gücünü artırma ve kendini stres kontrol etme yeteneğini geliştirmek için ileri bir nefes alma yöntemidir.",
      "method": [
        "Rahatça oturun veya yatın.",
        "Hızlı nefes alma: Derin içeri nefes alın ve güçsüz bir şekilde dışarı verin - 30 kez tekrarlayın (yaklaşık 1 dakika).",
        "Son çıkış nefesinizden sonra mümkün olduğunca nefes tutun (30 saniye~1 dakika).",
        "Toparlanma nefesi: Derin içeri nefes alın, 15 saniye tutun, ardından serbest bırakın.",
        "Bir döngüyle bitirin (yaklaşık 2 dakika)."
      ],
      "effect": [
        "Bağışıklık tepkisinin güçlendirilmesi — bilimsel çalışmalarla kanıtlanmıştır",
        "Stres hormonu (adrenalin) kendinden kontrol etme yeteneğinin artması",
        "İltihaplanma tepkisinin baskılanması ve enerji seviyesinin patlaması",
        "Soğuğa ve ağrıya karşı direnç artması",
        "Zihin ve beden dayanıklılığının (Resilience) en yüksek seviyesine ulaşması"
      ],
      "safetyNotice": "Mutlaka oturup veya yatarken uygulayın. Baş dönmesi meydana gelebileceği için, suya girerken, araba sürüyorken veya ayakta iken hiçbir zaman yapmayın."
    }
  },
  "pt": {
    "1": {
      "title": "① Iniciante · Respiração Natural",
      "intro": "A prática mais segura e universal para iniciantes. Apenas concentrar a atenção na sua respiração acalma a mente. É bom deixar a expiração mais longa que a inspiração.",
      "method": [
        "Sente-se ou deite-se confortavelmente com as costas retas.",
        "Mantenha a boca fechada e respire apenas pelo nariz.",
        "Deixe a inspiração e expiração fluírem naturalmente como de costume.",
        "Concentre-se apenas na respiração; quando pensamentos aparecerem, retorne à respiração.",
        "Mantenha por 2 minutos."
      ],
      "effect": [
        "Estabilização do sistema nervoso autônomo para acalmação imediata",
        "Ativação do sistema parassimpático → redução do hormônio do estresse (cortisol)",
        "A forma mais segura de um iniciante em meditação aprender consciência respiratória",
        "Ferramenta básica de recuperação que pode ser aplicada imediatamente em qualquer lugar do dia a dia"
      ]
    },
    "2": {
      "title": "② Básico · Respiração Calmante dos Nervos (4-7-8)",
      "intro": "Um 'sedativo natural para o sistema nervoso' desenvolvido pelo Dr. Andrew Weil. Uma técnica de respiração clinicamente comprovada para aliviar insônia e ansiedade.",
      "method": [
        "Repouse a ponta da língua levemente no palato, atrás dos dentes superiores.",
        "Expire completamente toda a ar pela boca com um som 'psiu'.",
        "Mantenha a boca fechada e inspire pelo nariz por 4 segundos.",
        "Retenha a respiração por 7 segundos.",
        "Expire pela boca com um som 'psiu' por 8 segundos.",
        "Repita este ciclo 4-6 vezes (aproximadamente 2 minutos)."
      ],
      "effect": [
        "Melhora da insônia — efeito rápido para adormecer quando feito antes de dormir",
        "Clinicamente comprovado para aliviar ataques de ansiedade e transtorno do pânico",
        "A retenção de 7 segundos equilibra oxigênio e dióxido de carbono para estabilizar os nervos",
        "Efeito imediato para aliviar tensão antes de apresentações ou provas"
      ]
    },
    "3": {
      "title": "③ Avançado · Respiração para Força Mental (Box Breathing)",
      "intro": "Técnica de respiração usada pelos Navy SEAL americanos em situações extremas. Eleva concentração e serenidade simultaneamente.",
      "method": [
        "Estique as costas e deixe os ombros relaxados.",
        "Inspire pelo nariz por 4 segundos, deixando o abdômen se expandir.",
        "Retenha a respiração por 4 segundos.",
        "Expire pelo nariz ou boca por 4 segundos.",
        "Retenha a respiração por 4 segundos novamente.",
        "Repita esses 4 passos por 2 minutos, como se desenhasse um quadrado."
      ],
      "effect": [
        "Melhora da capacidade de manter serenidade em situações de estresse extremo",
        "Eleva concentração e serenidade simultaneamente",
        "Eficaz para acalmar a mente antes de apresentações, provas ou decisões importantes",
        "Estabiliza a pressão arterial e otimiza o suprimento de oxigênio ao cérebro"
      ]
    },
    "4": {
      "title": "④ Especialista · Respiração para Fortalecer Imunidade (Wim Hof)",
      "intro": "Técnica de respiração desenvolvida pelo 'Homem de Gelo' holandês, Wim Hof. Prática avançada para fortalecer a imunidade e desenvolver a capacidade de auto-regulação do estresse.",
      "method": [
        "Sente-se ou deite-se confortavelmente.",
        "Fase de hiperventilação: inspire profundamente e deixe a expiração sair naturalmente, repetindo 30 vezes (aproximadamente 1 minuto).",
        "Após a última expiração, retenha a respiração o máximo que conseguir (30 segundos a 1 minuto).",
        "Respiração de recuperação: inspire profundamente, retenha por 15 segundos e expire.",
        "Termine após um ciclo (aproximadamente 2 minutos)."
      ],
      "effect": [
        "Fortalecimento da resposta imunológica — comprovado por pesquisa científica",
        "Melhora da capacidade de auto-regulação do hormônio do estresse (adrenalina)",
        "Supressão da inflamação e aumento explosivo dos níveis de energia",
        "Aumento da resistência ao frio e à dor",
        "Atingir o mais alto nível de resiliência mental e física"
      ],
      "safetyNotice": "Sempre pratique sentado ou deitado. Tontura pode ocorrer, portanto nunca faça isso dentro de água, enquanto dirigi ou em pé."
    }
  },
  "ar": {
    "1": {
      "title": "① مبتدئون · التنفس الطبيعي",
      "intro": "أسلوب تنفس آمن وعالمي للمبتدئين. مجرد تركيز انتباهك على نفسك يهدئ العقل. من الجيد أن تجعل الزفير أطول من الشهيق.",
      "method": [
        "اجلس أو استلقِ براحة مع إبقاء ظهرك مستقيماً.",
        "أبقِ فمك مغلقاً وتنفس من أنفك فقط.",
        "اترك الشهيق والزفير يتدفقان بشكل طبيعي كالمعتاد.",
        "ركز انتباهك على التنفس فقط، وإذا شردت أفكارك، أعِد انتباهك إلى التنفس.",
        "استمر لمدة دقيقتين."
      ],
      "effect": [
        "تهدئة فورية للعقل من خلال استقرار الجهاز العصبي اللاإرادي",
        "تنشيط الجهاز العصبي السمبثاوي → انخفاض هرمون التوتر (الكورتيزول)",
        "أسلوب آمن جداً للمبتدئين لتعلم الوعي بالتنفس",
        "أداة استشفاء أساسية يمكنك الاعتماد عليها في أي مكان وأي وقت"
      ]
    },
    "2": {
      "title": "② أساسي · تنفس تهدئة الأعصاب (4-7-8)",
      "intro": "\"مهدئ طبيعي للجهاز العصبي\" طوره الدكتور أندرو وايل الأمريكي. ثبت سريرياً لتخفيف الأرق والقلق.",
      "method": [
        "ضع طرف لسانك برفق خلف أسنانك العليا الأمامية.",
        "أفرغ رئتيك تماماً من خلال فمك بصوت \"هاااه\" عميق.",
        "أغلق فمك واستنشق من أنفك لمدة 4 ثوان.",
        "احبس نفسك لمدة 7 ثوان.",
        "أخرج الهواء من خلال فمك لمدة 8 ثوان بصوت \"هاااه\" عميق.",
        "كرر هذه الدورة 4-6 مرات (حوالي دقيقتين)."
      ],
      "effect": [
        "تحسين الأرق — يساعدك على النوم بسرعة عند ممارسته قبل النوم",
        "ثابت سريرياً لتهدئة نوبات القلق والذعر",
        "الانتظار لمدة 7 ثوان يوازن الأكسجين وثاني أكسيد الكربون لتهدئة الأعصاب",
        "فعال فوراً في تخفيف التوتر قبل العروض التقديمية والامتحانات"
      ]
    },
    "3": {
      "title": "③ متقدم · تنفس تقوية الصحة النفسية (التنفس المربع)",
      "intro": "أسلوب تنفس تستخدمه فرق البحرية الأمريكية الخاصة (Navy SEAL) تحت الضغط الشديد. يرفع التركيز والهدوء في نفس الوقت.",
      "method": [
        "استقيم في ظهرك وأرح كتفيك.",
        "استنشق من أنفك لمدة 4 ثوان (اترك بطنك ينتفخ).",
        "احبس نفسك لمدة 4 ثوان.",
        "أخرج الهواء من أنفك أو فمك لمدة 4 ثوان.",
        "احبس نفسك مرة أخرى لمدة 4 ثوان.",
        "كرر هذه الخطوات الأربع لمدة دقيقتين، كما لو كنت ترسم مربعاً."
      ],
      "effect": [
        "تحسين القدرة على الحفاظ على الهدوء تحت الضغط الشديد",
        "رفع التركيز والهدوء في نفس الوقت",
        "فعال في تهدئة النفس قبل العروض التقديمية والامتحانات والقرارات المهمة",
        "تستقر ضغط الدم وتحسين إمدادات الأكسجين للدماغ"
      ]
    },
    "4": {
      "title": "④ متخصص · تنفس تقوية المناعة (ويم هوف)",
      "intro": "تقنية طورها الهولندي \"رجل الجليد\" ويم هوف. أسلوب متقدم لتقوية المناعة والقدرة على تنظيم التوتر ذاتياً.",
      "method": [
        "اجلس أو استلقِ براحة.",
        "مرحلة الإفراط في التنفس: استنشق بعمق وأطلق الزفير بارتخاء 30 مرة (حوالي دقيقة واحدة).",
        "بعد آخر زفير، احبس نفسك قدر الإمكان (30 ثانية إلى دقيقة واحدة).",
        "تنفس الاسترجاع: استنشق بعمق، احبس لمدة 15 ثانية، ثم أطلق الهواء.",
        "أنهِ بدورة واحدة (حوالي دقيقتين)."
      ],
      "effect": [
        "تقوية الاستجابة المناعية — ثابت في البحوث المنشورة",
        "تحسين القدرة على التحكم الذاتي في هرمون التوتر (الأدرينالين)",
        "قمع الالتهاب وارتفاع مستويات الطاقة بشكل كبير",
        "زيادة المقاومة للبرد والألم",
        "الوصول إلى أعلى مستويات المرونة الجسدية والعقلية"
      ],
      "safetyNotice": "يجب أن تمارسها وأنت جالس أو مستلقٍ. قد يحدث دوار، لذلك لا تمارسها أبداً في الماء أو أثناء القيادة أو وأنت واقف."
    }
  },
  "ja": {
    "1": {
      "title": "① 入門・自然呼吸",
      "intro": "初心者向けの最も安全で普遍的な呼吸法です。呼吸に意識を集中させるだけで心が静まります。吸う息より吐く息を長くするのが良いでしょう。",
      "method": [
        "楽に座るか仰向けに寝転びます。背中を伸ばしてください。",
        "口を閉じて鼻からだけ呼吸します。",
        "吸う息と吐く息を普通に自然とつなげていきます。",
        "呼吸だけに意識を集中させて、雑念が浮かんだら再び呼吸に戻ります。",
        "2分間続けます。"
      ],
      "effect": [
        "自律神経系の安定化で即座に心が落ち着く",
        "副交感神経の活性化 → ストレスホルモン(コルチゾール)低下",
        "瞑想初心者が呼吸への気づき(awareness)を学ぶための最も安全な方法",
        "日常のどこでもすぐに活用できる基本的な回復ツール"
      ]
    },
    "2": {
      "title": "② 基本・神経安定呼吸(4-7-8)",
      "intro": "アメリカのアンドリュー・ワイル博士が開発した『神経系の天然安定剤』です。不眠症と不安の緩和に臨床的に検証された呼吸法です。",
      "method": [
        "舌の先端を上の前歯の裏の上顎に軽く当てます。",
        "口からすべての空気を『ふ〜』と音を出しながら完全に吐き出します。",
        "口を閉じて鼻で4秒間吸い込みます。",
        "7秒間息を止めます。",
        "口から『ふ〜』と音を出しながら8秒間かけて吐き出します。",
        "このサイクルを4〜6回繰り返します(約2分)。"
      ],
      "effect": [
        "不眠症の改善 — 寝る前に実施すると素早い入眠効果",
        "不安発作・パニック障害の緩和に臨床的に検証済み",
        "7秒間の息止めが酸素と二酸化炭素のバランスを整えて神経を安定させる",
        "発表・試験の直前の緊張緩和に即効"
      ]
    },
    "3": {
      "title": "③ 熟練・メンタル強化呼吸(ボックスブリーディング)",
      "intro": "アメリカのネイビーシール(特殊部隊)が極限状況で使う呼吸法です。集中力と平常心を同時に高めます。",
      "method": [
        "背中を伸ばして肩の力を抜きます。",
        "4秒間かけて鼻からゆっくり吸い込みます(お腹が膨らむように)。",
        "4秒間息を止めます。",
        "4秒間かけて鼻または口からゆっくり吐き出します。",
        "4秒間再び息を止めます。",
        "正方形を描くようにこの4つのステップを2分間繰り返します。"
      ],
      "effect": [
        "極限のストレス状況でも平常心を保つ能力が向上",
        "集中力と平常心を同時に高める",
        "発表・試験・重要な決断の前に心を落ち着かせるのに効果的",
        "血圧の安定化と脳への酸素供給の最適化"
      ]
    },
    "4": {
      "title": "④ 専門・免疫力強化呼吸(ウィムホフ)",
      "intro": "オランダの『アイスマン』ウィム・ホフが開発した呼吸テクニックです。免疫力強化と自己ストレスコントロール能力を高める上級の呼吸法です。",
      "method": [
        "楽に座るか仰向けに寝転びます。",
        "過呼吸フェーズ:深く吸って力を抜きながら吐くを30回繰り返します(約1分)。",
        "最後の吐く息の後、できるだけ長く息を止めます(30秒〜1分)。",
        "回復呼吸:大きく吸い込んで15秒間止めた後に吐き出します。",
        "1サイクルで終了します(約2分)。"
      ],
      "effect": [
        "免疫反応の強化 — 科学論文で検証済み",
        "ストレスホルモン(アドレナリン)の自己制御能力向上",
        "炎症反応の抑制とエネルギーレベルの飛躍的向上",
        "冷感・痛感への耐性増加",
        "心身の回復力(レジリエンス)が最高レベルに達する"
      ],
      "safetyNotice": "必ず座るか寝た状態で実施してください。めまいが起こることがあるので、水中、運転中、立った状態では絶対に禁止です。"
    }
  },
  "th": {
    "1": {
      "title": "① ผู้เริ่มต้น · การหายใจตามธรรมชาติ",
      "intro": "วิธีการหายใจที่ปลอดภัยและเหมาะสมที่สุดสำหรับผู้เริ่มต้น แค่เน้นสติไปที่การหายใจของคุณ ใจก็จะสงบลงได้ และถ้าให้ลมหายใจออกนานกว่าเข้า ก็จะดีมากเลย",
      "method": [
        "นั่งหรือนอนสบายๆ ให้หลังตรง",
        "ปิดปากแล้วหายใจผ่านจมูกเท่านั้น",
        "ให้ลมหายใจเข้าและออกไหลตามธรรมชาติ อย่างปกติของคุณ",
        "มุ่งสติไปที่การหายใจ และเมื่อความคิดลอยเลิก ให้กลับมาสู่การหายใจ",
        "ทำต่อไป 2 นาที"
      ],
      "effect": [
        "ปรับสมดุลระบบประสาทอัตโนมัติ → ใจสงบลงทันที",
        "เปิดใช้งานระบบประสาทพาราซิมพาเทติก → ลดฮอร์โมนความเครียด (คอร์ติซอล)",
        "วิธีการที่ปลอดภัยที่สุดให้ผู้เริ่มต้นเรียนรู้ความตระหนักรู้การหายใจ",
        "เป็นเครื่องมือการฟื้นตัวพื้นฐานที่คุณสามารถเข้าถึงได้ทุกเวลา ที่ไหนก็ได้"
      ]
    },
    "2": {
      "title": "② พื้นฐาน · การหายใจปลอบประโลมประสาท (4-7-8)",
      "intro": "เป็น 'สารประกอบธรรมชาติที่ปลอบประโลมประสาท' ที่ได้รับการพัฒนาโดยดร.แอนดรูว์ เวล วิธีการหายใจนี้ได้รับการตรวจสอบทางคลินิกว่าช่วยบรรเทาความนอนใจและความวิตกกังวล",
      "method": [
        "วางปลายลิ้นของคุณไว้ที่ด้านหลังฟันบนเบาๆ",
        "ปล่อยอากาศออกจากปากทั้งหมดด้วยเสียง 'ฟู~' ให้จนหมด",
        "ปิดปากแล้วหายใจเข้าผ่านจมูก นับ 4 วินาที",
        "หยุดหายใจไว้ 7 วินาที",
        "ปล่อยลมหายใจออกผ่านปากด้วยเสียง 'ฟู~' นับ 8 วินาที",
        "ทำซ้ำรอบนี้ 4-6 ครั้ง (ประมาณ 2 นาที)"
      ],
      "effect": [
        "ปรับปรุงความนอนใจ — ทำก่อนนอนจะช่วยให้หลับเร็วขึ้น",
        "ได้รับการพิสูจน์ทางคลินิกว่าช่วยบรรเทาความวิตกกังวลและอาการตื่นตระหนก",
        "การหยุดหายใจ 7 วินาทีช่วยให้สมดุลระหว่างออกซิเจนและคาร์บอนไดออกไซด์ → สงบประสาท",
        "ช่วยบรรเทาความตึงเครียดอย่างรวดเร็ว ก่อนการนำเสนอหรือสอบ"
      ]
    },
    "3": {
      "title": "③ ผู้มีประสบการณ์ · การหายใจเพิ่มความแข็งแกร่งจิตใจ (การหายใจแบบกล่อง)",
      "intro": "วิธีการหายใจที่ทีมพิเศษของกองทัพเรือสหรัฐ (Navy SEAL) ใช้ในสถานการณ์ที่รุนแรงสุดขีด วิธีนี้ช่วยเพิ่มความเข้มข้นและสติสัมปชัญญะไปพร้อมกัน",
      "method": [
        "ยืดให้หลังตรง และจ้วงไหล่ให้ผ่อนคลาย",
        "หายใจเข้าผ่านจมูก 4 วินาที (ให้ท้องพองขึ้น)",
        "หยุดหายใจ 4 วินาที",
        "ปล่อยลมหายใจออกผ่านจมูกหรือปาก 4 วินาที",
        "หยุดหายใจอีก 4 วินาที",
        "ทำสี่ขั้นตอนนี้ซ้ำไปเป็นรูปสี่เหลี่ยม นาน 2 นาที"
      ],
      "effect": [
        "เสริมสร้างความสามารถในการรักษาสติสัมปชัญญะในสถานการณ์ความเครียดสูงสุด",
        "เพิ่มความเข้มข้นและความสงบไปพร้อมกัน",
        "มีประสิทธิภาพในการสงบจิตใจก่อนการนำเสนอ สอบ หรือการตัดสินใจที่สำคัญ",
        "ปรับเสถียรภาพความดันโลหิต และเพิ่มประสิทธิภาพการจ่ายออกซิเจนไปยังสมอง"
      ]
    },
    "4": {
      "title": "④ ผู้มีทักษะเฉพาะ · การหายใจเพิ่มภูมิคุ้มกัน (วิม ฮอฟ)",
      "intro": "วิม ฮอฟ 'ชายน้ำแข็ง' ชาวเนเธอร์แลนด์ พัฒนาเทคนิคการหายใจนี้ขึ้นมา เป็นวิธีการหายใจขั้นสูงที่ช่วยเพิ่มภูมิคุ้มกันและพัฒนาความสามารถควบคุมความเครียดของตัวเอง",
      "method": [
        "นั่งหรือนอนสบายๆ",
        "ขั้นตอนการหายใจหลวม: หายใจเข้าลึกแล้วปล่อยออกแบบผ่อนคลาย ทำซ้ำ 30 ครั้ง (ประมาณ 1 นาที)",
        "หลังจากลมหายใจออกครั้งสุดท้าย หยุดหายใจไว้นานที่สุดเท่าที่คุณอาจทำได้ (30 วินาที-1 นาที)",
        "การหายใจการฟื้นตัว: หายใจเข้าลึก แล้วหยุดไว้ 15 วินาที แล้วปล่อยออก",
        "จบหนึ่งรอบ (ประมาณ 2 นาที)"
      ],
      "effect": [
        "เพิ่มความแข็งแกร่งให้กับระบบภูมิคุ้มกัน — ได้รับการพิสูจน์ด้วยบทความวิทยาศาสตร์",
        "ปรับปรุงความสามารถของตัวเองในการควบคุมฮอร์โมนความเครียด (อะดรีนาลีน)",
        "ระงับการตอบสนองของการติดเชื้อ และเพิ่มระดับพลังงานอย่างมากมาย",
        "เพิ่มความทนต่อความหนาวและความเจ็บปวด",
        "พัฒนาความยืดหยุ่นของจิตใจและกาย (Resilience) ถึงระดับสูงสุด"
      ],
      "safetyNotice": "ทำเพียงแค่ในสภาวะนั่งหรือนอนเท่านั้น อาจเกิดความมึนงงได้ จึงห้ามทำในน้ำ ขณะขับรถ หรือในสภาวะยืน"
    }
  },
  "tl": {
    "1": {
      "title": "① Pambungad · Likas na Paghihingal",
      "intro": "Ang pinaka-ligtas at pangkaraniwang pamamaraan ng paghihingal para sa mga nagsisimula pa lamang. Ang pagtuon ng iyong kaluluwa sa iyong hinihinga ay nagdudulot ng kapayapaan ng isip. Mas maganda kung ang iyong paglabas ng hangin ay mas mahabang panahon kaysa sa pagpasok.",
      "method": [
        "Umupo o lumiko ng komportable at diretso ang iyong likod.",
        "Isinara ang iyong bibig at huminga lamang sa pamamagitan ng ilong.",
        "Hayaan ang iyong pagpasok at paglabas ng hangin na lumabas nang natural, tulad ng dati.",
        "Tukuyin ang iyong atensyon sa iyong hinihinga; kung may mga asing-asingisip, bumalik sa hinihinga.",
        "Panatilihin ito sa loob ng 2 minuto."
      ],
      "effect": [
        "Ang stabilisasyon ng autonomic nervous system ay nagdudulot ng agarang kapayapaan ng isip",
        "Ang pag-activate ng parasympathetic nervous system → binabawasan ang stress hormone (cortisol)",
        "Ang pinaka-ligtas na paraan para sa mga baguhan sa meditasyon na matuto ng kamalayan sa hinihinga",
        "Isang pangunahing tool sa pagbabalik na maaaring gamitin kaagad kahit saan sa pang-araw-araw"
      ]
    },
    "2": {
      "title": "② Pangunahin · Mapayapang Sinu na Hinihinga (4-7-8)",
      "intro": "Isang 'natural na kagamot para sa nervous system' na idinisenyo ng Dr. Andrew Weil mula sa Estados Unidos. Ito ay clinically validated para sa pagbabawas ng insomnia at anxiety.",
      "method": [
        "Ilagay ang dulo ng iyong wika nang mahina sa likod ng iyong itaas na ngipin.",
        "Labasan nang buo ang lahat ng hangin sa iyong bibig na may tunog na 'whooosh'.",
        "Isara ang iyong bibig at huminga sa loob ng 4 segundo sa pamamagitan ng ilong.",
        "Panatilihin ang iyong hinihinga sa loob ng 7 segundo.",
        "Labasan ang hangin na may tunog na 'whooosh' sa loob ng 8 segundo sa pamamagitan ng iyong bibig.",
        "Ulitin ang cycle na ito 4-6 na beses (mga 2 minuto)."
      ],
      "effect": [
        "Pagpapabuti ng insomnia — mabilis na pagtulog kapag ginawa bago matulog",
        "Klinically validated para sa pagbabawas ng anxiety attacks at panic disorder",
        "Ang 7-segundo na paggabay ng hinihinga ay nagbabalanse ng oxygen at carbon dioxide para sa stability ng nerves",
        "Mabilis na epekto sa pagbabawas ng tension bago ang presentation o pagsusulit"
      ]
    },
    "3": {
      "title": "③ Napakahusay · Lakas ng Isip na Hinihinga",
      "intro": "Ang pamamaraan ng hinihinga na ginagamit ng US Navy SEALs sa extreme na sitwasyon. Ito ay nagpapataas ng konsentrasyon at kalmadahan nang sabay-sabay.",
      "method": [
        "Itaas ang iyong likod at bitiwan ang tensyon sa iyong mga balikat.",
        "Huminga sa pamamagitan ng ilong sa loob ng 4 segundo (ang iyong tiyan ay dapat umabot).",
        "Panatilihin ang iyong hinihinga sa loob ng 4 segundo.",
        "Labasan ang hangin sa pamamagitan ng ilong o bibig sa loob ng 4 segundo.",
        "Panatilihin ang iyong hinihinga muli sa loob ng 4 segundo.",
        "Ulitin ang 4 na yugto na ito sa loob ng 2 minuto, parang iginaguhit ang isang parisukat (box)."
      ],
      "effect": [
        "Ang pagpapabuti ng kakayahang manatiling kalmado sa extreme na sitwasyon ng stress",
        "Ang pagpapataas ng konsentrasyon at kalmadahan nang sabay-sabay",
        "Epektibo sa pagpapahinga ng isip bago ang presentation, pagsusulit, o mahalagang desisyon",
        "Ang stabilisasyon ng blood pressure at optimal na supply ng oxygen sa utak"
      ]
    },
    "4": {
      "title": "④ Eksperto · Immunity na Hinihinga (Wim Hof)",
      "intro": "Isang pamamaraan ng hinihinga na idinisenyo ng Wim Hof, ang 'Iceman' mula sa Netherlands. Isang advanced na teknik para palakasin ang immunity at ang kakayahang magself-regulate ng stress.",
      "method": [
        "Umupo o lumiko ng komportable.",
        "Power breathing stage: malalim na pagpasok at palakas na paglabas ng hangin ng 30 beses (mga 1 minuto).",
        "Pagkatapos ng huling paglabas, panatilihin ang iyong hinihinga hangga't kaya mo (30 segundo-1 minuto).",
        "Recovery breathing: malalim na pagpasok, panatilihin ang 15 segundo, pagkatapos labasan.",
        "Tapusin sa 1 cycle (mga 2 minuto)."
      ],
      "effect": [
        "Ang palakasin ng immune response — na-validate ng scientific research",
        "Ang pagpapabuti ng self-regulation ng stress hormone (adrenaline)",
        "Ang inhibition ng inflammation at explosive na pagtaas ng energy levels",
        "Ang pagtaas ng resistance sa lamig at sakit",
        "Ang pagkamit ng highest level ng mental at physical resilience"
      ],
      "safetyNotice": "Gawin lamang ito habang umupo o nakahiga. Ang pagkakitog ay maaaring mangyari, kaya't hindi ito dapat gawin sa tubig, habang nagmamaneho, o habang tumayo."
    }
  },
  "bn": {
    "1": {
      "title": "1. শুরু - প্রাকৃতিক শ্বাসপ্রশ্বাস",
      "intro": "শিক্ষানবিসদের জন্য সবচেয়ে নিরাপদ এবং সর্বজনীন শ্বাসপ্রশ্বাসের পদ্ধতি. শ্বাসপ্রশ্বাসে মনোযোগ কেন্দ্রীভূত করার মাধ্যমে মন শান্ত হয়. প্রশ্বাসকে নিঃশ্বাসের চেয়ে দীর্ঘ করা ভালো.",
      "method": [
        "আরামদায়কভাবে বসুন বা শুয়ে পড়ুন এবং আপনার পিঠ সোজা রাখুন.",
        "আপনার মুখ বন্ধ রাখুন এবং শুধুমাত্র নাক দিয়ে শ্বাস নিন.",
        "নিঃশ্বাস এবং প্রশ্বাসকে সাধারণত যেমন প্রবাহিত হয় তেমনভাবে প্রাকৃতিকভাবে প্রবাহিত করুন.",
        "শুধুমাত্র শ্বাসপ্রশ্বাসে মনোযোগ দিন; যখন চিন্তা বিক্ষিপ্ত হয়, আবার শ্বাসপ্রশ্বাসে ফিরে আসুন.",
        "২ মিনিটের জন্য বজায় রাখুন."
      ],
      "effect": [
        "স্বায়ত্তশাসিত স্নায়ুতন্ত্রের স্থিতিশীলতার মাধ্যমে তাৎক্ষণিক মনের শান্তি",
        "পরিসংবেদনশীল স্নায়ু সক্রিয়করণ - চাপের হরমোন (কর্টিসল) হ্রাস",
        "ধ্যান শিক্ষানবিসদের জন্য শ্বাসপ্রশ্বাস সচেতনতা শেখার সবচেয়ে নিরাপদ উপায়",
        "দৈনন্দিন জীবনে যেকোনো জায়গায় তাৎক্ষণিকভাবে প্রয়োগ করা যায় এমন মৌলিক পুনরুদ্ধার হাতিয়ার"
      ]
    },
    "2": {
      "title": "2. মৌলিক - স্নায়ু শান্তি শ্বাসপ্রশ্বাস (4-7-8)",
      "intro": "আমেরিকার ডাক্তার অ্যান্ড্রু ওয়েইল দ্বারা বিকশিত 'স্নায়ুতন্ত্রের প্রাকৃতিক শান্তিদায়ক'. অনিদ্রা এবং উদ্বেগ উপশম করতে ক্লিনিক্যালি প্রমাণিত শ্বাসপ্রশ্বাসের পদ্ধতি.",
      "method": [
        "আপনার জিহ্বার আগাটি আপনার উপরের দাঁতের পিছনে তালুতে হালকাভাবে রাখুন.",
        "আপনার মুখ দিয়ে সমস্ত বাতাস 'হুশ' শব্দ করে সম্পূর্ণভাবে বেরিয়ে দিন.",
        "আপনার মুখ বন্ধ করুন এবং নাক দিয়ে ৪ সেকেন্ডে শ্বাস নিন.",
        "৭ সেকেন্ডের জন্য শ্বাস ধরে রাখুন.",
        "আপনার মুখ দিয়ে 'হুশ' শব্দ করে ৮ সেকেন্ড ধরে শ্বাস বেরিয়ে দিন.",
        "এই চক্রটি ৪-৬ বার পুনরাবৃত্তি করুন (প্রায় ২ মিনিট)."
      ],
      "effect": [
        "অনিদ্রা উন্নত করুন - ঘুমানোর আগে চালাই দ্রুত ঘুমিয়ে পড়ার প্রভাব",
        "উদ্বেগ আক্রমণ এবং আতঙ্ক ব্যাধির প্রশমনে ক্লিনিক্যালি প্রমাণিত",
        "৭ সেকেন্ডের শ্বাস ধরে রাখা অক্সিজেন এবং কার্বন ডাইঅক্সাইডের ভারসাম্য বজায় রেখে স্নায়ু শান্ত করে",
        "উপস্থাপনা বা পরীক্ষার আগে উত্তেজনা উপশমে তাৎক্ষণিক প্রভাব"
      ]
    },
    "3": {
      "title": "3. দক্ষ - মানসিক শক্তি শ্বাসপ্রশ্বাস (বক্স ব্রিদিং)",
      "intro": "আমেরিকার নেভি সিল যা চরম পরিস্থিতিতে ব্যবহার করে. এটি ফোকাস এবং সমতাকে একসাথে বাড়ায়.",
      "method": [
        "আপনার পিঠ সোজা করুন এবং আপনার কাঁধ থেকে উত্তেজনা ছাড়িয়ে দিন.",
        "নাক দিয়ে ৪ সেকেন্ডে শ্বাস নিন (আপনার পেট প্রসারিত হওয়ার অনুমতি দিন).",
        "৪ সেকেন্ডের জন্য শ্বাস ধরে রাখুন.",
        "নাক বা মুখ দিয়ে ৪ সেকেন্ড ধরে শ্বাস বেরিয়ে দিন.",
        "আবার ৪ সেকেন্ডের জন্য শ্বাস ধরে রাখুন.",
        "বর্গক্ষেত্র (বক্স) আঁকার মতো এই ৪টি পদক্ষেপ ২ মিনিটের জন্য পুনরাবৃত্তি করুন."
      ],
      "effect": [
        "চরম চাপের পরিস্থিতিতে সমতা বজায় রাখার ক্ষমতা উন্নত করুন",
        "ফোকাস এবং সমতা একসাথে বাড়ান",
        "উপস্থাপনা, পরীক্ষা বা গুরুত্বপূর্ণ সিদ্ধান্তের আগে মন শান্ত করতে কার্যকর",
        "রক্তচাপ স্থিতিশীল করুন এবং মস্তিষ্কে অক্সিজেন সরবরাহ অপ্টিমাইজ করুন"
      ]
    },
    "4": {
      "title": "4. বিশেষজ্ঞ - রোগ প্রতিরোধ ক্ষমতা শক্তিশালী শ্বাসপ্রশ্বাস (উইম হফ)",
      "intro": "নেদারল্যান্ডের 'আইসম্যান' উইম হফ দ্বারা বিকশিত শ্বাসপ্রশ্বাসের কৌশল. রোগ প্রতিরোধ ক্ষমতা শক্তিশালী করার এবং আত্ম-চাপ নিয়ন্ত্রণ দক্ষতা বৃদ্ধির জন্য একটি উন্নত শ্বাসপ্রশ্বাসের পদ্ধতি.",
      "method": [
        "আরামদায়কভাবে বসুন বা শুয়ে পড়ুন.",
        "অতিশ্বাসের পর্যায়: গভীরভাবে শ্বাস নিন এবং ৩০ বার জোরপূর্বক শ্বাস ছাড়ান (প্রায় ১ মিনিট).",
        "চূড়ান্ত নিঃশ্বাসের পরে যতক্ষণ সম্ভব শ্বাস ধরে রাখুন (৩০ সেকেন্ড থেকে ১ মিনিট).",
        "পুনরুদ্ধার শ্বাসপ্রশ্বাস: গভীরভাবে শ্বাস নিন, ১৫ সেকেন্ড ধরে রাখুন, তারপর ছেড়ে দিন.",
        "এক চক্র দিয়ে শেষ করুন (প্রায় ২ মিনিট)."
      ],
      "effect": [
        "রোগ প্রতিরোধ ক্ষমতার প্রতিক্রিয়া শক্তিশালী করুন - বৈজ্ঞানিক গবেষণা দ্বারা যাচাই করা",
        "চাপের হরমোন (অ্যাড্রেনালিন) স্ব-নিয়ন্ত্রণ দক্ষতা উন্নত করুন",
        "প্রদাহজনক প্রতিক্রিয়া দমন এবং শক্তি স্তরে বিস্ফোরক বৃদ্ধি",
        "ঠান্ডা এবং ব্যথার বিরুদ্ধে প্রতিরোধ ক্ষমতা বৃদ্ধি",
        "মানসিক এবং শারীরিক স্থিতিস্থাপকতা সর্বোচ্চ স্তরে পৌঁছান"
      ],
      "safetyNotice": "সর্বদা বসা বা শোওয়ার অবস্থায় করুন. মাথা ঘোরা হতে পারে, তাই জলে, গাড়ি চালানোর সময় বা দাঁড়িয়ে থাকা অবস্থায় কখনোই করবেন না."
    }
  },
  "ur": {
    "1": {
      "title": "① سیکھنے والوں کے لیے · قدرتی سانس لینے کی تکنیک",
      "intro": "سیکھنے والوں کے لیے سب سے محفوظ اور عام سانس لینے کا طریقہ۔ صرف سانس لینے پر توجہ دینے سے ہی آپ کا دل پرسرار ہو جاتا ہے۔ سانس چھوڑتے وقت سانس لیتے وقت سے زیادہ لمبا کرنا بہتر ہے۔",
      "method": [
        "آرام سے بیٹھ جائیں یا لیٹ جائیں اور اپنی پیٹھ سیدھی رکھیں۔",
        "اپنا منہ بند رکھیں اور صرف ناک سے سانس لیں۔",
        "سانس لینے اور چھوڑنے کو معمول کے مطابق قدرتی طریقے سے جاری رکھیں۔",
        "صرف سانس لینے پر توجہ دیں، اگر کوئی خیال آئے تو دوبارہ سانس کی طرف آئیں۔",
        "2 منٹ تک برقرار رکھیں۔"
      ],
      "effect": [
        "خودکار اعصابی نظام کو مستحکم کر کے فوری طور پر دل پرسرار ہوتا ہے",
        "پیرا سمپیتھیٹک اعصاب کو فعال بناتا ہے → تناؤ کے ہارمون (کورٹیسول) میں کمی",
        "سیکھنے والوں کے لیے سانس کی شعور (awareness) سیکھنے کا سب سے محفوظ طریقہ",
        "روز مرہ کہیں بھی فوری طور پر استعمال کیے جانے والا بنیادی بحالی کا آلہ"
      ]
    },
    "2": {
      "title": "② بنیادی · اعصابی استحکام سانس (4-7-8)",
      "intro": "امریکی ڈاکٹر اینڈریو ویل کی طرف سے تیار کیا گیا 'اعصابی نظام کا قدرتی مسکن'۔ بے خوابی اور بے چینی کو کم کرنے کے لیے طبی طور پر تصدیق شدہ سانس لینے کی تکنیک ہے۔",
      "method": [
        "اپنی زبان کی نوک کو اوپری دانتوں کے پیچھے تالو پر ہلکے سے رکھیں۔",
        "منہ سے تمام ہوا کو 'فو~' آواز کے ساتھ مکمل طور پر باہر نکالیں۔",
        "منہ بند کریں اور 4 سیکنڈ تک ناک سے سانس لیں۔",
        "7 سیکنڈ تک سانس روکیں۔",
        "منہ سے 'فو~' آواز کے ساتھ 8 سیکنڈ میں سانس چھوڑیں۔",
        "اس سائیکل کو 4 سے 6 بار دہرائیں (تقریباً 2 منٹ)۔"
      ],
      "effect": [
        "بے خوابی میں بہتری — سونے سے پہلے کرنے سے جلدی سونے میں مدد",
        "بے چینی کے دوروں اور گھبراہٹ کی خرابی میں کمی کے لیے طبی طور پر تصدیق شدہ",
        "7 سیکنڈ سانس روکنا آکسیجن اور کاربن ڈائی آکسائیڈ کے توازن کو ٹھیک کر کے اعصابی استحکام لاتا ہے",
        "تقریر یا امتحان سے پہلے تناؤ میں فوری اثر"
      ]
    },
    "3": {
      "title": "③ ماہر · ذہنی طاقت کی سانس (باکس سانس)",
      "intro": "امریکی نیوی سیل (خصوصی دستے) انتہائی حالات میں استعمال کرتے ہیں۔ توجہ اور سکون کو بیک وقت بڑھاتا ہے۔",
      "method": [
        "اپنی پیٹھ سیدھی رکھیں اور کندھوں کو ڈھیلا کریں۔",
        "4 سیکنڈ تک ناک سے سانس لیں (پیٹ پھولنے دیں)۔",
        "4 سیکنڈ تک سانس روکیں۔",
        "4 سیکنڈ تک ناک یا منہ سے سانس چھوڑیں۔",
        "4 سیکنڈ تک دوبارہ سانس روکیں۔",
        "مربع بناتے ہوئے یہ 4 مرحلہ 2 منٹ تک دہرائیں۔"
      ],
      "effect": [
        "انتہائی تناؤ والی صورتحال میں سکون برقرار رکھنے کی صلاحیت میں اضافہ",
        "توجہ اور سکون کو بیک وقت بڑھاتا ہے",
        "تقریر، امتحان یا اہم فیصلے سے پہلے دل کو پرسرار کرنے میں موثر",
        "خون کی فشار کو مستحکم کرتا ہے اور دماغ میں آکسیجن کی سپلائی کو بہتر بناتا ہے"
      ]
    },
    "4": {
      "title": "④ ماہر · مدافعتی طاقت کی سانس (وم ہوف)",
      "intro": "ہالینڈ کے 'آئس مین' وم ہوف کی طرف سے تیار کی گئی سانس لینے کی تکنیک۔ مدافعتی طاقت میں اضافہ اور اپنے تناؤ کو کنٹرول کرنے کی صلاحیت بڑھانے کے لیے ایک اعلیٰ سطح کی تکنیک۔",
      "method": [
        "آرام سے بیٹھ جائیں یا لیٹ جائیں۔",
        "زیادہ سانس لینے کا مرحلہ: گہری سانس لیں اور ڈھیل کے ساتھ سانس چھوڑیں، یہ 30 بار دہرائیں (تقریباً 1 منٹ)۔",
        "آخری سانس چھوڑنے کے بعد جتنی دیر ممکن ہو سانس روکیں (30 سیکنڈ سے 1 منٹ)۔",
        "بحالی سانس: زوردار سانس لیں، 15 سیکنڈ روکیں، پھر چھوڑیں۔",
        "1 سائیکل کے ساتھ ختم کریں (تقریباً 2 منٹ)۔"
      ],
      "effect": [
        "مدافعتی ردعمل میں اضافہ — سائنسی مقالوں سے تصدیق شدہ",
        "تناؤ کے ہارمون (ایڈرینلین) کو خود کنٹرول کرنے کی صلاحیت میں بہتری",
        "سوزش کے ردعمل کو دبانا اور توانائی کی سطح میں بھاری اضافہ",
        "سردی اور درد کے خلاف مزاحمت میں اضافہ",
        "دماغی اور جسمانی لچک (Resilience) کی سب سے اعلیٰ سطح تک پہنچنا"
      ],
      "safetyNotice": "لازمی طور پر بیٹھے ہوئے یا لیٹے ہوئے حالت میں یہ تکنیک استعمال کریں۔ چکر آ سکتے ہیں اس لیے پانی میں، گاڑی چلاتے وقت یا کھڑے حالت میں ہرگز مت کریں۔"
    }
  }
};

export const DASH_GUIDE_TRANSLATIONS = {
  "en": {
    "1": {
      "title": "① Beginner · Walking / Running / Stretching",
      "methodSections": [
        {
          "heading": "Marching in Place Version",
          "steps": [
            "March in place, lifting your legs alternately.",
            "Aim to lift your knees up to hip height.",
            "Let your arms swing naturally.",
            "Maintain a steady rhythm for 1 minute.",
            "Breathe naturally through your nose and exhale through your mouth."
          ]
        },
        {
          "heading": "Running Version",
          "steps": [
            "Start with a light jog in place to warm up your ankles and knees.",
            "Keep your eyes forward and lean your upper body slightly ahead.",
            "Bend your elbows to 90 degrees and swing your arms forward and back with rhythm.",
            "Land on the balls of your feet and maintain a steady pace.",
            "Breathe in through your nose and out through your mouth, keeping it up for 1 minute."
          ]
        },
        {
          "heading": "Stretching Version",
          "steps": [
            "Gently roll your neck side to side (15 seconds)",
            "Lift and drop your shoulders (15 seconds)",
            "Twist your waist side to side (15 seconds)",
            "Stretch your sides, reaching both arms up (15 seconds)"
          ]
        }
      ],
      "effect": [
        "Easy to start, even for beginners",
        "Boosts circulation right away → eases cold hands and feet",
        "Warms up stiff joints and muscles",
        "Relieves the strain of sitting at a desk or working from home"
      ]
    },
    "2": {
      "title": "② Basic · Squats / Push-ups",
      "methodSections": [
        {
          "heading": "Squat Version",
          "steps": [
            "Stand with your feet shoulder-width apart, toes pointing slightly outward.",
            "Lower yourself as if sitting back in a chair, pushing your hips back.",
            "Keep your knees from extending past your toes.",
            "Lower until your thighs are parallel to the ground, then stand back up.",
            "Repeat slowly for 1 minute (aiming for 20–25 reps)."
          ]
        },
        {
          "heading": "Push-up Version",
          "steps": [
            "Place your hands slightly wider than shoulder-width on the floor.",
            "Beginners can start with knees bent if needed.",
            "Lower yourself slowly until your chest nearly touches the ground.",
            "Push through your arms to return to the starting position.",
            "Repeat as much as you can for 1 minute."
          ]
        }
      ],
      "effect": [
        "Activates large leg and upper body muscles → boosts your metabolic rate",
        "Your heart rate rises within 1 minute, giving you immediate results",
        "Improves posture and strengthens your core at the same time",
        "Perfect for a quick break at your desk"
      ]
    },
    "3": {
      "title": "③ Intermediate · Burpees / Jumping Jacks",
      "methodSections": [
        {
          "heading": "Burpee Version",
          "steps": [
            "Start by standing.",
            "Crouch down and place your hands on the floor.",
            "Kick your legs back to land in a plank position.",
            "Pull your legs forward and stand up.",
            "Jump up and clap your hands overhead.",
            "Repeat for 1 minute (aiming for 10–15 reps)."
          ]
        },
        {
          "heading": "Jumping Jack Version",
          "steps": [
            "Start standing with feet together.",
            "Jump, spreading your legs to shoulder-width and raising your arms overhead.",
            "Jump again and return to the starting position.",
            "Keep a steady rhythm and repeat quickly for 1 minute."
          ]
        }
      ],
      "effect": [
        "Works the whole body with both cardio and strength training",
        "Spikes your heart rate → burns maximum calories in just 1 minute",
        "Releases endorphins for a powerful sense of accomplishment",
        "Feel the definite difference in just 1 minute and build confidence"
      ]
    },
    "4": {
      "title": "④ Expert · HIIT Mini (20 sec × 3 sets)",
      "method": [
        "Set 1 (0–20 sec): Do burpees as fast as possible.",
        "Move directly to the next set with no rest.",
        "Set 2 (20–40 sec): Mountain climbers — from a plank, quickly drive your knees toward your chest, alternating legs.",
        "Set 3 (40–60 sec): Do jumping jacks at full speed.",
        "Push to your maximum intensity for each set."
      ],
      "effect": [
        "Get the benefit of 10+ minutes of exercise in just 1 minute",
        "Keeps burning calories for 24 hours after your workout (afterburn effect)",
        "Builds both cardiovascular and muscular endurance",
        "The perfect workout for busy people",
        "Improves blood sugar control and insulin sensitivity"
      ],
      "safetyNotice": "This is a high-intensity workout. If you have heart disease or injuries, consult a doctor first. Never start without warming up."
    }
  },
  "es": {
    "1": {
      "title": "① Introducción · Caminar / Correr / Estiramientos",
      "methodSections": [
        {
          "heading": "Versión de Marcha en Lugar",
          "steps": [
            "Camina en el mismo lugar levantando las piernas alternadamente.",
            "Intenta elevar las rodillas hasta la altura de la cintura.",
            "Balancea los brazos de forma natural.",
            "Mantén un ritmo constante durante 1 minuto.",
            "La respiración debe ser natural: inhala por la nariz y exhala por la boca."
          ]
        },
        {
          "heading": "Versión de Carrera",
          "steps": [
            "Comienza con saltos ligeros en el mismo lugar para calentar tobillos y rodillas.",
            "La vista dirigida al frente y el torso ligeramente inclinado hacia adelante.",
            "Dobla los codos a 90 grados y balancéalos hacia adelante y atrás con ritmo.",
            "Aterriza suavemente con la parte delantera del pie y mantén una velocidad constante.",
            "Respira naturalmente por la nariz e inhala por la boca, manteniendo 1 minuto."
          ]
        },
        {
          "heading": "Versión de Estiramiento",
          "steps": [
            "Giros lentos de cabeza de lado a lado (15 segundos)",
            "Levanta los hombros y baja lentamente (15 segundos)",
            "Giro de cintura de lado a lado (15 segundos)",
            "Estiramiento lateral: brazos hacia arriba estirando los costados (15 segundos)"
          ]
        }
      ],
      "effect": [
        "Accesible para principiantes sin necesidad de estar en forma",
        "Mejora la circulación sanguínea inmediatamente → alivia la sensación de frío en manos y pies",
        "Despierta las articulaciones y músculos rígidos con un efecto de calentamiento",
        "Alivia el malestar de estar sentado durante mucho tiempo para trabajadores de oficina"
      ]
    },
    "2": {
      "title": "② Básico · Sentadilla / Flexiones",
      "methodSections": [
        {
          "heading": "Versión de Sentadilla",
          "steps": [
            "Abre los pies al ancho de los hombros y los dedos ligeramente hacia afuera.",
            "Baja el cuerpo como si te fueras a sentar en una silla, echando las caderas hacia atrás mientras doblas las rodillas.",
            "Ten cuidado de que las rodillas no se proyecten más adelante de los dedos de los pies.",
            "Baja hasta que los muslos estén paralelos al suelo y luego sube.",
            "Repite lentamente durante 1 minuto (objetivo: 20 a 25 repeticiones)."
          ]
        },
        {
          "heading": "Versión de Flexión",
          "steps": [
            "Coloca las manos separadas un poco más que el ancho de los hombros en el suelo.",
            "Los principiantes pueden comenzar con las rodillas dobladas.",
            "Baja lentamente hasta que el pecho casi toque el suelo.",
            "Empuja con los brazos para volver a la posición inicial.",
            "Repite tantas veces como sea posible durante 1 minuto."
          ]
        }
      ],
      "effect": [
        "Activa los grandes músculos de la parte inferior y superior del cuerpo → aumenta el metabolismo basal",
        "La frecuencia cardíaca sube en menos de 1 minuto, entregando beneficios de ejercicio inmediatamente",
        "Corrección postural y fortalecimiento del núcleo al mismo tiempo",
        "Perfecto para breves descansos en el escritorio"
      ]
    },
    "3": {
      "title": "③ Avanzado · Burpee / Jumping Jack",
      "methodSections": [
        {
          "heading": "Versión de Burpee",
          "steps": [
            "Comienza de pie.",
            "Baja en cuclillas con las manos tocando el suelo.",
            "Extiende las piernas hacia atrás en una posición de plancha.",
            "Trae las piernas hacia adelante nuevamente y levántate.",
            "Salta y aplaude las manos sobre tu cabeza.",
            "Repite durante 1 minuto (objetivo: 10 a 15 repeticiones)."
          ]
        },
        {
          "heading": "Versión de Jumping Jack",
          "steps": [
            "Comienza en posición firme.",
            "Salta separando las piernas al ancho de los hombros mientras levantas los brazos sobre la cabeza.",
            "Salta de nuevo volviendo a la posición firme.",
            "Mantén el ritmo y repite rápidamente durante 1 minuto."
          ]
        }
      ],
      "effect": [
        "Cardio de cuerpo completo + efecto de fortalecimiento muscular simultáneamente",
        "La frecuencia cardíaca aumenta drásticamente → máxima quema de calorías en corto tiempo",
        "Libera endorfinas para una sensación de logro intenso después del ejercicio",
        "En 1 minuto obtienes una sensación clara de 'he hecho ejercicio' y confianza en ti mismo"
      ]
    },
    "4": {
      "title": "④ Experto · HIIT Rápido (20 segundos × 3 sets)",
      "method": [
        "Set 1 (0~20 segundos): Repite burpees lo más rápido posible.",
        "Sin descanso, pasa al siguiente set.",
        "Set 2 (20~40 segundos): Escaladores de montaña — en posición de plancha, trae las rodillas hacia el pecho rápidamente alternando.",
        "Set 3 (40~60 segundos): Repite jumping jacks a toda velocidad.",
        "Realiza cada set con tu máxima intensidad."
      ],
      "effect": [
        "1 minuto equivale al efecto de 10 minutos o más de ejercicio regular",
        "El cuerpo sigue quemando calorías durante 24 horas después (efecto afterburn)",
        "Mejora simultáneamente la resistencia cardiovascular y muscular",
        "El ejercicio perfecto para personas modernas con poco tiempo",
        "Mejora la capacidad de control del azúcar en sangre y la sensibilidad a la insulina"
      ],
      "safetyNotice": "Este es un ejercicio de máxima intensidad. Si tienes enfermedades cardiovasculares o lesiones, consulta con un médico antes de comenzar. No comiences abruptamente sin calentamiento previo."
    }
  },
  "vi": {
    "1": {
      "title": "① Người mới · Đi bộ / Chạy bộ / Giãn cơ",
      "methodSections": [
        {
          "heading": "Phiên bản Đi bộ tại chỗ",
          "steps": [
            "Đi bộ tại chỗ, thay phiên nâng chân.",
            "Cố gắng nâng đầu gối lên cao bằng chiều cao hông.",
            "Đung tay tự nhiên.",
            "Duy trì nhịp điệu đều đặn trong 1 phút.",
            "Hô hấp tự nhiên, hít vào qua mũi và thả ra qua miệng."
          ]
        },
        {
          "heading": "Phiên bản Chạy bộ",
          "steps": [
            "Nhảy tại chỗ nhẹ nhàng để giãn đủ mắt cá chân và đầu gối.",
            "Nhìn về phía trước và nghiêng hơi phần thân trên về phía trước.",
            "Gập cùi chỏ 90 độ và đung tay phía trước và phía sau theo nhịp.",
            "Chạm đất nhẹ nhàng với phần trước bàn chân và duy trì tốc độ đều.",
            "Hít vào qua mũi, thả ra qua miệng và duy trì trong 1 phút."
          ]
        },
        {
          "heading": "Phiên bản Giãn cơ",
          "steps": [
            "Xoay cổ trái phải chậm chạp (15 giây)",
            "Nâng vai lên cao và hạ xuống (15 giây)",
            "Xoay hông trái phải (15 giây)",
            "Giơ hai tay lên cao và giãn bên sườn (15 giây)"
          ]
        }
      ],
      "effect": [
        "Người mới bắt đầu cũng có thể bắt đầu mà không gặp áp lực",
        "Cải thiện tuần hoàn máu ngay → giảm cảm giác lạnh ở tay và chân",
        "Hiệu ứng khởi động giãn vô căng cứng khớp và cơ",
        "Giảm bớt áp lực từ ngồi lâu cho nhân viên văn phòng và những người làm việc tại nhà"
      ]
    },
    "2": {
      "title": "② Cơ bản · Squat / Chống đẩy",
      "methodSections": [
        {
          "heading": "Phiên bản Squat",
          "steps": [
            "Mở rộng chân bằng chiều rộng vai, với đầu chân hơi quay ra ngoài.",
            "Gập đầu gối, đẩy hông lùi như ngồi vào ghế.",
            "Chú ý để đầu gối không vượt quá phía trước bàn chân.",
            "Hạ xuống cho đến khi đùi song song với sàn, rồi đứng lên.",
            "Lặp lại chậm chạp trong 1 phút (mục tiêu 20-25 lần)."
          ]
        },
        {
          "heading": "Phiên bản Chống đẩy",
          "steps": [
            "Đặt tay trên sàn hơi rộng hơn chiều rộng vai.",
            "Người mới bắt đầu có thể bắt đầu với đầu gối gập.",
            "Hạ xuống chậm chạp cho đến khi ngực chạm sàn.",
            "Dùng tay để đẩy lên trở về tư thế ban đầu.",
            "Lặp lại bao nhiêu lần có thể trong 1 phút."
          ]
        }
      ],
      "effect": [
        "Kích hoạt cơ lớn phía dưới và phía trên → tăng tỷ lệ trao đổi chất cơ bản",
        "Nhịp tim tăng lên trong 1 phút → hiệu quả tập luyện phát huy ngay",
        "Hiệu ứng cùng lúc của sửa tư thế và tăng cường sức mạnh cốt lõi",
        "Tối ưu cho thời gian nghỉ ngắn ở bàn"
      ]
    },
    "3": {
      "title": "③ Thành thạo · Burpee / Nhảy Jack",
      "methodSections": [
        {
          "heading": "Phiên bản Burpee",
          "steps": [
            "Bắt đầu từ tư thế đứng.",
            "Cồm xuống và đặt tay trên sàn.",
            "Đá chân ra phía sau để tạo tư thế plank.",
            "Kéo chân lại phía trước và đứng lên.",
            "Nhảy lên cao và vỗ tay phía trên đầu.",
            "Lặp lại trong 1 phút (mục tiêu 10-15 lần)."
          ]
        },
        {
          "heading": "Phiên bản Nhảy Jack",
          "steps": [
            "Bắt đầu từ tư thế đứng thẳng.",
            "Nhảy và mở chân rộng bằng chiều rộng vai, đôi tay nâng lên trên đầu.",
            "Nhảy lại và trở về tư thế đứng thẳng.",
            "Duy trì nhịp điệu và lặp lại nhanh chóng trong 1 phút."
          ]
        }
      ],
      "effect": [
        "Hiệu ứng kết hợp của tập luyện tim mạch toàn thân + tập luyện sức mạnh",
        "Nhịp tim tăng đột ngột → tiêu hao calo tối đa trong thời gian ngắn",
        "Giải phóng endorphin để có cảm giác thành tựu mạnh mẽ sau tập luyện",
        "Đạt được cảm giác chắc chắn là 'tôi đã tập luyện' và tự tin trong 1 phút"
      ]
    },
    "4": {
      "title": "④ Chuyên gia · HIIT Mini (20 giây × 3 bộ)",
      "method": [
        "Bộ 1 (0-20 giây): Lặp lại burpee nhanh nhất có thể.",
        "Không nghỉ ngơi, tiếp tục sang bộ tiếp theo.",
        "Bộ 2 (20-40 giây): Nhà leo núi — từ tư thế plank, kéo đầu gối lên gần ngực thay phiên nhanh chóng.",
        "Bộ 3 (40-60 giây): Lặp lại nhảy Jack với toàn lực.",
        "Thực hiện mỗi bộ với cường độ tối đa của bạn."
      ],
      "effect": [
        "1 phút tương đương với hơn 10 phút tập luyện thường thường — hiệu ứng nén",
        "Tiêu hao calo kéo dài 24 giờ sau tập luyện (hiệu ứng afterburn)",
        "Cải thiện sức chịu đựng tim phổi và sức chịu đựng cơ cùng lúc",
        "Tập luyện tối ưu cho người hiện đại thiếu thời gian",
        "Cải thiện khả năng kiểm soát đường huyết và độ nhạy insulin"
      ],
      "safetyNotice": "Đây là tập luyện cường độ cao nhất. Nếu bạn có bệnh tim mạch hoặc chấn thương, vui lòng tư vấn với bác sĩ trước khi bắt đầu. Đừng bắt đầu đột ngột mà không khởi động."
    }
  },
  "zh": {
    "1": {
      "title": "① 入门 · 步行 / 跑步 / 伸展",
      "methodSections": [
        {
          "heading": "原地步行版本",
          "steps": [
            "在原地交替抬起腿，做步行动作。",
            "尽量将膝盖抬至腰部高度。",
            "自然地摆动手臂。",
            "保持一定的节奏，坚持1分钟。",
            "呼吸自然，用鼻子吸气，用嘴呼气。"
          ]
        },
        {
          "heading": "跑步版本",
          "steps": [
            "用轻快的原地跳跃充分拉松脚踝和膝盖。",
            "眼睛看向正前方，上身略微向前倾斜。",
            "肘部弯曲90度，前后有节奏地摆动。",
            "用前脚掌轻轻着地，以一定的速度跑步。",
            "用鼻子吸气，用嘴呼气，坚持1分钟。"
          ]
        },
        {
          "heading": "伸展版本",
          "steps": [
            "缓慢地左右转动脖子（15秒）",
            "肩膀向上提起后放下（15秒）",
            "腰部左右扭转（15秒）",
            "两臂向上伸展，做侧腹伸展（15秒）"
          ]
        }
      ],
      "effect": [
        "运动初学者也可轻松开始",
        "血液循环立即改善→缓解手脚冰冷感",
        "唤醒僵硬的关节和肌肉，起到热身效果",
        "缓解办公室职员和在家工作者长时间久坐的负担"
      ]
    },
    "2": {
      "title": "② 基本 · 深蹲 / 俯卧撑",
      "methodSections": [
        {
          "heading": "深蹲版本",
          "steps": [
            "两脚分开至肩宽，脚尖略微向外。",
            "像坐在椅子上一样，把臀部向后推，弯曲膝盖。",
            "注意膝盖不要超过脚尖。",
            "下蹲至大腿与地面平行，然后起身。",
            "缓慢重复1分钟（目标20-25次）。"
          ]
        },
        {
          "heading": "俯卧撑版本",
          "steps": [
            "双手分开至肩宽稍宽，撑在地上。",
            "初学者可以弯曲膝盖开始。",
            "缓慢下降至胸部接近地面。",
            "用手臂撑起，回到起始位置。",
            "在1分钟内尽可能多地重复。"
          ]
        }
      ],
      "effect": [
        "激活下肢和上肢大肌肉群→增加基础代谢率",
        "1分钟内心率上升，立即产生运动效果",
        "同时改善姿态和增强核心肌群力量",
        "最适合办公室短暂休息时间"
      ]
    },
    "3": {
      "title": "③ 熟练 · 波比运动 / 开合跳",
      "methodSections": [
        {
          "heading": "波比运动版本",
          "steps": [
            "从站立姿势开始。",
            "蹲下并将双手放在地上。",
            "向后踢腿做平板支撑姿势。",
            "收回腿并站起身。",
            "跳起并在头顶拍手。",
            "重复1分钟（目标10-15次）。"
          ]
        },
        {
          "heading": "开合跳版本",
          "steps": [
            "从立正姿势开始。",
            "跳起，同时两腿分开至肩宽，两臂向上抬起。",
            "再跳起，回到立正姿势。",
            "保持节奏，在1分钟内快速重复。"
          ]
        }
      ],
      "effect": [
        "全身有氧+力量训练同时进行",
        "心率急速上升→短时间内最大卡路里消耗",
        "分泌内啡肽，运动后产生强烈的成就感",
        "1分钟内产生'我在运动'的明确感受和自信心"
      ]
    },
    "4": {
      "title": "④ 专家 · HIIT迷你课程（20秒×3组）",
      "method": [
        "第1组（0-20秒）：尽快重复波比运动。",
        "不休息，直接进入下一组。",
        "第2组（20-40秒）：登山式——平板支撑姿势下，快速交替将膝盖向胸部拉动。",
        "第3组（40-60秒）：全力重复开合跳。",
        "每组都以自己的最大强度进行。"
      ],
      "effect": [
        "1分钟相当于常规运动10分钟以上的压缩效果",
        "运动后24小时内继续消耗卡路里（运动后效应）",
        "同时提升心肺耐力和肌肉耐力",
        "最适合时间紧张的现代人",
        "改善血糖控制能力和胰岛素敏感性"
      ],
      "safetyNotice": "这是最高强度运动。如有心血管疾病或受伤，请在咨询医生后再开始。不要在没有热身的情况下突然进行。"
    }
  },
  "id": {
    "1": {
      "title": "① Pemula · Berjalan / Berlari / Peregangan",
      "methodSections": [
        {
          "heading": "Versi Jalan di Tempat",
          "steps": [
            "Angkat kaki secara bergantian sambil berjalan di tempat.",
            "Cobalah mengangkat lutut setinggi pinggang.",
            "Ayunkan lengan dengan alami.",
            "Pertahankan ritme yang konsisten selama 1 menit.",
            "Bernapaslah dengan alami — hirup melalui hidung dan hembuskan melalui mulut."
          ]
        },
        {
          "heading": "Versi Berlari",
          "steps": [
            "Hangatkan kaki dan lutut dengan lompatan ringan di tempat.",
            "Pandangan lurus ke depan dan miringkan tubuh bagian atas sedikit ke depan.",
            "Tekuk siku 90 derajat dan ayunkan lengan ke depan dan belakang dengan ritme.",
            "Mendarat dengan ringan di ujung kaki dan berlari dengan kecepatan yang konsisten.",
            "Hirup melalui hidung dan hembuskan melalui mulut sambil mempertahankan selama 1 menit."
          ]
        },
        {
          "heading": "Versi Peregangan",
          "steps": [
            "Putar kepala ke kiri dan kanan dengan perlahan (15 detik)",
            "Naikkan bahu ke atas lalu turunkan (15 detik)",
            "Twist pinggang ke kiri dan kanan (15 detik)",
            "Rentangkan kedua lengan ke atas dan peregangan sisi tubuh (15 detik)"
          ]
        }
      ],
      "effect": [
        "Pemula dapat memulai tanpa rasa beban",
        "Perbaikan sirkulasi darah langsung → meringankan sensasi tangan dan kaki dingin",
        "Efek pemanasan untuk membangkitkan persendian dan otot yang kaku",
        "Mengatasi beban duduk lama bagi pekerja kantor dan yang bekerja dari rumah"
      ]
    },
    "2": {
      "title": "② Dasar · Squat / Push-up",
      "methodSections": [
        {
          "heading": "Versi Squat",
          "steps": [
            "Buka kaki selebar bahu, ujung kaki menghadap sedikit ke luar.",
            "Dorong pinggul ke belakang seolah-olah duduk di kursi sambil membengkokkan lutut.",
            "Hati-hati agar lutut tidak melebihi ujung kaki.",
            "Turun hingga paha sejajar dengan lantai, lalu naik kembali.",
            "Ulangi dengan perlahan selama 1 menit (target 20-25 kali)."
          ]
        },
        {
          "heading": "Versi Push-up",
          "steps": [
            "Letakkan tangan selebar bahu atau sedikit lebih lebar di lantai.",
            "Pemula boleh memulai dengan lutut dibengkokkan.",
            "Turunkan dada ke lantai dengan perlahan.",
            "Dorong dengan tangan dan kembali ke posisi awal.",
            "Ulangi sebanyak mungkin selama 1 menit."
          ]
        }
      ],
      "effect": [
        "Mengaktifkan otot besar bawah dan atas tubuh → meningkatkan laju metabolisme basal",
        "Detak jantung meningkat dalam 1 menit, efek olahraga langsung terasa",
        "Efek koreksi postur dan penguatan otot inti secara bersamaan",
        "Sempurna untuk istirahat singkat di depan meja"
      ]
    },
    "3": {
      "title": "③ Lanjutan · Burpee / Jumping Jack",
      "methodSections": [
        {
          "heading": "Versi Burpee",
          "steps": [
            "Mulai dari posisi berdiri.",
            "Jongkok dan letakkan tangan di lantai.",
            "Tendang kaki ke belakang untuk membentuk posisi plank.",
            "Tarik kaki kembali dan bangun.",
            "Lompat sambil bertepuk tangan di atas kepala.",
            "Ulangi selama 1 menit (target 10-15 kali)."
          ]
        },
        {
          "heading": "Versi Jumping Jack",
          "steps": [
            "Mulai dari posisi siap.",
            "Lompat sambil membuka kaki selebar bahu dan mengangkat tangan ke atas kepala.",
            "Lompat lagi dan kembali ke posisi siap.",
            "Pertahankan ritme dan ulangi dengan cepat selama 1 menit."
          ]
        }
      ],
      "effect": [
        "Efek aerobik seluruh tubuh + latihan kekuatan sekaligus",
        "Detak jantung meningkat drastis → pembakaran kalori maksimal dalam waktu singkat",
        "Pelepasan endorfin menghasilkan rasa pencapaian yang kuat setelah olahraga",
        "Dapatkan kepercayaan diri dan rasa \"sudah berolahraga\" yang pasti dalam 1 menit"
      ]
    },
    "4": {
      "title": "④ Ahli · HIIT Mini (20 detik×3 set)",
      "method": [
        "Set 1 (0-20 detik): Ulangi burpee secepat mungkin.",
        "Lanjut langsung ke set berikutnya tanpa istirahat.",
        "Set 2 (20-40 detik): Mountain Climber — dari posisi plank, tarik lutut ke dada dengan cepat secara bergantian.",
        "Set 3 (40-60 detik): Ulangi jumping jack dengan kekuatan penuh.",
        "Lakukan setiap set dengan intensitas maksimal Anda."
      ],
      "effect": [
        "Efek kompresi — 1 menit setara dengan 10 menit olahraga biasa atau lebih",
        "Pembakaran kalori berlanjut selama 24 jam setelah olahraga (efek after-burn)",
        "Peningkatan daya tahan kardio dan daya tahan otot sekaligus",
        "Olahraga terbaik untuk orang modern yang kekurangan waktu",
        "Meningkatkan kemampuan pengaturan gula darah dan sensitivitas insulin"
      ],
      "safetyNotice": "Ini adalah olahraga intensitas tinggi. Jika Anda memiliki penyakit kardiovaskular atau cedera, konsultasikan dengan dokter sebelum memulai. Jangan mulai tiba-tiba tanpa pemanasan."
    }
  },
  "hi": {
    "1": {
      "title": "① प्रवेश · चलना / दौड़ना / स्ट्रेचिंग",
      "methodSections": [
        {
          "heading": "जगह पर चलना संस्करण",
          "steps": [
            "जगह पर अपने पैरों को बारी-बारी से उठाते हुए चलें।",
            "अपने घुटनों को कमर की ऊंचाई तक उठाने की कोशिश करें।",
            "अपनी भुजाओं को भी स्वाभाविक रूप से हिलाएं।",
            "1 मिनट के लिए एक स्थिर लय बनाए रखें।",
            "स्वाभाविक रूप से नाक से सांस लें और मुंह से छोड़ें।"
          ]
        },
        {
          "heading": "दौड़ना संस्करण",
          "steps": [
            "हल्के जगह पर कूद-कूद कर अपनी पिंडली और घुटनों को अच्छी तरह ढीला करें।",
            "अपनी दृष्टि सामने की ओर रखें और अपनी ऊपरी शरीर को थोड़ा आगे झुकाएं।",
            "अपनी कोहनियों को 90 डिग्री पर मोड़ें और आगे-पीछे लयबद्ध तरीके से हिलाएं।",
            "अपने पैरों के अगले हिस्से से हल्के-फुल्के तरीके से दौड़ें और एक समान गति बनाए रखें।",
            "नाक से सांस लें और मुंह से छोड़ते हुए 1 मिनट के लिए जारी रखें।"
          ]
        },
        {
          "heading": "स्ट्रेचिंग संस्करण",
          "steps": [
            "गर्दन को बाएं-दाएं धीरे-धीरे घुमाएं (15 सेकंड)",
            "कंधों को ऊपर उठाएं और नीचे करें (15 सेकंड)",
            "कमर को बाएं-दाएं मोड़ें (15 सेकंड)",
            "दोनों भुजाओं को ऊपर की ओर फैलाएं और बग़ल को स्ट्रेच करें (15 सेकंड)"
          ]
        }
      ],
      "effect": [
        "व्यायाम के शुरुआती भी बिना किसी चिंता के शुरू कर सकते हैं",
        "रक्त परिसंचरण तुरंत बेहतर होता है → हाथ-पैरों में ठंड का एहसास कम होता है",
        "जकड़ी हुई जोड़ों और मांसपेशियों को जागृत करने का वार्मअप प्रभाव",
        "डेस्क जॉब और वर्क-फ्रॉम-होम करने वाले लोगों के लंबे समय तक बैठने का बोझ कम करता है"
      ]
    },
    "2": {
      "title": "② बुनियादी · स्क्वाट / पुश-अप्स",
      "methodSections": [
        {
          "heading": "स्क्वाट संस्करण",
          "steps": [
            "अपने पैरों को कंधे की चौड़ाई तक फैलाएं और पैरों के आगे का हिस्सा बाहर की ओर रखें।",
            "कुर्सी पर बैठने जैसे अपनी एड़ी को पीछे की ओर करते हुए घुटनों को मोड़ें।",
            "ध्यान रहे कि घुटने पैरों के आगे न जाएं।",
            "तब तक नीचे जाएं जब तक आपकी जांघ फर्श के समानांतर न हो, फिर ऊपर उठें।",
            "1 मिनट के लिए धीरे-धीरे दोहराएं (20-25 बार का लक्ष्य)।"
          ]
        },
        {
          "heading": "पुश-अप्स संस्करण",
          "steps": [
            "अपने हाथों को कंधे की चौड़ाई से थोड़ा अधिक चौड़ी दूरी पर फर्श पर रखें।",
            "शुरुआती अपने घुटनों को मोड़ी हुई अवस्था में शुरू कर सकते हैं।",
            "अपनी छाती को फर्श तक पहुंचने तक धीरे-धीरे नीचे करें।",
            "अपनी भुजाओं से ऊपर की ओर धक्का दें और शुरुआती स्थिति में वापस आएं।",
            "1 मिनट के लिए जितना हो सके दोहराएं।"
          ]
        }
      ],
      "effect": [
        "निचले और ऊपरी शरीर की बड़ी मांसपेशियों को सक्रिय करता है → आधार चयापचय दर बढ़ता है",
        "1 मिनट में ही दिल की गति बढ़ जाती है, व्यायाम का प्रभाव तुरंत दिखता है",
        "मुद्रा सुधार और कोर मांसपेशी शक्ति में एक साथ सुधार",
        "डेस्क पर कम समय के लिए आराम करते समय के लिए सर्वोत्तम"
      ]
    },
    "3": {
      "title": "③ अनुभवी · बर्पीज़ / जम्पिंग जैक्स",
      "methodSections": [
        {
          "heading": "बर्पीज़ संस्करण",
          "steps": [
            "खड़े होकर शुरू करें।",
            "नीचे बैठते हुए अपने हाथों को फर्श पर रखें।",
            "अपने पैरों को पीछे की ओर तेजी से लाएं और प्लैंक स्थिति बनाएं।",
            "अपने पैरों को वापस खींचते हुए ऊपर उठें।",
            "कूदते हुए अपने सिर के ऊपर हाथ पकड़ते हुए ताली बजाएं।",
            "1 मिनट के लिए दोहराएं (10-15 बार का लक्ष्य)।"
          ]
        },
        {
          "heading": "जम्पिंग जैक्स संस्करण",
          "steps": [
            "सावधानी की स्थिति से शुरू करें।",
            "कूदते हुए अपने पैरों को कंधे की चौड़ाई तक फैलाएं और अपनी भुजाओं को सिर के ऊपर उठाएं।",
            "फिर से कूदते हुए सावधानी की स्थिति में वापस आएं।",
            "लय को बनाए रखते हुए 1 मिनट के लिए तेजी से दोहराएं।"
          ]
        }
      ],
      "effect": [
        "पूरे शरीर की वायव सहनशीलता + मांसपेशी शक्ति व्यायाम एक साथ",
        "दिल की गति तेजी से बढ़ती है → कम समय में अधिकतम कैलोरी जलना",
        "एंडोर्फिन का स्राव व्यायाम के बाद मजबूत उपलब्धि की भावना देता है",
        "1 मिनट में ही 'मैंने व्यायाम कर लिया' की निश्चित भावना और आत्मविश्वास प्राप्त करें"
      ]
    },
    "4": {
      "title": "④ विशेषज्ञ · HIIT मिनी (20 सेकंड × 3 सेट)",
      "method": [
        "सेट 1 (0-20 सेकंड): बर्पीज़ को यथासंभव तेजी से दोहराएं।",
        "बिना आराम के सीधे अगले सेट पर जाएं।",
        "सेट 2 (20-40 सेकंड): माउंटेन क्लाइम्बर — प्लैंक स्थिति में अपने घुटनों को छाती की ओर तेजी से बारी-बारी से खींचें।",
        "सेट 3 (40-60 सेकंड): जम्पिंग जैक्स को पूरी ताकत से दोहराएं।",
        "प्रत्येक सेट को अपनी अधिकतम तीव्रता पर करें।"
      ],
      "effect": [
        "1 मिनट सामान्य 10 मिनट या अधिक व्यायाम के बराबर संपीड़न प्रभाव",
        "व्यायाम के बाद 24 घंटे तक कैलोरी जलना जारी रहता है (आफ्टरबर्न प्रभाव)",
        "हृदय-फेफड़ों की सहनशीलता और मांसपेशी सहनशीलता में एक साथ सुधार",
        "व्यस्त आधुनिक लोगों के लिए सर्वोत्तम व्यायाम",
        "रक्त शर्करा नियंत्रण क्षमता और इंसुलिन संवेदनशीलता में सुधार"
      ],
      "safetyNotice": "यह उच्चतम तीव्रता वाला व्यायाम है। यदि आपको हृदय संबंधी रोग या कोई चोट है, तो शुरू करने से पहले अपने डॉक्टर से परामर्श लें। वार्मअप के बिना अचानक शुरू न करें।"
    }
  },
  "tr": {
    "1": {
      "title": "① Başlangıç · Yürüyüş / Koşu / Esneme",
      "methodSections": [
        {
          "heading": "Yerinde Yürüyüş Versiyonu",
          "steps": [
            "Yerinde durup bacaklarınızı dönüşümlü olarak kaldırarak yürüyün.",
            "Dizlerinizi bel yüksekliğine kadar kaldırmaya çalışın.",
            "Kollarınızı da doğal olarak sallayın.",
            "1 dakika boyunca sabit bir ritimdeyken devam edin.",
            "Burununuzdan içeri nefes alıp ağzınızdan dışarı nefes alarak doğal olarak nefes alın."
          ]
        },
        {
          "heading": "Koşu Versiyonu",
          "steps": [
            "Hafif yerinde zıplama yaparak ayak bileği ve dizlerinizi iyi esnetip açın.",
            "Bakışlarınız öne bakın ve üst gövdenizi hafifçe ileri doğru eğin.",
            "Dirseklerinizi 90 derece açıyla tutarak kollarınızı ileri-geri ritmik olarak sallayın.",
            "Ayağınızın ön kısmıyla hafif iniş yaparak sabit hızda koşun.",
            "Burununuzdan içeri nefes alıp ağzınızdan dışarı nefes alarak 1 dakika boyunca devam edin."
          ]
        },
        {
          "heading": "Esneme Versiyonu",
          "steps": [
            "Boynu yavaşça sola ve sağa çevirme (15 saniye)",
            "Omuzları yukarı kaldırıp bırakma (15 saniye)",
            "Beli sola ve sağa çevirme (15 saniye)",
            "Her iki kolun yukarı uzatılıp yan kaburga açılması (15 saniye)"
          ]
        }
      ],
      "effect": [
        "Başlangıççı sporcular bile rahatça başlayabilir",
        "Kan dolaşımı hemen iyileşir → el ve ayak soğukluğu hafifler",
        "Katı hale gelmiş eklem ve kasları uyandıran ısınma etkisi",
        "Ofis çalışanı ve evden çalışanların uzun oturuştan kaynaklanan rahatsızlığını giderir"
      ]
    },
    "2": {
      "title": "② Temel · Çömelme / Şınav",
      "methodSections": [
        {
          "heading": "Çömelme Versiyonu",
          "steps": [
            "Ayaklarınızı omuz genişliğinde açın ve ayak uçlarını hafifçe dışarı çevirin.",
            "Sandalyeye oturuyormuş gibi poponuzu geri çekerken dizlerinizi bükün.",
            "Dizlerinizin ayak uçlarının ön tarafından ileri gitmemesine dikkat edin.",
            "Bacaklarınız yerle paralel olana kadar inin ve kalkın.",
            "1 dakika boyunca yavaşça tekrarlayın (20~25 kez hedefi)."
          ]
        },
        {
          "heading": "Şınav Versiyonu",
          "steps": [
            "Ellerinizi omuz genişliğinden biraz geniş olacak şekilde yere koyun.",
            "Başlangıççılar dizleri bükülü durumdan başlayabilirler.",
            "Göğsünüz yere dokunana kadar yavaşça inin.",
            "Kollarınızla itinerek başlangıç pozisyonuna geri dönün.",
            "1 dakika boyunca mümkün olduğunca tekrarlayın."
          ]
        }
      ],
      "effect": [
        "Alt ve üst vücut büyük kaslarının aktivasyonu → temel metabolizma oranının artması",
        "1 dakika içinde kalp atışı yükselir ve egzersiz etkisi hemen görülür",
        "Postür düzeltme ve çekirdek kas gücü artışı aynı anda",
        "Masanın önünde kısa bir mola zamanı için idealdir"
      ]
    },
    "3": {
      "title": "③ İleri Seviye · Burpee / Sıçrama Jack",
      "methodSections": [
        {
          "heading": "Burpee Versiyonu",
          "steps": [
            "Ayakta duran pozisyondan başlayın.",
            "Çömelirken ellerinizi yere koyun.",
            "Bacaklarınızı geriye doğru uzatarak plank pozisyonunu oluşturun.",
            "Bacaklarınızı geri çekerek kalkın.",
            "Sıçrayarak başınızın üzerinde ellerinizi çırpın.",
            "1 dakika boyunca tekrarlayın (10~15 kez hedefi)."
          ]
        },
        {
          "heading": "Sıçrama Jack Versiyonu",
          "steps": [
            "Dik duruş pozisyonundan başlayın.",
            "Sıçrayarak bacaklarınızı omuz genişliğine açın ve kollarınızı başınızın üzerine kaldırın.",
            "Tekrar sıçrayarak dik duruş pozisyonuna geri dönün.",
            "Ritimdeyken 1 dakika boyunca hızlı bir şekilde tekrarlayın."
          ]
        }
      ],
      "effect": [
        "Tüm vücut kardiyovasküler + kuvvet antrenmanının eş zamanlı etkisi",
        "Kalp atışı hızla yükselir → kısa sürede maksimum kalori yakılması",
        "Endorfin salgılanması ile egzersiz sonrası güçlü başarı hissi",
        "1 dakika içinde 'egzersiz yaptım' duygusu ve özgüven kazanılması"
      ]
    },
    "4": {
      "title": "④ Uzman Seviyesi · HIIT Mini (20 saniye×3 set)",
      "method": [
        "Set 1 (0~20 saniye): Burpee'leri mümkün olduğunca hızlı şekilde tekrarlayın.",
        "Ara vermeden hemen bir sonraki sete geçin.",
        "Set 2 (20~40 saniye): Dağ Tırmanıcısı — Plank pozisyonundan dizlerinizi hızlı ve dönüşümlü olarak göğsünüze çekin.",
        "Set 3 (40~60 saniye): Sıçrama Jack'leri tam güçle tekrarlayın.",
        "Her seti kendinizin maksimum yoğunluğunda gerçekleştirin."
      ],
      "effect": [
        "1 dakika, düzenli egzersizin 10 dakika ve daha fazlasına eşit sıkıştırma etkisi",
        "Egzersizden sonra 24 saat boyunca kalori yakılmaya devam etme (afterburn etkisi)",
        "Kardiyovasküler ve kas dayanıklılığının eş zamanlı iyileştirilmesi",
        "Vaktinden tasarruf yapan modern insan için en uygun egzersiz",
        "Kan şekeri kontrol yeteneği ve insülin duyarlılığının iyileştirilmesi"
      ],
      "safetyNotice": "Bu yüksek yoğunlukta bir egzersizdir. Kalp-damar hastalığınız varsa veya yaralıysanız, doktor ile danıştıktan sonra başlayın. Isınma olmadan aniden başlamayın."
    }
  },
  "pt": {
    "1": {
      "title": "① Iniciante · Caminhada / Corrida / Alongamento",
      "methodSections": [
        {
          "heading": "Versão Caminhada No Mesmo Lugar",
          "steps": [
            "Caminhe levantando as pernas alternadamente no mesmo lugar.",
            "Tente elevar os joelhos até a altura da cintura.",
            "Deixe os braços balançarem naturalmente.",
            "Mantenha um ritmo constante por 1 minuto.",
            "Respire naturalmente, inspire pelo nariz e expire pela boca."
          ]
        },
        {
          "heading": "Versão Corrida",
          "steps": [
            "Faça leves saltos no mesmo lugar para soltar tornozelos e joelhos.",
            "Olhe para frente e incline ligeiramente o tronco para a frente.",
            "Dobre os cotovelos a 90 graus e balance os braços para frente e para trás com ritmo.",
            "Pouse levemente na parte frontal dos pés e corra em velocidade constante.",
            "Inspire pelo nariz, expire pela boca e mantenha por 1 minuto."
          ]
        },
        {
          "heading": "Versão Alongamento",
          "steps": [
            "Gire o pescoço lentamente para os lados (15 segundos)",
            "Levante e abaixe os ombros (15 segundos)",
            "Torção lateral da cintura (15 segundos)",
            "Estique os braços para cima e alongue os flancos (15 segundos)"
          ]
        }
      ],
      "effect": [
        "Iniciantes em exercícios podem começar sem dificuldade",
        "Melhora imediata da circulação sanguínea → alívio das mãos e pés frios",
        "Efeito de aquecimento que desperta articulações e músculos endurecidos",
        "Alívio da tensão de ficar sentado por longos períodos para trabalhadores de escritório e home office"
      ]
    },
    "2": {
      "title": "② Básico · Agachamento / Flexão de Braço",
      "methodSections": [
        {
          "heading": "Versão Agachamento",
          "steps": [
            "Abra os pés na largura dos ombros com os dedos ligeiramente apontando para fora.",
            "Dobre os joelhos puxando o quadril para trás como se fosse sentar em uma cadeira.",
            "Tenha cuidado para os joelhos não ultrapassarem a ponta dos pés.",
            "Desça até as coxas ficarem paralelas ao chão, depois levante.",
            "Repita lentamente por 1 minuto (objetivo de 20-25 repetições)."
          ]
        },
        {
          "heading": "Versão Flexão de Braço",
          "steps": [
            "Coloque as mãos ligeiramente mais largas que a largura dos ombros no chão.",
            "Iniciantes podem começar com os joelhos dobrados.",
            "Desça lentamente até que o peito quase toque o chão.",
            "Use os braços para empurrar e voltar à posição inicial.",
            "Repita o máximo que conseguir por 1 minuto."
          ]
        }
      ],
      "effect": [
        "Ativação dos grandes músculos da parte inferior e superior do corpo → aumento do metabolismo basal",
        "A frequência cardíaca aumenta em 1 minuto, produzindo efeito de exercício imediato",
        "Efeito simultâneo de correção postural e fortalecimento do core",
        "Perfeito para breves intervalos de descanso em frente à mesa"
      ]
    },
    "3": {
      "title": "③ Avançado · Burpee / Jumping Jack",
      "methodSections": [
        {
          "heading": "Versão Burpee",
          "steps": [
            "Comece em pé.",
            "Agache-se e coloque as mãos no chão.",
            "Chute as pernas para trás para formar uma posição de prancha.",
            "Puxe as pernas novamente e levante-se.",
            "Salte e bata as mãos acima da cabeça.",
            "Repita por 1 minuto (objetivo de 10-15 repetições)."
          ]
        },
        {
          "heading": "Versão Jumping Jack",
          "steps": [
            "Comece em posição de pé com os pés juntos.",
            "Salte e abra as pernas na largura dos ombros, levantando os braços acima da cabeça.",
            "Salte novamente e retorne à posição inicial.",
            "Mantenha o ritmo e repita rapidamente por 1 minuto."
          ]
        }
      ],
      "effect": [
        "Efeito simultâneo de exercício aeróbio de corpo inteiro + exercício de força",
        "Aumento rápido da frequência cardíaca → máximo de queima de calorias em tempo curto",
        "Liberação de endorfina para sensação de realização forte após o exercício",
        "Sensação clara de 'exercitado' e confiança conquistada em 1 minuto"
      ]
    },
    "4": {
      "title": "④ Especialista · HIIT Mini (20 segundos × 3 séries)",
      "method": [
        "Série 1 (0-20 segundos): Repita burpees o mais rápido possível.",
        "Prossiga diretamente para a próxima série sem descanso.",
        "Série 2 (20-40 segundos): Mountain Climber — em posição de prancha, puxe alternadamente os joelhos para o peito rapidamente.",
        "Série 3 (40-60 segundos): Repita Jumping Jacks com máximo esforço.",
        "Execute cada série com sua máxima intensidade."
      ],
      "effect": [
        "1 minuto equivale a 10 minutos ou mais de exercício comum — efeito de compressão",
        "Queima de calorias contínua por 24 horas após exercício (efeito afterburn)",
        "Melhora simultânea da resistência cardiovascular e muscular",
        "Exercício ideal para pessoas modernas com falta de tempo",
        "Melhora da capacidade de regulação de glicose e sensibilidade à insulina"
      ],
      "safetyNotice": "Este é um exercício de máxima intensidade. Se você tem doença cardiovascular ou lesão, consulte um médico antes de começar. Não comece abruptamente sem aquecimento."
    }
  },
  "ar": {
    "1": {
      "title": "① مبتدئون · المشي · الركض · تمارين الإطالة",
      "methodSections": [
        {
          "heading": "نسخة المشي في المكان",
          "steps": [
            "امش في المكان برفع ساقيك بالتناوب.",
            "حاول رفع ركبتيك إلى ارتفاع الحوض.",
            "أرجح ذراعيك بشكل طبيعي.",
            "حافظ على إيقاع ثابت لمدة دقيقة واحدة.",
            "التنفس طبيعي - استنشق من أنفك وأخرج الهواء من فمك."
          ]
        },
        {
          "heading": "نسخة الركض",
          "steps": [
            "ابدأ بالقفز الخفيف في المكان لإطالة كاحليك وركبتيك.",
            "انظر للأمام مباشرة وأميل صدرك قليلاً للأمام.",
            "اثنِ مرفقيك بزاوية 90 درجة وأرجح ذراعيك للأمام والخلف بإيقاع.",
            "اهبط برفق على أطراف قدميك وحافظ على سرعة منتظمة.",
            "استنشق من أنفك وأخرج الهواء من فمك لمدة دقيقة واحدة."
          ]
        },
        {
          "heading": "نسخة تمارين الإطالة",
          "steps": [
            "دوران الرقبة ببطء يساراً ويميناً (15 ثانية)",
            "رفع الأكتاف لأعلى وإنزالها (15 ثانية)",
            "لف الخصر يساراً ويميناً (15 ثانية)",
            "مد ذراعيك لأعلى وإطالة جانب الجسم (15 ثانية)"
          ]
        }
      ],
      "effect": [
        "حتى المبتدئين يمكنهم البدء دون عبء",
        "تحسن الدورة الدموية فوراً → تخفيف الشعور بالبرد في اليدين والقدمين",
        "إيقاظ المفاصل والعضلات المتيبسة - تأثير الإحماء",
        "تخفيف الضغط من الجلوس الطويل للموظفين والعاملين من المنزل"
      ]
    },
    "2": {
      "title": "② أساسي · تمرين القرفصاء · تمرين تمديد الذراعين",
      "methodSections": [
        {
          "heading": "نسخة القرفصاء",
          "steps": [
            "افتح قدميك بعرض الأكتاف مع توجيه أصابع قدميك قليلاً للخارج.",
            "أرجع مؤخرتك للخلف وانزل كما لو كنت تجلس على كرسي.",
            "انتبه حتى لا تتحرك ركبتاك إلى الأمام من أصابع قدميك.",
            "انزل حتى يكون الفخذان متوازيين مع الأرض ثم ارفعهما.",
            "كرر ببطء لمدة دقيقة واحدة (استهدف 20-25 مرة)."
          ]
        },
        {
          "heading": "نسخة تمديد الذراعين",
          "steps": [
            "ضع يديك على الأرض بعرض أكتاف أوسع قليلاً.",
            "يمكن للمبتدئين أن يبدأوا بثني الركبتين.",
            "انزل برفق حتى يقترب صدرك من الأرض.",
            "ادفع بذراعيك لرفع جسدك للوضع الأول.",
            "كرر قدر الإمكان لمدة دقيقة واحدة."
          ]
        }
      ],
      "effect": [
        "تنشيط عضلات الجزء السفلي والعلوي الكبيرة → زيادة معدل الأيض الأساسي",
        "يرتفع معدل ضربات القلب خلال دقيقة واحدة - فعالية تمرين فوري",
        "تصحيح الوضعية وتقوية عضلات المركز في نفس الوقت",
        "مثالي لفترة راحة قصيرة في المكتب"
      ]
    },
    "3": {
      "title": "③ متقدم · تمرين البيربي · تمرين القفز بفتح الأرجل",
      "methodSections": [
        {
          "heading": "نسخة البيربي",
          "steps": [
            "ابدأ بالوقوف.",
            "انزل بالقرفصاء وضع يديك على الأرض.",
            "اركل رجليك للخلف لتشكيل وضع اللوح.",
            "اسحب رجليك للأمام مرة أخرى.",
            "قفز لأعلى واصفق بيديك فوق رأسك.",
            "كرر لمدة دقيقة واحدة (استهدف 10-15 مرة)."
          ]
        },
        {
          "heading": "نسخة القفز بفتح الأرجل",
          "steps": [
            "ابدأ بوضعية الانتصاب.",
            "قفز مع فتح ساقيك بعرض الأكتاف ورفع ذراعيك فوق رأسك.",
            "قفز مرة أخرى للعودة للوضع الأول.",
            "حافظ على الإيقاع وكرر بسرعة لمدة دقيقة واحدة."
          ]
        }
      ],
      "effect": [
        "تمرين هوائي كامل الجسم + تقوية عضلات في نفس الوقت",
        "ارتفاع سريع في معدل ضربات القلب → أقصى حرق سعرات حرارية في وقت قصير",
        "إفراز الإندورفين → شعور قوي بالإنجاز بعد التمرين",
        "الشعور الأكيد بـ \"تمرني\" والثقة في دقيقة واحدة فقط"
      ]
    },
    "4": {
      "title": "④ متخصص · تمرين عالي الشدة (20 ثانية × 3 مجموعات)",
      "method": [
        "المجموعة 1 (0-20 ثانية): كرر تمرين البيربي بأقصى سرعة.",
        "الانتقال مباشرة للمجموعة التالية دون راحة.",
        "المجموعة 2 (20-40 ثانية): متسلق الجبل - من وضع اللوح، اسحب ركبتيك بسرعة نحو صدرك بالتناوب.",
        "المجموعة 3 (40-60 ثانية): كرر القفز بفتح الأرجل بكل قوتك.",
        "نفذ كل مجموعة بأقصى شدة خاصة بك."
      ],
      "effect": [
        "دقيقة واحدة تعادل 10 دقائق أو أكثر من التمارين العادية",
        "حرق السعرات الحرارية يستمر لمدة 24 ساعة بعد التمرين (تأثير ما بعد الحرق)",
        "تحسن تحمل القلب والرئة والعضلات في نفس الوقت",
        "أفضل تمرين للأشخاص المشغولين الذين لديهم وقت محدود",
        "تحسن القدرة على تنظيم السكر في الدم وحساسية الأنسولين"
      ],
      "safetyNotice": "تمرين عالي الشدة جداً. إذا كان لديك أمراض القلب أو إصابات، استشر الطبيب قبل البدء. لا تبدأ فجأة بدون إحماء."
    }
  },
  "ja": {
    "1": {
      "title": "① 入門・歩き/ランニング/ストレッチング",
      "methodSections": [
        {
          "heading": "その場歩き版",
          "steps": [
            "その場で交互に脚を上げて歩きます。",
            "膝を腰の高さまで上げることを目指します。",
            "腕も自然に振ります。",
            "一定のリズムで1分間続けます。",
            "呼吸は自然と鼻から吸って口から吐きます。"
          ]
        },
        {
          "heading": "ランニング版",
          "steps": [
            "軽いその場での飛び跳ねで足首と膝を十分に準備します。",
            "視線は正面に向け、上体を少し前に傾けます。",
            "肘を90度に曲げて前後にリズミカルに振ります。",
            "足の前の方で着地しながら一定のスピードで走ります。",
            "鼻から吸って口から吐きながら1分間続けます。"
          ]
        },
        {
          "heading": "ストレッチング版",
          "steps": [
            "首を左右にゆっくり回す(15秒)",
            "肩を上に上げて下ろす(15秒)",
            "腰を左右にひねる(15秒)",
            "両腕を上に伸ばして脇腹をストレッチング(15秒)"
          ]
        }
      ],
      "effect": [
        "運動初心者も気軽に始められる",
        "血液循環の即座の改善 → 手足の冷感が緩和",
        "硬くなっていた関節と筋肉を目覚めさせるウォーミングアップ効果",
        "デスクワーク・テレワークの長時間座り込みの負担解消"
      ]
    },
    "2": {
      "title": "② 基本・スクワット/腕立て伏せ",
      "methodSections": [
        {
          "heading": "スクワット版",
          "steps": [
            "脚を肩幅に開き、つま先は少し外側を向きます。",
            "椅子に座るようにお尻を後ろに引きながら膝を曲げます。",
            "膝がつま先より前に出ないように注意します。",
            "太ももがほぼ床と平行になるまで下げて持ち上がります。",
            "1分間ゆっくり繰り返します(20〜25回が目標)。"
          ]
        },
        {
          "heading": "腕立て伏せ版",
          "steps": [
            "手は肩幅より少し広めに床につきます。",
            "初心者は膝を曲げた状態から始めても大丈夫です。",
            "胸が床に触れるくらいまでゆっくり下げます。",
            "腕で押し上げて開始姿勢に戻ります。",
            "1分間できるだけ繰り返します。"
          ]
        }
      ],
      "effect": [
        "下半身・上半身の大きな筋肉が活性化 → 基礎代謝量増加",
        "1分で心拍数が上がり運動効果が即座に発揮される",
        "姿勢矯正とコア筋力強化の同時効果",
        "デスクの前での短い休憩時間に最適"
      ]
    },
    "3": {
      "title": "③ 熟練・バーピー/ジャンピングジャック",
      "methodSections": [
        {
          "heading": "バーピー版",
          "steps": [
            "立った姿勢から始めます。",
            "しゃがみながら手を床につきます。",
            "脚を後ろに蹴ってプランク姿勢を作ります。",
            "再び脚を引き寄せて立ち上がります。",
            "ジャンプして頭の上で手を叩きます。",
            "1分間繰り返します(10〜15回が目標)。"
          ]
        },
        {
          "heading": "ジャンピングジャック版",
          "steps": [
            "直立姿勢から始めます。",
            "ジャンプして脚は肩幅に広げ、腕は頭の上に上げます。",
            "再びジャンプして直立姿勢に戻ります。",
            "リズムを保ちながら1分間素早く繰り返します。"
          ]
        }
      ],
      "effect": [
        "全身の有酸素運動と筋力運動の同時効果",
        "心拍数が急速に上昇 → 短時間で最大カロリー消費",
        "エンドルフィン分泌で運動後の強い達成感",
        "1分で『運動した』という確かな感覚と自信を獲得"
      ]
    },
    "4": {
      "title": "④ 専門・HIIT ミニ(20秒×3セット)",
      "method": [
        "セット1(0〜20秒):バーピーをできるだけ速く繰り返します。",
        "休憩せずすぐに次のセットに進みます。",
        "セット2(20〜40秒):マウンテンクライマー — プランク姿勢から膝を胸に素早く交互に引き寄せます。",
        "セット3(40〜60秒):ジャンピングジャックを全力で繰り返します。",
        "各セットは自分の最大強度で実施します。"
      ],
      "effect": [
        "1分が通常の運動10分以上に相当する圧縮効果",
        "運動後24時間の間カロリー消費が続く(アフターバーン効果)",
        "心肺持久力・筋持久力の同時向上",
        "時間が足りない現代人向けの最適な運動",
        "血糖調節能力とインスリン感受性の改善"
      ],
      "safetyNotice": "最高強度の運動です。心血管疾患がある方や怪我がある方は医師に相談してから始めてください。ウォーミングアップなしに急に始めないでください。"
    }
  },
  "th": {
    "1": {
      "title": "① ผู้เริ่มต้น · การเดิน / วิ่ง / ยืดกล้าม",
      "methodSections": [
        {
          "heading": "รุ่นการเดินในที่เดียว",
          "steps": [
            "ยกขาสลับกันในที่เดียว เป็นท่าเดิน",
            "พยายามยกเข่าให้สูงถึงระดับสะโพก",
            "แกว่งแขนอย่างเป็นธรรมชาติ",
            "รักษาจังหวะปกติ นาน 1 นาที",
            "หายใจเข้าผ่านจมูก ปล่อยออกผ่านปาก ตามธรรมชาติ"
          ]
        },
        {
          "heading": "รุ่นวิ่ง",
          "steps": [
            "ทำการกระโดดเบาๆ ในที่เดียว เพื่อให้ข้อเท้าและเข่าพร้อม",
            "มองตรงไปข้างหน้า เอียงลำตัวส่วนบนไปข้างหน้าเล็กน้อย",
            "งอศอกประมาณ 90 องศา แกว่งแขนไปข้างหน้าข้างหลังเป็นจังหวะ",
            "ลงเท้าด้วยส่วนปลายเท้า วิ่งด้วยความเร็วสม่ำเสมอ",
            "หายใจเข้าผ่านจมูก ปล่อยออกผ่านปาก ทำต่อไป 1 นาที"
          ]
        },
        {
          "heading": "รุ่นยืดกล้าม",
          "steps": [
            "หมุนคอซ้ายขวาช้าๆ (15 วินาที)",
            "ยกไหล่ขึ้นแล้วลงลง (15 วินาที)",
            "หมุนเอวซ้ายขวา (15 วินาที)",
            "ยืดแขนทั้งสองข้างขึ้น ยืดด้านข้าง (15 วินาที)"
          ]
        }
      ],
      "effect": [
        "ผู้เริ่มต้นสามารถเริ่มต้นได้อย่างไม่เบาะน้อย",
        "ปรับปรุงการไหลเวียนของเลือดทันที → บรรเทาความรู้สึกนิ้วมือและเท้าเย็น",
        "ปลุกให้ข้อต่อและกล้ามเนื้อที่เหน็ดเหนื่อยตื่นขึ้นมา เป็นการเตรียมกำลังที่ดี",
        "บรรเทาความเหนื่อยจากการนั่งนานสำหรับคนทำงานสำนัก / อยู่บ้าน"
      ]
    },
    "2": {
      "title": "② พื้นฐาน · สควอท / ดันแรง",
      "methodSections": [
        {
          "heading": "รุ่นสควอท",
          "steps": [
            "วางเท้าให้ห่างเท่ากับความกว้างของไหล่ โดยให้ปลายเท้าชี้ไปด้านข้างเล็กน้อย",
            "นั่งราวกับจะนั่งลงเก้าอี้ โดยยื่นเอวไปด้านหลังและงอเข่า",
            "ระวัง เข่าอย่านึกเข้าไปข้างหน้าของปลายเท้า",
            "เมื่อต้นขาขนานกับพื้น ให้ลุกขึ้น",
            "ทำต่อไป 1 นาที อย่างช้าๆ (เป้าหมาย 20-25 ครั้ง)"
          ]
        },
        {
          "heading": "รุ่นดันแรง",
          "steps": [
            "วางมือให้ห่างกว่าความกว้างของไหล่เล็กน้อย บนพื้น",
            "ผู้เริ่มต้นสามารถเริ่มด้วยการงอเข่าก็ได้",
            "ลดตัวลงช้าๆ ให้หน้าอกแตะพื้นเกือบถึง",
            "ดันตัวขึ้นด้วยแขน กลับไปท่าเริ่มต้น",
            "ทำต่อไป 1 นาที ให้ได้มากที่สุดเท่าที่ทำได้"
          ]
        }
      ],
      "effect": [
        "เปิดใช้งานกล้ามเนื้อขาส่วนล่าง·ส่วนบน → เพิ่มปริมาณการเผาผลาญพื้นฐาน",
        "ในเวลา 1 นาที อัตราการเต้นของหัวใจเพิ่มขึ้น ฉะนั้นออกกำลังกายมีประสิทธิภาพทันที",
        "แก้ไขท่าทางและเสริมสร้างกำลังของแกน ไปพร้อมกัน",
        "เหมาะสำหรับช่วงพักสั้นๆ ที่โต๊ะ"
      ]
    },
    "3": {
      "title": "③ ผู้มีประสบการณ์ · เบอร์พี่ / จัมปิ้งแจ็ก",
      "methodSections": [
        {
          "heading": "รุ่นเบอร์พี่",
          "steps": [
            "เริ่มจากท่ายืน",
            "นั่งเสบียงลงพื้นด้วยมือ",
            "เตะขาไปข้างหลัง ทำท่าแพลงค์",
            "ดึงขากลับ ลุกขึ้นยืน",
            "โดดขึ้น ตบมือเหนือหัว",
            "ทำต่อไป 1 นาที (เป้าหมาย 10-15 ครั้ง)"
          ]
        },
        {
          "heading": "รุ่นจัมปิ้งแจ็ก",
          "steps": [
            "เริ่มจากท่าตัวตรง",
            "โดดขึ้น ยื่นขาออกให้ห่างกว่าไหล่ เหยียดแขนขึ้นเหนือหัว",
            "โดดขึ้นอีกครั้ง กลับมาท่าตัวตรง",
            "รักษาจังหวะ ทำต่อไป 1 นาที อย่างรวดเร็ว"
          ]
        }
      ],
      "effect": [
        "ออกกำลังกายเบา + ความแข็งแกร่ง ไปพร้อมกัน",
        "อัตราการเต้นของหัวใจเพิ่มขึ้นอย่างรวดเร็ว → เผาพลังงานสูงสุดในเวลาสั้น",
        "ปล่อยปัจจัยจิตใจยาพลัง (เอนโดร์ฟิน) → รู้สึกสำเร็จใจยาหลังออกกำลังกาย",
        "ใน 1 นาที ได้รู้สึก 'ออกกำลังกาย' อย่างแน่ชัดและมีความเชื่อมั่น"
      ]
    },
    "4": {
      "title": "④ ผู้มีทักษะเฉพาะ · HIIT มินิ (20 วินาที × 3 เซต)",
      "method": [
        "เซต 1 (0-20 วินาที): ทำเบอร์พี่อย่างเร็วที่สุด",
        "ต่อไปไม่พัก จะเข้าเซตถัดไปเลย",
        "เซต 2 (20-40 วินาที): ไต่ภูเขา — ในท่าแพลงค์ ให้ขาสลับขึ้นไปหาอก อย่างรวดเร็ว",
        "เซต 3 (40-60 วินาที): จัมปิ้งแจ็กด้วยพลังเต็มที่",
        "ทำแต่ละเซตด้วยความแข็งแกร่งสูงสุดของตัวเอง"
      ],
      "effect": [
        "1 นาที เท่ากับการออกกำลังกายทั่วไป 10 นาทีขึ้นไป → ประสิทธิภาพการบีบอัด",
        "หลังออกกำลังกาย 24 ชั่วโมง ร่างกายยังคงเผาพลังงาน (afterburn effect) ต่ออยู่",
        "ปรับปรุงความทนต่ออุปสรรคทางหัวใจและปอด พร้อมทั้งความทนสำหรับกล้ามเนื้อ",
        "ออกกำลังกายที่สมบูรณ์แบบสำหรับคนยุคสมัยที่มีเวลาน้อย",
        "ปรับปรุงความสามารถในการควบคุมน้ำตาลในเลือด และความไวต่ออินซูลิน"
      ],
      "safetyNotice": "นี่คือการออกกำลังกายที่มีความแข็งแกร่งสูงสุด ถ้าคุณมีโรคหัวใจและหลอดเลือด หรือมีอาการบาดเจ็บ กรุณาปรึกษาแพทย์ก่อนเริ่ม และห้ามเริ่มอย่างฉับพลันโดยไม่ทำการเพิ่มความร้อน"
    }
  },
  "tl": {
    "1": {
      "title": "① Pambungad · Paglalakad / Pagtakbo / Pag-stretch",
      "methodSections": [
        {
          "heading": "Paglalakad sa Lugar",
          "steps": [
            "Maglakad sa lugar at alt-alt na itaas ang iyong mga paa.",
            "Subukan na itaas ang iyong mga tuhod hanggang sa taas ng iyong baywang.",
            "Hayaan ding lumakad ang iyong mga kamay nang natural.",
            "Panatilihin ang pare-pareho ang ritmo sa loob ng 1 minuto.",
            "Huminga nang natural—pasok sa ilong at labas sa bibig."
          ]
        },
        {
          "heading": "Pagtakbo",
          "steps": [
            "Magsimula sa light in-place jumping para palambotin ang iyong mga buwan-bukong at tuhod.",
            "Tingnan ang pasulong at iangat ang iyong upper body nang kaunti.",
            "Tikman ang iyong mga braso sa 90 degrees at ikumpas nang paunang-pauraan na may ritmo.",
            "Magpatakbo sa pare-pareho ang bilis, nag-land sa unahan ng iyong mga paa nang mahina.",
            "Huminga—pasok sa ilong at labas sa bibig—sa loob ng 1 minuto."
          ]
        },
        {
          "heading": "Pag-stretch",
          "steps": [
            "Paitin ang iyong leeg nang mabagal, kaliwa at kanan (15 segundo)",
            "Itaas ang iyong mga balikat at pagkatapos ay ibaba (15 segundo)",
            "Umiikot ang iyong baywang pakaliwa at pakaanan (15 segundo)",
            "Itaas ang parehong braso at mag-stretch sa iyong mga gilid (15 segundo)"
          ]
        }
      ],
      "effect": [
        "Madaling simulan kahit para sa mga baguhan sa exercise",
        "Agarang pagpapabuti ng blood circulation → mas mapawi ang lamig ng kamay at paa",
        "Ang pag-init na epekto na nagpapagising ng kuyog na joint at muscle",
        "Aliviating ang strain ng mahabang pagsisid para sa office at work-from-home workers"
      ]
    },
    "2": {
      "title": "② Pangunahin · Squat / Push-up",
      "methodSections": [
        {
          "heading": "Squat",
          "steps": [
            "Buksan ang iyong mga paa sa shoulder width at iurong kaunti ang iyong mga daliri ng paa.",
            "Tulad ng umupo sa isang upuan, iurong ang iyong balakang at yumuko ang iyong mga tuhod.",
            "Bantayan na ang iyong mga tuhod ay hindi magsukad na lampas sa iyong mga daliri ng paa.",
            "Bumaba hanggang ang iyong hita ay parallel sa lupa, pagkatapos ay bumangon.",
            "Ulitin nang mabagal sa loob ng 1 minuto (layunin: 20-25 repetisyon)."
          ]
        },
        {
          "heading": "Push-up",
          "steps": [
            "Ilagay ang iyong mga kamay sa lupa nang kaunting mas malayo kaysa shoulder width.",
            "Ang mga baguhan ay maaaring magsimula na may tuhod na nakabagsak.",
            "Bumaba nang mabagal hanggang ang iyong dibdib ay malapit na sa lupa.",
            "Itulak ang iyong sarili pataas gamit ang iyong mga kamay at bumalik sa simula.",
            "Ulitin hangga't kaya mo sa loob ng 1 minuto."
          ]
        }
      ],
      "effect": [
        "Ang pag-activate ng lower at upper body muscles → pagtaas ng basal metabolic rate",
        "Ang heart rate ay tataas sa loob ng 1 minuto para sa agarang exercise effect",
        "Parehong pag-correct ng posture at pag-strengthen ng core",
        "Perpekto para sa maikling break time sa likod ng desk"
      ]
    },
    "3": {
      "title": "③ Napakahusay · Burpee / Jumping Jack",
      "methodSections": [
        {
          "heading": "Burpee",
          "steps": [
            "Magsimula sa standing position.",
            "Sumuko at ilagay ang iyong mga kamay sa lupa.",
            "I-kick ang iyong mga paa pabalik para gumawa ng plank position.",
            "I-pull ang iyong mga paa pabalik at bumangon.",
            "Tumalon at abutin ang iyong mga kamay sa ibabaw ng iyong ulo.",
            "Ulitin sa loob ng 1 minuto (layunin: 10-15 repetisyon)."
          ]
        },
        {
          "heading": "Jumping Jack",
          "steps": [
            "Magsimula sa standing position na may mga paa nang magkasama.",
            "Tumalon—buksan ang iyong mga paa sa shoulder width at itaas ang iyong mga braso sa ibabaw.",
            "Tumalon muli at bumalik sa simula.",
            "Bilis-bilisin at ulitin sa loob ng 1 minuto, pinapanatiling ang ritmo."
          ]
        }
      ],
      "effect": [
        "Full-body cardio + strength training sa parehong oras",
        "Ang mabilis na pagtaas ng heart rate → maximum calorie burn sa maikling panahon",
        "Ang release ng endorphins para sa malakas na sense of achievement pagkatapos ng exercise",
        "Ang definitive feeling na 'nagsercise ako' at confidence sa loob ng 1 minuto"
      ]
    },
    "4": {
      "title": "④ Eksperto · HIIT Mini (20 segundo×3 set)",
      "method": [
        "Set 1 (0-20 segundo): Ulitin ang burpee nang kasing-bilis na kaya.",
        "Walang pahinga—direktang magpatuloy sa susunod na set.",
        "Set 2 (20-40 segundo): Mountain climber — sa plank posisyon, mabilis na i-pull nang palitan ang iyong mga tuhod papunta sa iyong dibdib.",
        "Set 3 (40-60 segundo): Ulitin ang jumping jack nang may buong lakas.",
        "Gawin ang bawat set sa iyong maximum intensity."
      ],
      "effect": [
        "Ang 1 minuto ay katumbas ng 10 minuto o higit pa ng regular exercise",
        "Ang patuloy na calorie burn sa loob ng 24 oras pagkatapos ng exercise (afterburn effect)",
        "Ang sabay-samang pagpapabuti ng cardiovascular at muscular endurance",
        "Ang perfect exercise para sa busy modern people",
        "Ang pagpapabuti ng blood sugar control at insulin sensitivity"
      ],
      "safetyNotice": "Ito ay high-intensity exercise. Kung mayroon kang heart condition o injury, makipag-konsulta sa iyong doktor bago magsimula. Huwag simulan nang biglaan nang walang warm-up."
    }
  },
  "bn": {
    "1": {
      "title": "1. শুরু - হাঁটা / দৌড়ানো / প্রসারণ",
      "methodSections": [
        {
          "heading": "জায়গায় হাঁটার সংস্করণ",
          "steps": [
            "একই জায়গায় আপনার পা বিকল্পভাবে উঠিয়ে হাঁটুন.",
            "আপনার হাঁটু কোমরের উচ্চতায় উঠানোর চেষ্টা করুন.",
            "আপনার বাহু প্রাকৃতিকভাবে দুলান.",
            "১ মিনিটের জন্য একটি সামঞ্জস্যপূর্ণ ছন্দ বজায় রাখুন.",
            "প্রাকৃতিকভাবে নাক দিয়ে শ্বাস নিন এবং মুখ দিয়ে শ্বাস ছাড়ুন."
          ]
        },
        {
          "heading": "দৌড়ানোর সংস্করণ",
          "steps": [
            "হালকা জায়গায় লাফিয়ে আপনার গোড়ালি এবং হাঁটু যথাযথভাবে শিথিল করুন.",
            "আপনার দৃষ্টি সামনের দিকে এবং আপনার উপরের শরীর সামান্য এগিয়ে ঝুকান.",
            "আপনার কনুই ৯০ ডিগ্রিতে বাঁকিয়ে ছন্দময়ভাবে এগিয়ে এবং পিছিয়ে দুলান.",
            "আপনার পায়ের সামনের দিক দিয়ে হালকাভাবে অবতরণ করুন এবং একটি সামঞ্জস্যপূর্ণ গতিতে দৌড়ান.",
            "নাক দিয়ে শ্বাস নিন এবং মুখ দিয়ে শ্বাস ছাড়ুন, ১ মিনিটের জন্য বজায় রাখুন."
          ]
        },
        {
          "heading": "প্রসারণের সংস্করণ",
          "steps": [
            "আপনার ঘাড় বাম এবং ডান দিকে ধীরে ধীরে ঘোরান (১৫ সেকেন্ড)",
            "আপনার কাঁধ উপরে তুলুন এবং তারপর নামান (১৫ সেকেন্ড)",
            "আপনার কোমর বাম এবং ডান দিকে মোড়ান (১৫ সেকেন্ড)",
            "আপনার উভয় বাহু উপরে প্রসারিত করুন এবং আপনার পাঁজর প্রসারিত করুন (১৫ সেকেন্ড)"
          ]
        }
      ],
      "effect": [
        "অনুশীলনের শিক্ষানবিসরাও সহজেই শুরু করতে পারে",
        "রক্ত সঞ্চালন তাৎক্ষণিকভাবে উন্নত হয় - ঠান্ডা হাত এবং পায়ের অনুভূতি কমে যায়",
        "নমনীয় জয়েন্ট এবং পেশিকে জাগ্রত করার ওয়ার্ম-আপ প্রভাব",
        "অফিস কর্মী এবং দূরবর্তী কাজকারীদের জন্য দীর্ঘ সময় বসার চাপ হ্রাস"
      ]
    },
    "2": {
      "title": "2. মৌলিক - স্কোয়াট / পুশ-আপ",
      "methodSections": [
        {
          "heading": "স্কোয়াটের সংস্করণ",
          "steps": [
            "আপনার পা কাঁধের প্রস্থে আলাদা করুন এবং আপনার পায়ের আঙুল সামান্য বাইরের দিকে নির্দেশ করুন.",
            "একটি চেয়ারে বসার মতো আপনার পোঁদ পিছনের দিকে ঠেলে দিন এবং আপনার হাঁটু বাঁকান.",
            "আপনার হাঁটু আপনার পায়ের আঙুলের চেয়ে এগিয়ে না যাওয়ার বিষয়ে সতর্ক থাকুন.",
            "আপনার উরু মেঝের সমান্তরাল হওয়া পর্যন্ত নিচে যান এবং উপরে উঠুন.",
            "১ মিনিটের জন্য ধীরে ধীরে পুনরাবৃত্তি করুন (২০-২৫ পুনরাবৃত্তি লক্ষ্য)."
          ]
        },
        {
          "heading": "পুশ-আপের সংস্করণ",
          "steps": [
            "আপনার হাত কাঁধের প্রস্থের চেয়ে সামান্য বিস্তৃত মেঝেতে রাখুন.",
            "শিক্ষানবিসরা বাঁকানো হাঁটুতে শুরু করতে পারেন.",
            "আপনার বুক মেঝে স্পর্শ করার কাছাকাছি না হওয়া পর্যন্ত ধীরে ধীরে নিচে যান.",
            "আপনার বাহু দিয়ে চাপ দিয়ে শুরুর অবস্থানে ফিরে আসুন.",
            "১ মিনিটের জন্য যতটা সম্ভব পুনরাবৃত্তি করুন."
          ]
        }
      ],
      "effect": [
        "নিম্ন এবং উপরের শরীরের বড় পেশি সক্রিয় করুন - ভিত্তি বিপাক বৃদ্ধি",
        "১ মিনিটের মধ্যে হৃদস্পন্দন বৃদ্ধি পায় এবং ব্যায়ামের প্রভাব তাৎক্ষণিকভাবে দেখা যায়",
        "ভঙ্গি সংশোধন এবং মূল শক্তি শক্তিশালীকরণ একযোগে",
        "ডেস্কের সামনে একটি ছোট ব্রেকের সময়ের জন্য সর্বোত্তম"
      ]
    },
    "3": {
      "title": "3. দক্ষ - বার্পি / জাম্পিং জ্যাক",
      "methodSections": [
        {
          "heading": "বার্পির সংস্করণ",
          "steps": [
            "দাঁড়িয়ে থাকার অবস্থান থেকে শুরু করুন.",
            "স্কোয়াট করার সময় আপনার হাত মেঝেতে রাখুন.",
            "আপনার পা পিছনের দিকে কিক করুন এবং একটি প্ল্যাঙ্ক অবস্থান তৈরি করুন.",
            "আপনার পা ফিরিয়ে আনুন এবং উপরে উঠুন.",
            "লাফ দিন এবং আপনার মাথার উপরে হাত তালি বাজান.",
            "১ মিনিটের জন্য পুনরাবৃত্তি করুন (১০-১৫ পুনরাবৃত্তি লক্ষ্য)."
          ]
        },
        {
          "heading": "জাম্পিং জ্যাকের সংস্করণ",
          "steps": [
            "মনোযোগী অবস্থান থেকে শুরু করুন.",
            "লাফ দিন এবং আপনার পা কাঁধের প্রস্থে আলাদা করুন এবং আপনার বাহু মাথার উপরে উঠান.",
            "আবার লাফ দিন এবং মনোযোগী অবস্থানে ফিরে আসুন.",
            "ছন্দ বজায় রেখে ১ মিনিটের জন্য দ্রুত পুনরাবৃত্তি করুন."
          ]
        }
      ],
      "effect": [
        "সম্পূর্ণ শরীর কার্ডিও + শক্তি প্রশিক্ষণ একযোগে",
        "হৃদস্পন্দন তীব্রভাবে বৃদ্ধি পায় - স্বল্প সময়ে সর্বাধিক ক্যালোরি বার্ন",
        "এন্ডোর্ফিন স্রাবের সাথে ব্যায়ামের পরে শক্তিশালী পূর্ণতার অনুভূতি",
        "১ মিনিটের মধ্যে 'আমি ব্যায়াম করেছি' সচেতনতা এবং আত্মবিশ্বাস অর্জন"
      ]
    },
    "4": {
      "title": "4. বিশেষজ্ঞ - HIIT মিনি (20 সেকেন্ড x 3 সেট)",
      "method": [
        "সেট 1 (0-20 সেকেন্ড): যতটা দ্রুত সম্ভব বার্পি পুনরাবৃত্তি করুন.",
        "বিশ্রাম ছাড়াই পরবর্তী সেটে চলে যান.",
        "সেট 2 (20-40 সেকেন্ড): মাউন্টেন ক্লাইম্বার - প্ল্যাঙ্ক অবস্থান থেকে আপনার হাঁটু বুকে দ্রুত বিকল্পভাবে আনুন.",
        "সেট 3 (40-60 সেকেন্ড): সর্বোচ্চ শক্তিতে জাম্পিং জ্যাক পুনরাবৃত্তি করুন.",
        "প্রতিটি সেট নিজের সর্বোচ্চ শক্তিতে সম্পাদন করুন."
      ],
      "effect": [
        "১ মিনিট সাধারণ ব্যায়ামের ১০ মিনিটের বেশি সমতুল্য সংকুচিত প্রভাব",
        "ব্যায়ামের পরে 24 ঘন্টা ধরে ক্যালোরি বার্ন অব্যাহত (অফটারবার্ন প্রভাব)",
        "কার্ডিওভাসকুলার সহনশীলতা এবং পেশি সহনশীলতা একযোগে উন্নত করুন",
        "সময়-সীমাবদ্ধ আধুনিক মানুষের জন্য সর্বোত্তম ব্যায়াম",
        "রক্তে শর্করা নিয়ন্ত্রণ ক্ষমতা এবং ইনসুলিন সংবেদনশীলতা উন্নত করুন"
      ],
      "safetyNotice": "এটি সর্বোচ্চ তীব্রতার ব্যায়াম. কার্ডিওভাসকুলার রোগ বা আঘাত থাকলে ডাক্তারের সাথে পরামর্শ করুন. ওয়ার্ম-আপ ছাড়াই হঠাৎ শুরু করবেন না."
    }
  },
  "ur": {
    "1": {
      "title": "① سیکھنے والوں کے لیے · چلنا / دوڑنا / سٹریچنگ",
      "methodSections": [
        {
          "heading": "جگہ پر چلنے کا ورژن",
          "steps": [
            "ایک جگہ پر رہتے ہوئے ایک ایک کر کے ٹانگ اوپر کریں اور چلیں۔",
            "اپنے گھٹنوں کو کمر کی اونچائی تک اٹھانے کی کوشش کریں۔",
            "بازوں کو بھی قدرتی طریقے سے ہلائیں۔",
            "1 منٹ تک ایک جیسی تال سے برقرار رکھیں۔",
            "سانس لیتے وقت ناک سے اور چھوڑتے وقت منہ سے قدرتی طریقے سے سانس لیں۔"
          ]
        },
        {
          "heading": "دوڑنے کا ورژن",
          "steps": [
            "ایک جگہ پر ہلکے سے اچھل کر ٹخنوں اور گھٹنوں کو مکمل طور پر لچکدار کریں۔",
            "نظر سامنے کی طرف رکھیں اور اپنے اوپری جسم کو تھوڑا آگے کی طرف جھکائیں۔",
            "کہنیوں کو 90 ڈگری پر موڑیں اور آگے پیچھے تال کے ساتھ ہلائیں۔",
            "پیروں کے اگلے حصے سے ہلکے سے لگے اور ایک جیسی رفتار سے دوڑیں۔",
            "ناک سے سانس لیں اور منہ سے چھوڑیں، 1 منٹ تک برقرار رکھیں۔"
          ]
        },
        {
          "heading": "سٹریچنگ کا ورژن",
          "steps": [
            "گردن کو بائیں دائیں آہستہ آہستہ گھمائیں (15 سیکنڈ)",
            "کندھوں کو اوپر کریں پھر نیچے کریں (15 سیکنڈ)",
            "کمر کو بائیں دائیں موڑیں (15 سیکنڈ)",
            "دونوں بازوں کو اوپر کی طرف پھیلائیں اور پہلو میں سٹریچنگ کریں (15 سیکنڈ)"
          ]
        }
      ],
      "effect": [
        "سیکھنے والے بھی بغیر کسی شدید مشقت کے شروع کر سکتے ہیں",
        "خون کی گردش فوری طور پر بہتر ہوتی ہے → ہاتھ پیروں کی سردی میں کمی",
        "سخت جوڑوں اور پٹھوں کو جاگنے والا وارمنگ اپ اثر",
        "دفتری کاری اور گھر سے کام کرنے والوں کے طویل بیٹھے ہونے کا بوجھ کم کرتا ہے"
      ]
    },
    "2": {
      "title": "② بنیادی · اسکواٹ / پش اپ",
      "methodSections": [
        {
          "heading": "اسکواٹ کا ورژن",
          "steps": [
            "اپنی ٹانگوں کو کندھوں کی چوڑائی سے کھولیں اور پیروں کے اگلے حصے کو تھوڑا باہر کی طرف کریں۔",
            "کرسی پر بیٹھتے ہوئے نتھنے کو پیچھے کریں اور گھٹنوں کو موڑیں۔",
            "اپنے گھٹنوں کو پیروں سے آگے نہ آنے دیں۔",
            "اپنی رانوں کو فرش کے ساتھ ہم سطح تک نیچے کریں پھر اوپر آئیں۔",
            "1 منٹ تک آہستہ آہستہ دہرائیں (20 سے 25 بار کا ہدف)۔"
          ]
        },
        {
          "heading": "پش اپ کا ورژن",
          "steps": [
            "اپنے ہاتھوں کو کندھوں کی چوڑائی سے تھوڑا زیادہ کھولیں اور فرش پر رکھیں۔",
            "سیکھنے والے اپنے گھٹنوں کو موڑ کر شروع کر سکتے ہیں۔",
            "اپنے سینے کو فرش تک آہستہ آہستہ نیچے لائیں۔",
            "اپنے بازوں سے اوپر کی طرف دھکیلیں اور شروع کی حالت میں واپس آئیں۔",
            "1 منٹ تک جتنا ممکن ہو دہرائیں۔"
          ]
        }
      ],
      "effect": [
        "نچلے جسم اور اوپری جسم کے بڑے پٹھوں کو فعال کرتا ہے → بنیادی میٹابولزم میں اضافہ",
        "1 منٹ میں دل کی تھاپ بڑھتی ہے اور ورزش کا اثر فوری ہوتا ہے",
        "وضع قطع کی درستگی اور کور طاقت میں اضافے کا بیک وقت اثر",
        "ڈیسک سے چھوٹے وقفے میں بہترین ورزش"
      ]
    },
    "3": {
      "title": "③ ماہر · برپی / جمپنگ جیک",
      "methodSections": [
        {
          "heading": "برپی کا ورژن",
          "steps": [
            "کھڑی حالت میں شروع کریں۔",
            "اسکواٹ کی حالت میں نیچے آئیں اور ہاتھ فرش پر رکھیں۔",
            "اپنی ٹانگوں کو پیچھے کی طرف کریں اور پلنک کی حالت بنائیں۔",
            "اپنی ٹانگوں کو دوبارہ اندر کی طرف کھیچیں اور اٹھ جائیں۔",
            "چھلانگ لگائیں اور اپنے سر کے اوپر تالی بجائیں۔",
            "1 منٹ تک دہرائیں (10 سے 15 بار کا ہدف)۔"
          ]
        },
        {
          "heading": "جمپنگ جیک کا ورژن",
          "steps": [
            "سیدھی کھڑی حالت سے شروع کریں۔",
            "چھلانگ لگائیں اور اپنی ٹانگوں کو کندھوں کی چوڑائی سے کھولیں اور بازوں کو سر کے اوپر اٹھائیں۔",
            "دوبارہ چھلانگ لگائیں اور سیدھی حالت میں واپس آئیں۔",
            "تال برقرار رکھتے ہوئے 1 منٹ تک تیزی سے دہرائیں۔"
          ]
        }
      ],
      "effect": [
        "پوری جسم میں کاردیو + طاقت ورزش کا بیک وقت اثر",
        "دل کی تھاپ تیزی سے بڑھتی ہے → کم وقت میں زیادہ سے زیادہ کیلوریز کا نقصان",
        "اینڈورفن کا اخراج ورزش کے بعد شدید کامیابی کا احساس",
        "1 منٹ میں 'میں نے ورزش کی' کا واضح احساس اور اعتماد حاصل کریں"
      ]
    },
    "4": {
      "title": "④ ماہر · HIIT مینی (20 سیکنڈ × 3 سیٹ)",
      "method": [
        "سیٹ 1 (0 سے 20 سیکنڈ): برپی کو تیزی سے دہرائیں۔",
        "بغیر آرام کے براہ راست اگلے سیٹ میں جائیں۔",
        "سیٹ 2 (20 سے 40 سیکنڈ): ماؤنٹین کلائمبر — پلنک کی حالت سے اپنے گھٹنوں کو سینے تک تیزی سے بدلتے ہیں۔",
        "سیٹ 3 (40 سے 60 سیکنڈ): جمپنگ جیک کو پوری طاقت سے دہرائیں۔",
        "ہر سیٹ میں اپنی زیادہ سے زیادہ طاقت سے کام کریں۔"
      ],
      "effect": [
        "1 منٹ عام ورزش کے 10 منٹ یا اس سے زیادہ کے برابر ہے",
        "ورزش کے بعد 24 گھنٹے تک کیلوری کا جلنا برقرار رہتا ہے (آفٹر برن اثر)",
        "دل اور پھیپھڑوں کی طاقت اور پٹھوں کی طاقت میں بیک وقت بہتری",
        "وقت کی کمی والے جدید لوگوں کے لیے بہترین ورزش",
        "خون میں شوگر کی کنٹرول کی صلاحیت اور انسولین کے لیے حساسیت میں بہتری"
      ],
      "safetyNotice": "یہ زیادہ سے زیادہ طاقت کی ورزش ہے۔ اگر آپ کو دل کی بیماری ہے یا چوٹ لگی ہے تو ڈاکٹر سے مشورہ لیں۔ وارمنگ اپ کے بغیر اچانک شروع مت کریں۔"
    }
  }
};

// lang이 'ko'가 아니면 해당 언어 번역을 base(한국어) 위에 덮어쓴다.
// 번역이 아예 없거나 해당 레벨만 없으면 한국어 원문 그대로 노출(빈 화면보다 낫다).
export function getGuide(track, level, lang = 'ko') {
  const map = track === 'deep' ? DEEP_GUIDE : DASH_GUIDE;
  const base = map[level] || map[1];
  if (lang === 'ko') return base;
  const translations = track === 'deep' ? DEEP_GUIDE_TRANSLATIONS : DASH_GUIDE_TRANSLATIONS;
  const langMap = translations[lang];
  const t = langMap && (langMap[level] || langMap[1]);
  return t ? { ...base, ...t } : base;
}
