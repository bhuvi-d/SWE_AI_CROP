import { useState, useEffect, useRef } from "react";
import "./LanguageScreen.css";
import { useLanguage } from "../context/LanguageContext";

function LanguageScreen({ onSelect }) {
  const { supportedLanguages } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const recognitionRef = useRef(null);

  // Filter languages based on search query
  const filteredLanguages = supportedLanguages.filter((lang) => {
    const query = searchQuery.toLowerCase();
    return (
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query)
    );
  });

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const detectedLangCode = event.results[0][0].lang || detectLanguageFromSpeech(event);

        // Try to match detected language with supported languages
        const matchedLang = matchLanguageFromSpeech(transcript, detectedLangCode);

        if (matchedLang) {
          setDetectedLanguage(matchedLang);
          setShowConfirmation(true);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Detect language from speech recognition event
  const detectLanguageFromSpeech = (event) => {
    // Check if the recognition result has language info
    if (event.results[0] && event.results[0][0]) {
      // The SpeechRecognition API sometimes provides language info
      const result = event.results[0][0];
      return result.lang || null;
    }
    return null;
  };

  // Match spoken text or detected language code to supported languages
  const matchLanguageFromSpeech = (transcript, detectedLangCode) => {
    const lowerTranscript = transcript.toLowerCase();

    // Common greetings and phrases for each language
    const languagePatterns = {
      en: ["hello", "hi", "good morning", "english"],
      hi: ["नमस्ते", "हिंदी", "हैलो", "प्रणाम"],
      ta: ["வணக்கம்", "தமிழ்", "நன்றி"],
      te: ["నమస్కారం", "తెలుగు", "హలో"],
      kn: ["ನಮಸ್ಕಾರ", "ಕನ್ನಡ", "ಹಲೋ"],
      bn: ["নমস্কার", "বাংলা", "হ্যালো"],
      mr: ["नमस्कार", "मराठी", "हॅलो"],
      gu: ["નમસ્તે", "ગુજરાતી", "હેલો"],
      pa: ["ਸਤ ਸ੍ਰੀ ਅਕਾਲ", "ਪੰਜਾਬੀ", "ਹੈਲੋ"],
      ml: ["നമസ്കാരം", "മലയാളം", "ഹലോ"],
      or: ["ନମସ୍କାର", "ଓଡ଼ିଆ", "ହେଲୋ"],
      as: ["নমস্কাৰ", "অসমীয়া", "হেল'"],
      ur: ["السلام علیکم", "اردو", "ہیلو"],
      ne: ["नमस्ते", "नेपाली", "नमस्कार"],
      sa: ["नमस्ते", "संस्कृतम्", "प्रणामः"]
    };

    // First check by detected language code
    if (detectedLangCode) {
      const langCodePrefix = detectedLangCode.split("-")[0].toLowerCase();
      const matchedLang = supportedLanguages.find(l => l.code === langCodePrefix);
      if (matchedLang) return matchedLang;
    }

    // Then try pattern matching
    for (const [code, patterns] of Object.entries(languagePatterns)) {
      for (const pattern of patterns) {
        if (lowerTranscript.includes(pattern.toLowerCase())) {
          return supportedLanguages.find(l => l.code === code);
        }
      }
    }

    // If transcript contains language name, match it
    for (const lang of supportedLanguages) {
      if (lowerTranscript.includes(lang.name.toLowerCase()) ||
        lowerTranscript.includes(lang.nativeName.toLowerCase())) {
        return lang;
      }
    }

    return null;
  };

  // Start voice input
  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in your browser. Please use Chrome.");
      return;
    }

    // Set recognition to detect multiple languages
    recognitionRef.current.lang = ""; // Allow auto-detection

    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      setIsListening(false);
    }
  };

  // Stop voice input
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Confirm detected language
  const confirmLanguage = () => {
    if (detectedLanguage) {
      onSelect(detectedLanguage.code);
    }
    setShowConfirmation(false);
    setDetectedLanguage(null);
  };

  // Cancel confirmation
  const cancelConfirmation = () => {
    setShowConfirmation(false);
    setDetectedLanguage(null);
  };

  return (
    <div className="lang-wrapper">
      <h2>Select Your Language</h2>
      <p className="lang-subtitle">
      </p>

      {/* Search and Voice Input */}
      <div className="lang-search-container">
        <div className="lang-search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search language... / भाषा खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="lang-search-input"
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <button
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopVoiceInput : startVoiceInput}
          title="Speak in your language"
        >
          {isListening ? (
            <div className="voice-waves">
              <span></span><span></span><span></span>
            </div>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>

      {isListening && (
        <p className="listening-text">🎤 Listening... Speak in your preferred language</p>
      )}

      {/* Language Grid */}
      <div className="lang-grid">
        {filteredLanguages.length > 0 ? (
          filteredLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className="lang-btn"
            >
              <span className="lang-native">{lang.nativeName}</span>
              {lang.code !== 'en' && (
                <span className="lang-english">{lang.name}</span>
              )}
            </button>
          ))
        ) : (
          <p className="no-results">No languages found</p>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && detectedLanguage && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Language Detected</h3>
            <p className="detected-lang-name">{detectedLanguage.nativeName}</p>
            <p className="detected-lang-english">{detectedLanguage.name}</p>
            <p className="confirmation-text">Continue with this language?</p>
            <div className="confirmation-buttons">
              <button className="confirm-btn" onClick={confirmLanguage}>
                ✓ Yes, Continue
              </button>
              <button className="cancel-btn" onClick={cancelConfirmation}>
                ✕ No, Choose Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageScreen;
