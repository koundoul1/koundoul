import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Target, Award, ArrowLeft, Play, CheckCircle } from 'lucide-react';
import api from '../services/api';
import DownloadChapterButton from '../components/DownloadChapterButton';

export default function ChapterDetail() {
  const { slug, chapterSlug } = useParams();
  
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapter();
  }, [slug, chapterSlug]);

  const fetchChapter = async () => {
    try {
      const response = await api.content.getChapter(slug, chapterSlug);
      setChapter(response.data);
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

  if (!chapter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold">Chapitre non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header avec retour */}
        <Link 
          to={`/courses/${slug}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux chapitres
        </Link>

        {/* En-tête du chapitre */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">{chapter.subject.icon}</div>
            <div>
              <p className="text-blue-200 text-sm font-semibold">
                {chapter.subject.name} • {chapter.level}
              </p>
              <h1 className="text-4xl font-bold mb-4">
                {chapter.title}
              </h1>
              <DownloadChapterButton 
                chapterId={chapter.id} 
                chapterTitle={chapter.title} 
              />
            </div>
          </div>
          <p className="text-xl text-blue-100 mt-4">
            {chapter.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Colonne principale : Leçons */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-blue-600" />
              Leçons ({chapter.lessons.length})
            </h2>

            <div className="space-y-4">
              {chapter.lessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  to={`/lessons/${lesson.id}?chapterId=${chapter.id}`}
                  className="block bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {lesson.summary}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>⏱️ {lesson.duration} min</span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {lesson.objectives.length} objectifs
                        </span>
                      </div>
                    </div>
                    <Play className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar : Exercices */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-7 h-7 text-orange-500" />
              Exercices ({chapter.exercises.length})
            </h2>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <p className="text-gray-600 mb-4">
                Mets en pratique tes connaissances avec {chapter.exercises.length} exercices progressifs
              </p>

              <div className="space-y-3">
                {chapter.exercises.slice(0, 5).map((exercise, index) => (
                  <Link
                    key={exercise.id}
                    to={`/exercises/${exercise.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        Exercice {index + 1}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        exercise.difficulty === 'FACILE' ? 'bg-green-100 text-green-700' :
                        exercise.difficulty === 'MOYEN' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {exercise.title}
                    </p>
                  </Link>
                ))}
              </div>

              {chapter.exercises.length > 5 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  +{chapter.exercises.length - 5} autres exercices
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
