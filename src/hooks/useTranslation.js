import { useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation, getSection } from '../translations';

/**
 * Custom hook for translations
 * Provides easy access to translations throughout the app
 * 
 * Usage:
 * const { t, language, setLanguage } = useTranslation();
 * <h1>{t('common.appName')}</h1>
 * <p>{t('loginScreen.title')}</p>
 */
export const useTranslation = () => {
    const { language, setLanguage, isLanguageSelected, supportedLanguages, getCurrentLanguageInfo } = useLanguage();

    /**
     * Translate a key
     * @param {string} key - Translation key (e.g., 'common.appName')
     * @param {object} params - Optional interpolation parameters
     * @returns {string} Translated string
     */
    const t = useCallback((key, params = {}) => {
        return getTranslation(key, language, params);
    }, [language]);

    /**
     * Get all translations for a section
     * @param {string} section - Section name (e.g., 'common', 'loginScreen')
     * @returns {object} All translations for that section
     */
    const ts = useCallback((section) => {
        return getSection(section, language);
    }, [language]);

    return {
        t,
        ts,
        language,
        setLanguage,
        isLanguageSelected,
        supportedLanguages,
        getCurrentLanguageInfo
    };
};

export default useTranslation;
