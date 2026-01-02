import { consentService } from './consentService';

const STORAGE_KEY = 'crop_diagnosis_user_crops';

export const cropService = {
    getCrops: () => {
        if (consentService.isGuest()) {
            return [];
        }
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load crops', e);
            return [];
        }
    },

    saveCrops: (crops) => {
        if (consentService.isGuest()) {
            return;
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
        } catch (e) {
            console.error('Failed to save crops', e);
        }
    },

    getAllCrops: () => [
        { id: 'wheat', name: 'Wheat', icon: '🌾' },
        { id: 'rice', name: 'Rice', icon: '🍚' },
        { id: 'corn', name: 'Corn', icon: '🌽' },
        { id: 'tomato', name: 'Tomato', icon: '🍅' },
        { id: 'potato', name: 'Potato', icon: '🥔' },
        { id: 'cotton', name: 'Cotton', icon: '🧶' },
        { id: 'sugarcane', name: 'Sugarcane', icon: '🎋' },
        { id: 'soybean', name: 'Soybean', icon: '🌱' },
    ]
};
