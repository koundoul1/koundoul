'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  numeroDossier: string
  onUploadSuccess?: (url: string) => void
}

export default function HTMLUploadCard({ numeroDossier, onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [htmlContent, setHtmlContent] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ url: string; size: number } | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  
  const handleFile = (file: File) => {
    setError('')
    
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setError('❌ Veuillez sélectionner un fichier HTML (.html ou .htm)')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB max
      setError('❌ Le fichier est trop volumineux (max 10MB)')
      return
    }
    
    setFile(file)
    
    // Lire le contenu du fichier
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      
      // Vérifier que c'est bien du HTML
      if (!content.includes('<html') && !content.includes('<!DOCTYPE')) {
        setError('⚠️ Le fichier ne semble pas contenir de HTML valide')
      }
      
      setHtmlContent(content)
    }
    reader.onerror = () => {
      setError('❌ Erreur lors de la lecture du fichier')
    }
    reader.readAsText(file)
  }
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) handleFile(selectedFile)
  }
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) handleFile(droppedFile)
  }
  
  const handleUpload = async () => {
    if (!htmlContent) {
      setError('❌ Aucun contenu HTML à uploader')
      return
    }
    
    setIsUploading(true)
    setError('')
    
    try {
      const response = await fetch('/api/upload-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroDossier,
          html: htmlContent
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload')
      }
      
      setUploadResult({ url: data.url, size: data.size })
      onUploadSuccess?.(data.url)
      router.refresh()
      
    } catch (err: any) {
      setError(`❌ ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }
  
  const resetUpload = () => {
    setFile(null)
    setHtmlContent('')
    setUploadResult(null)
    setError('')
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          📤 Étape 2 : Upload du HTML généré
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Uploadez le fichier HTML que Claude a créé
        </p>
      </div>
      
      {!uploadResult ? (
        <div className="space-y-4">
          {/* Drag & Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              type="file"
              accept=".html,.htm"
              onChange={handleFileInput}
              className="hidden"
              id="html-file-input"
            />
            
            <label htmlFor="html-file-input" className="cursor-pointer block">
              <div className="text-6xl mb-3">
                {file ? '✅' : dragActive ? '⬇️' : '📄'}
              </div>
              
              {file ? (
                <div>
                  <p className="font-semibold text-green-900 text-lg mb-1">
                    {file.name}
                  </p>
                  <p className="text-sm text-green-700">
                    {(file.size / 1024).toFixed(2)} KB • Prêt à uploader
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">
                    {dragActive ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier HTML'}
                  </p>
                  <p className="text-sm text-gray-500">
                    ou <span className="text-blue-600 font-medium">cliquez pour parcourir</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Formats acceptés : .html, .htm (max 10MB)
                  </p>
                </div>
              )}
            </label>
          </div>
          
          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {/* Aperçu HTML */}
          {file && htmlContent && !error && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">📝 Aperçu du contenu :</p>
              <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-auto max-h-32">
                <pre className="whitespace-pre-wrap">{htmlContent.substring(0, 500)}...</pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {htmlContent.length.toLocaleString()} caractères
              </p>
            </div>
          )}
          
          {/* Bouton Upload */}
          {file && htmlContent && !error && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Upload en cours...
                </>
              ) : (
                <>
                  🚀 Mettre en ligne maintenant
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        /* Résultat upload */
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <div className="flex items-start gap-3">
              <div className="text-3xl">✅</div>
              <div className="flex-1">
                <p className="text-lg font-bold text-green-900 mb-2">
                  Site mis en ligne avec succès !
                </p>
                
                <a
                  href={uploadResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium break-all text-sm"
                >
                  {uploadResult.url}
                </a>
                <p className="text-xs text-green-700 mt-2">
                  Taille : {(uploadResult.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions post-upload */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={uploadResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              👁️ Voir le site
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            <button
              onClick={resetUpload}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200"
            >
              🔄 Nouveau site
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
