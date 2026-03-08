import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { api } from '../services/api';
import { audioService } from '../services/audioService';
import { ArrowLeft, MessageSquare, ThumbsUp as ThumbsUpIcon, Image as ImageIcon, Send, ArrowRight } from 'lucide-react';
import { preferencesService } from '../services/preferencesService';

const CommunityScreen = ({ onBack }) => {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPostContent, setNewPostContent] = useState({ title: '', content: '', type: 'question' });
    const userId = preferencesService.getUserId();

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await api.community.getPosts();
            if (Array.isArray(data)) {
                setPosts(data);
            } else {
                console.error('Invalid posts data received:', data);
                setPosts([]);
            }
        } catch (error) {
            console.error('Failed to load posts', error);
            setPosts([]);
        } finally {
            setLoading(false);
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
            audioService.playSuccess();
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
                <h1 className="text-2xl font-bold flex-1 text-gray-800">{t('community.title')}</h1>
                <button
                    onClick={() => setShowNewPost(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-green-700"
                >
                    + {t('community.newPost')}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">{t('community.loading')}</div>
                ) : (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {posts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                                <MessageSquare className="w-12 h-12 text-green-200 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-gray-800">{t('community.noPosts')}</h3>
                                <p className="text-gray-500 mb-6 max-w-xs mx-auto">{t('community.beFirst')}</p>
                                <button
                                    onClick={() => setShowNewPost(true)}
                                    className="bg-green-600 text-white px-6 py-2 rounded-full font-medium shadow-sm hover:bg-green-700 transition"
                                >
                                    {t('community.createFirst')}
                                </button>
                            </div>
                        ) : (
                            posts.map(post => (
                                <div key={post._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                            {post.user?.name?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800">{post.title}</h3>
                                            <p className="text-xs text-gray-500">
                                                {post.user?.name || 'Unknown User'} • {new Date(post.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.type === 'question' ? 'bg-orange-100 text-orange-700' :
                                            post.type === 'tip' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {post.type}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                                    {post.image && (
                                        <img src={post.image} alt="Post attachment" className="rounded-lg mb-4 max-h-60 object-cover w-full" />
                                    )}

                                    <div className="flex items-center gap-6 pt-3 border-t border-gray-50">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`flex items-center gap-2 text-sm ${post.likes?.includes(userId) ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                                        >
                                            <ThumbsUpIcon className="w-4 h-4" />
                                            <span>{post.likes?.length || 0} {t('community.likes')}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-sm text-gray-500">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>{post.comments?.length || 0} {t('community.comments')}</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
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
