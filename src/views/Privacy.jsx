import { useLang } from '../i18n/LangContext';
import styles from './LegalPage.module.css';

export default function Privacy() {
  const { lang } = useLang();

  if (lang === 'en') {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.meta}>Last updated: 2026-05-17</p>

        <h2>1. What we collect</h2>
        <ul>
          <li><strong>Kakao OAuth:</strong> nickname, email address.</li>
          <li><strong>App activity:</strong> session timestamps, exercise/breath selections, EP, streak, mood selections, encouragement messages, friend relationships.</li>
          <li><strong>User-uploaded media:</strong> ✊ fist ("proof of life") photos that you choose to attach to a session.</li>
          <li><strong>Anonymous analytics:</strong> Vercel Analytics aggregate page views (no PII).</li>
        </ul>

        <h2>2. How we use it</h2>
        <p>
          To operate the service (display your activity, deliver friend feeds,
          calculate EP and streaks). We do not sell or share personal data with
          third parties for advertising.
        </p>

        <h2>3. Where it lives</h2>
        <p>
          Data is stored on Supabase (Postgres + Storage), hosted in the AWS
          ap-northeast-2 (Seoul) region. Transit and storage are encrypted.
        </p>

        <h2>4. Retention</h2>
        <p>
          Data is retained as long as your account exists. You can delete your
          account (and all associated data) by emailing us at the address below.
          We will complete deletion within 30 days.
        </p>

        <h2>5. Your rights (PIPA)</h2>
        <p>
          You can request access, correction, deletion, or export of your data
          at any time by contacting us. We respond within 30 days.
        </p>

        <h2>6. Contact</h2>
        <p>
          Data protection officer: <a href="mailto:idosati@gmail.com">idosati@gmail.com</a>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>개인정보처리방침</h1>
      <p className={styles.meta}>최종 업데이트: 2026-05-17</p>

      <h2>1. 수집하는 정보</h2>
      <ul>
        <li><strong>카카오 OAuth:</strong> 닉네임, 이메일 주소</li>
        <li><strong>앱 활동 데이터:</strong> 세션 시각, 선택한 운동·호흡, EP, 연속일, 무드 선택, 응원 메시지, 친구 관계</li>
        <li><strong>업로드한 사진:</strong> 사용자가 세션에 첨부한 ✊ 주먹 사진("PROOF OF LIFE")</li>
        <li><strong>익명 분석:</strong> Vercel Analytics 집계 페이지뷰 (개인 식별 정보 없음)</li>
      </ul>

      <h2>2. 이용 목적</h2>
      <p>
        서비스 운영(활동 표시, 친구 피드 전달, EP·연속일 계산). 광고 목적으로
        제3자에게 개인정보를 판매하거나 제공하지 않습니다.
      </p>

      <h2>3. 저장 위치</h2>
      <p>
        데이터는 Supabase(Postgres + Storage)에 저장되며 AWS ap-northeast-2(서울)
        리전에서 호스팅됩니다. 전송 구간과 저장 구간 모두 암호화됩니다.
      </p>

      <h2>4. 보관 기간</h2>
      <p>
        계정이 존재하는 동안 데이터를 보관합니다. 아래 연락처로 이메일을 보내
        계정과 모든 관련 데이터의 삭제를 요청할 수 있으며, 30일 이내에 삭제를
        완료합니다.
      </p>

      <h2>5. 정보주체의 권리 (개인정보보호법)</h2>
      <p>
        개인정보의 열람, 정정, 삭제, 처리정지, 이전을 언제든지 요청할 수
        있습니다. 요청은 30일 이내에 처리합니다.
      </p>

      <h2>6. 개인정보 보호 책임자</h2>
      <p>
        <a href="mailto:idosati@gmail.com">idosati@gmail.com</a>
      </p>
    </div>
  );
}
