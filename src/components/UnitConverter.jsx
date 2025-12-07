/**
 * 🔄 Composant de Conversion d'Unités - KOUNDOUL
 * Interface pour convertir entre différentes unités
 */

import React, { useState } from 'react';
import { 
  Calculator, 
  ArrowRight, 
  Copy, 
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { convertUnit, getCommonUnits, getAllUnitTypes } from '../data/unit-conversions';

const UnitConverter = () => {
  const [conversionType, setConversionType] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Types de conversion disponibles
  const conversionTypes = {
    length: 'Longueur',
    mass: 'Masse',
    time: 'Temps',
    temperature: 'Température',
    energy: 'Énergie',
    pressure: 'Pression',
    power: 'Puissance',
    force: 'Force',
    frequency: 'Fréquence',
    velocity: 'Vitesse',
    volume: 'Volume',
    area: 'Surface',
    angle: 'Angle'
  };

  // Obtenir les unités disponibles pour le type sélectionné
  const availableUnits = getCommonUnits(conversionType);

  // Définir des unités par défaut quand le type change
  React.useEffect(() => {
    if (availableUnits.length >= 2) {
      setFromUnit(availableUnits[0]);
      setToUnit(availableUnits[1]);
    }
  }, [conversionType]);

  // Effectuer la conversion
  const performConversion = () => {
    if (!value || !fromUnit || !toUnit) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (isNaN(parseFloat(value))) {
      setError('Veuillez entrer une valeur numérique valide');
      return;
    }

    setError('');

    try {
      const convertedValue = convertUnit(parseFloat(value), fromUnit, toUnit);
      
      setResult({
        originalValue: `${value} ${fromUnit}`,
        convertedValue: `${convertedValue.toFixed(6)} ${toUnit}`,
        conversion: `${value} ${fromUnit} = ${convertedValue.toFixed(6)} ${toUnit}`
      });
    } catch (error) {
      setError(error.message || 'Erreur lors de la conversion');
      console.error('Erreur:', error);
    }
  };

  // Inverser les unités
  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  // Copier le résultat
  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result.conversion);
    }
  };

  // Réinitialiser
  const reset = () => {
    setValue('');
    setResult(null);
    setError('');
  };

  return (
    <div className="koundoul-card">
      <div className="flex items-center mb-6">
        <Calculator className="h-6 w-6 text-blue-400 mr-3" />
        <h3 className="text-xl font-semibold text-gray-200">
          Convertisseur d'Unités
        </h3>
      </div>

      {/* Sélection du type de conversion */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Type de conversion
        </label>
        <select
          value={conversionType}
          onChange={(e) => {
            setConversionType(e.target.value);
            setResult(null);
            setError('');
          }}
          className="koundoul-input w-full"
        >
          {Object.entries(conversionTypes).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Interface de conversion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Valeur à convertir */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Valeur
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Entrez la valeur"
            className="koundoul-input w-full"
            step="any"
          />
        </div>

        {/* Unité source */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            De
          </label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="koundoul-input w-full"
          >
            <option value="">Sélectionnez une unité</option>
            {availableUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        {/* Unité cible */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Vers
          </label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="koundoul-input w-full"
          >
            <option value="">Sélectionnez une unité</option>
            {availableUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={performConversion}
          disabled={!value || !fromUnit || !toUnit}
          className="koundoul-btn-primary flex items-center px-4 py-2"
        >
          <Calculator className="h-5 w-5 mr-2" />
          Convertir
        </button>

        <button
          onClick={swapUnits}
          disabled={!fromUnit || !toUnit}
          className="flex items-center px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <ArrowRight className="h-5 w-5 mr-2" />
          Inverser
        </button>

        <button
          onClick={reset}
          className="flex items-center px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Réinitialiser
        </button>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
              <h4 className="text-lg font-semibold text-green-300">Résultat</h4>
            </div>
            <button
              onClick={copyResult}
              className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copier
            </button>
          </div>

          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {result.convertedValue}
              </div>
              <div className="text-gray-300">
                {result.originalValue} → {result.convertedValue}
              </div>
            </div>

            <div className="bg-black/20 rounded p-3">
              <p className="text-sm text-gray-400 font-mono">
                {result.conversion}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informations sur les unités disponibles */}
      {availableUnits.length > 0 && (
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center mb-2">
            <Info className="h-5 w-5 text-blue-400 mr-2" />
            <h5 className="text-sm font-medium text-gray-300">
              Unités disponibles pour {conversionTypes[conversionType]}
            </h5>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableUnits.map(unit => (
              <span
                key={unit}
                className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
              >
                {unit}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitConverter;
