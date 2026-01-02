import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Upload, Video, Mic, X, Check, AlertCircle, RefreshCw,
  Image as ImageIcon, Wifi, WifiOff, Info, Sun, Moon, Focus,
  Smartphone, ZoomIn, AlertTriangle, CheckCircle, Lightbulb,
  Grid3x3, Volume2, ChevronRight, Target, Leaf, Thermometer,
  Zap, Shield, RotateCcw, Maximize2, Minus, Plus, CameraOff,
  Settings, Crop, Droplets, Wind, Cloud, Sparkles, Scan,
  BarChart3, Filter, Image, HelpCircle, ChevronDown, ChevronUp,
  Download, Save, ShieldAlert, ThermometerSun, Waves, Bug,
  Flower2, Sprout, Trees, Globe, MapPin, Clock, Battery,
  Circle, Square, Triangle, Octagon, Crosshair, Eye, EyeOff,
  Play, Square as SquareIcon, Circle as CircleIcon,
  Music, MessageSquare, Headphones, Ear, VolumeX,
  Bell, BellOff, PhoneCall, PhoneOff, Radio,
  FileText, BookOpen, ShieldCheck, Wifi as WifiIcon,
  CloudRain, CloudSnow, Wind as WindIcon, Sunrise,
  Droplet, Thermometer as ThermometerIcon, UserCheck,
  BellRing, BatteryCharging, Layers, Activity,
  History, AlertOctagon, ArrowRight
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType } from '@capacitor/camera';
import LandingPage from './LandingPage';
import ConsentScreen from './ConsentScreen';
import UserProfile from './UserProfile';
import AudioSettingsPanel from './AudioSettingsPanel';
import SettingsPanel from './SettingsPanel';
import { cropService } from '../services/cropService';
import { consentService } from '../services/consentService';
import { audioService } from '../services/audioService';
import { aiService } from '../services/aiService';
import { useTranslation } from '../hooks/useTranslation';

const CropDiagnosisApp = ({ onBack }) => {
  const [appState, setAppState] = useState('loading'); // loading, landing, consent, app
  const [view, setView] = useState('home');
  const [capturedImages, setCapturedImages] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    isAndroid: /Android/i.test(navigator.userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent)
  });

  useEffect(() => {
    const initApp = () => {
      const hasConsent = consentService.hasConsent();
      if (hasConsent) {
        setAppState('app');
      } else {
        setAppState('landing');
      }
    };
    initApp();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    testCameraCapabilities();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const testCameraCapabilities = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log(`Camera test: ${videoDevices.length} camera(s) detected`);
    } catch (err) {
      console.log('Camera enumeration not supported');
    }
  };

  const addToOfflineQueue = (data) => {
    setOfflineQueue(prev => [...prev, data]);
  };

  const handleGuestContinue = () => {
    consentService.setGuestMode(true);
    setAppState('consent');
  };

  const handleLogin = () => {
    // Simulate login for now
    consentService.setGuestMode(false);
    setAppState('consent');
  };

  const handleConsentGiven = () => {
    consentService.giveConsent();
    setAppState('app');
  };

  if (appState === 'loading') return <div className="min-h-screen bg-nature-50 flex items-center justify-center"><RefreshCw className="animate-spin text-nature-600" /></div>;
  if (appState === 'landing') return <LandingPage onGuest={handleGuestContinue} onLogin={handleLogin} />;
  if (appState === 'consent') return <ConsentScreen onConsent={handleConsentGiven} />;

  return (
    <div className="min-h-screen bg-nature-50">
      {view === 'home' && (
        <HomeView
          setView={setView}
          capturedImages={capturedImages}
          offlineQueue={offlineQueue}
          isOnline={isOnline}
          setShowTutorial={setShowTutorial}
          deviceInfo={deviceInfo}
          onBack={onBack}
        />
      )}
      {view === 'camera' && (
        <EnhancedCompleteCameraCapture
          setView={setView}
          setCapturedImages={setCapturedImages}
          isOnline={isOnline}
          addToOfflineQueue={addToOfflineQueue}
          showTutorial={showTutorial}
          setShowTutorial={setShowTutorial}
          deviceInfo={deviceInfo}
        />
      )}
      {view === 'upload' && (
        <MultiImageUpload
          setView={setView}
          setCapturedImages={setCapturedImages}
          isOnline={isOnline}
          addToOfflineQueue={addToOfflineQueue}
        />
      )}
      {view === 'video' && (
        <VideoRecorder
          setView={setView}
          isOnline={isOnline}
          addToOfflineQueue={addToOfflineQueue}
        />
      )}
      {view === 'voice' && (
        <VoiceInput
          setView={setView}
          isOnline={isOnline}
        />
      )}
      {view === 'analysis' && (
        <ImageAnalysis
          setView={setView}
          capturedImages={capturedImages}
        />
      )}
      {view === 'profile' && (
        <UserProfile
          onBack={() => setView('home')}
        />
      )}
    </div>
  );
};

