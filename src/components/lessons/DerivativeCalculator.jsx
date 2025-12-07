/**
 * 🧮 Calculatrice de Dérivée Interactive
 * Outil pour dériver des expressions exponentielles
 */

import React, { useState } from 'react';
import { Calculator, CheckCircle, XCircle, Lightbulb, RefreshCw, Plus } from 'lucide-react';

const DerivativeCalculator = () => {
  const [inputFunction, setInputFunction] = useState('exp(3x)');
  const [derivative, setDerivative] = useState('');
  const [steps, setSteps] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // Exemples pré-définis
  const examples = [
    { label: 'exp(x)', value: 'exp(x)' },
    { label: 'exp(3x)', value: 'exp(3x)' },
    { label: 'exp(x²)', value: 'exp(x^2)' },
    { label: 'exp(2x+1)', value: 'exp(2x+1)' },
    { label: '5exp(3x)', value: '5exp(3x)' }
  ];

  // Fonction pour calculer la dérivée
  const calculateDerivative = (fn) => {
    const stepsList = [];
    
    // Simplifier l'input
    fn = fn.replace(/\s+/g, '');
    
    // Pattern matching pour différents cas
    if (fn === 'exp(x)') {
      stepsList.push({
        step: 'Étape 1',
        action: 'Reconnaître la forme de base',
        content: 'exp(x)'
      });
      stepsList.push({
        step: 'Résultat',
        action: 'La dérivée de exp(x) est exp(x)',
        content: "d/dx [exp(x)] = exp(x)"
      });
      return { result: 'exp(x)', steps: stepsList };
    }
    
    // exp(kx) → kexp(kx)
    const kxMatch = fn.match(/exp\((\d+)x\)/);
    if (kxMatch) {
      const k = kxMatch[1];
      stepsList.push({
        step: 'Étape 1',
        action: 'Identifier u(x) et u\'(x)',
        content: `u(x) = ${k}x, donc u'(x) = ${k}`
      });
      stepsList.push({
        step: 'Étape 2',
        action: 'Appliquer la formule [exp(u)]\' = u\' × exp(u)',
        content: `[exp(${k}x)]' = ${k} × exp(${k}x)`
      });
      return { result: `${k}exp(${k}x)`, steps: stepsList };
    }
    
    // exp(x²) → 2xexp(x²)
    if (fn === 'exp(x^2)' || fn === 'exp(x²)') {
      stepsList.push({
        step: 'Étape 1',
        action: 'Identifier u(x) et u\'(x)',
        content: 'u(x) = x², donc u\'(x) = 2x'
      });
      stepsList.push({
        step: 'Étape 2',
        action: 'Appliquer la formule',
        content: "[exp(x²)]' = 2x × exp(x²)"
      });
      return { result: '2x × exp(x²)', steps: stepsList };
    }
    
    // exp(2x+1) → 2exp(2x+1)
    const linearMatch = fn.match(/exp\((\d+)x\+(\d+)\)/);
    if (linearMatch) {
      const a = linearMatch[1];
      const b = linearMatch[2];
      stepsList.push({
        step: 'Étape 1',
        action: 'Identifier u(x) et u\'(x)',
        content: `u(x) = ${a}x + ${b}, donc u'(x) = ${a}`
      });
      stepsList.push({
        step: 'Résultat',
        action: 'Appliquer la formule',
        content: `[exp(${a}x + ${b})]' = ${a} × exp(${a}x + ${b})`
      });
      return { result: `${a}exp(${a}x + ${b})`, steps: stepsList };
    }
    
    // 5exp(3x) → 15exp(3x)
    const coeffMatch = fn.match(/(\d+)exp\((\d+)x\)/);
    if (coeffMatch) {
      const coeff = coeffMatch[1];
      const k = coeffMatch[2];
      const result = parseInt(coeff) * parseInt(k);
      stepsList.push({
        step: 'Étape 1',
        action: 'Extraire la constante',
        content: `Le coefficient ${coeff} reste`
      });
      stepsList.push({
        step: 'Étape 2',
        action: 'Dériver l\'exponentielle',
        content: `[exp(${k}x)]' = ${k}exp(${k}x)`
      });
      stepsList.push({
        step: 'Résultat',
        action: 'Multiplier',
        content: `f'(x) = ${coeff} × ${k}exp(${k}x) = ${result}exp(${k}x)`
      });
      return { result: `${result}exp(${k}x)`, steps: stepsList };
    }
    
    return { 
      result: 'Non reconnu', 
      steps: [{
        step: 'Erreur',
        action: 'Fonction non reconnue',
        content: 'Veuillez utiliser un des exemples ci-dessous'
      }]
    };
  };

  const handleCalculate = () => {
    const { result, steps: calculatedSteps } = calculateDerivative(inputFunction);
    setDerivative(result);
    setSteps(calculatedSteps);
    setShowExplanation(true);
  };

  const handleReset = () => {
    setInputFunction('');
    setDerivative('');
    setSteps([]);
    setShowExplanation(false);
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Calculatrice de Dérivée</h2>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Entre une fonction exponentielle :
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputFunction}
              onChange={(e) => setInputFunction(e.target.value)}
              placeholder="exp(3x)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            />
            <button
              onClick={handleCalculate}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
            >
              <Calculator className="h-5 w-5" />
              Calculer
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Exemples rapides */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Exemples rapides :</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setInputFunction(example.value)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-mono"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        {/* Résultat */}
        {showExplanation && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-800">Résultat</h3>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <p className="text-sm text-gray-600 mb-1">Dérivée :</p>
              <p className="text-3xl font-mono text-center font-bold text-blue-600">
                {derivative}
              </p>
            </div>

            {/* Étapes */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Détails du calcul :
              </h4>
              {steps.map((stepObj, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{stepObj.action}</p>
                      <p className="text-sm text-gray-600 mt-1 font-mono">{stepObj.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DerivativeCalculator;


