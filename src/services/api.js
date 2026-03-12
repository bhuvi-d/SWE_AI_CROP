import { offlineSync } from './offlineSync';
import { logger } from '../utils/logger';

const getApiUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Remove trailing slash if present
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    // Append /api if not present
    if (!url.endsWith('/api')) {
        url += '/api';
    }
    return url;
};

export const API_URL = getApiUrl();
export const API_BASE_URL = API_URL.replace(/\/api$/, '');

const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('jwt_token');
    const headers = { ...options.headers };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
};

export const api = {
    auth: {
        login: async (phoneNumber) => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber }),
            });
            return res.json();
        },
        verify: async (phoneNumber, otp) => {
            const res = await fetch(`${API_URL}/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, otp }),
            });
            if (!res.ok) throw new Error('Verification failed');
            return res.json();
        }
    },
    user: {
        getProfile: async (userId) => {
            const isGuest = localStorage.getItem('crop_diagnosis_is_guest') === 'true';
            if (isGuest) return { name: 'Guest User', guest: true };
            const res = await fetchWithAuth(`${API_URL}/user/${userId}`);
            return res.json();
        },
        updateProfile: async (userId, data) => {
            const res = await fetchWithAuth(`${API_URL}/user/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return res.json();
        }
    },
    crops: {
        get: async (userId) => {
            const isGuest = localStorage.getItem('crop_diagnosis_is_guest') === 'true';
            if (isGuest) return [];
            const res = await fetchWithAuth(`${API_URL}/crops/${userId}`);
            return res.json();
        },
        save: async (userId, selectedCrops) => {
            const isGuest = localStorage.getItem('crop_diagnosis_is_guest') === 'true';
            if (isGuest) return { success: true, message: 'Saved locally' };
            const res = await fetchWithAuth(`${API_URL}/crops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, selectedCrops }),
            });
            return res.json();
        }
    },
    settings: {
        get: async (userId) => {
            const isGuest = localStorage.getItem('crop_diagnosis_is_guest') === 'true';
            if (isGuest) return null;
            const res = await fetchWithAuth(`${API_URL}/settings/${userId}`);
            return res.json();
        },
        update: async (userId, settings) => {
            const res = await fetchWithAuth(`${API_URL}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...settings }),
            });
            return res.json();
        }
    },
    consent: {
        log: async (userId, agreed) => {
            try {
                const res = await fetch(`${API_URL}/consent`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, agreed }),
                });
                return await res.json();
            } catch (e) {
                logger.error("Consent log failed locally/network", e);
                return { success: false, error: e.message };
            }
        }
    },
    diagnosis: {
        save: async (data) => {
            const isGuest = localStorage.getItem('crop_diagnosis_is_guest') === 'true';
            if (isGuest) return { success: true, message: 'Diagnosis saved locally' };
            const res = await fetchWithAuth(`${API_URL}/diagnosis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        analyze: async (file) => {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetchWithAuth(`${API_URL}/crop-advice/analyze`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Analysis failed');
            return res.json();
        },
        analyzeBatch: async (files) => {
            const formData = new FormData();
            files.forEach((file) => formData.append('files', file));

            const res = await fetchWithAuth(`${API_URL}/crop-advice/analyze/batch`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Batch analysis failed');
            return res.json();
        }
    },
    speech: {
        transcribe: async (audioBlob) => {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'voice_command.webm');

            const res = await fetchWithAuth(`${API_URL}/speech/transcribe`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Speech transcription failed');
            return res.json();
        }
    },
    logs: {
        save: async (logPayload) => {
            const res = await fetch(`${API_URL}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logPayload),
            });
            // Don't throw if log fails to prevent retry loops
            return res.ok;
        }
    },
    community: {
        getPosts: async () => {
            if (!navigator.onLine) {
                const cached = offlineSync.getCachedData('community_posts');
                return cached || [];
            }
            try {
                const res = await fetchWithAuth(`${API_URL}/community`);
                const data = await res.json();
                offlineSync.cacheData('community_posts', data);
                return data;
            } catch (e) {
                console.error("Fetch failed, using cache", e);
                return offlineSync.getCachedData('community_posts') || [];
            }
        },
        getHotWords: async () => {
            try {
                const res = await fetchWithAuth(`${API_URL}/community/hot-words`);
                return await res.json();
            } catch (e) {
                console.error("Failed to fetch hot words", e);
                return [];
            }
        },
        createPost: async (postData) => {
            if (!navigator.onLine) {
                return offlineSync.queueAction('CREATE_POST', postData);
            }
            const res = await fetchWithAuth(`${API_URL}/community`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });
            return res.json();
        },
        likePost: async (postId, userId) => {
            // Likes are less critical, maybe just skip offline or optimistic allow?
            // For simplicity, skip offline for now or just throw error caught by UI
            if (!navigator.onLine) return [];
            const res = await fetchWithAuth(`${API_URL}/community/${postId}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            return res.json();
        },
        commentPost: async (postId, userId, text) => {
            if (!navigator.onLine) return null; // Comments complex to sync offline
            const res = await fetchWithAuth(`${API_URL}/community/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, text }),
            });
            return res.json();
        }
    },
    calendar: {
        getTasks: async (userId) => {
            if (!navigator.onLine) {
                const cached = offlineSync.getCachedData(`calendar_tasks_${userId}`);
                return cached || [];
            }
            try {
                const res = await fetchWithAuth(`${API_URL}/calendar/${userId}`);
                const data = await res.json();
                offlineSync.cacheData(`calendar_tasks_${userId}`, data);
                return data;
            } catch (e) {
                return offlineSync.getCachedData(`calendar_tasks_${userId}`) || [];
            }
        },
        createTask: async (taskData) => {
            if (!navigator.onLine) {
                return offlineSync.queueAction('CREATE_TASK', taskData);
            }
            const res = await fetchWithAuth(`${API_URL}/calendar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            });
            return res.json();
        },
        toggleTask: async (taskId, userId) => {
            if (!navigator.onLine) {
                return offlineSync.queueAction('TOGGLE_TASK', { taskId, userId });
            }
            const res = await fetchWithAuth(`${API_URL}/calendar/${taskId}/toggle`, {
                method: 'PUT',
            });
            return res.json();
        },
        deleteTask: async (taskId, userId) => {
            if (!navigator.onLine) {
                return offlineSync.queueAction('DELETE_TASK', { taskId, userId });
            }
            const res = await fetchWithAuth(`${API_URL}/calendar/${taskId}`, {
                method: 'DELETE',
            });
            return res.json();
        }
    },
    farmTasks: {
        getTasks: async (userId) => {
            try {
                const res = await fetch(`${API_URL}/farm-tasks/${userId}`);
                return await res.json();
            } catch (e) {
                console.error('Failed to fetch farm tasks', e);
                return [];
            }
        },
        getTodayTasks: async (userId) => {
            try {
                const res = await fetch(`${API_URL}/farm-tasks/${userId}/today`);
                return await res.json();
            } catch (e) {
                return [];
            }
        },
        getUpcomingTasks: async (userId) => {
            try {
                const res = await fetch(`${API_URL}/farm-tasks/${userId}/upcoming`);
                return await res.json();
            } catch (e) {
                return [];
            }
        },
        createTask: async (taskData) => {
            const res = await fetch(`${API_URL}/farm-tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to create farm task');
            }
            return res.json();
        },
        updateStatus: async (taskId, status) => {
            const res = await fetch(`${API_URL}/farm-tasks/${taskId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            return res.json();
        },
        updateTask: async (taskId, data) => {
            const res = await fetch(`${API_URL}/farm-tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        deleteTask: async (taskId, deleteAll = false) => {
            const res = await fetch(`${API_URL}/farm-tasks/${taskId}?deleteAll=${deleteAll}`, {
                method: 'DELETE',
            });
            return res.json();
        }
    },
    taskReminders: {
        getReminders: async (userId) => {
            try {
                const res = await fetchWithAuth(`${API_URL}/task-reminders/${userId}`);
                return await res.json();
            } catch (e) {
                console.error('Failed to fetch task reminders', e);
                return [];
            }
        },
        getTodayReminders: async (userId) => {
            try {
                const res = await fetchWithAuth(`${API_URL}/task-reminders/${userId}/today`);
                return await res.json();
            } catch (e) {
                return [];
            }
        },
        getUpcomingReminders: async (userId) => {
            try {
                const res = await fetchWithAuth(`${API_URL}/task-reminders/${userId}/upcoming`);
                return await res.json();
            } catch (e) {
                return [];
            }
        },
        createReminder: async (data) => {
            const res = await fetchWithAuth(`${API_URL}/task-reminders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to create reminder');
            }
            return res.json();
        },
        updateStatus: async (reminderId, status, completedFrom = 'web') => {
            const res = await fetchWithAuth(`${API_URL}/task-reminders/${reminderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, completedFrom }),
            });
            return res.json();
        },
        updateReminder: async (reminderId, data) => {
            const res = await fetchWithAuth(`${API_URL}/task-reminders/${reminderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        deleteReminder: async (reminderId, deleteAll = false) => {
            const res = await fetchWithAuth(`${API_URL}/task-reminders/${reminderId}?deleteAll=${deleteAll}`, {
                method: 'DELETE',
            });
            return res.json();
        }
    }
};
