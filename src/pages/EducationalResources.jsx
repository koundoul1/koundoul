/**
 * 📚 Page des Ressources Éducatives - KOUNDOUL
 * Interface pour consulter les constantes physiques, formules et conversions
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Calculator, 
  Infinity, 
  Search, 
  Copy, 
  Download,
  Filter,
  RefreshCw,
  Lightbulb,
  Zap,
  Atom,
  Thermometer,
  Waves,
  Globe
} from 'lucide-react';
import UnitConverter from '../components/UnitConverter';
import { ALL_PHYSICS_CONSTANTS, findConstantsByCategory } from '../data/physics-constants';
import { ALL_FORMULAS, findFormulasByDomain } from '../data/formulas';

const EducationalResources = () => {
  const [activeTab, setActiveTab] = useState('constants');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Utiliser les données locales
  const constants = Object.values(ALL_PHYSICS_CONSTANTS);
  const formulas = Object.values(ALL_FORMULAS);

  // Filtrer les constantes
  const filteredConstants = constants.filter(constant => {
    const matchesSearch = constant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         constant.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || constant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filtrer les formules
  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = formula.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.formula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Grouper les constantes par catégorie
  const constantsByCategory = filteredConstants.reduce((acc, constant) => {
    if (!acc[constant.category]) {
      acc[constant.category] = [];
    }
    acc[constant.category].push(constant);
    return acc;
  }, {});

  // Grouper les formules par catégorie
  const formulasByCategory = filteredFormulas.reduce((acc, formula) => {
    if (!acc[formula.category]) {
      acc[formula.category] = [];
    }
    acc[formula.category].push(formula);
    return acc;
  }, {});

  // Copier une constante dans le presse-papier
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Ici on pourrait ajouter une notification de succès
  };

  // Obtenir l'icône pour une catégorie
  const getCategoryIcon = (category) => {
    const icons = {
      fundamental: <Infinity className="h-5 w-5" />,
      electromagnetic: <Zap className="h-5 w-5" />,
      thermodynamic: <Thermometer className="h-5 w-5" />,
      particle: <Atom className="h-5 w-5" />,
      astronomical: <Globe className="h-5 w-5" />,
      conversion: <Calculator className="h-5 w-5" />,
      quantum: <Waves className="h-5 w-5" />,
      standard_model: <Atom className="h-5 w-5" />,
      spectroscopic: <Waves className="h-5 w-5" />
    };
    return icons[category] || <BookOpen className="h-5 w-5" />;
  };

  // Obtenir la couleur pour une catégorie
  const getCategoryColor = (category) => {
    const colors = {
      fundamental: 'text-purple-600 bg-purple-100',
      electromagnetic: 'text-yellow-600 bg-yellow-100',
      thermodynamic: 'text-red-600 bg-red-100',
      particle: 'text-blue-600 bg-blue-100',
      astronomical: 'text-green-600 bg-green-100',
      conversion: 'text-gray-600 bg-gray-100',
      quantum: 'text-indigo-600 bg-indigo-100',
      standard_model: 'text-pink-600 bg-pink-100',
      spectroscopic: 'text-orange-600 bg-orange-100'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950">
      {/* En-tête */}
      <div className="koundoul-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-orange-400 mr-3" />
              <h1 className="text-3xl font-bold koundoul-text-gradient">
                Ressources Éducatives
              </h1>
            </div>
            <p className="text-gray-300 text-lg">
              Fiches de révision, outils de conversion et constantes scientifiques
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onglets de navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-lg">
          {[
            { id: 'constants', label: 'Constantes', icon: <Infinity className="h-5 w-5" /> },
            { id: 'formulas', label: 'Formules', icon: <Calculator className="h-5 w-5" /> },
            { id: 'conversions', label: 'Conversions', icon: <RefreshCw className="h-5 w-5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Barre de recherche et filtres */}
        <div className="koundoul-card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une constante, formule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="koundoul-input w-full pl-10"
                />
              </div>
            </div>

            {/* Filtre par catégorie */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="koundoul-input w-full"
              >
                <option value="all">Toutes les catégories</option>
                <option value="fundamental">Fondamentales</option>
                <option value="electromagnetic">Électromagnétisme</option>
                <option value="thermodynamic">Thermodynamique</option>
                <option value="particle">Particules</option>
                <option value="astronomical">Astronomie</option>
                <option value="conversion">Conversions</option>
                <option value="quantum">Quantique</option>
              </select>
            </div>

            {/* Bouton de réinitialisation */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="koundoul-btn-secondary px-4 py-2 flex items-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        {activeTab === 'constants' && (
          <div className="space-y-6">
            {Object.entries(constantsByCategory).map(([category, categoryConstants]) => (
                <div key={category} className="koundoul-card">
                  <div className="flex items-center mb-4">
                    <div className={`p-2 rounded-lg mr-3 ${getCategoryColor(category)}`}>
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-200 capitalize">
                      {category.replace('_', ' ')}
                    </h3>
                    <span className="ml-auto text-sm text-gray-400">
                      {categoryConstants.length} constante{categoryConstants.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryConstants.map((constant, index) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-2xl font-bold text-blue-400 mr-2">
                              {constant.symbol}
                            </span>
                            <div>
                              <h4 className="font-medium text-gray-200">
                                {constant.description}
                              </h4>
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(`${constant.symbol} = ${constant.value.toExponential(3)} ${constant.unit}`)}
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-gray-300">
                            <span className="font-mono text-green-400">
                              {constant.value.toExponential(3)}
                            </span>
                            <span className="text-gray-500 ml-2">{constant.unit}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'formulas' && (
          <div className="space-y-6">
            {Object.entries(formulasByCategory).map(([category, categoryFormulas]) => (
              <div key={category} className="koundoul-card">
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-lg mr-3 ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-200 capitalize">
                    {category.replace('_', ' ')}
                  </h3>
                  <span className="ml-auto text-sm text-gray-400">
                    {categoryFormulas.length} formule{categoryFormulas.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-4">
                  {categoryFormulas.map((formula, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-200 mb-2">
                            {formula.description}
                          </h4>
                          <div className="bg-black/30 rounded p-3 font-mono text-green-400 text-lg">
                            {formula.formula}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(formula.formula)}
                          className="text-gray-400 hover:text-gray-200 transition-colors ml-4"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>

                      {formula.variables && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Variables :</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(formula.variables).map(([variable, description]) => (
                              <div key={variable} className="text-sm">
                                <span className="font-mono text-blue-400">{variable}</span>
                                <span className="text-gray-500 ml-2">{description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'conversions' && (
          <UnitConverter />
        )}
      </div>
    </div>
  );
};

export default EducationalResources;
