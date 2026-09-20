import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare,
  Award, Send, Eye, Clock, Loader2, AlertTriangle, RefreshCw
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
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const textareaRef = useRef(null);

  const [discussion,    setDiscussion]    = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [loadError,     setLoadError]     = useState(null);
  const [replyContent,  setReplyContent]  = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [replyError,    setReplyError]    = useState('');
  const [voteError,     setVoteError]     = useState('');
  // Suivi optimiste des votes de l'utilisateur { discId: ±1, replyId: ±1 }
  const [userVotes,     setUserVotes]     = useState({});
  const [votingId,      setVotingId]      = useState(null); // id en cours de vote

  useEffect(() => { fetchDiscussion(); }, [id]);

  const fetchDiscussion = async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const response = await api.forum.getDiscussion(id);
      setDiscussion(response.data);
    } catch (err) {
      setLoadError(err.message || 'Impossible de charger la discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteDiscussion = async (value) => {
    if (!user) return navigate('/login');
    if (votingId === 'disc') return;
    const key = `disc_${id}`;
    const currentVote = userVotes[key] ?? 0;
    const newVote     = currentVote === value ? 0 : value; // toggle

    // Mise à jour optimiste
    setUserVotes(v => ({ ...v, [key]: newVote }));
    setDiscussion(d => {
      const delta = newVote === 0 ? -currentVote : currentVote === 0 ? value : value * 2;
      return { ...d, votes: (d.votes ?? 0) + delta };
    });
    setVoteError('');
    setVotingId('disc');

    try {
      const res = await api.forum.voteDiscussion(id, value);
      // Synchroniser avec la valeur serveur réelle
      setDiscussion(d => ({ ...d, votes: res.votes ?? d.votes }));
      setUserVotes(v => ({ ...v, [key]: res.userVote ?? newVote }));
    } catch (e) {
      // Rollback
      setUserVotes(v => ({ ...v, [key]: currentVote }));
      setDiscussion(d => {
        const delta = newVote === 0 ? -currentVote : currentVote === 0 ? value : value * 2;
        return { ...d, votes: (d.votes ?? 0) - delta };
      });
      setVoteError('Erreur lors du vote. Réessaie.');
    } finally {
      setVotingId(null);
    }
  };

  const handleVoteReply = async (replyId, value) => {
    if (!user) return navigate('/login');
    if (votingId === replyId) return;
    const key         = `reply_${replyId}`;
    const currentVote = userVotes[key] ?? 0;
    const newVote     = currentVote === value ? 0 : value;

    // Mise à jour optimiste
    setUserVotes(v => ({ ...v, [key]: newVote }));
    setDiscussion(d => ({
      ...d,
      replies: d.replies.map(r => {
        if (r.id !== replyId) return r;
        const delta = newVote === 0 ? -currentVote : currentVote === 0 ? value : value * 2;
        return { ...r, votes: (r.votes ?? 0) + delta };
      })
    }));
    setVoteError('');
    setVotingId(replyId);

    try {
      const res = await api.forum.voteReply(replyId, value);
      setDiscussion(d => ({
        ...d,
        replies: d.replies.map(r =>
          r.id === replyId ? { ...r, votes: res.votes ?? r.votes } : r
        )
      }));
      setUserVotes(v => ({ ...v, [key]: res.userVote ?? newVote }));
    } catch (e) {
      // Rollback
      setUserVotes(v => ({ ...v, [key]: currentVote }));
      setDiscussion(d => ({
        ...d,
        replies: d.replies.map(r => {
          if (r.id !== replyId) return r;
          const delta = newVote === 0 ? -currentVote : currentVote === 0 ? value : value * 2;
          return { ...r, votes: (r.votes ?? 0) - delta };
        })
      }));
      setVoteError('Erreur lors du vote. Réessaie.');
    } finally {
      setVotingId(null);
    }
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
      await fetchDiscussion();
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
      await fetchDiscussion();
    } catch (e) {
      setVoteError(e.message || 'Erreur lors du marquage de la meilleure réponse');
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-kprimary" />
      </div>
    );
  }

  if (loadError || !discussion) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="k-card p-8 text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-gray-300 font-semibold mb-1">Discussion introuvable</p>
          <p className="text-gray-500 text-sm mb-5">{loadError || 'Cette discussion n\'existe pas ou a été supprimée.'}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={fetchDiscussion} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors">
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
            <button onClick={() => navigate('/forum')} className="px-4 py-2 rounded-xl bg-kprimary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              ← Forum
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor   = user && user.id === discussion.userId;
  const authorName = discussion.user?.username || discussion.user?.firstName || 'Anonyme';
  const discVote   = userVotes[`disc_${id}`] ?? 0;

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

        {/* Erreur vote globale */}
        {voteError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {voteError}
            <button onClick={() => setVoteError('')} className="ml-auto text-red-400 hover:text-red-300 text-lg leading-none">×</button>
          </div>
        )}

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
            {discussion.solved && (
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
              disabled={votingId === 'disc'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors text-sm ${
                discVote === 1
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 text-gray-400'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="font-bold">{discussion.votes ?? 0}</span>
            </button>
            <button
              onClick={() => handleVoteDiscussion(-1)}
              disabled={votingId === 'disc'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${
                discVote === -1
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400'
              }`}
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
              const replyVote   = userVotes[`reply_${reply.id}`] ?? 0;
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
                          disabled={votingId === reply.id}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors text-xs ${
                            replyVote === 1
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 text-gray-400'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="font-bold">{reply.votes ?? 0}</span>
                        </button>
                        <button
                          onClick={() => handleVoteReply(reply.id, -1)}
                          disabled={votingId === reply.id}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                            replyVote === -1
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400'
                          }`}
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
