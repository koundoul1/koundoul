/**
 * 🚀 Fonctionnalités Avancées - KOUNDOUL
 * Hub central pour toutes les nouvelles fonctionnalités révolutionnaires
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Globe, 
  BookOpen, 
  Target, 
  Lightbulb,
  Zap,
  Sparkles,
  ArrowRight,
  Play,
  Camera,
  Calculator,
  Atom,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

const AdvancedFeatures = () => {
  const features = [
    {
      id: 'coach',
      title: 'Coach Virtuel',
      description: 'Prenez une photo de votre exercice et apprenez étape par étape',
      icon: <Brain className="h-8 w-8" />,
      path: '/coach',
      color: 'from-blue-600 to-purple-600',
      highlights: [
        'Analyse IA des exercices',
        'Questions guidées progressives',
        '3 niveaux d\'aide adaptatifs',
        'Validation étape par étape'
      ],
      status: 'Disponible',
      popularity: 95
    },
    {
      id: 'visualizations',
      title: 'Visualisations Interactives',
      description: 'Explorez les concepts scientifiques en 3D et en temps réel',
      icon: <Globe className="h-8 w-8" />,
      path: '/visualizations',
      color: 'from-green-600 to-blue-600',
      highlights: [
        'Graphiques 3D manipulables',
        'Laboratoire virtuel de physique',
        'Molécules 3D tournantes',
        'Simulations interactives'
      ],
      status: 'Disponible',
      popularity: 88
    },
    {
      id: 'micro-lessons',
      title: 'Micro-Leçons',
      description: 'Capsules d\'apprentissage de 5-10 minutes pour maîtriser les concepts clés',
      icon: <BookOpen className="h-8 w-8" />,
      path: '/micro-lessons',
      color: 'from-orange-600 to-red-600',
      highlights: [
        'Format snackable (5-10 min)',
        'Contrôles de vitesse (x0.5 à x2)',
        'Objectifs d\'apprentissage clairs',
        'Progression personnalisée'
      ],
      status: 'Disponible',
      popularity: 92
    },
    {
      id: 'smart-exercises',
      title: 'Défi',
      description: 'Génération infinie d\'exercices avec correction détaillée',
      icon: <Target className="h-8 w-8" />,
      path: '/defi',
      color: 'from-purple-600 to-pink-600',
      highlights: [
        'Génération infinie d\'exercices',
        'Correction détaillée avec explications',
        'Suivi de progression intelligent',
        'Mode chrono pour l\'entraînement'
      ],
      status: 'Disponible',
      popularity: 87
    },
    {
      id: 'why-it-works',
      title: 'Pourquoi ça marche ?',
      description: 'Découvrez les applications concrètes des concepts scientifiques',
      icon: <Lightbulb className="h-8 w-8" />,
      path: '/why-it-works',
      color: 'from-yellow-600 to-orange-600',
      highlights: [
        'Applications concrètes du quotidien',
        'Exemples du monde réel',
        'Liens entre théorie et pratique',
        'Vidéos explicatives interactives'
      ],
      status: 'Disponible',
      popularity: 90
    },
    {
      id: 'collaborative-learning',
      title: 'Apprentissage Collaboratif',
      description: 'Forum par niveau avec entraide entre élèves',
      icon: <Users className="h-8 w-8" />,
      path: '/forum',
      color: 'from-indigo-600 to-purple-600',
      highlights: [
        'Forum par niveau scolaire',
        'Modération par IA + tuteurs',
        'Système de réputation',
        'Entraide entre pairs'
      ],
      status: 'En développement',
      popularity: 78
    }
  ];

  const comingSoonFeatures = [
    {
      title: 'Préparation Examens',
      description: 'Annales commentées et simulations en conditions réelles',
      icon: <Award className="h-6 w-6" />,
      eta: 'Q2 2024'
    },
    {
      title: 'Mode Défi',
      description: 'Duels avec camarades et challenges hebdomadaires',
      icon: <TrendingUp className="h-6 w-6" />,
      eta: 'Q2 2024'
    },
    {
      title: 'Tableau de Bord Intelligent',
      description: 'Suivi de progression avec analyse prédictive',
      icon: <Zap className="h-6 w-6" />,
      eta: 'Q3 2024'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 text-gray-100">
      {/* Header */}
      <div className="koundoul-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-orange-400 mr-4" />
              <h1 className="text-4xl font-bold koundoul-text-gradient">
                Fonctionnalités Révolutionnaires
              </h1>
            </div>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              Découvrez les outils d'apprentissage les plus avancés pour maîtriser les sciences
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grille des fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={feature.path}
              className="group block"
            >
              <div className="koundoul-card p-6 h-full hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className={`w-full h-2 bg-gradient-to-r ${feature.color} rounded-t-lg -m-6 mb-6`} />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-lg`}>
                      {feature.icon}
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        feature.status === 'Disponible' 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {feature.status}
                      </span>
                      <div className="text-sm text-gray-400 mt-1">
                        {feature.popularity}% d'utilisation
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-200 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {feature.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <span className="text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                      Découvrir
                    </span>
                    <ArrowRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Fonctionnalités à venir */}
        <div className="koundoul-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-200 mb-4">
              Fonctionnalités à Venir
            </h2>
            <p className="text-gray-400 text-lg">
              Des innovations encore plus impressionnantes en développement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comingSoonFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-yellow-600/20 rounded-lg mr-3">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">
                      {feature.title}
                    </h3>
                    <span className="text-sm text-yellow-400">
                      {feature.eta}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Statistiques d'utilisation */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="koundoul-card p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">15,000+</div>
            <div className="text-gray-400">Étudiants actifs</div>
          </div>
          
          <div className="koundoul-card p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">500,000+</div>
            <div className="text-gray-400">Exercices résolus</div>
          </div>
          
          <div className="koundoul-card p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
            <div className="text-gray-400">Taux de satisfaction</div>
          </div>
          
          <div className="koundoul-card p-6 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
            <div className="text-gray-400">Disponibilité IA</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeatures;
