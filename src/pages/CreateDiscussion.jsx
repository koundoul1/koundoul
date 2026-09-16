import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';

const SUBJECTS = [
  { label: '📐 Mathématiques', value: 'Mathématiques' },
  { label: '⚛️ Physique', value: 'Physique' },
  { label: '🧪 Chimie', value: 'Chimie' }
];

const LEVELS = [
  { label: 'Seconde', value: 'Seconde' },
  { label: 'Première', value: 'Première' },
  { label: 'Terminale', value: 'Terminale' }
];

export default function CreateDiscussion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: '',
    level: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    if (formData.content.trim().length < 20) {
      setError('Le contenu doit faire au moins 20 caractères.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await api.forum.create({
        title: formData.title.trim(),
        content: formData.content.trim(),
        subject: formData.subject || undefined,
        level: formData.level || undefined
      });
      navigate(`/forum/${response.data.id}`);
    } catch (err) {
      setError(err.message || 'Erreur lors de la publication.');
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = formData.title.trim().length > 0 && formData.content.trim().length >= 20;

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={() => navigate('/forum')}
          className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au forum
        </button>

        <div className="k-card p-6 sm:p-8">
          <h1 className="text-2xl font-black text-white mb-6">Nouvelle discussion</h1>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Titre */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex : Comment résoudre une équation du second degré ?"
                maxLength={200}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-kprimary/50 transition-colors"
                required
              />
              <p className="text-xs text-gray-600 mt-1 text-right">{formData.title.length}/200</p>
            </div>

            {/* Contenu */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                Description *
              </label>
              <textarea
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Décris ta question en détail, ce que tu as déjà essayé..."
                rows={7}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-kprimary/50 transition-colors resize-none"
                required
              />
              <p className={`text-xs mt-1 text-right ${formData.content.length >= 20 ? 'text-emerald-500' : 'text-gray-600'}`}>
                {formData.content.length} caractères (min. 20)
              </p>
            </div>

            {/* Matière */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                Matière (optionnel)
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, subject: formData.subject === s.value ? '' : s.value })}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      formData.subject === s.value
                        ? 'bg-kprimary text-white shadow-md shadow-kprimary/30'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:border-kprimary/40 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Niveau */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                Niveau (optionnel)
              </label>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map(l => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, level: formData.level === l.value ? '' : l.value })}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      formData.level === l.value
                        ? 'bg-kprimary text-white shadow-md shadow-kprimary/30'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:border-kprimary/40 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conseils */}
            <div className="px-4 py-3 rounded-xl bg-kprimary/5 border border-kprimary/15 text-xs text-gray-400 space-y-1">
              <p className="font-semibold text-kprimary/80 mb-1">💡 Conseils</p>
              <p>• Sois clair et précis dans ton titre</p>
              <p>• Décris ce que tu as déjà essayé</p>
              <p>• Reste respectueux et courtois</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate('/forum')}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-semibold text-sm hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || !isValid}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-kprimary to-ksecondary text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
