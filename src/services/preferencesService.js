import { consentService } from './consentService';
import { api } from './api';

/**
 * Preferences Service
 * Manages user preferences with local storage and sync capabilities
 */

const PREFERENCES_KEY = 'cropai_user_preferences';
const PREFERENCES_VERSION = '1.0';

class PreferencesService {
    constructor() {
        this.preferences = this.loadPreferences();
    }

    /**
     * Load preferences from localStorage
     * @returns {Object} User preferences
     */
    loadPreferences() {
        try {
            const stored = localStorage.getItem(PREFERENCES_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                let userId = parsed.userId;
                let needsUpdate = false;

                // Ensure a userId exists (guest or real) - must be 24 char hex for MongoDB
                const isGuest = localStorage.getItem('crop_diagnosis_is_guest') === 'true';
                if (!userId || isGuest || userId.startsWith('guest_')) {
                    userId = '1aa73030589c2135f668eacb'; // Stable local ID for all guests
                    needsUpdate = true;
                }

                const prefs = {
                    version: PREFERENCES_VERSION,
                    language: parsed.language || null,
                    cropType: parsed.cropType || null,
                    voiceInstructions: parsed.voiceInstructions !== undefined ? parsed.voiceInstructions : true,
                    showGrid: parsed.showGrid !== undefined ? parsed.showGrid : true,
                    userId: userId,
                    lastSyncedAt: parsed.lastSyncedAt || null,
                    createdAt: parsed.createdAt || new Date().toISOString(),
                    updatedAt: parsed.updatedAt || new Date().toISOString()
                };

                if (needsUpdate) {
                    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
                }

                return prefs;
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }

        return this.getDefaultPreferences();
    }

    getDefaultPreferences() {
        const prefs = {
            version: PREFERENCES_VERSION,
            language: null,
            cropType: null,
            voiceInstructions: true,
            showGrid: true,
            userId: '1aa73030589c2135f668eacb', // Stable local ID
            lastSyncedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
        return prefs;
    }

    /**
     * Save preferences to localStorage
     */
    savePreferences(skipSync = false) {
        try {
            this.preferences.updatedAt = new Date().toISOString();
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(this.preferences));
            console.log('Preferences saved:', this.preferences);

            // Sync to server if user is logged in
            const isGuest = localStorage.getItem('crop_diagnosis_is_guest') === 'true';
            if (!skipSync && this.preferences.userId && !isGuest) {
                api.settings.update(this.preferences.userId, {
                    language: this.preferences.language,
                    audioEnabled: this.preferences.voiceInstructions,
                    guestMode: false // Assuming logged in user is not guest
                }).catch(err => console.error('Failed to push prefs to server:', err));
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    /**
     * Get a specific preference
     * @param {string} key - Preference key
     * @returns {any} Preference value
     */
    getPreference(key) {
        return this.preferences[key];
    }

    /**
     * Set a specific preference
     * @param {string} key - Preference key
     * @param {any} value - Preference value
     */
    setPreference(key, value) {
        this.preferences[key] = value;
        this.savePreferences();
    }

    /**
     * Get all preferences
     * @returns {Object} All preferences
     */
    getAllPreferences() {
        return { ...this.preferences };
    }

    /**
     * Set multiple preferences at once
     * @param {Object} prefs - Preferences object
     */
    setPreferences(prefs) {
        this.preferences = {
            ...this.preferences,
            ...prefs
        };
        this.savePreferences();
    }

    /**
     * Get language preference
     * @returns {string|null} Language code
     */
    getLanguage() {
        return this.preferences.language;
    }

    /**
     * Set language preference
     * @param {string} language - Language code
     */
    setLanguage(language) {
        this.setPreference('language', language);
    }

    /**
     * Get crop type preference
     * @returns {string|null} Crop type
     */
    getCropType() {
        return this.preferences.cropType;
    }

    /**
     * Set crop type preference
     * @param {string} cropType - Crop type
     */
    setCropType(cropType) {
        this.setPreference('cropType', cropType);
    }

    /**
     * Get voice instructions preference
     * @returns {boolean} Voice instructions enabled
     */
    getVoiceInstructions() {
        return this.preferences.voiceInstructions;
    }

    /**
     * Set voice instructions preference
     * @param {boolean} enabled - Voice instructions enabled
     */
    setVoiceInstructions(enabled) {
        this.setPreference('voiceInstructions', enabled);
    }

    /**
     * Get show grid preference
     * @returns {boolean} Show grid enabled
     */
    getShowGrid() {
        return this.preferences.showGrid;
    }

    /**
     * Set show grid preference
     * @param {boolean} enabled - Show grid enabled
     */
    setShowGrid(enabled) {
        this.setPreference('showGrid', enabled);
    }

    /**
     * Set user ID for syncing
     * @param {string} userId - User ID
     */
    setUserId(userId) {
        this.setPreference('userId', userId);
    }

    /**
     * Get user ID
     * @returns {string|null} User ID
     */
    getUserId() {
        return this.preferences.userId;
    }

    /**
     * Sync preferences with server (when logged in)
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    async syncWithServer(userId) {
        if (!userId) {
            console.warn('Cannot sync without user ID');
            return;
        }

        try {
            this.preferences.userId = userId;

            // Don't fetch from server for guests (US6)
            const isGuest = localStorage.getItem('crop_diagnosis_is_guest') === 'true';
            if (isGuest) return;

            // 1. Fetch settings from server
            const serverSettings = await api.settings.get(userId);

            if (serverSettings) {
                // 2. Update local preferences with server data
                // Map server fields to local fields if names differ
                if (serverSettings.language) this.preferences.language = serverSettings.language;
                if (serverSettings.audioEnabled !== undefined) this.preferences.voiceInstructions = serverSettings.audioEnabled;
                // Add other mappings as needed

                this.savePreferences(false); // Save locally without syncing back immediately
                console.log('Preferences synced from server:', serverSettings);
            }
        } catch (error) {
            console.error('Error syncing preferences:', error);
        }
    }

    /**
     * Clear all preferences
     */
    clearPreferences() {
        localStorage.removeItem(PREFERENCES_KEY);
        this.preferences = this.loadPreferences();
    }

    /**
     * Check if preferences exist
     * @returns {boolean} True if preferences exist
     */
    hasPreferences() {
        return localStorage.getItem(PREFERENCES_KEY) !== null;
    }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
