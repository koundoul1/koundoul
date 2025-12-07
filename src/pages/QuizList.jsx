import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Target, Play, Award, TrendingUp, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('SECONDE');

  const levels = [
    { value: 'SECONDE', label: 'Seconde' },
    { value: 'PREMIERE', label: 'Première' },
    { value: 'TERMINALE', label: 'Terminale' }
  ];

  const difficultyColors = {
    FACILE: 'bg-green-100 text-green-700 border-green-300',
    MOYEN: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    DIFFICILE: 'bg-orange-100 text-orange-700 border-orange-300',
    EXPERT: 'bg-red-100 text-red-700 border-red-300'
  };

  useEffect(() => {
    fetchData();
  }, [selectedLevel]);

  const fetchData = async () => {
    try {
      const [quizzesRes, statsRes] = await Promise.all([
        api.quiz.getAll({ level: selectedLevel }),
        api.quiz.getStats()
      ]);
      
      setQuizzes(quizzesRes.data);
      setStats(statsRes.data);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Hero (style Solver) */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-10 shadow-xl border border-white/10">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">🎯 Quiz intelligents</h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Entraîne-toi comme sur le résolveur: interface moderne, focus et retour immédiat.
              </p>
            </div>
            {/* Sélecteur de niveau en hero */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20 shadow-lg">
              <div className="flex gap-2 md:gap-3">
                {levels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedLevel(level.value)}
                    className={`px-4 md:px-5 py-2 rounded-lg font-semibold transition-all ${
                      selectedLevel === level.value
                        ? 'bg-white text-blue-700 shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-yellow-300" />
                <span className="text-3xl font-extrabold text-white">{stats.totalAttempts}</span>
              </div>
              <p className="text-blue-100 font-semibold">Quiz tentés</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-300" />
                <span className="text-3xl font-extrabold text-white">{stats.quizzesPassed}</span>
              </div>
              <p className="text-blue-100 font-semibold">Quiz réussis</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-300" />
                <span className="text-3xl font-extrabold text-white">{stats.successRate}%</span>
              </div>
              <p className="text-blue-100 font-semibold">Taux de réussite</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-orange-300" />
                <span className="text-3xl font-extrabold text-white">{stats.averageScore}</span>
              </div>
              <p className="text-blue-100 font-semibold">Score moyen</p>
            </div>
          </div>
        )}


        {/* Liste des quiz */}
        <h2 className="text-2xl font-bold text-white mb-6">
          Quiz disponibles ({quizzes.length})
        </h2>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Aucun quiz disponible pour ce niveau
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-blue-400/60 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{quiz.subject.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-blue-100">
                        {quiz.subject.name}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 bg-white/10 text-white ${difficultyColors[quiz.difficulty]}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <p className="text-blue-100 mb-4">
                  {quiz.description}
                </p>

                <div className="flex items-center gap-6 text-sm text-blue-100 mb-4">
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {quiz._count.questions} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {quiz.timeLimit} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {quiz.passingScore}% requis
                  </span>
                </div>

                <Link
                  to={`/quiz/${quiz.id}`}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-95 transition-all shadow-xl border border-white/10"
                >
                  <Play className="w-5 h-5" />
                  Commencer le quiz
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}


