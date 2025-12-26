/**
 * 👨‍👩‍👧‍👦 Dashboard Parents - KOUNDOUL
 * Interface de suivi pour les parents
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  Target,
  BookOpen,
  TrendingDown,
  Activity,
  Moon,
  Zap,
  Trophy,
  Lightbulb,
  Shield,
  Smile,
  Loader2
} from 'lucide-react';

const ParentDashboard = () => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [notificationLevel, setNotificationLevel] = useState(2); // 1: Minimal, 2: Standard, 3: Detaillé

  // Charger la liste des enfants
  useEffect(() => {
    loadChildren();
  }, []);

  // Charger le dashboard quand enfant sélectionné
  useEffect(() => {
    if (selectedChild) {
      loadDashboard(selectedChild.id);
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      setLoadingChildren(true);
      const response = await api.get('/parent/children');
      
      if (response.data.success) {
        const childrenData = response.data.data;
        setChildren(childrenData);
        
        // Sélectionner le premier enfant par défaut
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0]);
        }
      }
    } catch (error) {
      console.error('Erreur chargement enfants:', error);
    } finally {
      setLoadingChildren(false);
    }
  };

  const loadDashboard = async (childId) => {
    try {
      setLoadingDashboard(true);
      const response = await api.get(`/parent/dashboard/${childId}`);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Données par défaut si pas encore chargées
  const weeklySummary = dashboardData?.weeklySummary || {
    studyTime: '0h00',
    exercisesCompleted: 0,
    progression: 0,
    weeklyGoal: 0,
    daysActive: 0,
    consecutiveDays: 0
  };

  const subjectsProgress = dashboardData?.subjectsProgress || [];
  const strengths = dashboardData?.strengths || [];
  const weaknesses = dashboardData?.weaknesses || [];
  const alerts = dashboardData?.alerts || [];
  const examPreparation = dashboardData?.examPreparation || {
    simulatedScore: 0,
    progression: '+0',
    annalsCompleted: '0/0',
    chaptersMastered: '0/0'
  };
  const screenTime = dashboardData?.screenTime || {
    dailyAverage: '0 min',
    longSessions: 0,
    regularBreaks: true,
    nocturnalUsage: false,
    status: 'healthy'
  };
  const sharedGoals = dashboardData?.sharedGoals || [];
  const recommendations = dashboardData?.recommendations || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'alert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return '🟢';
      case 'warning': return '🟡';
      case 'alert': return '🔴';
      default: return '⚪';
    }
  };

  // Affichage du loading initial
  if (loadingChildren) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-900 text-lg font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  // Affichage si aucun enfant lié
  if (!loadingChildren && children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-lg">
          <Shield className="h-20 w-20 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Aucun enfant lié</h2>
          <p className="text-gray-700 mb-8">
            Pour commencer à suivre la progression de votre enfant, demandez-lui de générer un code d'invitation depuis son profil.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            En savoir plus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Shield className="h-8 w-8 text-blue-600 mr-3" />
                  Dashboard Parents
                </h1>
                <p className="text-gray-800 font-semibold mt-2">
                  Suivi bienveillant de {selectedChild?.name || 'votre enfant'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Sélecteur d'enfant */}
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold"
                  value={selectedChild?.id || ''}
                  onChange={(e) => {
                    const child = children.find(c => c.id === e.target.value);
                    setSelectedChild(child);
                  }}
                >
                  {children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.name} - Niveau {child.level}
                    </option>
                  ))}
                </select>
                <button className="p-2 text-gray-800 hover:text-gray-900 font-semibold">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Niveau de visibilité */}
                          <div className="mt-4 flex items-center space-x-4">
                <span className="text-sm text-gray-800 font-semibold">Niveau de visibilité :</span>
                <div className="flex space-x-2">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => setNotificationLevel(level)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      notificationLevel === level
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300 font-semibold'
                    }`}
                  >
                    Niveau {level} {level === 1 ? '🔒' : level === 2 ? '⚖️' : '🔍'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Résumé hebdomadaire */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Cette semaine
            </h2>
            {dashboardData && (
              <span className="text-sm text-white font-medium">
                {selectedChild?.name || 'Enfant'} - Niveau {selectedChild?.level || 1}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 mr-2" />
                <span className="text-sm font-semibold">Temps d'étude</span>
              </div>
              <div className="text-2xl font-bold">{weeklySummary.studyTime}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="text-sm font-semibold">Exercices complétés</span>
              </div>
              <div className="text-2xl font-bold">{weeklySummary.exercisesCompleted}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 mr-2" />
                <span className="text-sm font-semibold">Progression</span>
              </div>
              <div className={`text-2xl font-bold ${weeklySummary.progression >= 0 ? '' : 'text-red-200'}`}>
                {weeklySummary.progression >= 0 ? '+' : ''}{weeklySummary.progression}%
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="text-sm font-semibold">Jours actifs</span>
              </div>
              <div className="text-2xl font-bold">{weeklySummary.daysActive}/7</div>
            </div>
          </div>
        </div>

        {/* Alertes intelligentes */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'success'
                    ? 'bg-green-50 border-green-500'
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-start">
                  <alert.icon className={`h-5 w-5 mr-3 ${
                    alert.type === 'success' ? 'text-green-600' :
                    alert.type === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                  <p className="text-sm text-gray-800">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progression par matière */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Progression par Matière
              </h3>
              
              <div className="space-y-4">
                {subjectsProgress.map((subject, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-900">{subject.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${subject.status === 'good' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {subject.trend}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{subject.progress}%</span>
                        <span className="text-lg">{getStatusIcon(subject.status)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          subject.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Message si pas de données */}
              {subjectsProgress.length === 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">
                    Aucune activité enregistrée pour le moment. Les données de progression apparaîtront ici.
                  </p>
                </div>
              )}
            </div>

            {/* Points forts et faiblesses */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Analyse IA - Forces & Axes d'amélioration</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Points Forts
                  </h4>
                  <ul className="space-y-2">
                    {strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-900 font-medium flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-yellow-700 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Points à Surveiller
                  </h4>
                  <ul className="space-y-2">
                    {weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm text-gray-900 font-medium flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {recommendations.length === 0 && strengths.length === 0 && weaknesses.length === 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 text-center py-8">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">
                    Les analyses apparaîtront ici une fois que {selectedChild?.name || 'votre enfant'} aura complété quelques activités.
                  </p>
                </div>
              )}
            </div>

            {/* Engagement et motivation */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                Engagement & Motivation
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{weeklySummary.daysActive}</div>
                  <div className="text-xs text-gray-800 font-semibold mt-1">Jours actifs</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{weeklySummary.consecutiveDays}</div>
                  <div className="text-xs text-gray-800 font-semibold mt-1">Jours consécutifs 🔥</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData?.weeklySummary?.quizzesCompleted || 0}
                  </div>
                  <div className="text-xs text-gray-800 font-semibold mt-1">Quiz complétés</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {dashboardData?.weeklySummary?.lessonsCompleted || 0}
                  </div>
                  <div className="text-xs text-gray-800 font-semibold mt-1">Leçons complétées</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Préparation examens */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-red-600" />
                Préparation Examens
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-800 font-semibold">Simulation Bac</span>
                    <span className="text-lg font-bold text-gray-900">{examPreparation.simulatedScore}/20</span>
                  </div>
                  <div className="flex items-center text-xs text-green-600 font-semibold">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {examPreparation.progression} depuis le mois dernier
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-800 font-semibold">Annales complétées</span>
                    <span className="font-semibold">{examPreparation.annalsCompleted}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-800 font-semibold">Chapitres maîtrisés</span>
                    <span className="font-semibold">{examPreparation.chaptersMastered}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Temps d'écran */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Moon className="h-5 w-5 mr-2 text-indigo-600" />
                Santé Numérique
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-800 font-semibold">Temps quotidien moyen</span>
                  <span className="font-semibold">{screenTime.dailyAverage}</span>
                </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-800 font-semibold">Sessions superieures a 2h</span>
                    <span className="font-semibold text-green-600">{screenTime.longSessions} cette semaine ✓</span>
                  </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-800 font-semibold">Pauses régulières</span>
                  <span className="font-semibold text-green-600">Oui ✓</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    <Smile className="h-4 w-4 mr-2" />
                    Temps d'étude sain pour un lycéen
                  </div>
                </div>
              </div>
            </div>

            {/* Objectifs partagés */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-pink-600" />
                Objectifs Partagés
              </h3>
              
              <div className="space-y-4">
                {sharedGoals.map((goal, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-800 font-semibold">{goal.name}</span>
                      <span className="text-xs font-semibold text-gray-900">{goal.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommandations */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Recommandations Personnalisées</h3>
              
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="bg-white rounded-lg p-3">
                    <div className="flex items-start">
                      <rec.icon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">{rec.title}</div>
                        <div className="text-xs text-gray-900 font-medium">{rec.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Rapport mensuel */}
        <div className="mt-8 flex justify-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Générer le Rapport Mensuel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
