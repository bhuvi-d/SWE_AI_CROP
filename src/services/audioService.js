
/**
 * Audio Service
 * Provides comprehensive audio feedback for user actions including:
 * - Sound effects (beeps, clicks, success/error tones)
 * - Text-to-speech voice confirmations
 * - Multilingual voice support
 */

class AudioService {
    constructor() {
        // Web Audio API context for generating sound effects
        this.audioContext = null;

        // User preference flags
        this.soundEnabled = true;      // Enable/disable sound effects
        this.voiceEnabled = true;      // Enable/disable text-to-speech

        // Speech tracking
        this.isSpeaking = false;       // Track if TTS is currently speaking
        this.currentUtterance = null;  // Reference to current speech utterance

        // Initialize Web Audio API for sound generation
        this.initAudioContext();

        // Load user's saved audio preferences from storage
        this.loadPreferences();
    }

    /**
     * Initialize Web Audio API context for generating sound effects
     * Uses browser-specific AudioContext (handles webkit prefix for Safari)
     */
    initAudioContext() {
        try {
            // Get AudioContext (standard or webkit-prefixed)
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('AudioService: Web Audio API initialized successfully');
        } catch (e) {
            // Gracefully handle browsers that don't support Web Audio API
            console.warn('Web Audio API not supported:', e);
            this.audioContext = null;
        }
    }

    /**
     * Load audio preferences from localStorage
     * Guest users always get default settings without persistence
     */
    loadPreferences() {
        // Guest mode: use defaults without loading from storage
        // Guests always start with audio enabled for better accessibility
        const isGuest = localStorage.getItem('crop_diagnosis_is_guest') === 'true';
        if (isGuest) {
            this.soundEnabled = true;
            this.voiceEnabled = true;
            return;
        }

        // Regular users: load saved preferences
        try {
            const prefs = localStorage.getItem('cropai_audio_preferences');
            if (prefs) {
                const parsed = JSON.parse(prefs);
                // Use saved values or default to true if not set
                this.soundEnabled = parsed.soundEnabled !== undefined ? parsed.soundEnabled : true;
                this.voiceEnabled = parsed.voiceEnabled !== undefined ? parsed.voiceEnabled : true;
                console.log('AudioService: Preferences loaded', { soundEnabled: this.soundEnabled, voiceEnabled: this.voiceEnabled });
            }
        } catch (e) {
            console.warn('Error loading audio preferences:', e);
            // Fall back to defaults on error
            this.soundEnabled = true;
            this.voiceEnabled = true;
        }
    }

    /**
     * Save current audio preferences to localStorage
     * Skipped for guest users to respect privacy
     */
    savePreferences() {
        // Don't persist preferences for guests (privacy-first approach)
        const isGuest = localStorage.getItem('crop_diagnosis_is_guest') === 'true';
        if (isGuest) {
            console.log('AudioService: Guest mode - preferences not saved');
            return;
        }

        // Save preferences for regular users
        try {
            const prefs = {
                soundEnabled: this.soundEnabled,
                voiceEnabled: this.voiceEnabled
            };
            localStorage.setItem('cropai_audio_preferences', JSON.stringify(prefs));
            console.log('AudioService: Preferences saved');
        } catch (e) {
            console.warn('Error saving audio preferences:', e);
        }
    }

    /**
     * Toggle sound effects on/off
     * Automatically saves preference for non-guest users
     * @returns {boolean} - New sound enabled state
     */
    toggleSound() {
        // Flip the current state
        this.soundEnabled = !this.soundEnabled;

        // Persist the new setting
        this.savePreferences();

        console.log('AudioService: Sound effects', this.soundEnabled ? 'enabled' : 'disabled');
        return this.soundEnabled;
    }

