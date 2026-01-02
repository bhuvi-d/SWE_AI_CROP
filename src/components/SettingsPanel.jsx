import React, { useState } from 'react';
import { X, Settings, Globe, ChevronRight, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';

const SettingsPanel = ({ onClose }) => {
    const { t } = useTranslation();
    const { language, setLanguage, supportedLanguages } = useLanguage();
    const [activeSection, setActiveSection] = useState('main'); // 'main', 'language'

    const handleLanguageSelect = (langCode) => {
        setLanguage(langCode);
        // Optional: Go back to main or close? 
        // Usually staying in language menu is better to see the change
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {activeSection === 'language' ? (
                             <button onClick={() => setActiveSection('main')} className="p-1 hover:bg-gray-100 rounded-full">
                                <ChevronRight className="w-6 h-6 rotate-180 text-gray-600" />
                             </button>
                        ) : (
                            <Settings className="w-6 h-6 text-gray-700" />
                        )}
                        <h2 className="text-xl font-bold text-gray-800">
                            {activeSection === 'language' ? t('settings.language') : t('settings.title')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto pr-1">
                    {activeSection === 'main' ? (
                        <div className="space-y-3">
                            {/* Language Setting */}
                            <button
                                onClick={() => setActiveSection('language')}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition border border-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800">{t('settings.language')}</div>
                                        <div className="text-xs text-gray-500">
                                            {supportedLanguages.find(l => l.code === language)?.nativeName}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                            
                            {/* App Version / About (Placeholder) */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                <div className="text-xs text-center text-gray-400">
                                    Version 1.0.0
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                             {supportedLanguages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageSelect(lang.code)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition border ${
                                        language === lang.code 
                                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                            : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-700'
                                    }`}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">{lang.nativeName}</span>
                                        <span className={`text-xs ${language === lang.code ? 'text-blue-500' : 'text-gray-400'}`}>
                                            {lang.name}
                                        </span>
                                    </div>
                                    {language === lang.code && (
                                        <Check className="w-5 h-5 text-blue-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
