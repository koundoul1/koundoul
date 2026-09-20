import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Search, Plus, ThumbsUp, Eye, Clock,
  Award, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

const SUBJECTS = [
  { label: 'Tous', value: '' },
  { label: 'Maths', value: 'Mathématiques', icon: '📐' },
  { label: 'Physique', value: 'Physique', icon: '⚛️' },
  { label: 'Chimie', value: 'Chimie', icon: '🧪' }
];

const LEVELS = [
  { label: 'Tous niveaux', value: '' },
  { label: 'Seconde', value: 'Seconde' },
  { label: 'Première', value: 'Première' },
  { label: 'Terminale', value: 'Terminale' }
];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

export default function Forum() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [discussions, setDiscussions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);

  // Debounce la recherche pour ne pas spammer le backend
  useEffect(() => {
    const timer = setTimeout(() => { fetchDiscussions(); }, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [subject, level, page, search]);

  const fetchDiscussions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (subject) params.subject = subject;
      if (level) params.level = level;
      if (search.trim()) params.search = search.trim();
      const res = await api.forum.getDiscussions(params);
      setDiscussions(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    } catch (e) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubject = (val) => { setSubject(val); setPage(1); };
  const handleFilterLevel   = (val) => { setLevel(val);   setPage(1); };
  const handleSearch        = (val) => { setSearch(val);  setPage(1); };

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-kprimary" />
              Forum
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {pagination.total} discussion{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          {user && (
            <button
              onClick={() => navigate('/forum/new')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-kprimary to-ksecondary rounded-xl text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-kprimary/20"
            >
              <Plus className="w-4 h-4" />
              Nouvelle discussion
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Rechercher dans le forum..."
            className="w-full pl-11 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-kprimary/50 transition-colors"
          />
          {search && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="k-card p-4 mb-6 space-y-3">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Matière</p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(s => (
                <button
                  key={s.value}
                  onClick={() => handleFilterSubject(s.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    subject === s.value
                      ? 'bg-kprimary text-white shadow-md shadow-kprimary/30'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:border-kprimary/40 hover:text-white'
                  }`}
                >
                  {s.icon && <span className="mr-1">{s.icon}</span>}{s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Niveau</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => handleFilterLevel(l.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    level === l.value
                      ? 'bg-kprimary text-white shadow-md shadow-kprimary/30'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:border-kprimary/40 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-kprimary" />
          </div>
        ) : error ? (
          <div className="k-card p-10 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">{error}</p>
            <button onClick={fetchDiscussions} className="flex items-center gap-2 px-4 py-2 bg-kprimary rounded-xl text-white text-sm font-bold mx-auto">
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
          </div>
        ) : discussions.length === 0 ? (
          <div className="k-card p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">
              {search ? `Aucun résultat pour "${search}"` : 'Aucune discussion pour le moment'}
            </p>
            {user && !search && (
              <button
                onClick={() => navigate('/forum/new')}
                className="mt-4 px-5 py-2.5 bg-kprimary rounded-xl text-white text-sm font-bold hover:opacity-90"
              >
                Créer la première discussion
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {discussions.map(disc => (
              <button
                key={disc.id}
                onClick={() => navigate(`/forum/${disc.id}`)}
                className="k-card w-full p-5 text-left hover:border-kprimary/30 hover:bg-white/[0.03] transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Vote count */}
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0 w-10">
                    <ThumbsUp className="w-4 h-4 text-gray-500 group-hover:text-kprimary transition-colors" />
                    <span className="text-xs font-bold text-gray-400">{disc.votes ?? 0}</span>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-white text-sm leading-snug group-hover:text-kprimary transition-colors line-clamp-2">
                        {disc.title}
                      </h3>
                      <div className="flex-shrink-0 flex items-center gap-1.5">
                        {disc.solved && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                            <Award className="w-3 h-3" /> Résolu
                          </span>
                        )}
                        {disc.subject && (
                          <span className="px-2 py-0.5 rounded-full bg-kprimary/10 text-kprimary text-xs font-semibold">
                            {disc.subject}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-500 text-xs line-clamp-2 mb-3">{disc.content}</p>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-medium text-gray-400">
                        {disc.author?.username || disc.author?.name || 'Anonyme'}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {disc.repliesCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {disc.views ?? 0}
                      </span>
                      {disc.level && (
                        <>
                          <span>·</span>
                          <span>{disc.level}</span>
                        </>
                      )}
                      <span className="ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(disc.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-400">
              Page {page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
