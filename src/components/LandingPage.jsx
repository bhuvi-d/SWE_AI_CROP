import { Leaf, User } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const LandingPage = ({ onGuest, onLogin }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f5132] to-[#2d6a4f] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">

            {/* Hero Visual */}
            <div className="mb-8 p-6 bg-white/10 backdrop-blur-md rounded-full shadow-lg transform hover:scale-105 transition duration-500 border border-white/20">
                <Leaf size={80} className="text-white" />
            </div>

            {/* Hero Text */}
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
                {t('landingPage.title')}
            </h1>
            <p className="text-lg opacity-90 text-center max-w-xs md:max-w-md mb-10">
                {t('landingPage.subtitle')}
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button
                    onClick={onGuest}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-white text-[#0f5132] font-semibold rounded-full shadow-lg hover:scale-105 transition"
                >
                    <Leaf size={20} />
                    {t('landingPage.continueAsGuest')}
                </button>
                <button
                    onClick={onLogin}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-transparent border-2 border-white/40 rounded-full hover:bg-white/10 transition"
                >
                    <User size={20} />
                    {t('landingPage.createAccount')}
                </button>
            </div>

            {/* Footer Text */}
            <p className="text-xs opacity-60 mt-8">
                {t('landingPage.footer')}
            </p>
        </div>
    );
};

export default LandingPage;
