/**
 * 📚 Composant d'Affichage des Étapes de Résolution
 * Design pédagogique avec icônes et progression visuelle
 * Support LaTeX complet pour formules mathématiques
 */

import React, { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { 
  BookOpen, Target, Edit3, CheckCircle, Lightbulb, 
  ChevronDown, ChevronUp 
} from 'lucide-react';

// Mapping des icônes selon le titre de l'étape
const getStepIcon = (title) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('rappel') || lowerTitle.includes('cours')) {
    return <BookOpen className="h-5 w-5" />;
  }
  if (lowerTitle.includes('stratégie') || lowerTitle.includes('plan')) {
    return <Target className="h-5 w-5" />;
  }
  if (lowerTitle.includes('étape') || lowerTitle.includes('calcul')) {
    return <Edit3 className="h-5 w-5" />;
  }
  if (lowerTitle.includes('vérification') || lowerTitle.includes('test')) {
    return <CheckCircle className="h-5 w-5" />;
  }
  if (lowerTitle.includes('plus loin') || lowerTitle.includes('conseil')) {
    return <Lightbulb className="h-5 w-5" />;
  }
  
  return <Edit3 className="h-5 w-5" />;
};

// Couleur selon le type d'étape
const getStepColor = (title) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('rappel')) return 'bg-blue-500/10 border-blue-400/30 text-blue-300';
  if (lowerTitle.includes('stratégie')) return 'bg-purple-500/10 border-purple-400/30 text-purple-300';
  if (lowerTitle.includes('vérification')) return 'bg-green-500/10 border-green-400/30 text-green-300';
  if (lowerTitle.includes('plus loin')) return 'bg-yellow-500/10 border-yellow-400/30 text-yellow-300';
  
  return 'bg-gray-500/10 border-gray-400/30 text-gray-300';
};

// Composant pour rendre le contenu avec support LaTeX
const RenderContentWithLaTeX = ({ content }) => {
  if (!content) return null;
  
  // Extraire les blocs LaTeX $$...$$
  const latexBlocks = [];
  let processedContent = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    const id = `__LATEX_BLOCK_${latexBlocks.length}__`;
    latexBlocks.push(formula.trim());
    return id;
  });
  
  // Extraire les LaTeX inline $...$
  const latexInline = [];
  processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
    const id = `__LATEX_INLINE_${latexInline.length}__`;
    latexInline.push(formula.trim());
    return id;
  });
  
  // Extraire et protéger les blocs de code
  const codeBlocks = [];
  processedContent = processedContent.replace(/```[\s\S]*?```/g, (match) => {
    const id = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(match);
    return id;
  });
  
  // Formater le markdown restant
  let formatted = processedContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-yellow-300">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-green-300">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2 border-l-4 border-blue-400 pl-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2 border-l-4 border-purple-400 pl-3">$1</h2>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 my-1 before:content-[\'\'\'] before:w-2 before:h-2 before:bg-blue-400 before:rounded-full before:inline-block before:mr-2 before:relative before:-left-2">$1</li>')
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 my-1 text-gray-300">$1</li>')
    .replace(/\n\n+/g, '</p><p class="my-3">')
    .replace(/\n/g, '<br />')
    .replace(/^(?!<[ph])/s, '<p class="my-2">')
    .replace(/(?<!>)$/s, '</p>');
  
  // Restaurer les blocs de code
  codeBlocks.forEach((block, index) => {
    const code = block.replace(/```[\w]*\n?/g, '').trim();
    const codeHTML = `<pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto my-3 border border-gray-700"><code class="text-green-300 text-sm font-mono">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    formatted = formatted.replace(`__CODE_BLOCK_${index}__`, codeHTML);
  });
  
  // Créer un tableau de composants React avec LaTeX
  const parts = [];
  let lastIndex = 0;
  const allTokens = [
    ...latexBlocks.map((f, i) => ({ type: 'block', formula: f, index: formatted.indexOf(`__LATEX_BLOCK_${i}__`) })),
    ...latexInline.map((f, i) => ({ type: 'inline', formula: f, index: formatted.indexOf(`__LATEX_INLINE_${i}__`) }))
  ].sort((a, b) => a.index - b.index);
  
  allTokens.forEach((token) => {
    if (token.index > lastIndex) {
      const htmlPart = formatted.substring(lastIndex, token.index);
      if (htmlPart) {
        parts.push(<span key={`html-${lastIndex}`} dangerouslySetInnerHTML={{ __html: htmlPart }} />);
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
        parts.push(
          <InlineMath key={`latex-inline-${token.index}`} math={token.formula} />
        );
      }
    } catch (error) {
      console.warn('Erreur rendu LaTeX:', error);
      parts.push(<code key={`latex-error-${token.index}`} className="bg-red-900/30 px-2 py-1 rounded">${token.formula}</code>);
    }
    
    lastIndex = token.index + (token.type === 'block' ? `__LATEX_BLOCK_${latexBlocks.indexOf(token.formula)}__`.length : `__LATEX_INLINE_${latexInline.indexOf(token.formula)}__`.length);
  });
  
  if (lastIndex < formatted.length) {
    const htmlPart = formatted.substring(lastIndex);
    if (htmlPart) {
      parts.push(<span key={`html-end`} dangerouslySetInnerHTML={{ __html: htmlPart }} />);
    }
  }
  
  return <div className="text-gray-200 leading-relaxed">{parts}</div>;
};

const SolutionSteps = ({ steps = [] }) => {
  const [expandedSteps, setExpandedSteps] = useState(
    new Set(steps.map((_, i) => i)) // Tous expandés par défaut
  );

  const toggleStep = (index) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  if (!steps || steps.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-blue-400" />
        Étapes de résolution détaillées
      </h4>

      {steps.map((step, index) => {
        const stepData = typeof step === 'string' ? { title: `Étape ${index + 1}`, content: step } : step;
        const isExpanded = expandedSteps.has(index);
        const icon = getStepIcon(stepData.title);
        const colorClass = getStepColor(stepData.title);

        return (
          <div 
            key={index} 
            className={`rounded-lg border-2 overflow-hidden transition-all duration-300 ${colorClass} ${
              isExpanded ? 'shadow-md' : 'shadow-sm'
            }`}
          >
            {/* Header - Cliquable pour expand/collapse */}
            <button
              onClick={() => toggleStep(index)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center shadow-sm border border-gray-600">
                  {icon}
                </div>
                <span className="font-medium text-left">
                  {stepData.title}
                </span>
              </div>
              
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 flex-shrink-0" />
              )}
            </button>

            {/* Contenu - Expandable avec support LaTeX */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 bg-black/20 max-h-96 overflow-y-auto">
                <RenderContentWithLaTeX content={stepData.content} />
              </div>
            )}

            {/* Barre de progression visuelle */}
            <div className="h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
          </div>
        );
      })}

      {/* Bouton "Tout expand / Tout collapse" */}
      <button
        onClick={() => {
          if (expandedSteps.size === steps.length) {
            setExpandedSteps(new Set());
          } else {
            setExpandedSteps(new Set(steps.map((_, i) => i)));
          }
        }}
        className="text-sm text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1"
      >
        {expandedSteps.size === steps.length ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Réduire tout
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Développer tout
          </>
        )}
      </button>
    </div>
  );
};

export default SolutionSteps;

