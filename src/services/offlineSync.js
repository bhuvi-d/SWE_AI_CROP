import { api } from './api';
import { showToast } from '../components/ConfirmationToast';

const QUEUE_KEY = 'offline_action_queue';
const DATA_CACHE_KEY = 'offline_data_cache';

export const offlineSync = {
    // Queue an action to be performed when online
    queueAction: (type, data) => {
        const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        const action = {
            id: Date.now(),
            type,
            data,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        queue.push(action);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

        // Optimistically update the cache for Calendar tasks (US27)
        if (type.endsWith('_TASK') && data.userId) {
            const cacheKey = `calendar_tasks_${data.userId}`;
            let cachedTasks = offlineSync.getCachedData(cacheKey);
            if (!Array.isArray(cachedTasks)) cachedTasks = [];

            if (type === 'CREATE_TASK') {
                const newTask = {
                    ...data,
                    _id: 'temp_' + action.id,
                    completed: false,
                    createdAt: action.timestamp
                };
                cachedTasks = [newTask, ...cachedTasks];
            } else if (type === 'TOGGLE_TASK') {
                cachedTasks = cachedTasks.map(t =>
                    t._id === data.taskId ? { ...t, completed: !t.completed } : t
                );
            } else if (type === 'DELETE_TASK') {
                cachedTasks = cachedTasks.filter(t => t._id !== data.taskId);
            }

            offlineSync.cacheData(cacheKey, cachedTasks);
        }

        // Return a mock response so the UI update optimistically
        return { success: true, offline: true, ...data, _id: 'temp_' + action.id, createdAt: new Date().toISOString() };
    },

    // Get the current queue
    getQueue: () => {
        return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    },

    // Sync pending actions
    sync: async () => {
        if (!navigator.onLine) return;

        const queue = offlineSync.getQueue();
        if (queue.length === 0) return;

        console.log(`Syncing ${queue.length} offline actions...`);
        const failedActions = [];
        let syncedCount = 0;

        for (const action of queue) {
            try {
                switch (action.type) {
                    case 'CREATE_POST':
                        await api.community.createPost(action.data);
                        break;
                    case 'CREATE_TASK':
                        await api.calendar.createTask(action.data);
                        break;
                    case 'TOGGLE_TASK':
                        await api.calendar.toggleTask(action.data.taskId);
                        break;
                    case 'DELETE_TASK':
                        await api.calendar.deleteTask(action.data.taskId);
                        break;
                    default:
                        console.warn('Unknown offline action type:', action.type);
                }
                syncedCount++;
            } catch (error) {
                console.error('Failed to sync action:', action, error);
                // Keep failed actions to retry later? Or discard?
                // For now, let's keep them if it's a network error, but how to distinguish?
                // If the error is not network related, we might want to discard to avoid stuck queue.
                // Simple approach: unshift to failedActions
                failedActions.push(action);
            }
        }

        localStorage.setItem(QUEUE_KEY, JSON.stringify(failedActions));

        if (syncedCount > 0) {
            // Dispatch event to refresh data
            window.dispatchEvent(new Event('offline-sync-complete'));
            console.log(`Synced ${syncedCount} actions.`);
        }
    },

    // Cache data for offline usage
    cacheData: (key, data) => {
        const cache = JSON.parse(localStorage.getItem(DATA_CACHE_KEY) || '{}');
        cache[key] = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(cache));
    },

    // Get cached data
    getCachedData: (key) => {
        const cache = JSON.parse(localStorage.getItem(DATA_CACHE_KEY) || '{}');
        return cache[key]?.data || null;
    }
};

// Auto-sync when online
export const initOfflineSync = () => {
    window.addEventListener('online', () => {
        offlineSync.sync();
        showToast("Back online! Syncing data...", { type: 'success' });
    });

    // Also try to sync on load if online
    if (navigator.onLine) {
        offlineSync.sync();
    }
};
