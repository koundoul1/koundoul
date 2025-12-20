'use client'

import { useState } from 'react'
import { buildClaudePrompt, copyToClipboard, InscriptionData } from '@/lib/prompt-builder'

interface Props {
  inscription: InscriptionData
}

export default function PromptCopyCard({ inscription }: Props) {
  const [copied, setCopied] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  
  const prompt = buildClaudePrompt(inscription)
  
  const handleCopy = () => {
    const success = copyToClipboard(prompt)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      alert('Erreur lors de la copie. Essayez manuellement.')
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🤖 Étape 1 : Générer avec Claude
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Copiez ce prompt et collez-le dans Claude (claude.ai)
          </p>
        </div>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showPrompt ? '👁️ Masquer' : '👁️ Voir'}
        </button>
      </div>
      
      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
        <p className="font-semibold text-blue-900 mb-2">📋 Instructions :</p>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1.5">
          <li>Cliquez sur <strong>"📋 Copier le prompt"</strong> ci-dessous</li>
          <li>Ouvrez <strong>Claude</strong> dans un nouvel onglet</li>
          <li>Collez le prompt et appuyez sur Entrée</li>
          <li>Attendez que Claude génère le code HTML complet</li>
          <li>Téléchargez le fichier HTML généré</li>
          <li>Passez à l'<strong>Étape 2</strong> pour l'upload</li>
        </ol>
      </div>
      
      {/* Prompt preview */}
      {showPrompt && (
        <div className="mb-4">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 font-mono text-xs">
            <pre className="whitespace-pre-wrap">{prompt}</pre>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {prompt.length} caractères • ~{Math.ceil(prompt.length / 4)} tokens
          </p>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
          }`}
        >
          {copied ? '✅ Copié dans le presse-papier !' : '📋 Copier le prompt'}
        </button>
        
        <a
          href="https://claude.ai/new"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-900 hover:to-black transition-all duration-200 hover:shadow-lg flex items-center gap-2"
        >
          🤖 Ouvrir Claude
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}
