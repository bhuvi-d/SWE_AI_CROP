import { consentService } from './consentService';

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
        // Return default preferences for guest users (don't load from storage)
        if (consentService.isGuest()) {
            return this.getDefaultPreferences();
        }

        try {
            const stored = localStorage.getItem(PREFERENCES_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    version: PREFERENCES_VERSION,
                    language: parsed.language || null,
                    cropType: parsed.cropType || null,
                    voiceInstructions: parsed.voiceInstructions !== undefined ? parsed.voiceInstructions : true,
                    showGrid: parsed.showGrid !== undefined ? parsed.showGrid : true,
                    userId: parsed.userId || null,
                    lastSyncedAt: parsed.lastSyncedAt || null,
                    createdAt: parsed.createdAt || new Date().toISOString(),
                    updatedAt: parsed.updatedAt || new Date().toISOString()
                };
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }

        return this.getDefaultPreferences();
    }

    getDefaultPreferences() {
        return {
            version: PREFERENCES_VERSION,
            language: null,
            cropType: null,
            voiceInstructions: true,
            showGrid: true,
            userId: null,
            lastSyncedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        // Don't save preferences for guest users
        if (consentService.isGuest()) {
            return;
        }

        try {
            this.preferences.updatedAt = new Date().toISOString();
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(this.preferences));
            console.log('Preferences saved:', this.preferences);
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
            // TODO: Implement actual server sync
            // For now, just mark as synced
            this.preferences.userId = userId;
            this.preferences.lastSyncedAt = new Date().toISOString();
            this.savePreferences();
            console.log('Preferences synced for user:', userId);
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
