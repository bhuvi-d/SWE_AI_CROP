import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { api } from '../services/api';
import { audioService } from '../services/audioService';
import { ArrowRight, Calendar as CalendarIcon, CheckCircle, Circle, Trash2, Plus } from 'lucide-react';
import { preferencesService } from '../services/preferencesService';

const CalendarScreen = ({ onBack }) => {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewTask, setShowNewTask] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', type: 'other', date: new Date().toISOString().split('T')[0], notes: '' });
    const userId = preferencesService.getUserId();

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await api.calendar.getTasks(userId);
            if (Array.isArray(data)) {
                setTasks(data);
            } else {
                console.error('Invalid tasks data received:', data);
                setTasks([]);
            }
        } catch (error) {
            console.error('Failed to load tasks', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async () => {
        if (!newTask.title) return;

        try {
            await api.calendar.createTask({
                userId: userId,
                ...newTask
            });
            setShowNewTask(false);
            setNewTask({ title: '', type: 'other', date: new Date().toISOString().split('T')[0], notes: '' });
            loadTasks();
            audioService.playSuccess();
        } catch (error) {
            console.error('Failed to create task', error);
            audioService.playError();
        }
    };

    const toggleTask = async (taskId) => {
        try {
            await api.calendar.toggleTask(taskId, userId);
            setTasks(tasks.map(t =>
                t._id === taskId ? { ...t, completed: !t.completed } : t
            ));
            audioService.playClick();
        } catch (error) {
            console.error('Failed to toggle task', error);
        }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await api.calendar.deleteTask(taskId, userId);
            setTasks(tasks.filter(t => t._id !== taskId));
            audioService.playClick();
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    // Group tasks by date
    const groupedTasks = tasks.reduce((acc, task) => {
        const date = new Date(task.date).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(task);
        return acc;
    }, {});

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
                    onClick={() => setShowNewTask(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700"
                >
                    + {t('calendar.addTask')}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">{t('calendar.loading')}</div>
                ) : (
                    <div className="max-w-md mx-auto space-y-6">
                        {Object.entries(groupedTasks).map(([date, dateTasks]) => (
                            <div key={date}>
                                <h3 className="font-semibold text-gray-500 mb-2 sticky top-0 bg-gray-50 py-1">{date}</h3>
                                <div className="space-y-2">
                                    {dateTasks.map(task => (
                                        <div key={task._id} className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 ${task.completed ? 'opacity-60 bg-gray-50' : ''}`}>
                                            <button onClick={() => toggleTask(task._id)} className="text-gray-400 hover:text-green-500 transition">
                                                {task.completed ?
                                                    <CheckCircle className="w-6 h-6 text-green-500" /> :
                                                    <Circle className="w-6 h-6" />
                                                }
                                            </button>
                                            <div className="flex-1">
                                                <h4 className={`font-medium text-gray-800 ${task.completed ? 'line-through' : ''}`}>
                                                    {task.title}
                                                </h4>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">
                                                    {task.type}
                                                </span>
                                            </div>
                                            <button onClick={() => deleteTask(task._id)} className="p-2 text-gray-300 hover:text-red-500 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
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

            {/* New Task Modal */}
            {showNewTask && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 animate-slide-up text-gray-900">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">{t('calendar.createTask')}</h2>

                        <div className="space-y-4">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('calendar.type')}</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        value={newTask.type}
                                        onChange={e => setNewTask({ ...newTask, type: e.target.value })}
                                    >
                                        <option value="watering">{t('calendar.watering')}</option>
                                        <option value="fertilizer">{t('calendar.fertilizer')}</option>
                                        <option value="pesticide">{t('calendar.pesticide')}</option>
                                        <option value="harvest">{t('calendar.harvest')}</option>
                                        <option value="other">{t('calendar.other')}</option>
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
