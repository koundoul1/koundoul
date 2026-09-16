import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare,
  Award, Send, Eye, Clock, Loader2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

function Avatar({ name, size = 'md' }) {
  const letter = (name || '?').charAt(0).toUpperCase();
  const s = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-kprimary to-ksecondary flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {letter}
    </div>
  );
}

export default function DiscussionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const textareaRef = useRef(null);

  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');

  useEffect(() => { fetchDiscussion(); }, [id]);

  const fetchDiscussion = async () => {
    try {
      const response = await api.forum.getDiscussion(id);
      setDiscussion(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteDiscussion = async (value) => {
    if (!user) return navigate('/login');
    try {
      await api.forum.voteDiscussion(id, value);
      fetchDiscussion();
    } catch (e) { console.error(e); }
  };

  const handleVoteReply = async (replyId, value) => {
    if (!user) return navigate('/login');
    try {
      await api.forum.voteReply(replyId, value);
      fetchDiscussion();
    } catch (e) { console.error(e); }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    if (!user) return navigate('/login');
    try {
      setSubmitting(true);
      setReplyError('');
      await api.forum.reply(id, replyContent.trim());
      setReplyContent('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      fetchDiscussion();
    } catch (err) {
      setReplyError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkBestAnswer = async (replyId) => {
    if (!window.confirm('Marquer cette réponse comme la meilleure ?')) return;
    try {
      await api.forum.markBestAnswer(id, replyId);
      fetchDiscussion();
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-kprimary" />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="k-card p-8 text-center max-w-md">
          <p className="text-red-400 font-semibold mb-3">Discussion non trouvée</p>
          <button onClick={() => navigate('/forum')} className="text-kprimary hover:underline text-sm">
            ← Retour au forum
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = user && user.id === discussion.userId;
  const authorName = discussion.user?.username || discussion.user?.firstName || 'Anonyme';

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={() => navigate('/forum')}
          className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Forum
        </button>

        {/* Main discussion */}
        <div className="k-card p-6 sm:p-8 mb-6">
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {discussion.subject && (
              <span className="px-2.5 py-1 rounded-full bg-kprimary/10 text-kprimary text-xs font-semibold">
                {discussion.subject}
              </span>
            )}
            {discussion.level && (
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
                {discussion.level}
              </span>
            )}
            {discussion.bestAnswerId && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <Award className="w-3 h-3" /> Résolu
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white mb-4 leading-tight">
            {discussion.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3 mb-5">
            <Avatar name={authorName} />
            <div>
              <p className="text-sm font-bold text-white">{authorName}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo(discussion.createdAt)}
                <span className="mx-1">·</span>
                <Eye className="w-3 h-3" /> {discussion.views ?? 0} vues
              </p>
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm mb-6">
            {discussion.content}
          </p>

          {/* Vote actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
            <button
              onClick={() => handleVoteDiscussion(1)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 text-gray-400 transition-colors text-sm"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="font-bold">{discussion.votes ?? 0}</span>
            </button>
            <button
              onClick={() => handleVoteDiscussion(-1)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2 text-gray-500 text-sm">
              <MessageSquare className="w-4 h-4" />
              {discussion.replies?.length ?? 0} réponse{discussion.replies?.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Replies */}
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-kprimary" />
          Réponses ({discussion.replies?.length ?? 0})
        </h2>

        <div className="space-y-3 mb-6">
          {discussion.replies?.length === 0 ? (
            <div className="k-card p-10 text-center">
              <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Aucune réponse pour le moment. Soyez le premier !</p>
            </div>
          ) : (
            discussion.replies.map(reply => {
              const replyAuthor = reply.user?.username || reply.user?.firstName || 'Anonyme';
              return (
                <div
                  key={reply.id}
                  className={`k-card p-5 ${reply.isBestAnswer ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
                >
                  {reply.isBestAnswer && (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-3">
                      <Award className="w-4 h-4" /> Meilleure réponse
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Avatar name={replyAuthor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-white">{replyAuthor}</span>
                        <span className="text-xs text-gray-500">{timeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                        {reply.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVoteReply(reply.id, 1)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 text-gray-400 transition-colors text-xs"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="font-bold">{reply.votes ?? 0}</span>
                        </button>
                        <button
                          onClick={() => handleVoteReply(reply.id, -1)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition-colors"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        {isAuthor && !reply.isBestAnswer && (
                          <button
                            onClick={() => handleMarkBestAnswer(reply.id)}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors"
                          >
                            <Award className="w-3.5 h-3.5" /> Meilleure réponse
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply form */}
        <div className="k-card p-5">
          <h3 className="text-sm font-bold text-white mb-4">
            {user ? 'Votre réponse' : 'Connecte-toi pour répondre'}
          </h3>

          {!user ? (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl bg-kprimary text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Se connecter
            </button>
          ) : (
            <form onSubmit={handleSubmitReply}>
              {replyError && (
                <p className="text-red-400 text-xs mb-3">{replyError}</p>
              )}
              <textarea
                ref={textareaRef}
                value={replyContent}
                onChange={e => {
                  setReplyContent(e.target.value);
                  const el = textareaRef.current;
                  if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
                }}
                placeholder="Écris ta réponse ici..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-kprimary/50 transition-colors resize-none mb-3"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-kprimary to-ksecondary text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Envoi...' : 'Publier'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