    /**
     * Toggle voice feedback on/off
     * If turning off voice, stops any currently playing speech
     * @returns {boolean} - New voice enabled state
     */
    toggleVoice() {
        // Flip the current state
        this.voiceEnabled = !this.voiceEnabled;

        // Persist the new setting
        this.savePreferences();

        // If disabling voice, stop any ongoing speech immediately
        if (!this.voiceEnabled) {
            this.stopSpeaking();
        }

        console.log('AudioService: Voice feedback', this.voiceEnabled ? 'enabled' : 'disabled');
        return this.voiceEnabled;
    }

    /**
     * Check if sound is enabled
     */
    isSoundEnabled() {
        return this.soundEnabled;
    }

    /**
     * Check if voice is enabled
     */
    isVoiceEnabled() {
        return this.voiceEnabled;
    }

    /**
     * Play a beep sound with specified frequency and duration
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in milliseconds
     * @param {string} type - Oscillator type (sine, square, sawtooth, triangle)
     */
    playBeep(frequency = 800, duration = 100, type = 'sine') {
        if (!this.soundEnabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.audioContext.currentTime + duration / 1000
            );

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.warn('Error playing beep:', e);
        }
    }

    /**
     * Play success sound
     */
    playSuccess() {
        if (!this.soundEnabled) return;

        // Play ascending tone
        setTimeout(() => this.playBeep(523, 100, 'sine'), 0);   // C
        setTimeout(() => this.playBeep(659, 100, 'sine'), 100); // E
        setTimeout(() => this.playBeep(784, 150, 'sine'), 200); // G
    }

    /**
     * Play error sound
     */
    playError() {
        if (!this.soundEnabled) return;

        // Play descending tone
        setTimeout(() => this.playBeep(400, 150, 'square'), 0);
        setTimeout(() => this.playBeep(300, 200, 'square'), 150);
    }

    /**
     * Play warning sound
     */
    playWarning() {
        if (!this.soundEnabled) return;

        // Play repeating tone
        this.playBeep(600, 100, 'triangle');
        setTimeout(() => this.playBeep(600, 100, 'triangle'), 150);
    }

    /**
     * Play click sound
     */
    playClick() {
        if (!this.soundEnabled) return;
        this.playBeep(1000, 50, 'sine');
    }

    /**
     * Play upload sound
     */
    playUpload() {
        if (!this.soundEnabled) return;

        // Play rising tone
        setTimeout(() => this.playBeep(400, 80, 'sine'), 0);
        setTimeout(() => this.playBeep(500, 80, 'sine'), 80);
        setTimeout(() => this.playBeep(600, 80, 'sine'), 160);
        setTimeout(() => this.playBeep(700, 100, 'sine'), 240);
    }

    /**
     * Play camera capture sound
     */
    playCapture() {
        if (!this.soundEnabled) return;

        // Play camera shutter sound
        this.playBeep(800, 50, 'square');
        setTimeout(() => this.playBeep(400, 100, 'square'), 50);
    }

    /**
     * Play soft alert sound from assets
     */
    playSoftAlert() {
        if (!this.soundEnabled) return;
        try {
            const audio = new Audio('/sounds/soft_alert.mp3');
            audio.play().catch(e => console.warn('Failed to play soft_alert.mp3:', e));
        } catch (e) {
            console.warn('Error playing soft alert:', e);
        }
    }

    /**
     * Play notification sound
     */
    playNotification() {
        if (!this.soundEnabled) return;

        // Play gentle notification
        this.playBeep(880, 100, 'sine');
        setTimeout(() => this.playBeep(1046, 150, 'sine'), 100);
    }

    /**
     * Speak text using Web Speech API
     * @param {string} text - Text to speak
     * @param {Object} options - Speech options
     */
    speak(text, options = {}) {
        if (!this.voiceEnabled || !('speechSynthesis' in window)) return;

        // Cancel any ongoing speech
        this.stopSpeaking();

        this.isSpeaking = true;

        const utterance = new SpeechSynthesisUtterance(text);

        // Configure speech
        utterance.lang = options.lang || 'en-US';
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        // Event handlers
        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            if (options.onEnd) options.onEnd();
        };

        utterance.onerror = (e) => {
            console.warn('Speech error:', e);
            this.isSpeaking = false;
            this.currentUtterance = null;
            if (options.onError) options.onError(e);
        };

        this.currentUtterance = utterance;
        speechSynthesis.speak(utterance);
    }

    /**
     * Stop current speech
     */
    stopSpeaking() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
        }
    }

    /**
     * Check if currently speaking
     */
    getSpeakingStatus() {
        return this.isSpeaking;
    }

    /**
     * Confirm action with sound and voice
     * @param {string} action - Action name
     * @param {string} message - Voice message (optional)
     */
    confirmAction(action, message = null) {
        // Play appropriate sound
        switch (action) {
            case 'success':
                this.playSuccess();
                break;
            case 'error':
                this.playError();
                break;
            case 'warning':
                this.playWarning();
                break;
            case 'click':
                this.playClick();
                break;
            case 'upload':
                this.playUpload();
                break;
            case 'capture':
                this.playCapture();
                break;
            case 'notification':
                this.playNotification();
                break;
            default:
                this.playClick();
        }

        // Speak message if provided
        if (message && this.voiceEnabled) {
            setTimeout(() => this.speak(message), 100);
        }
    }

    /**
     * Multilingual voice messages
     */
    getLocalizedMessage(key, lang = 'en') {
        const messages = {
            'language_selected': {
                'en': 'Language selected',
                'hi': 'भाषा चयनित',
                'ta': 'மொழி தேர்ந்தெடுக்கப்பட்டது',
                'te': 'భాష ఎంచుకోబడింది',
                'kn': 'ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ'
            },
            'photo_captured': {
                'en': 'Photo captured successfully',
                'hi': 'फोटो सफलतापूर्वक कैप्चर किया गया',
                'ta': 'புகைப்படம் வெற்றிகரமாகப் பிடிக்கப்பட்டது',
                'te': 'ఫోటో విజయవంతంగా క్యాప్చర్ చేయబడింది',
                'kn': 'ಫೋಟೋ ಯಶಸ್ವಿಯಾಗಿ ಸೆರೆಹಿಡಿಯಲಾಗಿದೆ'
            },
            'upload_complete': {
                'en': 'Upload complete',
                'hi': 'अपलोड पूर्ण',
                'ta': 'பதிவேற்றம் முடிந்தது',
                'te': 'అప్‌లోడ్ పూర్తయింది',
                'kn': 'ಅಪ್‌ಲೋಡ್ ಪೂರ್ಣಗೊಂಡಿದೆ'
            },
            'analysis_complete': {
                'en': 'Analysis complete',
                'hi': 'विश्लेषण पूर्ण',
                'ta': 'பகுப்பாய்வு முடிந்தது',
                'te': 'విశ్లేషణ పూర్తయింది',
                'kn': 'ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ'
            },
            'images_selected': {
                'en': 'images selected',
                'hi': 'छवियाँ चयनित',
                'ta': 'படங்கள் தேர்ந்தெடுக்கப்பட்டன',
                'te': 'చిత్రాలు ఎంచుకోబడ్డాయి',
                'kn': 'ಚಿತ್ರಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ'
            }
        };

        return messages[key]?.[lang] || messages[key]?.['en'] || key;
    }

    /**
     * Speak localized message
     */
    speakLocalized(key, lang = 'en', options = {}) {
        const message = this.getLocalizedMessage(key, lang);
        this.speak(message, { ...options, lang: this.getVoiceLang(lang) });
    }

    /**
     * Get voice language code
     */
    getVoiceLang(lang) {
        const langMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'kn': 'kn-IN'
        };
        return langMap[lang] || 'en-US';
    }

    /**
     * Get available voices for a language
     */
    getVoicesForLanguage(lang) {
        if (!('speechSynthesis' in window)) return [];

        const voices = speechSynthesis.getVoices();
        const voiceLang = this.getVoiceLang(lang);

        return voices.filter(voice => voice.lang.startsWith(voiceLang.split('-')[0]));
    }
}

// Export singleton instance
export const audioService = new AudioService();

// Export default
export default audioService;
