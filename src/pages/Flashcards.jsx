import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, TrendingUp, Flame, Play, Plus, BookOpen, Layers, ChevronLeft, ChevronRight, RotateCcw, Check, X, Loader2, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

// ── Flip Card Component ───────────────────────────────────────────────

function FlashcardView({ question, answer, isFlipped, onFlip }) {
  return (
    <div className="perspective-1000 w-full max-w-lg mx-auto" style={{ perspective: '1000px' }}>
      <div
        onClick={onFlip}
        className="relative w-full cursor-pointer transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '280px'
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-kprimary/20 to-ksecondary/20 border border-kprimary/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-xs text-kprimary font-medium mb-4 uppercase tracking-wide">Question</p>
          <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed">{question}</p>
          <p className="text-xs text-gray-500 mt-6">Clique pour retourner</p>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs text-emerald-400 font-medium mb-4 uppercase tracking-wide">Reponse</p>
          <p className="text-base sm:text-lg text-gray-200 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

// ── Review Buttons ────────────────────────────────────────────────────

function ReviewButtons({ onReview, disabled }) {
  return (
    <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mt-6">
      <button
        onClick={() => onReview(1)}
        disabled={disabled}
        className="py-3 px-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
      >
        Difficile
      </button>
      <button
        onClick={() => onReview(2)}
        disabled={disabled}
        className="py-3 px-4 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-semibold text-sm hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
      >
        Moyen
      </button>
      <button
        onClick={() => onReview(3)}
        disabled={disabled}
        className="py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
      >
        Facile
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function Flashcards() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('study');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadStats();
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      const res = await api.flashcards.getStats();
      setStats(res.data || res);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  const tabs = [
    { id: 'study', label: 'Etudier', icon: Play },
    { id: 'banks', label: 'Banque officielle', icon: BookOpen },
    { id: 'create', label: 'Mes cartes', icon: Plus },
  ];

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3 mb-1">
            <Brain className="w-8 h-8 text-kprimary" />
            Flashcards
          </h1>
          <p className="text-gray-400 text-sm">Revision espacee avec algorithme SM-2</p>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <Target className="w-5 h-5 text-kprimary mx-auto mb-1" />
              <p className="text-xl font-bold">{stats.dueCount || 0}</p>
              <p className="text-[11px] text-gray-500">A reviser</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-xl font-bold">{stats.mastered || 0}</p>
              <p className="text-[11px] text-gray-500">Maitrisees</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <Layers className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-bold">{stats.total || 0}</p>
              <p className="text-[11px] text-gray-500">Total</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-xl font-bold">{stats.retentionRate || 0}%</p>
              <p className="text-[11px] text-gray-500">Retention</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === id ? 'bg-kprimary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'study' && <StudyTab onStatsChange={loadStats} />}
        {tab === 'banks' && <BanksTab onStatsChange={loadStats} />}
        {tab === 'create' && <CreateTab onStatsChange={loadStats} />}
      </div>
    </div>
  );
}

// ── Study Tab ─────────────────────────────────────────────────────────

function StudyTab({ onStatsChange }) {
  const [cards, setCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [xpTotal, setXpTotal] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => { loadDue(); }, []);

  const loadDue = async () => {
    setLoading(true);
    try {
      const res = await api.flashcards.getDue(20);
      setCards(res.data || []);
      setCurrentIdx(0);
      setIsFlipped(false);
      setDone(false);
      setXpTotal(0);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  const handleReview = async (quality) => {
    if (reviewing || !cards[currentIdx]) return;
    setReviewing(true);
    try {
      const card = cards[currentIdx];
      const res = await api.flashcards.submitReview(card.id, quality);
      setXpTotal(prev => prev + (res.data?.xpEarned || 0));
    } catch (e) { /* ignore */ }
    setReviewing(false);
    setIsFlipped(false);

    if (currentIdx + 1 >= cards.length) {
      setDone(true);
      onStatsChange();
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-kprimary" /></div>;

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Pas de cartes a reviser</h3>
        <p className="text-sm text-gray-500 max-w-sm">Reviens demain ou ajoute de nouvelles cartes depuis la banque officielle.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-white mb-2">Session terminee !</h3>
        <p className="text-gray-400 mb-2">{cards.length} carte(s) revisee(s)</p>
        {xpTotal > 0 && <p className="text-yellow-400 font-semibold">+{xpTotal} XP gagnes</p>}
        <button onClick={loadDue} className="mt-6 px-5 py-2.5 bg-kprimary text-white rounded-xl font-medium hover:bg-kprimary/90">
          <RotateCcw className="w-4 h-4 inline mr-2" />Nouvelle session
        </button>
      </div>
    );
  }

  const card = cards[currentIdx];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-500">Carte {currentIdx + 1} / {cards.length}</span>
        <span className="text-xs text-gray-600">{card.chapter || card.subject}</span>
      </div>

      <FlashcardView
        question={card.front}
        answer={card.back}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
      />

      {isFlipped && <ReviewButtons onReview={handleReview} disabled={reviewing} />}

      {!isFlipped && (
        <p className="text-center text-xs text-gray-600 mt-4">Clique sur la carte pour voir la reponse</p>
      )}
    </div>
  );
}

// ── Banks Tab ─────────────────────────────────────────────────────────

function BanksTab({ onStatsChange }) {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => { loadBanks(); }, []);

  const loadBanks = async () => {
    try {
      const res = await api.flashcards.getAll({ limit: 0 });
      // Try banks endpoint
      try {
        const banksRes = await fetch(
          (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : 'http://localhost:5000/api') + '/flashcards/banks'
        );
        if (banksRes.ok) {
          const data = await banksRes.json();
          setBanks(data.data || []);
        }
      } catch (e) { /* fallback: no banks data */ }
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  const startDeck = async (subject, chapter) => {
    setStarting(subject + chapter);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : 'http://localhost:5000/api';
      const res = await fetch(base + '/flashcards/start-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ subject, chapter })
      });
      const data = await res.json();
      setMessage(data.created + ' carte(s) ajoutee(s). Va dans Etudier pour commencer !');
      onStatsChange();
    } catch (e) {
      setMessage('Erreur lors de l\'ajout');
    }
    setStarting(null);
  };

  const subjectColors = {
    'Mathematiques': 'from-blue-500/20 to-cyan-500/20 border-blue-500/20',
    'Physique': 'from-orange-500/20 to-red-500/20 border-orange-500/20',
    'Chimie': 'from-green-500/20 to-emerald-500/20 border-green-500/20',
  };

  const subjectIcons = {
    'Mathematiques': '📐',
    'Physique': '⚡',
    'Chimie': '🧪',
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-kprimary" /></div>;

  if (banks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BookOpen className="w-12 h-12 text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">Banque en chargement</h3>
        <p className="text-sm text-gray-500">Les 450 cartes officielles seront disponibles apres le seed du backend.</p>
      </div>
    );
  }

  // Group by subject
  const grouped = {};
  banks.forEach(b => {
    if (!grouped[b.subject]) grouped[b.subject] = [];
    grouped[b.subject].push(b);
  });

  return (
    <div>
      {message && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 text-center">
          {message}
        </div>
      )}

      {Object.entries(grouped).map(([subject, chapters]) => (
        <div key={subject} className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span>{subjectIcons[subject] || '📚'}</span>
            {subject}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {chapters.map((ch, i) => (
              <div key={i} className={`bg-gradient-to-br ${subjectColors[subject] || 'from-gray-500/20 to-gray-500/20 border-gray-500/20'} border rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{ch.chapter}</p>
                    <p className="text-xs text-gray-400">{ch.totalCards} cartes</p>
                  </div>
                  <button
                    onClick={() => startDeck(subject, ch.chapter)}
                    disabled={starting === subject + ch.chapter}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
                  >
                    {starting === subject + ch.chapter ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Commencer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Create Tab ────────────────────────────────────────────────────────

function CreateTab({ onStatsChange }) {
  const [showForm, setShowForm] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [saving, setSaving] = useState(false);
  const [myCards, setMyCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => { loadMyCards(); }, []);

  const loadMyCards = async () => {
    try {
      const res = await api.flashcards.getAll();
      const cards = (res.data || []).filter(c => !c.isOfficial);
      setMyCards(cards);
    } catch (e) { /* ignore */ }
    setLoadingCards(false);
  };

  const createCard = async () => {
    if (!front.trim() || !back.trim()) return;
    setSaving(true);
    try {
      await api.flashcards.create({ front: front.trim(), back: back.trim() });
      setFront('');
      setBack('');
      setShowForm(false);
      loadMyCards();
      onStatsChange();
    } catch (e) { /* ignore */ }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Mes cartes personnelles</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-kprimary text-white text-sm rounded-xl hover:bg-kprimary/90"
        >
          <Plus className="w-4 h-4" />
          Creer une carte
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Question (recto)</label>
              <textarea
                value={front}
                onChange={e => setFront(e.target.value)}
                placeholder="Ex: Quelle est la formule du discriminant ?"
                rows={2}
                className="w-full px-3 py-2 text-sm bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-kprimary resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Reponse (verso)</label>
              <textarea
                value={back}
                onChange={e => setBack(e.target.value)}
                placeholder="Ex: Delta = b2 - 4ac"
                rows={2}
                className="w-full px-3 py-2 text-sm bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-kprimary resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm bg-gray-800 text-gray-400 rounded-lg">Annuler</button>
              <button onClick={createCard} disabled={saving || !front.trim() || !back.trim()} className="px-4 py-2 text-sm bg-kprimary text-white rounded-lg disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Creer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingCards ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
      ) : myCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Plus className="w-12 h-12 text-gray-600 mb-3" />
          <h3 className="text-gray-400 font-medium mb-1">Aucune carte personnelle</h3>
          <p className="text-xs text-gray-500">Cree tes propres cartes pour reviser ce qui compte pour toi.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {myCards.map(card => (
            <div key={card.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-1">{card.front}</p>
              <p className="text-xs text-gray-400">{card.back}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded ${card.status === 'mastered' ? 'bg-emerald-500/20 text-emerald-400' : card.status === 'learning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {card.status || 'new'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
