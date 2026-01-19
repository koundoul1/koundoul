import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, CheckCircle, Award, Send } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DiscussionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  const fetchDiscussion = async () => {
    try {
      const response = await api.forum.getDiscussion(id);
      setDiscussion(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteDiscussion = async (value) => {
    try {
      await api.forum.voteDiscussion(id, value);
      fetchDiscussion();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleVoteReply = async (replyId, value) => {
    try {
      await api.forum.voteReply(replyId, value);
      fetchDiscussion();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;
    
    try {
      setSubmitting(true);
      await api.forum.reply(id, replyContent);
      setReplyContent('');
      fetchDiscussion();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkBestAnswer = async (replyId) => {
    if (!confirm('Marquer cette réponse comme la meilleure ?')) return;
    
    try {
      await api.forum.markBestAnswer(id, replyId);
      fetchDiscussion();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de marquer cette réponse');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-semibold">Discussion non trouvée</p>
        </div>
      </div>
    );
  }

  const isAuthor = user && user.id === discussion.userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Navigation */}
        <button
          onClick={() => navigate('/forum')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au forum
        </button>

        {/* Discussion principale */}
        <div className="bg-white rounded-xl p-8 border-2 border-gray-200 mb-6">
          
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {discussion.user.username.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {discussion.title}
                </h1>
                {discussion.solved && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Résolu
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-gray-600">
                <span className="font-semibold text-blue-600">{discussion.user.username}</span>
                <span>•</span>
                <span>{new Date(discussion.createdAt).toLocaleDateString('fr-FR')}</span>
                {discussion.subject && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>{discussion.subject.icon}</span>
                      {discussion.subject.name}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{discussion.views} vues</span>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="prose max-w-none mb-6">
            <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
              {discussion.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <button
              onClick={() => handleVoteDiscussion(1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors"
            >
              <ThumbsUp className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">{discussion.upvotes}</span>
            </button>
            
            <button
              onClick={() => handleVoteDiscussion(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ThumbsDown className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 text-gray-600">
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold">{discussion.repliesCount} réponses</span>
            </div>
          </div>
        </div>

        {/* Réponses */}
        <div className="space-y-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-blue-600" />
            Réponses ({discussion.replies.length})
          </h2>

          {discussion.replies.map((reply) => (
            <div
              key={reply.id}
              className={`bg-white rounded-xl p-6 border-2 ${
                reply.isBestAnswer ? 'border-green-400 bg-green-50' : 'border-gray-200'
              }`}
            >
              {reply.isBestAnswer && (
                <div className="flex items-center gap-2 text-green-700 font-semibold mb-4">
                  <Award className="w-5 h-5" />
                  Meilleure réponse
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                  {reply.user.username.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{reply.user.username}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  <p className="text-gray-800 mb-4 whitespace-pre-wrap">
                    {reply.content}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleVoteReply(reply.id, 1)}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900">{reply.upvotes}</span>
                    </button>
                    
                    <button
                      onClick={() => handleVoteReply(reply.id, -1)}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {isAuthor && !reply.isBestAnswer && (
                      <button
                        onClick={() => handleMarkBestAnswer(reply.id)}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-semibold transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        Marquer comme meilleure réponse
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {discussion.replies.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Aucune réponse pour le moment. Soyez le premier à répondre !
              </p>
            </div>
          )}
        </div>

        {/* Formulaire de réponse */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Votre réponse
          </h3>
          
          <form onSubmit={handleSubmitReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Écrivez votre réponse..."
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            ></textarea>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Envoi...' : 'Publier'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}


