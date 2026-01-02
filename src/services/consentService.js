const CONSENT_KEY = 'crop_diagnosis_consent';
const GUEST_KEY = 'crop_diagnosis_is_guest';

export const consentService = {
    hasConsent: () => {
        return localStorage.getItem(CONSENT_KEY) === 'true';
    },

    giveConsent: () => {
        localStorage.setItem(CONSENT_KEY, 'true');
    },

    revokeConsent: () => {
        localStorage.removeItem(CONSENT_KEY);
    },

    isGuest: () => {
        return localStorage.getItem(GUEST_KEY) === 'true';
    },

    setGuestMode: (isGuest) => {
        if (isGuest) {
            localStorage.setItem(GUEST_KEY, 'true');
        } else {
            localStorage.removeItem(GUEST_KEY);
        }
    }
};
