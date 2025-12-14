import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { BookOpen, Clock, Target, CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function SubjectChapters() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || 'SECONDE';
  
  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug, level]);

  const fetchData = async () => {
    try {
      const [subjectRes, chaptersRes] = await Promise.all([
        api.content.getSubject(slug),
        api.content.getChapters(slug, level)
      ]);
      
      setSubject(subjectRes.data);
      setChapters(chaptersRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header avec retour */}
        <Link 
          to="/courses"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux cours
        </Link>

        {/* Info Matière */}
        <div className="bg-white rounded-2xl p-8 mb-8 border-2 border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{subject?.icon}</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {subject?.name}
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Niveau : {level}
              </p>
            </div>
          </div>
          <p className="text-gray-700">
            {subject?.description}
          </p>
        </div>

        {/* Liste des Chapitres */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📖 Chapitres ({chapters.length})
        </h2>

        <div className="grid gap-6">
          {chapters.map((chapter, index) => {
            const isLocked = false; // TODO: Implémenter la logique de verrouillage
            
            return (
              <div
                key={chapter.id}
                className={`bg-white rounded-xl p-6 border-2 transition-all ${
                  isLocked
                    ? 'border-gray-200 opacity-60'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start gap-6">
                  
                  {/* Numéro du chapitre */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${
                    isLocked ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white'
                  }`}>
                    {isLocked ? <Lock className="w-6 h-6" /> : index + 1}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {chapter.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {chapter.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {chapter._count.lessons} leçons
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {chapter._count.exercises} exercices
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        ~{chapter._count.lessons * 20} min
                      </span>
                    </div>

                    {/* Action */}
                    {isLocked ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm">
                          Complète le chapitre précédent pour débloquer
                        </span>
                      </div>
                    ) : (
                      <Link
                        to={`/courses/${slug}/chapters/${chapter.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                      >
                        Commencer le chapitre
                        <CheckCircle className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}


