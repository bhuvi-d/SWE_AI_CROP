import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { api } from '../services/api';
import { audioService } from '../services/audioService';
import { ArrowLeft, MessageSquare, ThumbsUp as ThumbsUpIcon, Image as ImageIcon, Send, ArrowRight } from 'lucide-react';
import { preferencesService } from '../services/preferencesService';

const CommunityScreen = ({ onBack }) => {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [hotWords, setHotWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPostContent, setNewPostContent] = useState({ title: '', content: '', type: 'question' });
    
    // Filtering states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    
    const userId = preferencesService.getUserId();

    useEffect(() => {
        loadPosts();
        loadHotWords();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await api.community.getPosts();
            if (Array.isArray(data)) {
                setPosts(data);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error('Failed to load posts', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadHotWords = async () => {
        try {
            const data = await api.community.getHotWords();
            setHotWords(data);
        } catch (error) {
            console.error('Failed to load hot words', error);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.title || !newPostContent.content) return;

        try {
            await api.community.createPost({
                userId: userId,
                ...newPostContent
            });
            setShowNewPost(false);
            setNewPostContent({ title: '', content: '', type: 'question' });
            loadPosts();
            loadHotWords();
            audioService.playSoftAlert();
        } catch (error) {
            console.error('Failed to create post', error);
            audioService.playError();
        }
    };

    const handleLike = async (postId) => {
        try {
            const updatedLikes = await api.community.likePost(postId, userId);
            setPosts(posts.map(p =>
                p._id === postId ? { ...p, likes: updatedLikes } : p
            ));
            audioService.playClick();
        } catch (error) {
            console.error('Failed to like post', error);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || post.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10 transition-all duration-300">
                <button
                    onClick={onBack}
                    className="p-2.5 bg-white rounded-full text-gray-600 hover:bg-gray-100 transition active:scale-95 shadow-md border border-gray-100"
                >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">{t('community.title')}</h1>
                    <p className="text-xs text-gray-500 font-medium">Public Forum for All Farmers</p>
                </div>
                <button
                    onClick={() => setShowNewPost(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition active:scale-95 flex items-center gap-2"
                >
                    <span className="text-lg">+</span>
                    {t('community.newPost')}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
                
                {/* Sidebar - Hot Words & Filters */}
                <div className="w-full md:w-64 flex flex-col gap-4 overflow-y-auto pb-4">
                    
                    {/* Search Bar */}
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Search community..."
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none text-gray-800"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Send className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 rotate-45" />
                        </div>
                    </div>

                    {/* Filter Categories */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Categories</h3>
                        <div className="flex flex-col gap-1">
                            {['all', 'question', 'tip', 'success_story'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`text-left px-3 py-2 rounded-lg text-sm capitalize transition ${
                                        filterType === type 
                                            ? 'bg-green-50 text-green-700 font-bold' 
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hot Words / Trending */}
                    {hotWords.length > 0 && (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <span className="text-orange-500">🔥</span> Trending
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {hotWords.map(word => (
                                    <button
                                        key={word}
                                        onClick={() => setSearchQuery(word)}
                                        className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-medium border border-orange-100 hover:bg-orange-100 transition"
                                    >
                                        #{word}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Feed */}
                <div className="flex-1 overflow-y-auto px-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            {t('community.loading')}
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-2xl mx-auto pb-10">
                            {filteredPosts.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <MessageSquare className="w-12 h-12 text-green-200 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-gray-800">No posts found</h3>
                                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">Try a different search or filter, or be the first to post!</p>
                                </div>
                            ) : (
                                filteredPosts.map(post => (
                                    <div key={post._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                {post.user?.name?.[0] || 'G'}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{post.title}</h3>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {post.user?.name || 'Guest Farmer'} • {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${post.type === 'question' ? 'bg-orange-100 text-orange-700' :
                                                post.type === 'tip' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {post.type.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                                        {post.image && (
                                            <div className="rounded-xl overflow-hidden mb-4 border border-gray-100">
                                                <img src={post.image} alt="Post attachment" className="w-full max-h-80 object-cover hover:scale-105 transition duration-500" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                                            <button
                                                onClick={() => handleLike(post._id)}
                                                className={`flex items-center gap-2 text-sm transition-colors ${post.likes?.includes(userId) ? 'text-blue-600 font-bold scale-110' : 'text-gray-500 hover:text-blue-500'}`}
                                            >
                                                <ThumbsUpIcon className={`w-4 h-4 ${post.likes?.includes(userId) ? 'fill-blue-600' : ''}`} />
                                                <span>{post.likes?.length || 0}</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                                <span>{post.comments?.length || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* New Post Modal */}
            {showNewPost && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 animate-slide-up text-gray-900">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">{t('community.createPost')}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('community.postTitle')}</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white"
                                    placeholder={t('community.postTitlePlaceholder')}
                                    value={newPostContent.title}
                                    onChange={e => setNewPostContent({ ...newPostContent, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('community.postType')}</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white"
                                    value={newPostContent.type}
                                    onChange={e => setNewPostContent({ ...newPostContent, type: e.target.value })}
                                >
                                    <option value="question">{t('community.askQuestion')}</option>
                                    <option value="tip">{t('community.shareTip')}</option>
                                    <option value="success_story">{t('community.successStory')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('community.postContent')}</label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-32 resize-none text-gray-900 bg-white"
                                    placeholder={t('community.postContentPlaceholder')}
                                    value={newPostContent.content}
                                    onChange={e => setNewPostContent({ ...newPostContent, content: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowNewPost(false)}
                                    className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg border border-gray-200"
                                >
                                    {t('community.cancel')}
                                </button>
                                <button
                                    onClick={handleCreatePost}
                                    disabled={!newPostContent.title || !newPostContent.content}
                                    className="flex-1 py-2 bg-green-600 text-white font-medium rounded-lg disabled:opacity-50 hover:bg-green-700 transition"
                                >
                                    {t('community.post')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityScreen;
