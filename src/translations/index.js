// Centralized translations index
import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';
import te from './te.json';
import kn from './kn.json';
import bn from './bn.json';
import mr from './mr.json';
import gu from './gu.json';
import pa from './pa.json';
import ml from './ml.json';
import or from './or.json';
import as from './as.json';
import ur from './ur.json';
import ne from './ne.json';
import sa from './sa.json';

// All available translations
const translations = {
    en,
    hi,
    ta,
    te,
    kn,
    bn,
    mr,
    gu,
    pa,
    ml,
    or,
    as,
    ur,
    ne,
    sa
};

/**
 * Get translation for a specific key
 * @param {string} key - Dot-notation key (e.g., 'common.appName' or 'loginScreen.title')
 * @param {string} language - Language code
 * @param {object} params - Optional parameters for interpolation
 * @returns {string} Translated string
 */
export const getTranslation = (key, language = 'en', params = {}) => {
    const lang = translations[language] || translations.en;

    // Support dot notation for nested keys
    const keys = key.split('.');
    let value = lang;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            // Fallback to English if key not found
            value = translations.en;
            for (const fallbackKey of keys) {
                if (value && typeof value === 'object' && fallbackKey in value) {
                    value = value[fallbackKey];
                } else {
                    return key; // Return the key itself if not found
                }
            }
            break;
        }
    }

    // Handle interpolation (e.g., "Hello {name}")
    if (typeof value === 'string' && Object.keys(params).length > 0) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? params[paramKey] : match;
        });
    }

    return typeof value === 'string' ? value : key;
};

/**
 * Get all translations for a specific section
 * @param {string} section - Section name (e.g., 'common', 'loginScreen')
 * @param {string} language - Language code
 * @returns {object} All translations for that section
 */
export const getSection = (section, language = 'en') => {
    const lang = translations[language] || translations.en;
    return lang[section] || translations.en[section] || {};
};

/**
 * Check if a translation exists
 * @param {string} key - Translation key
 * @param {string} language - Language code
 * @returns {boolean}
 */
export const hasTranslation = (key, language = 'en') => {
    const lang = translations[language] || translations.en;
    const keys = key.split('.');
    let value = lang;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return false;
        }
    }

    return typeof value === 'string';
};

export default translations;
