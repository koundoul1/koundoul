import React, { useEffect, useRef, useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import api from '../services/api';
import SolutionSteps from '../components/SolutionSteps';
import { 
  Brain, 
  Send, 
  Zap,
  History, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  Star,
  Sparkles,
  Lightbulb
} from 'lucide-react';

// Composant pour afficher la solution avec support LaTeX
const SolutionDisplay = ({ content }) => {
  if (!content) return <p className="text-gray-100">Aucune solution affichée</p>;
  
  // Extraire les blocs LaTeX $$...$$ et inline $...$
  const latexBlocks = [];
  let processedContent = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    const id = `__LATEX_BLOCK_${latexBlocks.length}__`;
    latexBlocks.push(formula.trim());
    return id;
  });
  
  const latexInline = [];
  processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
    const id = `__LATEX_INLINE_${latexInline.length}__`;
    latexInline.push(formula.trim());
    return id;
  });
  
  const parts = [];
  let lastIndex = 0;
  const allTokens = [
    ...latexBlocks.map((f, i) => ({ type: 'block', formula: f, index: processedContent.indexOf(`__LATEX_BLOCK_${i}__`) })),
    ...latexInline.map((f, i) => ({ type: 'inline', formula: f, index: processedContent.indexOf(`__LATEX_INLINE_${i}__`) }))
  ].sort((a, b) => a.index - b.index);
  
  allTokens.forEach((token) => {
    if (token.index > lastIndex) {
      const textPart = processedContent.substring(lastIndex, token.index);
      if (textPart) {
        parts.push(<span key={`text-${lastIndex}`} className="text-gray-100 whitespace-pre-wrap text-lg leading-relaxed font-medium">{textPart}</span>);
      }
    }
    
    try {
      if (token.type === 'block') {
        parts.push(
          <div key={`latex-block-${token.index}`} className="my-4 flex justify-center">
            <BlockMath math={token.formula} />
          </div>
        );
      } else {
        parts.push(<InlineMath key={`latex-inline-${token.index}`} math={token.formula} />);
      }
    } catch (error) {
      console.warn('Erreur rendu LaTeX:', error);
      parts.push(<span key={`latex-error-${token.index}`} className="text-red-300">${token.formula}</span>);
    }
    
    lastIndex = token.index + (token.type === 'block' ? `__LATEX_BLOCK_${latexBlocks.indexOf(token.formula)}__`.length : `__LATEX_INLINE_${latexInline.indexOf(token.formula)}__`.length);
  });
  
  if (lastIndex < processedContent.length) {
    const textPart = processedContent.substring(lastIndex);
    if (textPart) {
      parts.push(<span key="text-end" className="text-gray-100 whitespace-pre-wrap text-lg leading-relaxed font-medium">{textPart}</span>);
    }
  }
  
  return <div className="text-gray-100 text-lg leading-relaxed font-medium">{parts.length > 0 ? parts : content}</div>;
};

