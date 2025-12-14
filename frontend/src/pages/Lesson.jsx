import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Target, BookOpen, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import api from '../services/api';
import { useBadgeContext } from '../components/Layout';

export default function Lesson() {
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const chapterId = searchParams.get('chapterId');
  const navigate = useNavigate();
  const { showBadges } = useBadgeContext() || {};
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      console.log('🔍 Récupération de la leçon:', lessonId);
      // Ne pas passer chapterId si null
      const response = await api.content.getLesson(lessonId, chapterId || undefined);
      console.log('✅ Réponse API:', response);
      console.log('📄 Données leçon:', response.data);
      setLesson(response.data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement de la leçon:', error);
      // Afficher un message d'erreur plus détaillé
      if (error.message) {
        console.error('Message d\'erreur:', error.message);
      }
      if (error.response) {
        console.error('Réponse erreur:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const response = await api.content.completeLesson(lessonId, timeSpent);
      setCompleted(true);
      
      // Afficher les nouveaux badges
      if (response.data.newBadges && response.data.newBadges.length > 0 && showBadges) {
        showBadges(response.data.newBadges);
      }
      
      // Notification succès
      alert('🎉 Leçon complétée ! +5 XP');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate(`/courses/${lesson.chapter.subject.slug}/chapters/${lesson.chapter.slug}`);
      }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la validation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold mb-4">Leçon non trouvée</p>
          <p className="text-gray-600 text-sm mb-4">
            ID de la leçon: {lessonId}
          </p>
          <button
            onClick={() => navigate('/micro-lessons')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour aux micro-leçons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      
      {/* Header fixe */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{lesson.duration} min</span>
              </div>
              
              {!completed ? (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  Marquer comme complété
                </button>
              ) : (
                <div className="flex items-center gap-2 px-6 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Complété !
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* En-tête de la leçon */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center gap-2 mb-3 text-blue-200 text-sm">
              <span>{lesson.chapter.subject.icon}</span>
              <span>{lesson.chapter.subject.name}</span>
              <ChevronRight className="w-4 h-4" />
              <span>{lesson.chapter.title}</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {lesson.title}
            </h1>
            <p className="text-xl text-blue-100">
              {lesson.summary}
            </p>
          </div>

          {/* Objectifs d'apprentissage */}
          <div className="bg-white rounded-xl p-6 border-2 border-blue-200 mb-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
              <Target className="w-6 h-6 text-blue-600" />
              Objectifs d'apprentissage
            </h2>
            <ul className="space-y-2">
              {lesson.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contenu de la leçon (Markdown) */}
          <div className="bg-white rounded-xl p-8 border-2 border-gray-200 prose prose-lg max-w-none">
            {lesson.content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-4" {...props} />,
                  li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline ? (
                      <code className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono" {...props} />
                    ) : (
                      <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono" {...props} />
                    ),
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4" {...props} />
                  ),
                }}
              >
                {lesson.content}
              </ReactMarkdown>
            ) : (
              <div className="text-gray-500 text-center py-12">
                <p className="text-lg mb-2">⚠️ Contenu non disponible</p>
                <p className="text-sm">Cette leçon n'a pas encore de contenu.</p>
              </div>
            )}
          </div>

          {/* Actions en bas */}
          <div className="mt-8 flex items-center justify-between p-6 bg-white rounded-xl border-2 border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Leçon {lesson.order}
              </p>
              <p className="font-semibold text-gray-900">
                {lesson.title}
              </p>
            </div>
            
            {!completed && (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                J'ai compris, continuer
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
