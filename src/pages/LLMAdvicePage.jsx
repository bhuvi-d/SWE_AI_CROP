import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Loader2, AlertCircle, CheckCircle2, Sparkles,
    Leaf, Bug, Droplet, Shield, FlaskConical, Sprout, AlertTriangle,
    Edit3, RefreshCw, Save, X, TrendingUp, Award, Zap
} from 'lucide-react';

const LLMAdvicePage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check for query params (demo mode)
    const searchParams = new URLSearchParams(location.search);
    const isDemo = searchParams.get('demo') === 'true';

    // Get data from navigation state or use demo data
    let stateData = location.state || {};
    if (isDemo && !stateData.cropType) {
        stateData = {
            cropType: 'Tomato',
            disease: 'Early Blight',
            severity: 'medium',
            confidence: 0.85
        };
    }

    // Editable state
    const [editMode, setEditMode] = useState(false);
    const [cropType, setCropType] = useState(stateData.cropType || '');
    const [disease, setDisease] = useState(stateData.disease || '');
    const [severity, setSeverity] = useState(stateData.severity || 'medium');
    const [confidence, setConfidence] = useState(stateData.confidence || 0.75);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [advice, setAdvice] = useState(null);

    useEffect(() => {
        // If no data provided, show error
        if (!cropType || !disease) {
            setError('Missing crop or disease information. Please edit the fields below.');
            return;
        }

        // Fetch advice when component mounts
        fetchAdvice();
    }, []); // Only run once on mount

    const fetchAdvice = async () => {
        if (!cropType || !disease) {
            setError('Please provide crop type and disease information.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const response = await fetch(`${apiUrl}/api/crop-advice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    crop: cropType,
                    disease: disease,
                    severity: severity || 'unknown',
                    confidence: parseFloat(confidence) || 0.0
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate advice');
            }

            if (data.success && data.data) {
                setAdvice(data.data);
                setEditMode(false); // Exit edit mode on success
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Error fetching advice:', err);
            setError(err.message || 'Failed to generate advice. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAndRefresh = () => {
        fetchAdvice();
    };

    const handleCancelEdit = () => {
        // Restore original values
        setCropType(stateData.cropType || '');
        setDisease(stateData.disease || '');
        setSeverity(stateData.severity || 'medium');
        setConfidence(stateData.confidence || 0.75);
        setEditMode(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 sm:p-6 pb-20">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white rounded-2xl text-gray-600 hover:bg-gray-50 transition-all active:scale-95 shadow-lg hover:shadow-xl border border-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg relative">
                                <Sparkles className="w-8 h-8 text-white" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                    AI Crop Advisor
                                </h1>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    Powered by Gemini AI
                                </p>
                            </div>
                        </div>
                    </div>

                    {!editMode && !loading && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-emerald-200 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all active:scale-95 shadow-md hover:shadow-lg"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit Details
                        </button>
                    )}
                </header>

                {/* Editable Input Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-6 shadow-xl border border-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                                <Leaf className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Diagnosis Information</h2>
                        </div>

                        {editMode && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveAndRefresh}
                                    disabled={!cropType || !disease}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    Save & Generate
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Crop Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-emerald-500" />
                                Crop Type
                            </label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={cropType}
                                    onChange={(e) => setCropType(e.target.value)}
                                    placeholder="e.g., Tomato, Potato, Rice"
                                    className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all text-gray-800 font-medium"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                                    <p className="text-lg font-bold text-gray-800">{cropType}</p>
                                </div>
                            )}
                        </div>

                        {/* Disease */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <Bug className="w-4 h-4 text-red-500" />
                                Disease
                            </label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={disease}
                                    onChange={(e) => setDisease(e.target.value)}
                                    placeholder="e.g., Early Blight, Rust"
                                    className="w-full px-4 py-3 bg-white border-2 border-red-200 rounded-xl focus:border-red-400 focus:outline-none transition-all text-gray-800 font-medium"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                                    <p className="text-lg font-bold text-red-600">{disease}</p>
                                </div>
                            )}
                        </div>

                        {/* Severity */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-orange-500" />
                                Severity
                            </label>
                            {editMode ? (
                                <select
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all text-gray-800 font-medium"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            ) : (
                                <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                                    <p className="text-lg font-bold text-orange-600 capitalize">{severity}</p>
                                </div>
                            )}
                        </div>

                        {/* Confidence */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <Award className="w-4 h-4 text-blue-500" />
                                Confidence Score
                            </label>
                            {editMode ? (
                                <div className="space-y-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={confidence}
                                        onChange={(e) => setConfidence(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${confidence * 100}%, rgb(219, 234, 254) ${confidence * 100}%, rgb(219, 234, 254) 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>0%</span>
                                        <span className="font-bold text-blue-600">{(confidence * 100).toFixed(0)}%</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <p className="text-lg font-bold text-blue-600">{(confidence * 100).toFixed(1)}%</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white flex flex-col items-center justify-center">
                        <div className="relative">
                            <Loader2 className="w-20 h-20 text-emerald-500 animate-spin" />
                            <div className="absolute inset-0 w-20 h-20 border-4 border-emerald-200 rounded-full animate-ping"></div>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 mb-2 mt-6">Generating Expert Advice...</p>
                        <p className="text-sm text-gray-500">AI is analyzing {cropType} disease patterns</p>
                        <div className="mt-4 flex gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-3xl p-8 shadow-xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-red-100 rounded-2xl">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-red-800 mb-2">Unable to Generate Advice</h3>
                                <p className="text-red-600">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveAndRefresh}
                            disabled={!cropType || !disease}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                    </div>
                )}

                {/* Success - Advice Display */}
                {advice && !loading && !error && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Cause */}
                        <AdviceCard
                            icon={<Bug className="w-6 h-6" />}
                            title="Root Cause"
                            content={advice.cause}
                            color="red"
                            index={0}
                        />

                        {/* Symptoms */}
                        <AdviceCard
                            icon={<AlertTriangle className="w-6 h-6" />}
                            title="Symptoms to Watch"
                            content={advice.symptoms}
                            color="orange"
                            index={1}
                        />

                        {/* Immediate Treatment */}
                        <AdviceCard
                            icon={<Shield className="w-6 h-6" />}
                            title="Immediate Action Required"
                            content={advice.immediate}
                            color="blue"
                            index={2}
                        />

                        {/* Chemical Solution */}
                        <AdviceCard
                            icon={<FlaskConical className="w-6 h-6" />}
                            title="Chemical Treatment"
                            content={advice.chemical}
                            color="purple"
                            index={3}
                        />

                        {/* Organic Solution */}
                        <AdviceCard
                            icon={<Sprout className="w-6 h-6" />}
                            title="Organic Alternative"
                            content={advice.organic}
                            color="green"
                            index={4}
                        />

                        {/* Prevention */}
                        <AdviceCard
                            icon={<CheckCircle2 className="w-6 h-6" />}
                            title="Future Prevention"
                            content={advice.prevention}
                            color="teal"
                            index={5}
                        />

                        {/* Metadata */}
                        {advice.metadata && (
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-4 mt-8 border border-gray-200">
                                <p className="text-xs font-medium text-center text-gray-500">
                                    ✨ Generated on {new Date(advice.metadata.generatedAt).toLocaleString()}
                                    {advice.metadata.source === 'fallback' && ' • Using expert database'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Back Button */}
                {advice && !loading && (
                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/home')}
                            className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all active:scale-98 shadow-lg flex items-center justify-center gap-2 group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </button>
                    </div>
                )}
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-blob {
                    animation: blob 7s infinite;
                }
                
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out;
                }
                
                .active\:scale-98:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
};

// Enhanced Reusable Advice Card Component
const AdviceCard = ({ icon, title, content, color, index }) => {
    const colorClasses = {
        red: {
            bg: 'from-red-50 to-rose-50',
            border: 'border-red-200',
            iconBg: 'from-red-100 to-red-200',
            iconText: 'text-red-600',
            titleText: 'text-red-800',
            accent: 'bg-red-500'
        },
        orange: {
            bg: 'from-orange-50 to-amber-50',
            border: 'border-orange-200',
            iconBg: 'from-orange-100 to-orange-200',
            iconText: 'text-orange-600',
            titleText: 'text-orange-800',
            accent: 'bg-orange-500'
        },
        blue: {
            bg: 'from-blue-50 to-cyan-50',
            border: 'border-blue-200',
            iconBg: 'from-blue-100 to-blue-200',
            iconText: 'text-blue-600',
            titleText: 'text-blue-800',
            accent: 'bg-blue-500'
        },
        purple: {
            bg: 'from-purple-50 to-violet-50',
            border: 'border-purple-200',
            iconBg: 'from-purple-100 to-purple-200',
            iconText: 'text-purple-600',
            titleText: 'text-purple-800',
            accent: 'bg-purple-500'
        },
        green: {
            bg: 'from-green-50 to-emerald-50',
            border: 'border-green-200',
            iconBg: 'from-green-100 to-green-200',
            iconText: 'text-green-600',
            titleText: 'text-green-800',
            accent: 'bg-green-500'
        },
        teal: {
            bg: 'from-teal-50 to-cyan-50',
            border: 'border-teal-200',
            iconBg: 'from-teal-100 to-teal-200',
            iconText: 'text-teal-600',
            titleText: 'text-teal-800',
            accent: 'bg-teal-500'
        }
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <div
            className={`bg-gradient-to-r ${colors.bg} border-2 ${colors.border} rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden`}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${colors.accent}`}></div>

            <div className="flex items-start gap-4">
                <div className={`p-4 bg-gradient-to-br ${colors.iconBg} rounded-2xl flex-shrink-0 shadow-md`}>
                    <div className={colors.iconText}>{icon}</div>
                </div>
                <div className="flex-1 pt-1">
                    <h3 className={`text-lg font-bold ${colors.titleText} mb-3 flex items-center gap-2`}>
                        {title}
                        <span className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-500 font-normal">AI</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-base">{content}</p>
                </div>
            </div>
        </div>
    );
};

export default LLMAdvicePage;