const VirtualCoach = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [inputMode, setInputMode] = useState('text');
  const [problemText, setProblemText] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    return () => closeCamera();
  }, []);

  const resetAll = () => {
    setSolution(null);
    setProblemText('');
    setImageBase64(null);
    setImagePreview(null);
    setError('');
  };

  const handleSelectImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setImagePreview(result);
      setImageBase64(String(result));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } }, 
        audio: false 
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Erreur ouverture caméra:', err);
      alert('Impossible d\'accéder à la caméra. Vérifie les permissions.');
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setImagePreview(dataUrl);
    setImageBase64(dataUrl);
    closeCamera();
  };

  // Utiliser la même logique que le solver : résolution intégrale complète
  const handleAnalyze = async () => {
    if (inputMode === 'photo' && !imageBase64) {
      setError('Veuillez sélectionner ou prendre une photo');
      return;
    }
    if (inputMode === 'text' && !problemText.trim()) {
      setError('Veuillez saisir le problème à résoudre');
      return;
    }
    
    setLoading(true);
    setError('');
    setSolution(null);

    try {
      const problem = inputMode === 'text' ? problemText.trim() : 'Problème depuis image';
      
      // Utiliser l'API solver pour résolution intégrale complète
      // Domain et level seront détectés automatiquement par Gemini IA
      const response = await api.solver.solve({
        input: problem,
        domain: 'general', // Détection automatique par l'IA
        level: 'medium' // Niveau moyen par défaut
      });

      if (response.success) {
        const solutionData = response.data.solution || response.data;
        setSolution(solutionData);
      } else {
        setError(response.message || 'Erreur lors de la résolution');
      }
    } catch (error) {
      console.error('Erreur résolution:', error);
      setError(error.message || 'Erreur lors de la résolution du problème');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySolution = () => {
    if (solution) {
      navigator.clipboard.writeText(solution.solution);
    }
  };

  const handleDownloadSolution = () => {
    if (solution) {
      const content = `Problème: ${problemText}\n\nSolution:\n${solution.solution}\n\nExplication:\n${solution.explanation}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solution_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950">
      {/* Header */}
      <div className="koundoul-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold koundoul-text-gradient flex items-center">
                <Brain className="h-8 w-8 text-blue-400 mr-3" />
                Coach Pédagogique Universel
              </h1>
              <p className="text-gray-300 mt-1">
                Résolution intégrale complète avec stratégie pédagogique
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Saisie du problème */}
        {!solution && (
          <div className="koundoul-card mb-6">
            <h2 className="text-xl font-semibold mb-4">📝 Décrivez votre problème</h2>
            
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setInputMode('text')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  inputMode === 'text' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ✍️ Texte
              </button>
              <button
                onClick={() => setInputMode('photo')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  inputMode === 'photo' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📸 Photo
              </button>
            </div>

            {inputMode === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Énoncé du problème
                </label>
                <textarea
                  value={problemText}
                  onChange={(e) => {
                    setProblemText(e.target.value);
                    if (error) setError('');
                  }}
                  className="koundoul-solver-input w-full h-32 resize-none"
                  placeholder="Soyez aussi précis que possible pour obtenir la meilleure solution..."
                />
              </div>
            )}

            {inputMode === 'photo' && (
              <div>
                <div className="flex gap-4 mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSelectImage}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="koundoul-btn-secondary px-4 py-2"
                  >
                    📁 Importer
                  </button>
                  <button
                    onClick={handleOpenCamera}
                    className="koundoul-btn-secondary px-4 py-2"
                  >
                    🎥 Prendre une photo
                  </button>
                </div>

                {isCameraOpen && (
                  <div className="mb-4">
                    <video ref={videoRef} autoPlay playsInline className="max-h-64 rounded-lg" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={handleCapturePhoto} className="koundoul-btn-primary px-4 py-2">
                        📷 Capturer
                      </button>
                      <button onClick={closeCamera} className="px-4 py-2 bg-gray-600 text-white rounded-lg">
                        ✖️ Fermer
                      </button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}

                {imagePreview && (
                  <div className="mb-4">
                    <img src={imagePreview} alt="Aperçu" className="max-h-64 rounded-lg border border-gray-600" />
                  </div>
                )}
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || (inputMode === 'photo' && !imageBase64) || (inputMode === 'text' && !problemText.trim())}
              className="relative w-full koundoul-btn-primary py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-pulse transition-opacity" />
              
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-6 w-6 mr-3" />
                  <span className="flex items-center gap-2">
                    <span>Réflexion en cours</span>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </span>
                </>
              ) : (
                <>
                  <Zap className="h-6 w-6 mr-3 group-hover:animate-pulse" />
                  <span className="text-lg">Résoudre avec l'IA</span>
                  <Sparkles className="h-5 w-5 ml-2 opacity-75" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Solution complète */}
        {solution && (
          <div className="mt-8 koundoul-card">
            <div className="border-b border-gray-600 pb-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
                  Solution trouvée
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopySolution}
                    className="flex items-center px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copier
                  </button>
                  <button
                    onClick={handleDownloadSolution}
                    className="flex items-center px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </button>
                </div>
              </div>
            </div>

            <div className="prose max-w-none">
              {/* Solution finale avec LaTeX */}
              <div className="koundoul-solution-final">
                <h4 className="font-semibold text-green-300 mb-4 flex items-center text-xl">
                  <CheckCircle className="h-7 w-7 mr-3 text-green-400" />
                  Solution trouvée
                </h4>
                <div className="bg-black/20 rounded-lg p-4 border border-green-400/30">
                  <SolutionDisplay content={solution.solution || 'Aucune solution affichée'} />
                </div>
              </div>

              {/* Étapes pédagogiques avec LaTeX */}
              {solution.steps && solution.steps.length > 0 && (
                <SolutionSteps steps={solution.steps} />
              )}

              <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  +{solution.points || 10} XP
                </div>
                <div className="flex items-center">
                  <button
                    onClick={resetAll}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                  >
                    🔄 Résoudre un autre problème
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VirtualCoach;
