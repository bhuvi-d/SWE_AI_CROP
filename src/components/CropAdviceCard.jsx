import React from 'react';
import {
    AlertCircle, Leaf, Droplets, Spray, Target, Shield,
    CheckCircle, Info, ExternalLink, Copy, Check
} from 'lucide-react';

/**
 * CropAdviceCard Component
 * Displays AI-generated crop disease advice in a farmer-friendly format
 */
const CropAdviceCard = ({ advice, diseaseData, onClose }) => {
    const [copied, setCopied] = React.useState(false);

    if (!advice) {
        return null;
    }

    const { cause, symptoms, immediate, chemical, organic, prevention, metadata } = advice;
    const { crop, disease, severity, confidence } = metadata || diseaseData || {};

    // Get severity color
    const getSeverityColor = (sev) => {
        const s = (sev || '').toLowerCase();
        if (s === 'high' || s === 'severe') return 'text-red-600 bg-red-50';
        if (s === 'medium' || s === 'moderate') return 'text-amber-600 bg-amber-50';
        return 'text-green-600 bg-green-50';
    };

    // Get confidence color
    const getConfidenceColor = (conf) => {
        if (conf >= 0.8) return 'text-green-600';
        if (conf >= 0.6) return 'text-amber-600';
        return 'text-orange-600';
    };

    // Handle copy advice
    const handleCopy = () => {
        const text = `
Crop: ${crop}
Disease: ${disease}
Severity: ${severity}
Confidence: ${(confidence * 100).toFixed(0)}%

CAUSE: ${cause}
SYMPTOMS: ${symptoms}
IMMEDIATE TREATMENT: ${immediate}
CHEMICAL SOLUTION: ${chemical}
ORGANIC SOLUTION: ${organic}
PREVENTION: ${prevention}
    `.trim();

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-t-3xl text-white relative">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Leaf className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{crop}</h2>
                                <p className="text-emerald-100 text-sm">AI-Generated Advice</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Disease Info */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {disease}
                            </h3>
                            <button
                                onClick={handleCopy}
                                className="p-2 hover:bg-white/20 rounded-lg transition flex items-center gap-2 text-sm"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="flex gap-3 text-sm">
                            <span className={`px-3 py-1 rounded-full font-medium ${getSeverityColor(severity)}`}>
                                {severity || 'Unknown'} Severity
                            </span>
                            <span className={`px-3 py-1 rounded-full font-medium bg-white/20 ${getConfidenceColor(confidence)}`}>
                                {((confidence || 0) * 100).toFixed(0)}% Confidence
                            </span>
                        </div>
                    </div>
                </div>

                {/* Advice Cards */}
                <div className="p-6 space-y-4">

                    {/* Cause */}
                    <AdviceSection
                        icon={<Info className="w-6 h-6 text-blue-600" />}
                        title="Cause"
                        content={cause}
                        bgColor="bg-blue-50"
                        borderColor="border-blue-200"
                    />

                    {/* Symptoms */}
                    <AdviceSection
                        icon={<Target className="w-6 h-6 text-purple-600" />}
                        title="Symptoms to Look For"
                        content={symptoms}
                        bgColor="bg-purple-50"
                        borderColor="border-purple-200"
                    />

                    {/* Immediate Treatment */}
                    <AdviceSection
                        icon={<AlertCircle className="w-6 h-6 text-red-600" />}
                        title="Immediate Action"
                        content={immediate}
                        bgColor="bg-red-50"
                        borderColor="border-red-200"
                        highlight
                    />

                    {/* Chemical Solution */}
                    <AdviceSection
                        icon={<Spray className="w-6 h-6 text-orange-600" />}
                        title="Chemical Solution"
                        content={chemical}
                        bgColor="bg-orange-50"
                        borderColor="border-orange-200"
                    />

                    {/* Organic Solution */}
                    <AdviceSection
                        icon={<Droplets className="w-6 h-6 text-green-600" />}
                        title="Organic/Natural Remedy"
                        content={organic}
                        bgColor="bg-green-50"
                        borderColor="border-green-200"
                    />

                    {/* Prevention */}
                    <AdviceSection
                        icon={<Shield className="w-6 h-6 text-teal-600" />}
                        title="Prevention Tips"
                        content={prevention}
                        bgColor="bg-teal-50"
                        borderColor="border-teal-200"
                    />
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-amber-800">
                                <strong>Important:</strong> This advice is AI-generated and should be used as a guide.
                                For severe cases or persistent problems, please consult with a local agricultural expert or extension officer.
                            </p>
                        </div>
                    </div>

                    {metadata?.generatedAt && (
                        <p className="text-xs text-gray-500 text-center mt-4">
                            Generated on {new Date(metadata.generatedAt).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Reusable advice section component
const AdviceSection = ({ icon, title, content, bgColor, borderColor, highlight }) => {
    return (
        <div className={`${bgColor} border ${borderColor} rounded-2xl p-4 ${highlight ? 'ring-2 ring-offset-2 ring-red-300' : ''}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                    {icon}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                        {title}
                        {highlight && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">URGENT</span>}
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {content}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CropAdviceCard;
