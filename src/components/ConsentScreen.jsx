import React from 'react';
import { ShieldCheck, Cloud, Database, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const ConsentScreen = ({ onConsent }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f5132] to-[#2d6a4f] flex items-center justify-center p-6 animate-slide-up">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full border border-nature-100">

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-nature-100 p-3 rounded-full">
                        <ShieldCheck className="w-8 h-8 text-nature-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-nature-900">{t('consentScreen.title')}</h2>
                </div>

                <p className="text-nature-900 mb-6 font-medium">
                    {t('consentScreen.description')}
                </p>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-4">
                        <Cloud className="w-6 h-6 text-earth-500 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-nature-800">{t('consentScreen.imageAnalysis')}</h3>
                            <p className="text-sm text-nature-600 leading-relaxed">
                                {t('consentScreen.imageAnalysisDesc')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <Database className="w-6 h-6 text-earth-500 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-nature-800">{t('consentScreen.localStorage')}</h3>
                            <p className="text-sm text-nature-600 leading-relaxed">
                                {t('consentScreen.localStorageDesc')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-nature-50 p-4 rounded-xl mb-8 border border-nature-100">
                    <p className="text-xs text-nature-700 italic text-center">
                        "{t('consentScreen.privacyNote')}"
                    </p>
                </div>

                <button
                    onClick={onConsent}
                    className="w-full bg-nature-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:bg-nature-700 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                    <Check className="w-5 h-5" />
                    <span>{t('consentScreen.agreeButton')}</span>
                </button>
            </div>
        </div>
    );
};

export default ConsentScreen;
