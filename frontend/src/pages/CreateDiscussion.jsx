import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';

export default function CreateDiscussion() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'QUESTION',
    subjectId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.content.getSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await api.forum.create({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        subjectId: formData.subjectId || undefined
      });
      
      // Rediriger vers la discussion créée
      navigate(`/forum/${response.data.id}`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la discussion');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { value: 'QUESTION', label: '❓ Question', description: 'Poser une question sur un cours ou exercice' },
    { value: 'EXPLANATION', label: '💡 Explication', description: 'Partager une explication ou méthode' },
    { value: 'RESOURCE', label: '📚 Ressource', description: 'Partager une ressource utile' },
    { value: 'BUG', label: '🐛 Bug', description: 'Signaler un problème technique' },
    { value: 'OTHER', label: '💬 Autre', description: 'Discussion générale' }
  ];

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

        {/* Formulaire */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
            
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Nouvelle discussion
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Catégorie */}
              <div>
                <label className="block text-gray-700 font-semibold mb-3">
                  Catégorie *
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.category === cat.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">
                        {cat.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {cat.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Matière (optionnel) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Matière (optionnel)
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucune matière spécifique</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.icon} {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Comment résoudre une équation du second degré ?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength={200}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.title.length}/200 caractères
                </p>
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Décrivez votre question ou partagez vos idées en détail..."
                  rows="12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Minimum 20 caractères
                  </p>
                  <p className="text-sm text-gray-500">
                    {formData.content.length} caractères
                  </p>
                </div>
              </div>

              {/* Conseils */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">
                  💡 Conseils pour une bonne discussion
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Soyez clair et précis dans votre titre</li>
                  <li>Décrivez le contexte et ce que vous avez déjà essayé</li>
                  <li>Restez respectueux et courtois</li>
                  <li>Marquez la discussion comme résolue une fois que vous avez votre réponse</li>
                </ul>
              </div>

              {/* Boutons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/forum')}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.title.trim() || !formData.content.trim() || formData.content.length < 20}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {submitting ? 'Publication...' : 'Publier la discussion'}
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}


