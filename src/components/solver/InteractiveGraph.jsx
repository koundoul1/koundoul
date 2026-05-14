/**
 * Graphique Interactif - Koundoul
 * Visualisation de fonctions mathématiques avec Plotly.js
 * Plotly is lazy-loaded to avoid bloating the initial bundle (~4.8MB)
 */

import React, { useState, useMemo, lazy, Suspense } from 'react'
import { ZoomIn, ZoomOut, RefreshCw, Download, AlertCircle } from 'lucide-react'

const Plot = lazy(() => import('react-plotly.js'))

const InteractiveGraph = ({
  func,
  domain = [-10, 10],
  title = 'f(x)',
  showDerivative: showDerivativeProp = false
}) => {
  const [xRange, setXRange] = useState(domain)
  const [showGrid, setShowGrid] = useState(true)
  const [showDerivative, setShowDerivative] = useState(showDerivativeProp)
  const [error, setError] = useState(null)

  const generatePoints = (fn, range) => {
    const points = []
    const step = (range[1] - range[0]) / 200

    for (let x = range[0]; x <= range[1]; x += step) {
      try {
        const y = fn(x)
        if (isFinite(y) && !isNaN(y)) {
          points.push({ x, y })
        }
      } catch (e) {
        console.warn(`Erreur à x=${x}:`, e)
      }
    }

    return points
  }

  const calculateDerivative = (fn, x, h = 0.001) => {
    try {
      return (fn(x + h) - fn(x - h)) / (2 * h)
    } catch (e) {
      return NaN
    }
  }

  const generateDerivativePoints = (fn, range) => {
    const points = []
    const step = (range[1] - range[0]) / 200

    for (let x = range[0]; x <= range[1]; x += step) {
      const dy = calculateDerivative(fn, x)
      if (isFinite(dy) && !isNaN(dy)) {
        points.push({ x, y: dy })
      }
    }

    return points
  }

  const points = useMemo(() => {
    setError(null)
    const pts = generatePoints(func, xRange)

    if (pts.length === 0) {
      setError('Impossible de tracer la fonction sur ce domaine')
    }

    return pts
  }, [func, xRange])

  const derivativePoints = useMemo(() => {
    if (!showDerivative) return []
    return generateDerivativePoints(func, xRange)
  }, [func, xRange, showDerivative])

  const handleZoom = (factor) => {
    const center = (xRange[0] + xRange[1]) / 2
    const currentWidth = xRange[1] - xRange[0]
    const newWidth = currentWidth * factor

    setXRange([
      center - newWidth / 2,
      center + newWidth / 2
    ])
  }

  const handleReset = () => {
    setXRange(domain)
  }

  const handleDownload = () => {
    const plotElement = document.querySelector('.js-plotly-plot')
    if (plotElement && window.Plotly) {
      window.Plotly.downloadImage(plotElement, {
        format: 'png',
        filename: `graph-${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
        width: 1200,
        height: 800
      })
    }
  }

  const plotData = useMemo(() => {
    const data = [
      {
        x: points.map(p => p.x),
        y: points.map(p => p.y),
        type: 'scatter',
        mode: 'lines',
        name: title || 'f(x)',
        line: { color: '#06B6D4', width: 3 },
        hovertemplate: 'x: %{x:.2f}<br>y: %{y:.2f}<extra></extra>'
      }
    ]

    if (showDerivative && derivativePoints.length > 0) {
      data.push({
        x: derivativePoints.map(p => p.x),
        y: derivativePoints.map(p => p.y),
        type: 'scatter',
        mode: 'lines',
        name: "f'(x)",
        line: { color: '#F59E0B', width: 2, dash: 'dash' },
        hovertemplate: "x: %{x:.2f}<br>f'(x): %{y:.2f}<extra></extra>"
      })
    }

    return data
  }, [points, derivativePoints, showDerivative, title])

  const plotLayout = {
    title: { text: title, font: { color: '#fff', size: 18 } },
    xaxis: {
      title: 'x',
      gridcolor: showGrid ? '#444' : 'transparent',
      color: '#ccc',
      range: xRange,
      zeroline: true, zerolinecolor: '#666', zerolinewidth: 2
    },
    yaxis: {
      title: 'f(x)',
      gridcolor: showGrid ? '#444' : 'transparent',
      color: '#ccc',
      zeroline: true, zerolinecolor: '#666', zerolinewidth: 2
    },
    paper_bgcolor: '#1f2937',
    plot_bgcolor: '#111827',
    font: { color: '#fff' },
    margin: { t: 50, r: 20, b: 50, l: 60 },
    hovermode: 'closest',
    showlegend: true,
    legend: {
      x: 0.02, y: 0.98,
      bgcolor: 'rgba(31, 41, 55, 0.8)',
      bordercolor: '#444', borderwidth: 1
    }
  }

  const plotConfig = {
    displayModeBar: false,
    responsive: true,
    displaylogo: false
  }

  return (
    <div className="interactive-graph space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-lg font-semibold text-gray-200">
          Représentation graphique
        </h4>
        <div className="flex gap-2">
          <button onClick={() => handleZoom(0.7)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-gray-300" title="Zoom avant">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => handleZoom(1.3)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-gray-300" title="Zoom arrière">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={handleReset} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-gray-300" title="Réinitialiser">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={handleDownload} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-gray-300" title="Télécharger (PNG)">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <Suspense fallback={
            <div className="flex items-center justify-center h-[280px] sm:h-[400px] text-white/40 text-sm">
              Chargement du graphique...
            </div>
          }>
            <Plot
              data={plotData}
              layout={plotLayout}
              config={plotConfig}
              style={{ width: '100%', height: '100%' }}
              className="plotly-graph min-h-[280px] sm:min-h-[400px]"
              useResizeHandler={true}
              className="plotly-graph"
            />
          </Suspense>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="rounded" />
          <span className="text-gray-300">Afficher la grille</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showDerivative} onChange={(e) => setShowDerivative(e.target.checked)} className="rounded" />
          <span className="text-gray-300">Afficher la dérivée f'(x)</span>
        </label>
      </div>

      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
        <p className="text-sm text-blue-300">
          <strong>Astuce:</strong> Utilise les boutons de zoom pour explorer la fonction en détail.
          Tu peux aussi activer la dérivée pour voir comment la pente change !
        </p>
      </div>
    </div>
  )
}

export default InteractiveGraph
