/**
 * 🎯 Défi - KOUNDOUL
 * Génération infinie d'exercices avec correction détaillée
 */

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Clock, 
  Trophy,
  TrendingUp,
  Brain,
  Calculator,
  Zap,
  Award,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Settings
} from 'lucide-react';
import api from '../services/api';

const SmartExercises = () => {
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [currentExercise, setCurrentExercise] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [totalExercises, setTotalExercises] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [dbExercises, setDbExercises] = useState([]);
  const [dbQCMs, setDbQCMs] = useState([]);
  const [loadingDB, setLoadingDB] = useState(false);

  // Charger les exercices et QCM depuis la base de données
  useEffect(() => {
    const loadDBExercises = async () => {
      try {
        setLoadingDB(true);
        
        // Mapper matières
        const subjectMap = {
          'mathematics': 'Mathématiques',
          'physics': 'Physique',
          'chemistry': 'Chimie'
        };
        
        const levelMap = {
          'easy': 'Seconde',
          'medium': 'Première',
          'hard': 'Terminale'
        };
        
        const currentSubject = subjectMap[selectedSubject] || 'Mathématiques';
        const currentLevel = levelMap[selectedDifficulty] || 'Première';
        
        // Charger toutes les banques correspondantes
        const banksRes = await api.questionBanks.list({
          subject: currentSubject,
          level: currentLevel
        });
        
        const banks = banksRes.data || [];
        let allExercises = [];
        let allQCMs = [];
        
        // Pour chaque banque, charger les exercices et QCM
        for (const bank of banks) {
          if (bank.type === 'Exercices') {
            const exRes = await api.questionBanks.getExercises(bank.id, { limit: 100 });
            allExercises = [...allExercises, ...(exRes.data || [])];
          } else if (bank.type === 'QCM') {
            const qcmRes = await api.questionBanks.getQCM(bank.id, { limit: 100 });
            allQCMs = [...allQCMs, ...(qcmRes.data || [])];
          }
        }
        
        setDbExercises(allExercises);
        setDbQCMs(allQCMs);
        
      } catch (error) {
        console.error('Erreur chargement exercices DB:', error);
      } finally {
        setLoadingDB(false);
      }
    };
    
    loadDBExercises();
  }, [selectedSubject, selectedDifficulty]);

  // Générateur d'exercices (simulation)
  const generateExercise = (subject, difficulty) => {
    // Priorité 1 : Exercices de la base de données
    if (dbExercises.length > 0) {
      const randomIndex = Math.floor(Math.random() * dbExercises.length);
      const dbEx = dbExercises[randomIndex];
      
      // Transformer le format DB vers le format attendu
      return {
        id: dbEx.id,
        question: dbEx.problem || dbEx.statement || dbEx.question,
        type: 'database',
        correctAnswer: dbEx.solution?.final_answer || null,
        explanation: dbEx.solution?.explanation || 'Voir la solution détaillée ci-dessous',
        steps: dbEx.solution?.steps || [],
        hints: dbEx.hints || [],
        points: dbEx.points || 10,
        source: 'database'
      };
    }
    
    // Priorité 2 : QCMs de la base de données (transformés en exercices)
    if (dbQCMs.length > 0) {
      const randomIndex = Math.floor(Math.random() * dbQCMs.length);
      const dbQCM = dbQCMs[randomIndex];
      
      return {
        id: dbQCM.id,
        question: dbQCM.question,
        type: 'qcm',
        correctAnswer: dbQCM.options && dbQCM.correct_answer !== undefined 
          ? dbQCM.options[dbQCM.correct_answer] 
          : null,
        explanation: dbQCM.explanation || 'Aucune explication disponible',
        steps: [],
        hints: [],
        points: dbQCM.points || 10,
        options: dbQCM.options || [],
        correct_answer: dbQCM.correct_answer,
        source: 'database-qcm'
      };
    }
    
    // Fallback : Exercices statiques si aucun exercice DB disponible
    const exercises = {
      mathematics: {
        easy: [
          {
            id: Date.now(),
            question: "Résolvez l'équation : 2x + 5 = 13",
            type: 'algebra',
            correctAnswer: '4',
            explanation: 'Pour résoudre 2x + 5 = 13, on soustrait 5 des deux côtés : 2x = 8, puis on divise par 2 : x = 4',
            steps: [
              '2x + 5 = 13',
              '2x = 13 - 5',
              '2x = 8',
              'x = 8 ÷ 2',
              'x = 4'
            ],
            hints: [
              'Commencez par isoler le terme en x',
              'Soustrayez 5 des deux côtés de l\'équation',
              'Divisez ensuite par le coefficient de x'
            ],
            estimatedTime: 120 // 2 minutes
          },
          {
            id: Date.now() + 1,
            question: "Calculez l'aire d'un rectangle de longueur 8 cm et largeur 5 cm",
            type: 'geometry',
            correctAnswer: '40',
            explanation: 'L\'aire d\'un rectangle se calcule par longueur × largeur = 8 × 5 = 40 cm²',
            steps: [
              'Aire = longueur × largeur',
              'Aire = 8 × 5',
              'Aire = 40 cm²'
            ],
            hints: [
              'Utilisez la formule Aire = longueur × largeur',
              'Multipliez les deux dimensions',
              'N\'oubliez pas l\'unité cm²'
            ],
            estimatedTime: 60
          }
        ],
        medium: [
          {
            id: Date.now(),
            question: "Résolvez l'équation du second degré : x² - 5x + 6 = 0",
            type: 'quadratic',
            correctAnswer: '2,3',
            explanation: 'En factorisant : (x-2)(x-3) = 0, donc x = 2 ou x = 3',
            steps: [
              'x² - 5x + 6 = 0',
              'On cherche deux nombres qui multipliés donnent 6 et additionnés donnent -5',
              'Ces nombres sont -2 et -3',
              '(x - 2)(x - 3) = 0',
              'x - 2 = 0 ou x - 3 = 0',
              'x = 2 ou x = 3'
            ],
            hints: [
              'Essayez de factoriser le polynôme',
              'Cherchez deux nombres qui multipliés donnent 6',
              'Ces nombres additionnés doivent donner -5'
            ],
            estimatedTime: 300
          }
        ],
        hard: [
          {
            id: Date.now(),
            question: "Calculez la dérivée de f(x) = x³ + 2x² - 5x + 3",
            type: 'calculus',
            correctAnswer: '3x² + 4x - 5',
            explanation: 'En appliquant la règle de dérivation : f\'(x) = 3x² + 4x - 5',
            steps: [
              'f(x) = x³ + 2x² - 5x + 3',
              'f\'(x) = 3x² + 4x - 5 + 0',
              'f\'(x) = 3x² + 4x - 5'
            ],
            hints: [
              'Utilisez la règle : (x^n)\' = nx^(n-1)',
              'La dérivée d\'une constante est 0',
              'La dérivée d\'une somme est la somme des dérivées'
            ],
            estimatedTime: 420
          }
        ]
      },
      physics: {
        easy: [
          {
            id: Date.now(),
            question: "Un objet de masse 2 kg est soumis à une force de 10 N. Calculez son accélération.",
            type: 'mechanics',
            correctAnswer: '5',
            explanation: 'D\'après la 2ème loi de Newton : F = ma, donc a = F/m = 10/2 = 5 m/s²',
            steps: [
              'F = ma (2ème loi de Newton)',
              'a = F/m',
              'a = 10 N / 2 kg',
              'a = 5 m/s²'
            ],
            hints: [
              'Utilisez la 2ème loi de Newton : F = ma',
              'Isolez l\'accélération : a = F/m',
              'Substituez les valeurs numériques'
            ],
            estimatedTime: 180
          }
        ],
        medium: [
          {
            id: Date.now(),
            question: "Un projectile est lancé horizontalement à 20 m/s d'une hauteur de 45 m. Calculez le temps de vol.",
            type: 'projectile',
            correctAnswer: '3',
            explanation: 'Le temps de vol dépend uniquement de la hauteur : t = √(2h/g) = √(2×45/9.81) ≈ 3 s',
            steps: [
              'Pour un mouvement horizontal, le temps de vol est : t = √(2h/g)',
              't = √(2 × 45 / 9.81)',
              't = √(90 / 9.81)',
              't = √9.17',
              't ≈ 3 s'
            ],
            hints: [
              'Le temps de vol ne dépend que de la hauteur initiale',
              'Utilisez la formule : t = √(2h/g)',
              'g = 9.81 m/s²'
            ],
            estimatedTime: 360
          }
        ],
        hard: [
          {
            id: Date.now(),
            question: "Un circuit RLC série a R=100Ω, L=0.5H, C=10μF. Calculez la fréquence de résonance.",
            type: 'electromagnetism',
            correctAnswer: '71.2',
            explanation: 'La fréquence de résonance est : f = 1/(2π√(LC)) = 1/(2π√(0.5×10×10⁻⁶)) ≈ 71.2 Hz',
            steps: [
              'f = 1/(2π√(LC))',
              'f = 1/(2π√(0.5 × 10 × 10⁻⁶))',
              'f = 1/(2π√(5 × 10⁻⁶))',
              'f = 1/(2π × 2.24 × 10⁻³)',
              'f ≈ 71.2 Hz'
            ],
            hints: [
              'Utilisez la formule de résonance : f = 1/(2π√(LC))',
              'Attention aux unités : μF = 10⁻⁶ F',
              'Calculez étape par étape'
            ],
            estimatedTime: 480
          }
        ]
      }
    };

    const subjectExercises = exercises[subject]?.[difficulty] || [];
    const randomIndex = Math.floor(Math.random() * subjectExercises.length);
    return subjectExercises[randomIndex];
  };

  // Démarrer un nouvel exercice
  const startNewExercise = () => {
    const exercise = generateExercise(selectedSubject, selectedDifficulty);
    setCurrentExercise(exercise);
    setUserAnswer('');
    setShowSolution(false);
    setIsCorrect(null);
    setTimeSpent(0);
    setIsTimerRunning(true);
  };

  // Vérifier la réponse
  const checkAnswer = () => {
    if (!currentExercise || !userAnswer) return;

    let correct = false;
    
    // Pour les QCM : comparer avec l'option correcte
    if (currentExercise.type === 'qcm' && currentExercise.options) {
      const correctOption = currentExercise.options[currentExercise.correct_answer];
      correct = userAnswer === correctOption;
    } 
    // Pour les exercices normaux avec correctAnswer
    else if (currentExercise.correctAnswer !== undefined && currentExercise.correctAnswer !== null) {
      // Normaliser les réponses pour une comparaison flexible
      const normalizeAnswer = (answer) => {
        let normalized = answer
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ''); // Supprimer tous les espaces
        
        // ÉTAPE 1 : Remplacer virgules décimales par points
        // Détection : chiffre, virgule, chiffre (ex: 6,5 → 6.5)
        normalized = normalized.replace(/(\d),(\d)/g, '$1.$2');
        
        // ÉTAPE 2 : Uniformiser séparateurs de liste (après décimales)
        normalized = normalized
          .replace(/[;:]/g, ',') // ; et : deviennent ,
          .replace(/u₀/g, 'u0') // Normaliser indices
          .replace(/u₁/g, 'u1')
          .replace(/u₂/g, 'u2')
          .replace(/u₃/g, 'u3')
          .replace(/médiane=/g, '') // Supprimer préfixes inutiles
          .replace(/médiane/g, '')
          .replace(/=/g, '='); // Garder =
        
        return normalized;
      };
      
      const normalizedUserAnswer = normalizeAnswer(userAnswer.trim());
      const normalizedCorrectAnswer = normalizeAnswer(currentExercise.correctAnswer);
      
      // Comparer directement
      correct = normalizedUserAnswer === normalizedCorrectAnswer;
      
      // Si pas égal, vérifier si la réponse utilisateur contient tous les éléments clés
      if (!correct && normalizedCorrectAnswer.includes(',')) {
        const correctParts = normalizedCorrectAnswer.split('(')[0].split(',').map(p => p.trim()).filter(Boolean);
        const userParts = normalizedUserAnswer.split(',').map(p => p.trim()).filter(Boolean);
        
        // Vérifier si toutes les parties essentielles sont présentes
        correct = correctParts.every(part => 
          userParts.some(userPart => userPart.includes(part) || part.includes(userPart))
        );
      }
    } 
    // Exercices sans réponse définie (accepter toute réponse)
    else {
      correct = true;
    }
    
    setIsCorrect(correct);
    
    if (correct) {
      setStreak(streak + 1);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setStreak(0);
    }
    
    setTotalExercises(totalExercises + 1);
    setIsTimerRunning(false);
    
    // Ajouter à l'historique
    setExerciseHistory([{
      exercise: currentExercise,
      userAnswer,
      isCorrect: correct,
      timeSpent,
      timestamp: new Date()
    }, ...exerciseHistory.slice(0, 9)]);
  };

  // Gestion du timer
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Démarrer un exercice au chargement
  useEffect(() => {
    startNewExercise();
  }, [selectedSubject, selectedDifficulty]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const accuracy = totalExercises > 0 ? ((correctAnswers / totalExercises) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 text-gray-100">
      {/* Header */}
      <div className="koundoul-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 text-orange-400 mr-3" />
              <h1 className="text-3xl font-bold koundoul-text-gradient">
                Défi
              </h1>
            </div>
            <p className="text-gray-300 text-lg">
              Génération infinie d'exercices avec correction détaillée
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Statistiques */}
          <div className="lg:col-span-1 space-y-6">
            {/* Statistiques générales */}
            <div className="koundoul-card">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                Statistiques
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Exercices:</span>
                  <span className="text-gray-200 font-medium">{totalExercises}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Réussis:</span>
                  <span className="text-green-400 font-medium">{correctAnswers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Précision:</span>
                  <span className="text-blue-400 font-medium">{accuracy}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Série:</span>
                  <span className="text-orange-400 font-medium">{streak}</span>
                </div>
              </div>
            </div>

            {/* Paramètres */}
            <div className="koundoul-card">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-400" />
                Paramètres
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Matière
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="koundoul-input w-full"
                  >
                    <option value="mathematics">Mathématiques</option>
                    <option value="physics">Physique</option>
                    <option value="chemistry">Chimie</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulté
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="koundoul-input w-full"
                  >
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
                
                {/* Indicateur de source */}
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-xs text-green-400 font-medium">
                    ✨ {dbExercises.length + dbQCMs.length} exercices chargés depuis la base
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {dbExercises.length} exercices • {dbQCMs.length} QCM
                  </p>
                </div>
              </div>
            </div>

            {/* Historique récent */}
            <div className="koundoul-card">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-400" />
                Récent
              </h3>
              <div className="space-y-2">
                {exerciseHistory.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 truncate">
                      {item.exercise.question.substring(0, 30)}...
                    </span>
                    <div className="flex items-center">
                      {item.isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-6">
            {currentExercise && (
              <>
                {/* Exercice actuel */}
                <div className="koundoul-card">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <span className="text-gray-300">
                          {isTimerRunning ? formatTime(timeSpent) : 'Arrêté'}
                        </span>
                      </div>
                      {currentExercise.estimatedTime && (
                        <div className="flex items-center space-x-2">
                          <Target className="h-5 w-5 text-green-400" />
                          <span className="text-gray-300">
                            {currentExercise.estimatedTime}s estimé
                          </span>
                        </div>
                      )}
                      {currentExercise.source === 'database' && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                          📚 Base de données
                        </span>
                      )}
                      {currentExercise.source === 'database-qcm' && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                          ✓ QCM
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={startNewExercise}
                      className="koundoul-btn-secondary flex items-center px-4 py-2"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Nouvel exercice
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-200 mb-4">
                        {currentExercise.question}
                      </h2>
                      
                      {/* Options QCM ou Input texte */}
                      {currentExercise.type === 'qcm' && currentExercise.options ? (
                        <div className="space-y-3 mb-6">
                          {currentExercise.options.map((option, index) => {
                            const optionId = String.fromCharCode(65 + index); // A, B, C, D
                            const isSelected = userAnswer === option;
                            const isCorrectOption = currentExercise.correct_answer === index;
                            const showFeedback = isCorrect !== null;
                            
                            return (
                              <button
                                key={index}
                                onClick={() => setUserAnswer(option)}
                                disabled={isCorrect !== null}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                  showFeedback && isCorrectOption
                                    ? 'bg-green-500/20 border-green-500 text-green-100'
                                    : showFeedback && isSelected && !isCorrectOption
                                    ? 'bg-red-500/20 border-red-500 text-red-100'
                                    : isSelected
                                    ? 'bg-blue-500/20 border-blue-500 text-white'
                                    : 'bg-white/5 border-white/20 text-gray-200 hover:bg-white/10'
                                } ${isCorrect !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <span className="font-bold mr-2">{optionId}.</span>
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="mb-6">
                          <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Votre réponse..."
                            className="koundoul-input w-full text-lg"
                            disabled={isCorrect !== null}
                          />
                        </div>
                      )}

                      <div className="flex space-x-4">
                        <button
                          onClick={checkAnswer}
                          disabled={!userAnswer || isCorrect !== null}
                          className="koundoul-btn-primary flex items-center px-6 py-3"
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Vérifier
                        </button>
                        
                        <button
                          onClick={() => setShowSolution(!showSolution)}
                          className="koundoul-btn-secondary flex items-center px-6 py-3"
                        >
                          <Lightbulb className="h-5 w-5 mr-2" />
                          {showSolution ? 'Masquer' : 'Voir'} la solution
                        </button>
                      </div>
                    </div>

                    {/* Feedback */}
                    {isCorrect !== null && (
                      <div className={`p-4 rounded-lg border ${
                        isCorrect 
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        <div className="flex items-center mb-2">
                          {isCorrect ? (
                            <CheckCircle className="h-6 w-6 mr-2" />
                          ) : (
                            <XCircle className="h-6 w-6 mr-2" />
                          )}
                          <span className="font-semibold">
                            {isCorrect ? 'Correct !' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-gray-300">
                          {isCorrect 
                            ? 'Excellente réponse ! Vous avez bien compris le concept.'
                            : (currentExercise.correctAnswer 
                              ? `La bonne réponse était : ${currentExercise.correctAnswer}`
                              : 'Vous pouvez maintenant consulter la solution détaillée ci-dessous.')
                          }
                        </p>
                      </div>
                    )}

                    {/* Solution */}
                    {showSolution && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                          <Lightbulb className="h-5 w-5 mr-2" />
                          Solution détaillée
                        </h3>
                        
                        <div className="space-y-4">
                          <p className="text-gray-300">
                            {currentExercise.explanation}
                          </p>
                          
                          <div>
                            <h4 className="font-medium text-gray-200 mb-2">Étapes :</h4>
                            <ol className="list-decimal list-inside space-y-1 text-gray-300">
                              {currentExercise.steps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-200 mb-2">Indices :</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-300">
                              {currentExercise.hints.map((hint, index) => (
                                <li key={index}>{hint}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartExercises;
