import { useLang } from '../i18n/LangContext';
import styles from './LegalPage.module.css';

export default function Terms() {
  const { lang } = useLang();

  if (lang === 'en') {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.meta}>Last updated: 2026-05-17</p>

        <h2>1. About this service</h2>
        <p>
          DDCircle ("the Service") is a wellness web application that helps users
          take a daily three-minute mindful break (short exercise + deep breathing)
          and share that practice with friends.
        </p>

        <h2>2. Accounts</h2>
        <p>
          The Service uses Kakao OAuth for sign-in. By signing in, you agree that
          DDCircle may receive your Kakao account email and profile nickname for
          the sole purpose of running your account. You may sign out at any time
          and request account deletion by contacting us.
        </p>

        <h2>3. User content</h2>
        <p>
          You retain ownership of any content (selfie proofs, messages, mood tags)
          you submit. You grant DDCircle a limited license to store and display
          that content to you and the friends or circles you choose to share with.
          Do not upload content that violates others' rights or applicable laws.
        </p>

        <h2>4. EP & future rewards</h2>
        <p>
          EP (energy points) is an in-app metric tracking your activity. EP has
          no monetary value until and unless a separate reward program is launched.
          Any future reward program will have its own terms.
        </p>

        <h2>5. Disclaimer</h2>
        <p>
          DDCircle is not a medical service. The exercises and breathing patterns
          are general wellness suggestions, not medical advice. Consult a doctor
          before starting any exercise program.
        </p>

        <h2>6. Changes</h2>
        <p>
          We may update these terms. Material changes will be announced in-app.
          Continued use after a change constitutes acceptance.
        </p>

        <h2>7. Contact</h2>
        <p>
          Questions: <a href="mailto:idosati@gmail.com">idosati@gmail.com</a>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>이용약관</h1>
      <p className={styles.meta}>최종 업데이트: 2026-05-17</p>

      <h2>1. 서비스 소개</h2>
      <p>
        DDCircle("본 서비스")는 매일 3분 짧은 운동과 깊은 호흡을 함께 실천하고
        친구들과 그 일상을 나누는 웰니스 웹 애플리케이션입니다.
      </p>

      <h2>2. 계정</h2>
      <p>
        본 서비스는 카카오 OAuth 로그인을 사용합니다. 로그인 시 본 서비스는
        계정 운영 목적으로 카카오에서 제공하는 닉네임과 이메일 주소를 받습니다.
        언제든지 로그아웃할 수 있으며, 계정 삭제는 아래 연락처로 요청할 수
        있습니다.
      </p>

      <h2>3. 사용자 콘텐츠</h2>
      <p>
        사용자가 업로드하는 콘텐츠(셀카 인증, 응원 메시지, 무드 태그 등)에 대한
        권리는 사용자에게 있습니다. 사용자는 DDCircle이 해당 콘텐츠를 사용자
        본인과 사용자가 선택한 친구/서클에 표시·저장하기 위한 제한적 권한을
        DDCircle에게 부여합니다. 타인의 권리 또는 관련 법령을 침해하는
        콘텐츠를 업로드해서는 안 됩니다.
      </p>

      <h2>4. EP 및 향후 보상</h2>
      <p>
        EP(에너지 포인트)는 사용자의 활동을 기록하는 앱 내 지표입니다. 별도
        보상 프로그램이 시작되기 전까지 EP는 금전적 가치를 가지지 않으며, 향후
        보상 프로그램이 도입될 경우 별도의 약관을 통해 안내됩니다.
      </p>

      <h2>5. 면책 조항</h2>
      <p>
        DDCircle은 의료 서비스가 아닙니다. 제공되는 운동·호흡 가이드는 일반적인
        웰니스 제안이며 의료 행위가 아닙니다. 운동 프로그램을 시작하기 전에는
        의료 전문가와 상담하시기 바랍니다.
      </p>

      <h2>6. 변경</h2>
      <p>
        본 약관은 변경될 수 있습니다. 중요한 변경 사항은 앱 내에서 안내합니다.
        변경 이후 본 서비스를 계속 이용하면 변경된 약관에 동의한 것으로 봅니다.
      </p>

      <h2>7. 문의</h2>
      <p>
        <a href="mailto:idosati@gmail.com">idosati@gmail.com</a>
      </p>
    </div>
  );
}
