import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, Trophy } from 'lucide-react';
import api from '../services/api';

export default function QuizPlay() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    startQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const startQuiz = async () => {
    try {
      const response = await api.quiz.start(quizId);
      setQuiz(response.data.quiz);
      setAttempt(response.data.attempt);
      setTimeLeft(response.data.quiz.timeLimit * 60); // Convertir en secondes
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du démarrage du quiz');
      navigate('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const unanswered = quiz.questions.filter(q => !answers[q.id]);
    
    if (unanswered.length > 0) {
      setShowWarning(true);
      return;
    }

    submitQuiz();
  };

  const handleAutoSubmit = () => {
    submitQuiz();
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const response = await api.quiz.submit(attempt.id, answers);
      // Naviguer vers la page de résultats avec les données
      navigate(`/quiz/${quizId}/results`, { 
        state: { results: response.data } 
      });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la soumission');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft < 60) return 'text-red-200';
    if (timeLeft < 180) return 'text-orange-200';
    return 'text-white';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-300"></div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900">
      
      {/* Header fixe avec timer (style Solver) */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 sticky top-0 z-10 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {quiz.title}
              </h1>
              <p className="text-sm text-blue-100">
                Question {currentQuestion + 1} sur {quiz.questions.length}
              </p>
            </div>
            
            <div className={`flex items-center gap-3 px-6 py-3 rounded-lg font-extrabold text-2xl bg-white/10 backdrop-blur-md border border-white/20 ${getTimeColor()}`}>
              <Clock className="w-6 h-6" />
              <span className="text-white">{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-4 w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Question */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Question {currentQuestion + 1}
              </h2>
              <span className="px-4 py-2 bg-white/10 text-white rounded-lg font-semibold border border-white/20">
                {question.points} points
              </span>
            </div>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              {question.questionText}
            </p>

            {/* Options de réponse */}
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = answers[question.id] === option;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(question.id, option)}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-white/10 shadow-lg scale-[1.02]'
                        : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                        isSelected
                          ? 'border-blue-400 bg-blue-500 text-white'
                          : 'border-white/30 text-blue-200'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg text-blue-100">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
              ← Précédent
            </button>

            <div className="text-center">
              <p className="text-sm text-blue-200 mb-1">
                Questions répondues
              </p>
              <p className="text-2xl font-bold text-white">
                {answeredCount} / {quiz.questions.length}
              </p>
            </div>

            {currentQuestion < quiz.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/10"
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-95 transition-all shadow-xl disabled:opacity-50 border border-white/10"
              >
                {submitting ? 'Envoi...' : 'Terminer le quiz'}
              </button>
            )}
          </div>

          {/* Avertissement questions non répondues */}
          {showWarning && (
            <div className="mt-6 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-yellow-200 mb-2">
                    Questions non répondues
                  </h3>
                  <p className="text-yellow-100 mb-4">
                    Il reste {quiz.questions.length - answeredCount} question(s) sans réponse. 
                    Es-tu sûr de vouloir soumettre le quiz ?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={submitQuiz}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600"
                    >
                      Oui, soumettre quand même
                    </button>
                    <button
                      onClick={() => setShowWarning(false)}
                      className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20"
                    >
                      Continuer à répondre
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


