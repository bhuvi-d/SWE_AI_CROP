import { useState, useEffect } from "react";
import "./LoginScreen.css";

import { speak } from "../utils/voice";
import { useTranslation } from "../hooks/useTranslation";

import { auth } from "../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

function LoginScreen({ onLogin, onSkip }) {
  const { t } = useTranslation();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");

  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  const [voiceEnabled, setVoiceEnabled] = useState(false);


  /* 🔊 Enable Voice After First Click */
  useEffect(() => {

    const enableVoice = () => {
      speak(t('loginScreen.brandDesc'));
      setVoiceEnabled(true);

      document.removeEventListener("click", enableVoice);
    };

    document.addEventListener("click", enableVoice);

    return () => {
      document.removeEventListener("click", enableVoice);
    };

  }, [t]);


  // Send OTP
  const sendOtp = async () => {

    if (phone.length !== 10) {
      if (voiceEnabled) {
        speak(t('loginScreen.invalidPhone'));
      }

      alert(t('loginScreen.invalidPhone'));
      return;
    }

    try {
      setLoading(true);

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
      }

      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        "+91" + phone,
        appVerifier
      );

      setConfirmation(result);
      setStep("otp");

      if (voiceEnabled) {
        speak(t('loginScreen.otpSent'));
      }

    } catch (err) {
      console.error("OTP Error:", err);

      if (voiceEnabled) {
        speak(t('loginScreen.otpFailed'));
      }

      alert(t('loginScreen.otpFailed'));
    }

    setLoading(false);
  };


  // Verify OTP
  const verifyOtp = async () => {

    if (!confirmation) {

      if (voiceEnabled) {
        speak(t('loginScreen.requestOtpFirst'));
      }

      alert(t('loginScreen.requestOtpFirst'));
      return;
    }

    try {
      setLoading(true);

      await confirmation.confirm(otp);

      if (voiceEnabled) {
        speak(t('loginScreen.loginSuccess'));
      }

      alert(t('loginScreen.loginSuccess'));

      onLogin();

    } catch (err) {
      console.error("Verify Error:", err);

      if (voiceEnabled) {
        speak(t('loginScreen.incorrectOtp'));
      }

      alert(t('loginScreen.incorrectOtp'));
    }

    setLoading(false);
  };


  return (
    <div className="login-wrapper">

      {/* LEFT SIDE */}
      <div className="login-left">
        <h1>{t('loginScreen.brandName')}</h1>

        <p>
          {t('loginScreen.brandDesc')}
          <br /><br />
          {t('loginScreen.brandSubDesc')}
        </p>
      </div>


      {/* RIGHT SIDE */}
      <div className="login-right">

        <div className="login-card">

          <h2>{t('loginScreen.title')}</h2>


          {/* PHONE INPUT */}
          {step === "phone" && (
            <>
              <input
                type="tel"
                placeholder={t('loginScreen.enterMobile')}
                value={phone}
                maxLength="10"
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
              />

              <button
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? t('loginScreen.sending') : t('loginScreen.sendOtp')}
              </button>
            </>
          )}


          {/* OTP INPUT */}
          {step === "otp" && (
            <>
              <input
                type="number"
                placeholder={t('loginScreen.enterOtp')}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                onClick={verifyOtp}
                disabled={loading}
              >
                {loading ? t('loginScreen.verifying') : t('loginScreen.verifyLogin')}
              </button>
            </>
          )}


          {/* SKIP */}
          <p className="skip" onClick={onSkip}>
            {t('loginScreen.skipLogin')}
          </p>


          {/* FIREBASE CAPTCHA */}
          <div id="recaptcha-container"></div>

        </div>

      </div>

    </div>
  );
}

export default LoginScreen;
