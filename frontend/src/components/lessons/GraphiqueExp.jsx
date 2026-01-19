/**
 * 📈 Composant Graphique Interactif - Fonction Exponentielle
 * Visualisation interactive de exp(x) et sa dérivée
 */

import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Calculator } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GraphiqueExp = () => {
  const [xValue, setXValue] = useState(0);
  
  // Données pour le graphique de exp(x)
  const labels = [];
  const expData = [];
  const derivativeData = [];
  
  for (let x = -2; x <= 2; x += 0.1) {
    labels.push(x.toFixed(1));
    expData.push(Math.exp(x));
    derivativeData.push(Math.exp(x)); // La dérivée de exp est exp
  }
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'exp(x)',
        data: expData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false
      },
      {
        label: "derivee [exp(x)]'",
        data: derivativeData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Fonction exponentielle et sa dérivée'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y.toFixed(3);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 8
      }
    }
  };

  // Calculer la valeur et la dérivée au point sélectionné
  const yValue = Math.exp(xValue);
  const derivativeValue = Math.exp(xValue);

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="h-80 mb-4">
          <Line data={chartData} options={chartOptions} />
        </div>
        
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Choisis un point x : {xValue.toFixed(2)}
          </label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={xValue}
            onChange={(e) => setXValue(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Point x</p>
            <p className="text-2xl font-bold text-gray-900">{xValue.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">exp(x)</p>
            <p className="text-2xl font-bold text-blue-600">{yValue.toFixed(3)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">derivee</p>
            <p className="text-2xl font-bold text-green-600">{derivativeValue.toFixed(3)}</p>
          </div>
        </div>

        {Math.abs(yValue - derivativeValue) < 0.001 && (
          <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-5 w-5 text-yellow-600" />
              <p className="font-bold text-yellow-800">Observation importante</p>
            </div>
            <p className="text-sm text-yellow-700">
              La valeur de exp({xValue.toFixed(2)}) est {yValue.toFixed(3)} et la dérivée est {derivativeValue.toFixed(3)}
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              Elles sont égales ! C'est la propriété unique de l'exponentielle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphiqueExp;

