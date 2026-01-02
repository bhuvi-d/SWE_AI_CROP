import React, { useState } from 'react';
import { Leaf, Loader, AlertCircle } from 'lucide-react';
import CropAdviceCard from './CropAdviceCard';
import cropAdviceService from '../services/cropAdviceService';

/**
 * Example component showing how to use the Crop Advice system
 * This can be integrated into your existing disease detection flow
 */
const CropAdviceDemo = () => {
    const [advice, setAdvice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCard, setShowCard] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [jsonMode, setJsonMode] = useState(false);
    const [jsonInput, setJsonInput] = useState('');

    // Example disease data (replace this with your actual detection results)
    const [diseaseData, setDiseaseData] = useState({
        crop: 'Tomato',
        disease: 'Early Blight',
        severity: 'medium',
        confidence: 0.93
    });

    const handleGetAdvice = async () => {
        setLoading(true);
        setError(null);

        try {
            // Parse JSON if in JSON mode
            let dataToSend = diseaseData;
            if (jsonMode) {
                try {
                    dataToSend = JSON.parse(jsonInput);
                } catch (e) {
                    throw new Error('Invalid JSON format. Please check your input.');
                }
            }

            // Add API key to request if provided
            const requestData = {
                ...dataToSend,
                ...(apiKey && { apiKey })
            };

            const result = await cropAdviceService.getCropAdvice(requestData);
            setAdvice(result);
            setShowCard(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                            <Leaf className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800">Crop Doctor AI</h1>
                    </div>
                    <p className="text-gray-600">Get instant AI-powered advice for crop diseases</p>
                </div>

                {/* Input Form */}
                <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Disease Information</h2>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-sm font-medium text-gray-600">JSON Mode</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={jsonMode}
                                    onChange={(e) => {
                                        setJsonMode(e.target.checked);
                                        if (e.target.checked) {
                                            setJsonInput(JSON.stringify(diseaseData, null, 2));
                                        }
                                    }}
                                    className="sr-only"
                                />
                                <div className={`w-11 h-6 rounded-full transition-colors ${jsonMode ? 'bg-emerald-500' : 'bg-gray-300'
                                    }`}></div>
                                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${jsonMode ? 'translate-x-5' : 'translate-x-0'
                                    }`}></div>
                            </div>
                        </label>
                    </div>

                    {/* API Key Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gemini API Key (Optional - Override Backend Key)
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
                            placeholder="AIza..."
                        />
                        <p className="mt-1 text-xs text-gray-500">Leave empty to use server's API key</p>
                    </div>

                    {jsonMode ? (
                        /* JSON Editor Mode */
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Input JSON
                            </label>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
                                rows="10"
                                placeholder='{
  "crop": "Tomato",
  "disease": "Early Blight",
  "severity": "medium",
  "confidence": 0.93
}'
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Edit the JSON directly. Must include: crop, disease, severity, confidence
                            </p>
                        </div>
                    ) : (
                        /* Form Mode */
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Crop Name
                                </label>
                                <input
                                    type="text"
                                    value={diseaseData.crop}
                                    onChange={(e) => setDiseaseData({ ...diseaseData, crop: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="e.g., Tomato, Potato, Wheat"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Disease Detected
                                </label>
                                <input
                                    type="text"
                                    value={diseaseData.disease}
                                    onChange={(e) => setDiseaseData({ ...diseaseData, disease: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="e.g., Early Blight, Powdery Mildew"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Severity
                                    </label>
                                    <select
                                        value={diseaseData.severity}
                                        onChange={(e) => setDiseaseData({ ...diseaseData, severity: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confidence
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={diseaseData.confidence}
                                        onChange={(e) => setDiseaseData({ ...diseaseData, confidence: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="0.00 - 1.00"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleGetAdvice}
                        disabled={loading}
                        className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Generating Advice...
                            </>
                        ) : (
                            <>
                                <Leaf className="w-5 h-5" />
                                Get AI Advice
                            </>
                        )}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-800">Error</p>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="font-bold text-blue-800 mb-2">How to Integrate</h3>
                    <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                        <li>After your disease detection model identifies a disease, call <code className="bg-blue-100 px-2 py-0.5 rounded">cropAdviceService.getCropAdvice()</code></li>
                        <li>Pass the crop name, disease name, severity, and confidence score</li>
                        <li>Display the result using the <code className="bg-blue-100 px-2 py-0.5 rounded">CropAdviceCard</code> component</li>
                        <li>The AI will generate farmer-friendly advice in your preferred language</li>
                    </ol>
                </div>
            </div>

            {/* Advice Card Modal */}
            {showCard && advice && (
                <CropAdviceCard
                    advice={advice}
                    diseaseData={diseaseData}
                    onClose={() => setShowCard(false)}
                />
            )}
        </div>
    );
};

export default CropAdviceDemo;