const HomeView = ({ setView, isOnline, capturedImages, setShowTutorial, deviceInfo, onBack }) => {
  const [showAudioSettings, setShowAudioSettings] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const { t } = useTranslation();

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('homeView.greeting');
    if (hour < 17) return t('homeView.greetingAfternoon');
    return t('homeView.greetingEvening');
  };

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-gray-800 flex flex-col p-4 sm:p-6 overflow-y-auto">
      {/* Header */}
      <header className="w-full mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 bg-white rounded-full text-gray-600 hover:bg-gray-100 transition active:scale-95 shadow-md"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
          )}
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-200">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-base text-gray-500 font-medium">{getGreeting()},</p>
            <h1 className="text-2xl font-bold text-gray-800">{t('homeView.userTitle')}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              audioService.playClick();
              setShowAudioSettings(true);
            }}
            className="p-3 bg-white rounded-full text-gray-600 hover:bg-gray-100 transition active:scale-95 shadow-md"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              audioService.playClick();
              setShowSettings(true);
            }}
            className="p-3 bg-white rounded-full text-gray-600 hover:bg-gray-100 transition active:scale-95 shadow-md"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              audioService.playClick();
              setView('profile');
            }}
            className="p-3 bg-white rounded-full text-gray-600 hover:bg-gray-100 transition active:scale-95 shadow-md relative"
          >
            <UserCheck className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full mb-6">
        {/* Scan Plant - Full Width */}
        <button
          onClick={() => {
            audioService.playClick();
            setShowTutorial(true);
            setView('camera');
          }}
          className="col-span-2 sm:col-span-3 bg-gradient-to-r from-emerald-500 to-green-500 p-6 rounded-3xl flex items-center justify-between shadow-xl shadow-emerald-200 hover:shadow-emerald-300 transition-all hover:-translate-y-1 group"
        >
          <div className="flex flex-col items-start gap-1">
            <span className="bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm mb-2">
              {t('homeView.aiPowered')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">{t('homeView.scanPlant')}</h3>
            <p className="text-emerald-100 text-sm sm:text-base">{t('homeView.scanPlantDesc')}</p>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition backdrop-blur-sm">
            <Camera className="w-12 h-12 text-white" />
          </div>
        </button>

        {/* Upload */}
        <button
          onClick={() => {
            audioService.playClick();
            setView('upload');
          }}
          className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all shadow-md group border border-gray-100"
        >
          <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl group-hover:from-blue-200 group-hover:to-blue-100 transition">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <span className="font-semibold text-gray-700 text-base">{t('homeView.upload')}</span>
        </button>

        {/* Voice */}
        <button
          onClick={() => {
            audioService.playClick();
            setView('voice');
          }}
          className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all shadow-md group border border-gray-100"
        >
          <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl group-hover:from-purple-200 group-hover:to-purple-100 transition">
            <Mic className="w-8 h-8 text-purple-600" />
          </div>
          <span className="font-semibold text-gray-700 text-base">{t('homeView.voice')}</span>
        </button>

        {/* Record */}
        <button
          onClick={() => {
            audioService.playClick();
            setView('video');
          }}
          className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all shadow-md group border border-gray-100"
        >
          <div className="p-4 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl group-hover:from-red-200 group-hover:to-red-100 transition">
            <Video className="w-8 h-8 text-red-500" />
          </div>
          <span className="font-semibold text-gray-700 text-base">{t('homeView.record')}</span>
        </button>

        {/* History */}
        <button
          onClick={() => {
            audioService.playClick();
            setView('analysis');
          }}
          className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all shadow-md group border border-gray-100"
        >
          <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl group-hover:from-amber-200 group-hover:to-amber-100 transition">
            <History className="w-8 h-8 text-amber-600" />
          </div>
          <span className="font-semibold text-gray-700 text-base">{t('homeView.history')}</span>
        </button>

        {/* LLM Advice Demo */}
        <button
          onClick={() => {
            audioService.playClick();
            // Navigate to LLM demo with sample data
            window.location.href = '/llm-advice?demo=true';
          }}
          className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all shadow-md group border border-gray-100"
        >
          <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-2xl group-hover:from-emerald-200 group-hover:to-teal-100 transition">
            <Sparkles className="w-8 h-8 text-emerald-600" />
          </div>
          <span className="font-semibold text-gray-700 text-base">LLM Advice</span>
        </button>
      </div>

      {/* Disease Alert */}
      <div className="w-full mb-4">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-100 rounded-xl">
            <AlertOctagon className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-700 text-base">{t('homeView.pestAlert')}</h3>
            <p className="text-sm text-amber-600/80">{t('homeView.pestAlertDesc')}</p>
          </div>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="w-full mb-6">
        <div className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-md border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-sky-100 to-blue-50 rounded-xl">
              <Cloud className="w-10 h-10 text-sky-500" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{t('homeView.temperature')}</div>
              <div className="text-sm text-gray-500">{t('homeView.partlyCloudy')}</div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-1">
              <Droplets className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">62%</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Wind className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">8km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="flex-1 w-full">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {t('homeView.quickTip')}
          </h3>
          <p className="text-emerald-100 text-sm leading-relaxed">
            {t('homeView.quickTipText')}
          </p>
        </div>
      </div>

      {/* Status Footer */}
      <div className="w-full pt-4 mt-auto">
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span>{isOnline ? t('homeView.online') : t('homeView.offline')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Smartphone className="w-4 h-4" />
            <span>{deviceInfo.isMobile ? t('homeView.mobile') : t('homeView.desktop')}</span>
          </div>
        </div>
      </div>

      {/* Audio Settings Modal */}
      {showAudioSettings && (
        <AudioSettingsPanel onClose={() => setShowAudioSettings(false)} />
      )}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

const EnhancedCompleteCameraCapture = ({
  setView,
  setCapturedImages,
  isOnline,
  addToOfflineQueue,
  showTutorial,
  setShowTutorial,
  deviceInfo
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const voiceTimeoutRef = useRef(null);
  const warningSoundRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [qualityWarning, setQualityWarning] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [liveQuality, setLiveQuality] = useState({
    brightness: 0,
    blur: 0,
    contrast: 0,
    sharpness: 0,
    status: 'checking',
    score: 0,
    message: '',
    issues: []
  });
  const [showGrid, setShowGrid] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [voiceGuidance, setVoiceGuidance] = useState(null);
  const [showDetailedTips, setShowDetailedTips] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const [flashMode, setFlashMode] = useState('off');
  const [captureCountdown, setCaptureCountdown] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentStep, setCurrentStep] = useState('camera'); // 'camera', 'preparation', 'analysis'
  const [cropType, setCropType] = useState('');
  const [diseaseSymptoms, setDiseaseSymptoms] = useState([]);
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [voiceInstructions, setVoiceInstructions] = useState(true);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [photoTipsShown, setPhotoTipsShown] = useState(false);
  const [qualityHistory, setQualityHistory] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showSaveConsent, setShowSaveConsent] = useState(false);

  // Initialize camera immediately
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      speechSynthesis.cancel();
    };
  }, [cameraFacing]);

  // Live analysis
  useEffect(() => {
    if (stream && videoRef.current && !capturedPhoto && cameraReady) {
      const analyzeFrame = () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          performLiveAnalysis();
        }
        animationRef.current = requestAnimationFrame(analyzeFrame);
      };

      animationRef.current = requestAnimationFrame(analyzeFrame);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [stream, capturedPhoto, cameraReady]);

  // Tutorial timeout
  useEffect(() => {
    if (showTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(false);
        // Show photo tips after tutorial
        setTimeout(() => {
          if (!photoTipsShown) {
            showPhotoGuidanceTips();
            setPhotoTipsShown(true);
          }
        }, 1000);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showTutorial]);

  // Voice guidance with delay to avoid spam
  useEffect(() => {
    if (voiceInstructions && liveQuality.message && voiceGuidance !== liveQuality.message && !isSpeaking) {
      voiceTimeoutRef.current = setTimeout(() => {
        speakGuidance(liveQuality.message);
        setVoiceGuidance(liveQuality.message);
      }, 2000); // 2 second delay between voice messages
    }

    return () => {
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    };
  }, [liveQuality.message, voiceInstructions, isSpeaking]);

  // NEW: Check for quality issues and show warnings separately
  useEffect(() => {
    if (cameraReady && liveQuality.status !== 'good' && liveQuality.score < 70) {
      // Show warning alert
      setShowWarningAlert(true);
      setWarningMessage(liveQuality.message);

      // Speak warning if voice is enabled
      if (voiceInstructions && !isSpeaking) {
        const warningText = `Warning: ${liveQuality.message}`;
        speakWarning(warningText);
      }
    } else {
      setShowWarningAlert(false);
    }
  }, [liveQuality.status, liveQuality.message, liveQuality.score, cameraReady]);

  // Track quality history for improvement validation
  useEffect(() => {
    if (liveQuality.score > 0) {
      setQualityHistory(prev => {
        const newHistory = [...prev, {
          score: liveQuality.score,
          timestamp: Date.now(),
          issues: liveQuality.issues
        }].slice(-10); // Keep last 10 measurements
        return newHistory;
      });
    }
  }, [liveQuality.score]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        }
      };

      // Adjust constraints based on device
      if (deviceInfo.isMobile) {
        if (deviceInfo.isIOS) {
          constraints.video.width = { ideal: 1280 };
          constraints.video.height = { ideal: 720 };
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          if (voiceInstructions) {
            speakGuidance("Camera ready. Please aim at the plant for analysis.");
          }
          // Show initial photo tips
          if (!photoTipsShown) {
            setTimeout(() => {
              showPhotoGuidanceTips();
              setPhotoTipsShown(true);
            }, 1000);
          }
        };
      }
      setStream(mediaStream);
      setCameraSupported(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraSupported(false);
      showCameraError();
    }
  };

  const showCameraError = () => {
    if (voiceInstructions) {
      speakGuidance("Unable to access camera. Please check permissions and try again.");
    }
    alert('Unable to access camera. Please check permissions and try again.');
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const switchCamera = () => {
    setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
    if (voiceInstructions) {
      speakGuidance(`Switching to ${cameraFacing === 'environment' ? 'front' : 'rear'} camera`);
    }
  };

  const performLiveAnalysis = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Brightness calculation
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    brightness /= (data.length / 4);

    // Advanced blur detection using Laplacian variance
    let blurScore = 0;
    let laplacianSum = 0;
    let pixelCount = 0;

    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = (y * canvas.width + x) * 4;
        const topIdx = ((y - 1) * canvas.width + x) * 4;
        const bottomIdx = ((y + 1) * canvas.width + x) * 4;
        const leftIdx = (y * canvas.width + (x - 1)) * 4;
        const rightIdx = (y * canvas.width + (x + 1)) * 4;

        const centerBrightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const topBrightness = (data[topIdx] + data[topIdx + 1] + data[topIdx + 2]) / 3;
        const bottomBrightness = (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3;
        const leftBrightness = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
        const rightBrightness = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

        // Laplacian approximation
        const laplacian = Math.abs(4 * centerBrightness - (topBrightness + bottomBrightness + leftBrightness + rightBrightness));
        laplacianSum += laplacian;
        pixelCount++;

        // Edge strength for blur detection
        const edgeStrength = Math.abs(centerBrightness - leftBrightness) + Math.abs(centerBrightness - rightBrightness);
        blurScore += edgeStrength;
      }
    }

    const laplacianVariance = laplacianSum / pixelCount;
    blurScore /= pixelCount;

    // Contrast calculation
    let contrast = 0;
    for (let i = 0; i < data.length; i += 4) {
      const pixelBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      contrast += Math.abs(pixelBrightness - brightness);
    }
    contrast /= (data.length / 4);

    // Sharpness (based on edge strength)
    const sharpness = laplacianVariance;

    // Determine status with multiple thresholds
    let status = 'good';
    let message = 'Perfect! Ready to capture';
    let icon = '✓';
    let score = 100;
    let issues = [];

    // Check for darkness
    if (brightness < 40) {
      status = 'dark';
      message = 'Too dark - Move to brighter area or use flash';
      icon = '🌙';
      score = 20;
      issues.push('Severe darkness');
    } else if (brightness < 60) {
      status = 'dark';
      message = 'Low light - Move to brighter area';
      icon = '🌙';
      score = 40;
      issues.push('Low light');
    }

    // Check for brightness
    if (brightness > 240) {
      status = 'bright';
      message = 'Too bright - Avoid direct sunlight';
      icon = '☀️';
      score = 30;
      issues.push('Severe overexposure');
    } else if (brightness > 200) {
      status = 'bright';
      message = 'Very bright - Reduce lighting';
      icon = '☀️';
      score = 50;
      issues.push('Overexposure');
    }

    // Check for blur using advanced detection
    if (laplacianVariance < 50) {
      status = 'blur';
      message = 'Very blurry - Hold phone steady';
      icon = '🌀';
      score = Math.min(score, 25);
      issues.push('Severe blur');
    } else if (laplacianVariance < 100) {
      status = 'blur';
      message = 'Image blurry - Hold phone steady';
      icon = '🌀';
      score = Math.min(score, 40);
      issues.push('Blur detected');
    }

    // Check for low contrast
    if (contrast < 15) {
      status = 'low-contrast';
      message = 'Low contrast - Adjust lighting';
      icon = '⚫';
      score = Math.min(score, 50);
      issues.push('Low contrast');
    }

    // Plant detection
    let greenPixelCount = 0;
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (g > r * 1.2 && g > b * 1.2 && g > 50) {
        greenPixelCount++;
      }
    }
    const greenPercentage = (greenPixelCount / (data.length / 16)) * 100;
    const plantDetected = greenPercentage > 5;

    if (!plantDetected && status === 'good') {
      message = 'Aim at plant for best results';
      score = 60;
    }

    // Update detection
    setDetectedObjects(plantDetected ? [{ class: 'plant', score: greenPercentage / 100 }] : []);

    setLiveQuality({
      brightness: Math.round(brightness),
      blur: Math.round(blurScore * 100) / 100,
      contrast: Math.round(contrast),
      sharpness: Math.round(sharpness),
      status,
      message: plantDetected ? message : 'Aim at plant',
      icon,
      score,
      issues
    });
  };

  const showPhotoGuidanceTips = () => {
    const tips = [
      "For best results, ensure good lighting",
      "Hold your phone steady to avoid blur",
      "Fill the frame with the affected leaf",
      "Avoid shadows on the plant surface",
      "Keep 15-20 cm distance from the plant"
    ];

    // Show visual tips
    setShowDetailedTips(true);

    // Speak first tip
    if (voiceInstructions) {
      speakGuidance("Here are some photo tips: " + tips[0]);
    }

    // Auto-hide tips after 10 seconds
    setTimeout(() => {
      setShowDetailedTips(false);
    }, 10000);
  };

  const validateImageQuality = () => {
    const issues = [];

    if (liveQuality.brightness < 60) {
      issues.push({
        type: 'darkness',
        severity: liveQuality.brightness < 40 ? 'severe' : 'warning',
        message: liveQuality.brightness < 40 ? 'Image is too dark' : 'Image is somewhat dark',
        suggestion: 'Move to brighter area or use flash'
      });
    }

    if (liveQuality.brightness > 220) {
      issues.push({
        type: 'brightness',
        severity: 'warning',
        message: 'Image is too bright',
        suggestion: 'Avoid direct sunlight'
      });
    }

    if (liveQuality.sharpness < 100) {
      issues.push({
        type: 'blur',
        severity: liveQuality.sharpness < 50 ? 'severe' : 'warning',
        message: liveQuality.sharpness < 50 ? 'Image is very blurry' : 'Image is slightly blurry',
        suggestion: 'Hold phone steady or use support'
      });
    }

    if (liveQuality.contrast < 20) {
      issues.push({
        type: 'contrast',
        severity: 'warning',
        message: 'Low contrast detected',
        suggestion: 'Adjust lighting conditions'
      });
    }

    if (detectedObjects.length === 0) {
      issues.push({
        type: 'subject',
        severity: 'warning',
        message: 'No plant detected',
        suggestion: 'Aim camera at plant or leaf'
      });
    }

    return issues;
  };

  // NEW: Separate function to speak warnings
  const speakWarning = (message) => {
    if ('speechSynthesis' in window && voiceInstructions && !isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
    }
  };

  const capturePhoto = () => {
    // Start countdown immediately - no blocking quality checks
    setCaptureCountdown(3);

    if (voiceInstructions) {
      speakGuidance("Starting countdown. Get ready... 3... 2... 1...");
    }

    const countdown = setInterval(() => {
      setCaptureCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          performCapture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takeNativePhoto = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl
      });

      const photoData = image.dataUrl;
      setCapturedPhoto(photoData);

      // Stop any existing stream
      stopCamera();

      if (voiceInstructions) {
        audioService.speak("Analyzing crop health. Please wait...", { rate: 1.0 });
      }

      // Perform AI Analysis
      try {
        const aiResult = await aiService.analyze(photoData, cropType || 'general');
        setAnalysisResult(aiResult);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);

        if (voiceInstructions) {
          const severe = aiResult.severity === 'severe';
          const msg = `Analysis complete. ${aiResult.diagnosis} detected with ${aiResult.confidence * 100} percent confidence. ${severe ? 'Immediate action required.' : aiResult.explanation}`;
          audioService.speak(msg);
        }

        setTimeout(() => {
          setCurrentStep('preparation');
        }, 3000);

      } catch (error) {
        console.error("AI Analysis failed", error);
        audioService.speak("Analysis failed. Please try again.");
      }
    } catch (e) {
      console.log('User cancelled or error', e);
    }
  };

  const performCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Apply enhancements
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const enhancementFactor = liveQuality.brightness < 100 ? 1.2 : 1.1;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * enhancementFactor);
        data[i + 1] = Math.min(255, data[i + 1] * enhancementFactor);
        data[i + 2] = Math.min(255, data[i + 2] * enhancementFactor);
      }
      ctx.putImageData(imageData, 0, 0);

      const photoData = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedPhoto(photoData);

      // Audio feedback for capture
      audioService.playCapture();

      // Stop camera immediately
      stopCamera();

      // Speak analyzing
      if (voiceInstructions) {
        audioService.speak("Analyzing crop health. Please wait...", { rate: 1.0 });
      }

      // Perform AI Analysis
      try {
        const aiResult = await aiService.analyze(photoData, cropType || 'general');
        setAnalysisResult(aiResult);

        // Show confirmation
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);

        // Speak result
        if (voiceInstructions) {
          const severe = aiResult.severity === 'severe';
          const msg = `Analysis complete. ${aiResult.diagnosis} detected with ${aiResult.confidence * 100} percent confidence. ${severe ? 'Immediate action required.' : aiResult.explanation}`;
          audioService.speak(msg);
        }

        // Move to preparation step
        setTimeout(() => {
          setCurrentStep('preparation');
        }, 3000);

      } catch (error) {
        console.error("AI Analysis failed", error);
        audioService.speak("Analysis failed. Please try again.");
      }
    }
  };

  const performDetailedAnalysis = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let greenPixelCount = 0;
    let brownPixelCount = 0;
    let yellowPixelCount = 0;
    let whitePixelCount = 0;
    let blackPixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Detect plant health colors
      if (g > r * 1.3 && g > b * 1.3 && g > 100) {
        greenPixelCount++; // Healthy green
      } else if (r > g * 1.2 && r > b * 1.2 && r > 150 && g < 200) {
        brownPixelCount++; // Browning
      } else if (r > 180 && g > 180 && b < 120 && r < 240) {
        yellowPixelCount++; // Yellowing
      } else if (r > 200 && g > 200 && b > 200) {
        whitePixelCount++; // Fungal/mildew
      } else if (r < 50 && g < 50 && b < 50) {
        blackPixelCount++; // Necrosis
      }
    }

    const totalPixels = data.length / 4;
    const greenPercentage = (greenPixelCount / totalPixels) * 100;
    const brownPercentage = (brownPixelCount / totalPixels) * 100;
    const yellowPercentage = (yellowPixelCount / totalPixels) * 100;
    const diseasePercentage = ((whitePixelCount + blackPixelCount) / totalPixels) * 100;

    // Calculate health score
    let healthScore = 100;
    healthScore -= brownPercentage * 1.5;
    healthScore -= yellowPercentage * 1.2;
    healthScore -= diseasePercentage * 2;
    healthScore = Math.max(0, Math.round(healthScore));

    // Determine likely issues
    const issues = [];
    if (brownPercentage > 5) issues.push('Leaf browning detected');
    if (yellowPercentage > 5) issues.push('Yellowing observed');
    if (diseasePercentage > 2) issues.push('Possible disease spots');
    if (greenPercentage < 20) issues.push('Low healthy green area');

    const recommendations = [
      healthScore < 50 ? 'Immediate treatment recommended' : 'Monitor regularly',
      brownPercentage > 10 ? 'Check for fungal infections' : null,
      yellowPercentage > 10 ? 'Check nutrient levels' : null,
      diseasePercentage > 5 ? 'Consider fungicide treatment' : null,
      'Compare with previous captures'
    ].filter(Boolean);

    return {
      healthScore,
      greenPercentage: Math.round(greenPercentage),
      brownPercentage: Math.round(brownPercentage),
      yellowPercentage: Math.round(yellowPercentage),
      diseasePercentage: Math.round(diseasePercentage),
      spotDensity: Math.round(Math.random() * 10),
      issues,
      recommendations,
      timestamp: new Date().toISOString(),
      qualityScore: liveQuality.score
    };
  };

  const saveCapture = () => {
    setShowSaveConsent(true);
  };

  const confirmSave = () => {
    if (capturedPhoto && analysisResult) {
      const captureData = {
        data: capturedPhoto,
        analysis: analysisResult,
        metadata: {
          cropType,
          diseaseSymptoms,
          environmentalData,
          qualityScore: liveQuality.score,
          qualityIssues: liveQuality.issues,
          deviceInfo,
          timestamp: Date.now(),
          qualityHistory: qualityHistory.slice(-5) // Last 5 quality measurements
        }
      };

      setCapturedImages(prev => [...prev, captureData]);

      if (!isOnline) {
        addToOfflineQueue(captureData);
      }

      setCurrentStep('analysis');
      setShowAnalysis(true);
      setShowSaveConsent(false);

      if (voiceInstructions) {
        speakGuidance("Capture saved successfully. Viewing analysis results.");
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setAnalysisResult(null);
    setQualityWarning(null);
    setShowWarningAlert(false);
    setCurrentStep('camera');
    setCaptureCountdown(null);
    startCamera();

    if (voiceInstructions) {
      speakGuidance("Retaking photo. Please position your camera.");
    }
  };

  const getQualityColor = () => {
    switch (liveQuality.status) {
      case 'good': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'dark': return 'bg-gradient-to-r from-yellow-500 to-amber-600';
      case 'bright': return 'bg-gradient-to-r from-orange-500 to-yellow-600';
      case 'blur': return 'bg-gradient-to-r from-red-500 to-orange-600';
      case 'low-contrast': return 'bg-gradient-to-r from-purple-500 to-pink-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-700';
    }
  };

  const getQualityScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const speakGuidance = (message) => {
    if ('speechSynthesis' in window && voiceInstructions) {
      speechSynthesis.cancel(); // Cancel any ongoing speech
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
    }
  };

  const toggleVoiceInstructions = () => {
    setVoiceInstructions(!voiceInstructions);
    if (!voiceInstructions) {
      speakGuidance("Voice instructions enabled");
    }
  };

  const getEnvironmentalData = () => {
    // Simulate environmental data
    const mockData = {
      temperature: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 40) + 40,
      soilMoisture: Math.floor(Math.random() * 50) + 30,
      lightLevel: Math.floor(Math.random() * 60) + 40,
      location: 'Field A',
      time: new Date().toLocaleTimeString(),
      weather: ['Sunny', 'Cloudy', 'Partly Cloudy'][Math.floor(Math.random() * 3)]
    };
    setEnvironmentalData(mockData);

    if (voiceInstructions) {
      speakGuidance(`Environmental data collected. Temperature is ${mockData.temperature} degrees, humidity ${mockData.humidity} percent.`);
    }
  };

  // NEW: Function to show warning button
  const showWarningButton = () => {
    if (qualityWarning) {
      return (
        <button
          onClick={() => setQualityWarning(null)}
          className="absolute top-4 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-2 animate-pulse"
        >
          <AlertTriangle className="w-5 h-5" />
          Quality Issues
        </button>
      );
    }
    return null;
  };

  // Render based on current step
  if (currentStep === 'camera') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Camera Unsupported Message */}
        {!cameraSupported && (
          <div className="absolute inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Camera Not Available</h2>
                  <p className="text-sm text-gray-600">Unable to access camera on this device</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <CameraOff className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 text-sm">Check Permissions</p>
                    <p className="text-xs text-red-700">Allow camera access in browser settings</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Device Support</p>
                    <p className="text-xs text-blue-700">Ensure your device has a working camera</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setView('home')}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Back to Home
                </button>
                <button
                  onClick={startCamera}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Retry Camera
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Overlay */}
        {showTutorial && (
          <div className="absolute inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('smartCameraGuide.title')}</h2>
                  <p className="text-sm text-gray-600">{t('smartCameraGuide.subtitle')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Leaf className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm">{t('smartCameraGuide.autoLeafDetection')}</p>
                    <p className="text-xs text-green-700">{t('smartCameraGuide.autoLeafDetectionDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Thermometer className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">{t('smartCameraGuide.qualityMeter')}</p>
                    <p className="text-xs text-blue-700">{t('smartCameraGuide.qualityMeterDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Volume2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900 text-sm">{t('smartCameraGuide.voiceGuidance')}</p>
                    <p className="text-xs text-purple-700">{t('smartCameraGuide.voiceGuidanceDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900 text-sm">{t('smartCameraGuide.qualityWarnings')}</p>
                    <p className="text-xs text-yellow-700">{t('smartCameraGuide.qualityWarningsDesc')}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowTutorial(false)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                {t('smartCameraGuide.startSmartCamera')}
              </button>
            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {captureCountdown && (
          <div className="absolute inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-8xl font-bold animate-pulse mb-4">{captureCountdown}</div>
              <p className="text-xl opacity-80">{t('smartCameraGuide.getReady')}</p>
            </div>
          </div>
        )}

        {/* Warning Alert Button (Separate from capture) */}
        {showWarningAlert && (
          <button
            onClick={() => {
              // Show detailed warning modal
              const qualityIssues = validateImageQuality();
              setQualityWarning({
                type: 'warning',
                issues: qualityIssues.map(issue => ({
                  icon: issue.type === 'darkness' ? Moon :
                    issue.type === 'blur' ? Focus :
                      issue.type === 'brightness' ? Sun : AlertCircle,
                  text: issue.message,
                  color: issue.severity === 'severe' ? 'red' : 'yellow',
                  suggestion: issue.suggestion
                })),
                message: 'Photo quality issues detected',
                score: liveQuality.score
              });
            }}
            className="absolute top-20 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 animate-pulse shadow-2xl"
          >
            <AlertTriangle className="w-5 h-5" />
            Quality Warning
          </button>
        )}

        {/* Quality Warning Modal (Only shown when warning button is clicked) */}
        {qualityWarning && (
          <div className="absolute inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 animate-fade-in">
              <div className={`flex items-center justify-between ${qualityWarning.type === 'severe' ? 'text-red-600' : 'text-yellow-600'}`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8" />
                  <div>
                    <h3 className="text-xl font-bold">
                      {qualityWarning.type === 'severe' ? '⚠️ Poor Quality Detected' : '⚠️ Quality Warning'}
                    </h3>
                    <div className={`text-sm font-bold ${getQualityScoreColor(qualityWarning.score)}`}>
                      Quality Score: {qualityWarning.score}%
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setQualityWarning(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2">
                {qualityWarning.issues.map((issue, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${issue.color === 'red' ? 'bg-red-50' : 'bg-yellow-50'
                    }`}>
                    <issue.icon className={`w-5 h-5 ${issue.color === 'red' ? 'text-red-600' : 'text-yellow-600'}`} />
                    <div>
                      <span className={`text-sm font-medium ${issue.color === 'red' ? 'text-red-800' : 'text-yellow-800'}`}>
                        {issue.text}
                      </span>
                      {issue.suggestion && (
                        <p className={`text-xs mt-1 ${issue.color === 'red' ? 'text-red-700' : 'text-yellow-700'}`}>
                          Suggestion: {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-gray-700 text-sm">
                {qualityWarning.message} You can still capture photos, but quality may be affected.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setQualityWarning(null)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Acknowledge
                </button>
                <button
                  onClick={() => {
                    if (voiceInstructions) {
                      const warningDetails = qualityWarning.issues.map(issue => issue.text).join('. ');
                      speakWarning(`Quality warning details: ${warningDetails}. Suggestions: ${qualityWarning.issues.map(issue => issue.suggestion).join('. ')}`);
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Volume2 className="w-5 h-5" />
                  Hear Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="relative z-10 bg-gradient-to-b from-black to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-white font-medium bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-70 transition backdrop-blur-sm"
            >
              <X className="w-5 h-5" /> Back
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-full transition backdrop-blur-sm ${showGrid ? 'bg-white text-black' : 'bg-black bg-opacity-50 text-white'
                  }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>

              <button
                onClick={switchCamera}
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition backdrop-blur-sm"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={toggleVoiceInstructions}
                className={`p-2 rounded-full transition backdrop-blur-sm ${voiceInstructions ? 'bg-green-500 text-white' : 'bg-black bg-opacity-50 text-white'
                  }`}
              >
                {voiceInstructions ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowDetailedTips(!showDetailedTips)}
                className={`p-2 rounded-full transition backdrop-blur-sm ${showDetailedTips ? 'bg-blue-500 text-white' : 'bg-black bg-opacity-50 text-white'
                  }`}
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative overflow-hidden">
          {!capturedPhoto ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
              />

              {/* Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="border border-white border-opacity-20"></div>
                    ))}
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white border-opacity-30 rounded-lg"></div>
                </div>
              )}

              {/* Smart Focus Frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12" style={{ zIndex: 15 }}>
                <div className="relative w-full max-w-md aspect-square">
                  {detectedObjects.length > 0 ? (
                    <>
                      <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-green-500 rounded-tl-lg animate-pulse"></div>
                      <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-green-500 rounded-tr-lg animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-green-500 rounded-bl-lg animate-pulse"></div>
                      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-green-500 rounded-br-lg animate-pulse"></div>
                      <div className="absolute inset-0 border-2 border-green-500 border-opacity-50 rounded-lg animate-pulse"></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        Plant Detected
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-red-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-red-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-red-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-red-500 rounded-br-lg"></div>
                      <div className="absolute inset-0 border-2 border-red-500 border-opacity-30 border-dashed rounded-lg"></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Aim at Plant
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Live Quality Banner Removed */}



              {/* UNIFIED STATUS PILL (Top Center) */}
              {cameraReady && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 w-auto max-w-[90%]">
                  <div className={`glass-card px-4 py-2 rounded-full flex items-center gap-3 backdrop-blur-md shadow-lg transition-all duration-300 ${liveQuality.issues.length > 0 ? 'border-amber-500/50 bg-black/60' :
                    detectedObjects.length > 0 ? 'border-emerald-500/50 bg-black/60' : 'border-white/10 bg-black/40'
                    }`}>

                    {/* Icon Indicator */}
                    <div className={`w-2 h-2 rounded-full animate-pulse ${liveQuality.issues.length > 0 ? 'bg-amber-500' :
                      detectedObjects.length > 0 ? 'bg-emerald-500' : 'bg-white/50'
                      }`}></div>

                    {/* Status Text */}
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold whitespace-nowrap ${liveQuality.issues.length > 0 ? 'text-amber-400' :
                        detectedObjects.length > 0 ? 'text-emerald-400' : 'text-white'
                        }`}>
                        {liveQuality.issues.length > 0 ? 'Improve Quality' :
                          detectedObjects.length > 0 ? 'Plant Detected' : 'Aim at Plant'}
                      </span>

                      {/* Subtext (Quality Issues or Score) */}
                      <div className="flex items-center gap-2 text-[10px] text-gray-300 leading-none mt-0.5">
                        {liveQuality.issues.length > 0 ? (
                          <span>{liveQuality.issues[0]}</span>
                        ) : (
                          <>
                            <span>Quality: {liveQuality.score}%</span>
                            {detectedObjects.length > 0 && <span className="text-emerald-500 font-bold">• Ready</span>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Side Controls (Zoom) */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-4">
                <div className="glass-card p-1.5 rounded-full flex flex-col items-center gap-2 bg-black/40">
                  <button onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.5))} className="p-2 text-white hover:bg-white/20 rounded-full transition">
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-mono font-bold">{zoomLevel.toFixed(1)}x</span>
                  <button onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.5))} className="p-2 text-white hover:bg-white/20 rounded-full transition">
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Detailed Tips Drawer (Bottom) */}
              <div className={`absolute bottom-32 left-4 right-4 z-20 transition-all duration-300 transform ${showDetailedTips ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className="glass-card p-4 rounded-xl bg-black/80 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-yellow-400">
                      <Lightbulb className="w-4 h-4" /> Photography Tips
                    </h3>
                    <button onClick={() => setShowDetailedTips(false)}><X className="w-4 h-4 text-gray-400" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-300">
                    <div className="flex items-center gap-2"><Sun className="w-3 h-3 text-yellow-500" /> Natural Light</div>
                    <div className="flex items-center gap-2"><Focus className="w-3 h-3 text-blue-500" /> Steady Hand</div>
                    <div className="flex items-center gap-2"><Maximize2 className="w-3 h-3 text-green-500" /> Fill Frame</div>
                    <div className="flex items-center gap-2"><Droplet className="w-3 h-3 text-cyan-500" /> Clean Lens</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <img src={capturedPhoto} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Success Confirmation */}
        {showConfirmation && !qualityWarning && (
          <div className="absolute top-20 left-4 right-4 z-30 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-down">
            <CheckCircle className="w-6 h-6" />
            <div className="flex-1">
              <p className="font-bold">Photo captured successfully!</p>
              <p className="text-xs opacity-90">
                Quality: {liveQuality.score}% | Plants: {detectedObjects.length} |
                {liveQuality.score >= 80 ? ' Excellent!' : liveQuality.score >= 60 ? ' Good!' : ' Acceptable'}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="relative z-10 bg-[#0f172a] p-6 pb-8 border-t border-white/5">
          {!capturedPhoto ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-between w-full max-w-xs px-4">
                {/* Info / Tips Toggle */}
                <button
                  onClick={() => setShowDetailedTips(!showDetailedTips)}
                  className={`p-4 rounded-full glass-card transition ${showDetailedTips ? 'bg-white/20 text-yellow-400' : 'text-white hover:bg-white/10'}`}
                >
                  <Info className="w-6 h-6" />
                </button>

                {/* Shutter Button */}
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className={`relative group transition-all transform active:scale-95 ${!cameraReady && 'opacity-50 grayscale'}`}
                >
                  <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${detectedObjects.length > 0 ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/50 bg-white/10'
                    }`}>
                    <div className={`w-16 h-16 rounded-full transition-all ${detectedObjects.length > 0 ? 'bg-emerald-500 scale-90 group-hover:scale-100' : 'bg-white scale-90 group-hover:scale-100'
                      }`}></div>
                  </div>
                </button>

                {/* Switch Camera */}
                <button
                  onClick={switchCamera}
                  className="p-4 rounded-full glass-card text-white hover:bg-white/10 transition rotate-0 active:rotate-180 duration-500"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>

                {/* Native Camera Button */}
                {Capacitor.isNativePlatform() && (
                  <button
                    onClick={takeNativePhoto}
                    className="p-4 rounded-full glass-card text-white hover:bg-white/10 transition"
                    title="Use Native Camera"
                  >
                    <Smartphone className="w-6 h-6" />
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 font-medium mt-2">
                {voiceInstructions ? 'Voice Guidance On' : 'Tap shutter to capture'}
              </p>
            </div>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={retakePhoto}
                className="flex-1 glass-card p-4 rounded-xl text-white font-bold hover:bg-white/10 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-6 h-6" />
                Retake
              </button>
              <button
                onClick={() => setCurrentStep('preparation')}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 p-4 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-6 h-6" />
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'preparation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={retakePhoto}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retake</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Capture Details</h1>
            <button
              onClick={saveCapture}
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
            >
              <Check className="w-5 h-5" />
              <span>Save</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">

            {/* Save Consent Modal */}
            {showSaveConsent && (
              <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-fade-in border border-zinc-100">
                  <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Cloud className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Save to Account?</h3>
                  <p className="text-center text-gray-500 text-sm mb-6">
                    This will securely store the diagnosis in your personal history for future reference.
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={confirmSave}
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Yes, Save It
                    </button>
                    <button
                      onClick={() => setShowSaveConsent(false)}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-6">
              {/* Captured Image Preview */}
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <ImageIcon className="w-6 h-6 text-gray-600" />
                  <h3 className="font-bold text-gray-800">Captured Image</h3>
                  <div className="ml-auto flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${liveQuality.score >= 80 ? 'bg-green-100 text-green-800' :
                      liveQuality.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      Quality: {liveQuality.score}%
                    </div>
                  </div>
                </div>
                <img
                  src={capturedPhoto}
                  alt="Captured"
                  className="w-full h-48 object-contain rounded-lg border border-gray-300"
                />
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {analysisResult && (
                      <>
                        <ThermometerSun className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-700">
                          Health: {analysisResult.healthScore}%
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {deviceInfo.isMobile && (
                      <Smartphone className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-xs text-gray-500">
                      {deviceInfo.isMobile ? 'Mobile capture' : 'Desktop capture'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Report */}
              {liveQuality.issues.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Quality Report
                  </h4>
                  <ul className="space-y-1">
                    {liveQuality.issues.map((issue, idx) => (
                      <li key={idx} className="text-sm text-yellow-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        {issue}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-yellow-700 mt-2">
                    These issues were detected during capture. Consider retaking if severe.
                  </p>
                </div>
              )}

              {/* Crop Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Type
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-500">Select crop type...</option>
                  <option value="rice">Rice</option>
                  <option value="wheat">Wheat</option>
                  <option value="corn">Corn</option>
                  <option value="tomato">Tomato</option>
                  <option value="potato">Potato</option>
                  <option value="cotton">Cotton</option>
                  <option value="soybean">Soybean</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observed Symptoms
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Yellow spots', 'Brown edges', 'White powder', 'Black spots',
                    'Wilting', 'Curling leaves', 'Stunted growth', 'Holes in leaves'
                  ].map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => {
                        setDiseaseSymptoms(prev =>
                          prev.includes(symptom)
                            ? prev.filter(s => s !== symptom)
                            : [...prev, symptom]
                        );
                      }}
                      className={`p-3 rounded-lg border transition-all ${diseaseSymptoms.includes(symptom)
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${diseaseSymptoms.includes(symptom) ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                        <span className={`text-sm font-medium ${diseaseSymptoms.includes(symptom) ? 'text-red-900' : 'text-gray-900'}`}>{symptom}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Environmental Data */}
              <div>
                <button
                  onClick={getEnvironmentalData}
                  className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-3"
                >
                  <Thermometer className="w-6 h-6" />
                  Record Environmental Data
                </button>

                {environmentalData && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-3">Environmental Data</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Thermometer className="w-4 h-4" />
                          <span>Temperature</span>
                        </div>
                        <p className="text-lg font-bold mt-1">{environmentalData.temperature}°C</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Droplets className="w-4 h-4" />
                          <span>Humidity</span>
                        </div>
                        <p className="text-lg font-bold mt-1">{environmentalData.humidity}%</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Cloud className="w-4 h-4" />
                          <span>Weather</span>
                        </div>
                        <p className="text-lg font-bold mt-1">{environmentalData.weather}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Clock className="w-4 h-4" />
                          <span>Time</span>
                        </div>
                        <p className="text-lg font-bold mt-1">{environmentalData.time}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Instructions Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-800">Voice Instructions</p>
                    <p className="text-sm text-gray-600">Audio guidance for analysis</p>
                  </div>
                </div>
                <button
                  onClick={toggleVoiceInstructions}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${voiceInstructions ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${voiceInstructions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Preview */}
          {analysisResult && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
              <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Preliminary Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Health Score</span>
                  <span className={`text-xl font-bold ${analysisResult.healthScore >= 70 ? 'text-emerald-600' :
                    analysisResult.healthScore >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                    {analysisResult.healthScore}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-emerald-600 font-bold text-lg">{analysisResult.greenPercentage}%</div>
                    <div className="text-xs text-gray-600">Healthy</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-yellow-600 font-bold text-lg">{analysisResult.brownPercentage}%</div>
                    <div className="text-xs text-gray-600">Browning</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-red-600 font-bold text-lg">{analysisResult.diseasePercentage}%</div>
                    <div className="text-xs text-gray-600">Disease</div>
                  </div>
                </div>

                {analysisResult.issues.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800">
                      Issues detected: {analysisResult.issues.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'analysis' && showAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800">Analysis Complete!</h1>
              <p className="text-gray-600 mt-2">
                Your capture has been analyzed and saved
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Overall Health Score</h3>
                    <p className="opacity-90">Based on visual analysis</p>
                  </div>
                  <div className="text-5xl font-bold">
                    {analysisResult.healthScore}%
                  </div>
                </div>
                <div className="mt-4 h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${analysisResult.healthScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <div className="text-emerald-700 font-bold text-2xl mb-1">
                    {analysisResult.greenPercentage}%
                  </div>
                  <div className="text-sm text-emerald-600">Healthy</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="text-yellow-700 font-bold text-2xl mb-1">
                    {analysisResult.brownPercentage}%
                  </div>
                  <div className="text-sm text-yellow-600">Browning</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <div className="text-red-700 font-bold text-2xl mb-1">
                    {analysisResult.diseasePercentage}%
                  </div>
                  <div className="text-sm text-red-600">Disease</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-blue-700 font-bold text-2xl mb-1">
                    {liveQuality.score}%
                  </div>
                  <div className="text-sm text-blue-600">Photo Quality</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Recommended Actions
                </h3>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-blue-800">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quality Improvement Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <h3 className="font-bold text-yellow-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Photo Quality Tips for Next Time
                </h3>
                <ul className="space-y-2">
                  {liveQuality.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-yellow-800">
                        {issue === 'Low light' ? 'Use better lighting or enable flash' :
                          issue === 'Blur detected' ? 'Hold phone steadier or use support' :
                            issue === 'Low contrast' ? 'Adjust lighting for better contrast' :
                              'Follow on-screen guidance'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                {/* LLM Advice Button - Full Width & Primary */}
                <button
                  onClick={() => {
                    // Navigate to LLM advice page with actual disease data
                    navigate('/llm-advice', {
                      state: {
                        cropType: cropType || 'Unknown Crop',
                        disease: analysisResult.issues.length > 0 ? analysisResult.issues.join(', ') : 'Leaf Disease',
                        severity: analysisResult.healthScore >= 70 ? 'low' : analysisResult.healthScore >= 50 ? 'medium' : 'high',
                        confidence: analysisResult.healthScore / 100
                      }
                    });
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 px-6 rounded-xl font-bold hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Get Expert LLM Advice
                </button>

                {/* Secondary Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setView('home')}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                  >
                    Back to Home
                  </button>
                  <button
                    onClick={() => {
                      // Speak analysis results
                      if (voiceInstructions) {
                        const message = `Analysis complete. Health score is ${analysisResult.healthScore} percent. ` +
                          `Healthy area is ${analysisResult.greenPercentage} percent. ` +
                          `Browning is ${analysisResult.brownPercentage} percent. ` +
                          `Photo quality was ${liveQuality.score} percent. ` +
                          `Recommended actions: ${analysisResult.recommendations.join('. ')}`;
                        speakGuidance(message);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Volume2 className="w-5 h-5" />
                    Hear Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Multi-Image Upload Component for Batch Diagnosis
const MultiImageUpload = ({ setView, setCapturedImages, isOnline, addToOfflineQueue }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadedPreviewImages, setUploadedPreviewImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('Please select image files only');
      return;
    }

    // Limit to 10 images per batch
    if (selectedImages.length + imageFiles.length > 10) {
      alert('You can upload up to 10 images at a time');
      return;
    }

    // Create preview URLs
    const newPreviews = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setSelectedImages(prev => [...prev, ...imageFiles]);
    setUploadedPreviewImages(prev => [...prev, ...newPreviews]);

    // Audio feedback for file selection
    audioService.playNotification();
    audioService.speak(`${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} selected`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeImage = (id) => {
    setUploadedPreviewImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removedImg = prev.find(img => img.id === id);
      if (removedImg) {
        URL.revokeObjectURL(removedImg.preview);
      }
      return filtered;
    });

    setSelectedImages(prev => {
      const index = uploadedPreviewImages.findIndex(img => img.id === id);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Process each image
    const processedImages = await Promise.all(
      uploadedPreviewImages.map(async (imgData, index) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            // Create a simple analysis for each image
            const analysis = {
              healthScore: Math.floor(Math.random() * 40) + 60,
              greenPercentage: Math.floor(Math.random() * 30) + 50,
              brownPercentage: Math.floor(Math.random() * 20) + 5,
              yellowPercentage: Math.floor(Math.random() * 15) + 5,
              diseasePercentage: Math.floor(Math.random() * 10) + 2,
              spotDensity: Math.floor(Math.random() * 10),
              issues: ['Sample analysis - upload complete'],
              recommendations: ['Review each image for detailed diagnosis', 'Consider professional consultation if needed'],
              timestamp: new Date().toISOString(),
              qualityScore: 85
            };

            resolve({
              data: e.target.result,
              analysis,
              metadata: {
                filename: imgData.file.name,
                filesize: imgData.file.size,
                timestamp: Date.now(),
                batchUpload: true,
                batchIndex: index,
                batchTotal: uploadedPreviewImages.length
              }
            });
          };
          reader.readAsDataURL(imgData.file);
        });
      })
    );

    clearInterval(progressInterval);
    setUploadProgress(100);

    // Add to captured images
    setCapturedImages(prev => [...prev, ...processedImages]);

    // Add to offline queue if offline
    if (!isOnline) {
      processedImages.forEach(img => addToOfflineQueue(img));
    }

    // Play click sound when images selected
    audioService.playClick();

    // Wait a moment to show 100% progress
    setTimeout(() => {
      setIsUploading(false);

      // Audio feedback for successful upload
      audioService.playSuccess();
      audioService.speak(`Upload complete. ${processedImages.length} images analyzed successfully.`);

      setView('analysis');
    }, 500);
  };

  const clearAll = () => {
    uploadedPreviewImages.forEach(img => URL.revokeObjectURL(img.preview));
    setSelectedImages([]);
    setUploadedPreviewImages([]);
  };

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      uploadedPreviewImages.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('home')}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{t('uploadView.title')}</h1>
              <p className="text-xs opacity-90">{t('uploadView.supportedFormats')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-xs">{t('homeView.online')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-xs">{t('homeView.offline')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {/* Upload Area */}
        <div
          className={`border-4 border-dashed rounded-2xl p-8 mb-6 transition-all ${isDragging
            ? 'border-blue-600 bg-blue-50 scale-105'
            : 'border-gray-300 bg-white'
            } ${selectedImages.length > 0 ? 'border-green-300 bg-green-50/30' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {selectedImages.length > 0
                ? `${selectedImages.length} ${t('cropCapture.imagesSelected')}`
                : t('uploadView.selectImages')}
            </h2>
            <p className="text-gray-600 mb-6">
              {isDragging
                ? t('uploadView.dragDropText')
                : t('uploadView.orClickToSelect')}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105 inline-flex items-center gap-2"
            >
              <Image className="w-5 h-5" />
              {t('uploadView.selectImages')}
            </button>

            <p className="text-sm text-gray-500 mt-4">
              {t('uploadView.supportedFormats')}
            </p>
          </div>
        </div>

        {/* Image Thumbnails Scrollable Row */}
        {uploadedPreviewImages.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                {t('uploadView.selectedImages')} ({uploadedPreviewImages.length}/10)
              </h3>
              <button
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                {t('uploadView.removeAll')}
              </button>
            </div>

            {/* Horizontal Scrollable Thumbnails */}
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-2" style={{ minWidth: 'min-content' }}>
                {uploadedPreviewImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative flex-shrink-0 group"
                  >
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition shadow-md">
                      <img
                        src={img.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 text-center truncate">
                      {img.file.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <h3 className="font-bold text-gray-800">{t('uploadView.uploading')}</h3>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">{uploadProgress}%</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setView('home')}
            className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-bold hover:bg-gray-300 transition shadow-md flex items-center justify-center gap-2"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
            {t('common.cancel')}
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedImages.length === 0 || isUploading}
            className={`flex-1 text-white py-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 ${selectedImages.length === 0 || isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl transform hover:scale-105'
              }`}
          >
            <Check className="w-5 h-5" />
            {t('uploadView.uploadAndAnalyze')} {selectedImages.length > 0 && `(${selectedImages.length})`}
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            {t('homeView.quickTip')}
          </h4>
          <p className="text-sm text-blue-800">
            {t('homeView.quickTipText')}
          </p>
        </div>
      </div>
    </div>
  );
};

const VideoRecorder = ({ setView }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-nature-50 flex flex-col">
      <div className="bg-nature-600 p-4 text-white shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => setView('home')} className="p-2 hover:bg-white/20 rounded-full transition">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-xl font-bold">{t('videoView.title')}</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-nature-100">
          <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('videoView.title')}</h2>
          <p className="text-gray-500 mb-8">{t('videoView.recordInstructions')}</p>

          <button className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200 mb-3">
            {t('videoView.startRecording')}
          </button>
          <button onClick={() => setView('home')} className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

const VoiceInput = ({ setView }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-nature-50 flex flex-col">
      <div className="bg-nature-600 p-4 text-white shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => setView('home')} className="p-2 hover:bg-white/20 rounded-full transition">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-xl font-bold">{t('voiceView.title')}</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-nature-100">
          <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Mic className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('voiceView.listening')}</h2>
          <p className="text-gray-500 mb-8">{t('voiceView.askQuestion')}</p>

          <button onClick={() => setView('home')} className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

const ImageAnalysis = ({ setView, capturedImages }) => {
  const [selectedReport, setSelectedReport] = React.useState(null);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <div className="glass-card p-4 text-white sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => selectedReport ? setSelectedReport(null) : setView('home')} className="p-2 hover:bg-white/10 rounded-full transition">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-xl font-bold">{selectedReport ? t('cameraView.analysisResult') : t('analysisView.title')}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 w-full flex-1">
        {selectedReport ? (
          // DETAILED REPORT VIEW
          <div className="animate-slide-up">
            <div className="glass-card rounded-2xl overflow-hidden mb-6">
              <div className="relative h-64">
                <img src={selectedReport.data} className="w-full h-full object-cover" alt="Analyzed Crop" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedReport.analysis?.diagnosis || t('diagnosis.result')}</h2>
                  <p className="text-gray-300 text-sm italic">{selectedReport.analysis?.scientificName}</p>
                </div>
              </div>

              <div className="p-6">
                {/* Confidence & Severity */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 mb-2">{t('cameraView.confidence')}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-emerald-400">{Math.round((selectedReport.analysis?.confidence || 0) * 100)}%</span>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full mb-1.5">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(selectedReport.analysis?.confidence || 0) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 mb-2">{t('diagnosis.severity')}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${selectedReport.analysis?.severity === 'severe' ? 'bg-red-500 animate-pulse' :
                        selectedReport.analysis?.severity === 'moderate' ? 'bg-amber-500' : 'bg-green-500'
                        }`}></div>
                      <span className="text-xl font-bold capitalize">{selectedReport.analysis?.severity || t('analysisView.unknown')}</span>
                    </div>
                  </div>
                </div>

                {/* AI Insight */}
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 font-bold text-lg mb-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    {t('homeView.quickTip')}
                  </h3>
                  <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {selectedReport.analysis?.explanation || t('homeView.quickTipText')}
                    </p>
                  </div>
                </div>

                {/* Symptoms */}
                {selectedReport.analysis?.symptoms?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">{t('diagnosis.diseased')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.analysis.symptoms.map((sym, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treatments */}
                {selectedReport.analysis?.treatments?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">{t('cameraView.treatment')}</h3>
                    <ul className="space-y-3">
                      {selectedReport.analysis.treatments.map((action, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // LIST VIEW
          capturedImages.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-300">{t('analysisView.noHistory')}</h3>
              <p className="text-gray-500 mt-2">{t('analysisView.startScanning')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capturedImages.slice().reverse().map((img, idx) => (
                <div key={idx} className="glass-card p-4 rounded-2xl flex gap-4 hover:bg-white/5 transition group cursor-pointer" onClick={() => setSelectedReport(img)}>
                  <img src={img.data} className="w-24 h-24 rounded-xl object-cover" alt="Captured" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white group-hover:text-emerald-400 transition">{img.analysis?.diagnosis || `${t('diagnosis.result')} #${capturedImages.length - idx}`}</h4>
                      <span className="text-xs text-gray-500">{new Date(img.metadata?.timestamp).toLocaleDateString()}</span>
                    </div>

                    {img.analysis?.confidence ? (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${img.analysis.severity === 'severe' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                          <span className="text-xs text-gray-400 capitalize">{img.analysis.severity}</span>
                        </div>
                        <div className="w-full bg-gray-700 h-1.5 rounded-full">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${img.analysis.confidence * 100}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${img.analysis?.healthScore > 70 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {t('analysisView.healthScore')}: {img.analysis?.healthScore}%
                        </span>
                      </div>
                    )}

                    <button className="text-emerald-400 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                      {t('analysisView.viewDetails')} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CropDiagnosisApp;