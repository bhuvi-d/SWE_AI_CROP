import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { api } from '../services/api';
import { socketService } from '../services/socketService';
import { audioService } from '../services/audioService';
import { ArrowRight, Calendar as CalendarIcon, CheckCircle, Circle, Trash2, Plus, Clock, Repeat, AlertTriangle, Leaf, SkipForward, Bell, Cloud, Timer, MessageSquare } from 'lucide-react';
import { preferencesService } from '../services/preferencesService';

const TASK_TYPES = [
    { value: 'watering', emoji: '💧' },
    { value: 'fertilizer', emoji: '🧪' },
    { value: 'pesticide', emoji: '🛡️' },
    { value: 'harvest', emoji: '🌾' },
    { value: 'sowing', emoji: '🌱' },
    { value: 'pruning', emoji: '✂️' },
    { value: 'soil_testing', emoji: '🔬' },
    { value: 'irrigation_check', emoji: '🚿' },
    { value: 'weeding', emoji: '🌿' },
    { value: 'mulching', emoji: '🍂' },
    { value: 'other', emoji: '📋' },
];

const PRIORITIES = [
    { value: 'low', color: 'bg-green-100 text-green-700', label: 'Low' },
    { value: 'medium', color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
    { value: 'high', color: 'bg-orange-100 text-orange-700', label: 'High' },
    { value: 'urgent', color: 'bg-red-100 text-red-700', label: 'Urgent' },
];

const STATUS_BADGES = {
    pending: { icon: '🟡', label: 'Pending', class: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    done: { icon: '✅', label: 'Done', class: 'bg-green-50 text-green-700 border-green-200' },
    skipped: { icon: '⏭️', label: 'Skipped', class: 'bg-gray-50 text-gray-600 border-gray-200' },
    overdue: { icon: '🔴', label: 'Overdue', class: 'bg-red-50 text-red-700 border-red-200' },
};

const CalendarScreen = ({ onBack }) => {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewTask, setShowNewTask] = useState(false);
    const [showNewReminder, setShowNewReminder] = useState(false);
    const [activeTab, setActiveTab] = useState('reminders'); // 'tasks' or 'reminders'
    const [newTask, setNewTask] = useState({
        title: '',
        taskType: 'other',
        date: new Date().toISOString().split('T')[0],
        time: '08:00',
        notes: '',
        cropName: '',
        priority: 'medium',
        isRecurring: false,
        recurrencePattern: 'none',
        recurrenceEndDate: '',
        description: ''
    });
    const [newReminder, setNewReminder] = useState({
        title: '',
        message: '',
        taskType: 'other',
        date: new Date().toISOString().split('T')[0],
        time: '08:00',
        cropName: '',
        priority: 'medium',
        notes: '',
        estimatedDuration: '',
        weatherDependent: false,
        isRecurring: false,
        recurrencePattern: 'none',
        recurrenceEndDate: '',
        customRecurrenceDays: []
    });
    const userId = preferencesService.getUserId();
    const socketCleanupRef = useRef([]);

    const loadTasks = useCallback(async () => {
        try {
            const [calendarData, farmData] = await Promise.all([
                api.calendar.getTasks(userId),
                api.farmTasks.getTasks(userId).catch(() => [])
            ]);

            const calTasks = Array.isArray(calendarData) ? calendarData.map(t => ({ ...t, _source: 'calendar' })) : [];
            const farmTasks = Array.isArray(farmData) ? farmData.map(t => ({ ...t, _source: 'farm' })) : [];

            const allTasks = [...calTasks, ...farmTasks].sort((a, b) => {
                const dateA = a.scheduledAt || a.date;
                const dateB = b.scheduledAt || b.date;
                return new Date(dateA) - new Date(dateB);
            });

            setTasks(allTasks);
        } catch (error) {
            console.error('Failed to load tasks', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const loadReminders = useCallback(async () => {
        try {
            const data = await api.taskReminders.getReminders(userId);
            setReminders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load reminders', error);
            setReminders([]);
        }
    }, [userId]);

    useEffect(() => {
        loadTasks();
        loadReminders();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            loadTasks();
            loadReminders();
        }, 30000);

        // Connect Socket.IO for real-time updates
        socketService.connect(userId);

        // Listen for real-time reminder status changes (from app notifications)
        const unsub1 = socketService.on('reminder:statusChanged', (data) => {
            setReminders(prev => prev.map(r =>
                r._id === data.reminderId
                    ? { ...r, status: data.status, completedAt: data.completedAt, completedFrom: data.completedFrom }
                    : r
            ));
            // Show a toast when task is completed from the app
            if (data.completedFrom === 'app_notification' || data.completedFrom === 'app_screen') {
                audioService.playSuccess?.();
            }
        });

        const unsub2 = socketService.on('reminder:created', () => loadReminders());
        const unsub3 = socketService.on('reminder:updated', () => loadReminders());
        const unsub4 = socketService.on('reminder:deleted', () => loadReminders());
        const unsub5 = socketService.on('reminder:deletedAll', () => loadReminders());

        socketCleanupRef.current = [unsub1, unsub2, unsub3, unsub4, unsub5];

        return () => {
            clearInterval(interval);
            socketCleanupRef.current.forEach(fn => fn());
        };
    }, [loadTasks, loadReminders, userId]);

    const handleCreateTask = async () => {
        if (!newTask.title) return;

        try {
            await api.farmTasks.createTask({
                userId: userId,
                title: newTask.title,
                description: newTask.description,
                taskType: newTask.taskType,
                cropName: newTask.cropName,
                date: newTask.date,
                time: newTask.time,
                priority: newTask.priority,
                isRecurring: newTask.isRecurring,
                recurrencePattern: newTask.isRecurring ? newTask.recurrencePattern : 'none',
                recurrenceEndDate: newTask.isRecurring ? newTask.recurrenceEndDate : null
            });
            setShowNewTask(false);
            setNewTask({
                title: '', taskType: 'other', date: new Date().toISOString().split('T')[0],
                time: '08:00', notes: '', cropName: '', priority: 'medium',
                isRecurring: false, recurrencePattern: 'none', recurrenceEndDate: '', description: ''
            });
            loadTasks();
            audioService.playSoftAlert();
        } catch (error) {
            console.error('Failed to create task', error);
            audioService.playError();
        }
    };

    const handleCreateReminder = async () => {
        if (!newReminder.title) return;

        try {
            await api.taskReminders.createReminder({
                userId: userId,
                title: newReminder.title,
                message: newReminder.message,
                taskType: newReminder.taskType,
                cropName: newReminder.cropName,
                date: newReminder.date,
                time: newReminder.time,
                priority: newReminder.priority,
                notes: newReminder.notes,
                estimatedDuration: newReminder.estimatedDuration ? parseInt(newReminder.estimatedDuration) : null,
                weatherDependent: newReminder.weatherDependent,
                isRecurring: newReminder.isRecurring,
                recurrencePattern: newReminder.isRecurring ? newReminder.recurrencePattern : 'none',
                recurrenceEndDate: newReminder.isRecurring ? newReminder.recurrenceEndDate : null,
                customRecurrenceDays: newReminder.recurrencePattern === 'custom' ? newReminder.customRecurrenceDays : []
            });
            setShowNewReminder(false);
            setNewReminder({
                title: '', message: '', taskType: 'other', date: new Date().toISOString().split('T')[0],
                time: '08:00', cropName: '', priority: 'medium', notes: '',
                estimatedDuration: '', weatherDependent: false,
                isRecurring: false, recurrencePattern: 'none', recurrenceEndDate: '', customRecurrenceDays: []
            });
            loadReminders();
            audioService.playSoftAlert();
        } catch (error) {
            console.error('Failed to create reminder', error);
            audioService.playError();
        }
    };

    const toggleTask = async (task) => {
        try {
            if (task._source === 'farm') {
                const newStatus = task.status === 'done' ? 'pending' : 'done';
                await api.farmTasks.updateStatus(task._id, newStatus);
                setTasks(tasks.map(t =>
                    t._id === task._id ? { ...t, status: newStatus, completedAt: newStatus === 'done' ? new Date() : null } : t
                ));
            } else {
                await api.calendar.toggleTask(task._id, userId);
                setTasks(tasks.map(t =>
                    t._id === task._id ? { ...t, completed: !t.completed } : t
                ));
            }
            audioService.playClick();
        } catch (error) {
            console.error('Failed to toggle task', error);
        }
    };

    const skipTask = async (task) => {
        if (task._source !== 'farm') return;
        try {
            await api.farmTasks.updateStatus(task._id, 'skipped');
            setTasks(tasks.map(t =>
                t._id === task._id ? { ...t, status: 'skipped' } : t
            ));
            audioService.playClick();
        } catch (error) {
            console.error('Failed to skip task', error);
        }
    };

    const deleteTask = async (task) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            if (task._source === 'farm') {
                await api.farmTasks.deleteTask(task._id);
            } else {
                await api.calendar.deleteTask(task._id, userId);
            }
            setTasks(tasks.filter(t => t._id !== task._id));
            audioService.playClick();
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    const toggleReminder = async (reminder) => {
        try {
            const newStatus = reminder.status === 'done' ? 'pending' : 'done';
            await api.taskReminders.updateStatus(reminder._id, newStatus, 'web');
            setReminders(reminders.map(r =>
                r._id === reminder._id ? { ...r, status: newStatus, completedAt: newStatus === 'done' ? new Date() : null } : r
            ));
            audioService.playClick();
        } catch (error) {
            console.error('Failed to toggle reminder', error);
        }
    };

    const skipReminder = async (reminder) => {
        try {
            await api.taskReminders.updateStatus(reminder._id, 'skipped', 'web');
            setReminders(reminders.map(r =>
                r._id === reminder._id ? { ...r, status: 'skipped' } : r
            ));
            audioService.playClick();
        } catch (error) {
            console.error('Failed to skip reminder', error);
        }
    };

    const deleteReminder = async (reminder) => {
        if (!window.confirm('Delete this reminder?')) return;
        try {
            await api.taskReminders.deleteReminder(reminder._id);
            setReminders(reminders.filter(r => r._id !== reminder._id));
            audioService.playClick();
        } catch (error) {
            console.error('Failed to delete reminder', error);
        }
    };

    // Group tasks by date
    const groupedTasks = tasks.reduce((acc, task) => {
        const dateVal = task.scheduledAt || task.date;
        const date = new Date(dateVal).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(task);
        return acc;
    }, {});

    // Group reminders by date
    const groupedReminders = reminders.reduce((acc, reminder) => {
        const dateVal = reminder.scheduledAt || reminder.date;
        const date = new Date(dateVal).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(reminder);
        return acc;
    }, {});

    const getTaskTypeEmoji = (type) => TASK_TYPES.find(t => t.value === type)?.emoji || '📋';
    const getPriorityStyle = (priority) => PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
    const getStatusBadge = (task) => {
        if (task._source === 'farm') return STATUS_BADGES[task.status] || STATUS_BADGES.pending;
        return task.completed ? STATUS_BADGES.done : STATUS_BADGES.pending;
    };
    const isTaskDone = (task) => task._source === 'farm' ? task.status === 'done' : task.completed;

    const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getCompletedFromLabel = (from) => {
        if (from === 'app_notification') return '📱 via Notification';
        if (from === 'app_screen') return '📱 via App';
        if (from === 'web') return '🌐 via Web';
        return '';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="p-2.5 bg-white rounded-full text-gray-600 hover:bg-gray-100 transition active:scale-95 shadow-md"
                >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <h1 className="text-xl font-bold flex-1 text-gray-800">{t('calendar.title')}</h1>
                <button
                    onClick={() => activeTab === 'reminders' ? setShowNewReminder(true) : setShowNewTask(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" /> {activeTab === 'reminders' ? 'New Reminder' : t('calendar.addTask')}
                </button>
            </div>

            {/* Tab Switcher */}
            <div className="bg-white border-b flex">
                <button
                    onClick={() => setActiveTab('reminders')}
                    className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
                        activeTab === 'reminders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Bell className="w-4 h-4" /> Reminders ({reminders.length})
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
                        activeTab === 'tasks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <CalendarIcon className="w-4 h-4" /> Tasks ({tasks.length})
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">{t('calendar.loading')}</div>
                ) : activeTab === 'reminders' ? (
                    /* ── Reminders Tab ── */
                    <div className="max-w-md mx-auto space-y-6">
                        {Object.entries(groupedReminders).map(([date, dateReminders]) => (
                            <div key={date}>
                                <h3 className="font-semibold text-gray-500 mb-2 sticky top-0 bg-gray-50 py-1 flex items-center gap-2">
                                    <Bell className="w-4 h-4" /> {date}
                                    <span className="text-xs text-gray-400">({dateReminders.length})</span>
                                </h3>
                                <div className="space-y-2">
                                    {dateReminders.map(reminder => {
                                        const done = reminder.status === 'done';
                                        const statusBadge = STATUS_BADGES[reminder.status] || STATUS_BADGES.pending;
                                        const priorityStyle = getPriorityStyle(reminder.priority);

                                        return (
                                            <div key={reminder._id} className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 ${done ? 'opacity-60 bg-gray-50' : ''} ${reminder.status === 'skipped' ? 'opacity-50' : ''}`}>
                                                <button onClick={() => toggleReminder(reminder)} className="text-gray-400 hover:text-green-500 transition flex-shrink-0">
                                                    {done ?
                                                        <CheckCircle className="w-6 h-6 text-green-500" /> :
                                                        <Circle className="w-6 h-6" />
                                                    }
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span>{getTaskTypeEmoji(reminder.taskType)}</span>
                                                        <h4 className={`font-medium text-gray-800 ${done ? 'line-through' : ''} truncate`}>
                                                            {reminder.title}
                                                        </h4>
                                                    </div>
                                                    {reminder.message && (
                                                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                            <MessageSquare className="w-3 h-3" /> {reminder.message}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        {reminder.time && (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> {reminder.time}
                                                            </span>
                                                        )}
                                                        {reminder.cropName && (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1">
                                                                <Leaf className="w-3 h-3" /> {reminder.cropName}
                                                            </span>
                                                        )}
                                                        {priorityStyle && (
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyle.color}`}>
                                                                {priorityStyle.label}
                                                            </span>
                                                        )}
                                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge.class}`}>
                                                            {statusBadge.icon} {statusBadge.label}
                                                        </span>
                                                        {reminder.isRecurring && (
                                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600">
                                                                <Repeat className="w-3 h-3 inline" /> {reminder.recurrencePattern}
                                                            </span>
                                                        )}
                                                        {reminder.weatherDependent && (
                                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600">
                                                                <Cloud className="w-3 h-3 inline" /> Weather
                                                            </span>
                                                        )}
                                                        {reminder.estimatedDuration && (
                                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">
                                                                <Timer className="w-3 h-3 inline" /> {reminder.estimatedDuration}min
                                                            </span>
                                                        )}
                                                        {reminder.completedFrom && (
                                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                                                {getCompletedFromLabel(reminder.completedFrom)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {reminder.status === 'pending' && (
                                                        <button onClick={() => skipReminder(reminder)} className="p-2 text-gray-300 hover:text-orange-500 transition" title="Skip">
                                                            <SkipForward className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => deleteReminder(reminder)} className="p-2 text-gray-300 hover:text-red-500 transition">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {reminders.length === 0 && (
                            <div className="text-center py-10">
                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No reminders yet</p>
                                <p className="text-gray-400 text-sm mt-1">Create reminders here — farmers will get notified on the app!</p>
                                <button onClick={() => setShowNewReminder(true)} className="text-blue-600 font-medium mt-2">
                                    Create first reminder
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Tasks Tab (existing) ── */
                    <div className="max-w-md mx-auto space-y-6">
                        {Object.entries(groupedTasks).map(([date, dateTasks]) => (
                            <div key={date}>
                                <h3 className="font-semibold text-gray-500 mb-2 sticky top-0 bg-gray-50 py-1 flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" /> {date}
                                    <span className="text-xs text-gray-400">({dateTasks.length})</span>
                                </h3>
                                <div className="space-y-2">
                                    {dateTasks.map(task => {
                                        const done = isTaskDone(task);
                                        const statusBadge = getStatusBadge(task);
                                        const priorityStyle = task._source === 'farm' ? getPriorityStyle(task.priority) : null;

                                        return (
                                            <div key={task._id} className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 ${done ? 'opacity-60 bg-gray-50' : ''} ${task.status === 'skipped' ? 'opacity-50' : ''}`}>
                                                <button onClick={() => toggleTask(task)} className="text-gray-400 hover:text-green-500 transition flex-shrink-0">
                                                    {done ?
                                                        <CheckCircle className="w-6 h-6 text-green-500" /> :
                                                        <Circle className="w-6 h-6" />
                                                    }
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span>{getTaskTypeEmoji(task.taskType || task.type)}</span>
                                                        <h4 className={`font-medium text-gray-800 ${done ? 'line-through' : ''} truncate`}>
                                                            {task.title}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        {task.time && (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> {task.time}
                                                            </span>
                                                        )}
                                                        {task.cropName && (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1">
                                                                <Leaf className="w-3 h-3" /> {task.cropName}
                                                            </span>
                                                        )}
                                                        {priorityStyle && (
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyle.color}`}>
                                                                {priorityStyle.label}
                                                            </span>
                                                        )}
                                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge.class}`}>
                                                            {statusBadge.icon} {statusBadge.label}
                                                        </span>
                                                        {task.isRecurring && (
                                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600">
                                                                <Repeat className="w-3 h-3 inline" /> {task.recurrencePattern}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {task._source === 'farm' && task.status === 'pending' && (
                                                        <button onClick={() => skipTask(task)} className="p-2 text-gray-300 hover:text-orange-500 transition" title="Skip">
                                                            <SkipForward className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => deleteTask(task)} className="p-2 text-gray-300 hover:text-red-500 transition">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {tasks.length === 0 && (
                            <div className="text-center py-10">
                                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">{t('calendar.noTasks')}</p>
                                <button onClick={() => setShowNewTask(true)} className="text-blue-600 font-medium mt-2">
                                    {t('calendar.startPlanning')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── New Reminder Modal ── */}
            {showNewReminder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 animate-slide-up text-gray-900 max-h-[85vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                            🔔 Create Reminder
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            This reminder will be sent as a notification to the mobile app. The farmer gets alerts 10min before, 5min before, and at the scheduled time.
                        </p>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Title *</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    placeholder="e.g. Water the tomato field"
                                    value={newReminder.title}
                                    onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
                                />
                            </div>

                            {/* Notification Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <MessageSquare className="w-3.5 h-3.5" /> Notification Message
                                </label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white resize-none"
                                    rows="2"
                                    placeholder="Message shown in the notification (e.g., Use drip irrigation for 30 minutes)"
                                    value={newReminder.message}
                                    onChange={e => setNewReminder({ ...newReminder, message: e.target.value })}
                                />
                            </div>

                            {/* Type + Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        value={newReminder.taskType}
                                        onChange={e => setNewReminder({ ...newReminder, taskType: e.target.value })}
                                    >
                                        {TASK_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.emoji} {t.value.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        value={newReminder.date}
                                        onChange={e => setNewReminder({ ...newReminder, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Time + Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" /> Time *
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        value={newReminder.time}
                                        onChange={e => setNewReminder({ ...newReminder, time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Priority
                                    </label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        value={newReminder.priority}
                                        onChange={e => setNewReminder({ ...newReminder, priority: e.target.value })}
                                    >
                                        {PRIORITIES.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Crop Name + Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <Leaf className="w-3.5 h-3.5" /> Crop Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        placeholder="e.g. Tomato, Rice..."
                                        value={newReminder.cropName}
                                        onChange={e => setNewReminder({ ...newReminder, cropName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <Timer className="w-3.5 h-3.5" /> Est. Duration (min)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        placeholder="30"
                                        value={newReminder.estimatedDuration}
                                        onChange={e => setNewReminder({ ...newReminder, estimatedDuration: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white resize-none"
                                    rows="2"
                                    placeholder="Additional notes for the farmer..."
                                    value={newReminder.notes}
                                    onChange={e => setNewReminder({ ...newReminder, notes: e.target.value })}
                                />
                            </div>

                            {/* Weather Dependent */}
                            <label className="flex items-center gap-2 cursor-pointer p-2 bg-sky-50 rounded-lg border border-sky-100">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-sky-600 rounded"
                                    checked={newReminder.weatherDependent}
                                    onChange={e => setNewReminder({ ...newReminder, weatherDependent: e.target.checked })}
                                />
                                <Cloud className="w-4 h-4 text-sky-600" />
                                <span className="text-sm font-medium text-sky-800">Weather dependent task</span>
                                <span className="text-xs text-sky-500 ml-1">(Remind farmer to check weather first)</span>
                            </label>

                            {/* Recurrence */}
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-purple-600 rounded"
                                        checked={newReminder.isRecurring}
                                        onChange={e => setNewReminder({ ...newReminder, isRecurring: e.target.checked })}
                                    />
                                    <Repeat className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-800">Recurring Reminder</span>
                                    <span className="text-xs text-purple-500 ml-1">(No need to re-fill daily!)</span>
                                </label>

                                {newReminder.isRecurring && (
                                    <div className="mt-3 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-purple-700 mb-1">Pattern</label>
                                                <select
                                                    className="w-full p-2 border border-purple-200 rounded-lg text-sm text-gray-900 bg-white"
                                                    value={newReminder.recurrencePattern}
                                                    onChange={e => setNewReminder({ ...newReminder, recurrencePattern: e.target.value })}
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="biweekly">Every 2 Weeks</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="custom">Custom Days</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-purple-700 mb-1">Until</label>
                                                <input
                                                    type="date"
                                                    className="w-full p-2 border border-purple-200 rounded-lg text-sm text-gray-900 bg-white"
                                                    value={newReminder.recurrenceEndDate}
                                                    onChange={e => setNewReminder({ ...newReminder, recurrenceEndDate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Custom Days Picker */}
                                        {newReminder.recurrencePattern === 'custom' && (
                                            <div>
                                                <label className="block text-xs font-medium text-purple-700 mb-2">Select Days</label>
                                                <div className="flex gap-1 flex-wrap">
                                                    {WEEKDAYS.map((day, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => {
                                                                const days = [...newReminder.customRecurrenceDays];
                                                                const i = days.indexOf(idx);
                                                                if (i > -1) days.splice(i, 1);
                                                                else days.push(idx);
                                                                setNewReminder({ ...newReminder, customRecurrenceDays: days });
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                                                newReminder.customRecurrenceDays.includes(idx)
                                                                    ? 'bg-purple-600 text-white'
                                                                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                            }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowNewReminder(false)}
                                    className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg border border-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateReminder}
                                    disabled={!newReminder.title}
                                    className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
                                >
                                    Create Reminder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Task Modal - Enhanced */}
            {showNewTask && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 animate-slide-up text-gray-900 max-h-[85vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                            🌾 {t('calendar.createTask')}
                        </h2>

                        <div className="space-y-4">
                            {/* Task Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('calendar.taskName')}</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    placeholder={t('calendar.taskNamePlaceholder')}
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>

                            {/* Type + Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('calendar.type')}</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        value={newTask.taskType}
                                        onChange={e => setNewTask({ ...newTask, taskType: e.target.value })}
                                    >
                                        {TASK_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.emoji} {t.value.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('calendar.date')}</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        value={newTask.date}
                                        onChange={e => setNewTask({ ...newTask, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Time + Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" /> Time
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        value={newTask.time}
                                        onChange={e => setNewTask({ ...newTask, time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Priority
                                    </label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        {PRIORITIES.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Crop Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <Leaf className="w-3.5 h-3.5" /> Crop Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    placeholder="e.g. Tomato, Rice, Wheat..."
                                    value={newTask.cropName}
                                    onChange={e => setNewTask({ ...newTask, cropName: e.target.value })}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white resize-none"
                                    rows="2"
                                    placeholder="Additional notes about this task..."
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>

                            {/* Recurrence */}
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-purple-600 rounded"
                                        checked={newTask.isRecurring}
                                        onChange={e => setNewTask({ ...newTask, isRecurring: e.target.checked })}
                                    />
                                    <Repeat className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-800">Recurring Task</span>
                                </label>

                                {newTask.isRecurring && (
                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-purple-700 mb-1">Pattern</label>
                                            <select
                                                className="w-full p-2 border border-purple-200 rounded-lg text-sm text-gray-900 bg-white"
                                                value={newTask.recurrencePattern}
                                                onChange={e => setNewTask({ ...newTask, recurrencePattern: e.target.value })}
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="biweekly">Every 2 Weeks</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-purple-700 mb-1">Until</label>
                                            <input
                                                type="date"
                                                className="w-full p-2 border border-purple-200 rounded-lg text-sm text-gray-900 bg-white"
                                                value={newTask.recurrenceEndDate}
                                                onChange={e => setNewTask({ ...newTask, recurrenceEndDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowNewTask(false)}
                                    className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg border border-gray-200"
                                >
                                    {t('calendar.cancel')}
                                </button>
                                <button
                                    onClick={handleCreateTask}
                                    disabled={!newTask.title}
                                    className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
                                >
                                    {t('calendar.add')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarScreen;
