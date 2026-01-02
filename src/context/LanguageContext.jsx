import React, { createContext, useContext, useState, useEffect } from 'react';
import { preferencesService } from '../services/preferencesService';

// Create the context
const LanguageContext = createContext(null);

// Supported languages with BCP47 codes for speech recognition
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', speechCode: 'hi-IN' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechCode: 'or-IN' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', speechCode: 'as-IN' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', speechCode: 'ur-IN' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', speechCode: 'ne-NP' },
    { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', speechCode: 'sa-IN' }
];

// Language Provider component
export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        // Initialize from preferences or default to null (will show language selection)
        return preferencesService.getLanguage() || null;
    });

    // Update language and persist to preferences
    const setLanguage = (langCode) => {
        setLanguageState(langCode);
        preferencesService.setLanguage(langCode);
    };

    // Check if language is selected
    const isLanguageSelected = () => {
        return language !== null;
    };

    // Get current language info
    const getCurrentLanguageInfo = () => {
        return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
    };

    const value = {
        language: language || 'en', // Default to 'en' for translations
        rawLanguage: language, // Can be null if not selected
        setLanguage,
        isLanguageSelected,
        getCurrentLanguageInfo,
        supportedLanguages: SUPPORTED_LANGUAGES
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook to use language context
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
