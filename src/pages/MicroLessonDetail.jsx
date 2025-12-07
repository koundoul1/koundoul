import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { ArrowLeft, Clock, Star, Tag, CheckCircle2, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function MicroLessonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [completionData, setCompletionData] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.microlessons.get(id)
        setLesson(res.data || res)
        
        // Charger l'état de complétion si connecté
        if (user) {
          try {
            const completionRes = await api.microlessons.getCompletion(id)
            if (completionRes.data) {
              setCompletionData(completionRes.data)
              setCompleted(true)
            }
          } catch (e) {
            // Pas de complétion existante, c'est normal
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold">Leçon introuvable</p>
        </div>
      </div>
    )
  }

  const sections = lesson.content_sections || null
  const isArrayFormat = Array.isArray(sections)

  const handleComplete = async () => {
    if (!user) return
    
    try {
      // Pour l'instant, marquer comme complété sans score (sera amélioré avec les QCM)
      const res = await api.microlessons.complete(id, { score: 100, timeSpent: 0 })
      
      if (res.success) {
        setCompleted(true)
        setCompletionData(res.data.completion)
        
        // Afficher notification d'XP si gagné
        if (res.data.xpEarned > 0) {
          alert(`🎉 +${res.data.xpEarned} XP gagnés !`)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la complétion:', error)
      alert('Erreur lors de l\'enregistrement de la complétion')
    }
  }

  // Helper pour rendre une section
  const renderSection = (section) => {
    if (!section) return null
    
    const { title, content, items } = section
    
    if (title && content) {
      return (
        <section key={title} className="mb-6">
          <h2 className="text-xl font-bold text-blue-700 mb-2">{title}</h2>
          <p className="text-gray-700 leading-relaxed">{content}</p>
        </section>
      )
    }
    
    if (title && items && Array.isArray(items)) {
      return (
        <section key={title} className="mb-6">
          <h2 className="text-xl font-bold text-blue-700 mb-2">{title}</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )
    }
    
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6">
          <ArrowLeft className="w-5 h-5"/> Retour
        </button>

        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{lesson.title}</h1>
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">{lesson.level}</span>
          </div>
          <p className="text-gray-600 mb-2">{lesson.subject} • {lesson.chapter}</p>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6 text-sm text-gray-700">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4"/>{lesson.duration_min} min</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500"/>{lesson.xp_reward} XP</span>
              <span className="flex items-center gap-1"><Tag className="w-4 h-4"/>Diff. {lesson.difficulty}/5</span>
            </div>
            
            {user && (
              completed ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Complétée</span>
                  {completionData?.score && (
                    <span className="text-xs">({completionData.score}%)</span>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Marquer comme complété</span>
                </button>
              )
            )}
          </div>

          {/* Si sections est un array, itérer dessus */}
          {isArrayFormat ? (
            sections.map(renderSection)
          ) : (
            <>
              {/* Fallback vers l'ancien format */}
              <section className="mb-6">
                <h2 className="text-xl font-bold text-blue-700 mb-2">Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  {sections?.introduction || (
                    <>Cette micro‑leçon présente les notions essentielles de <strong>{lesson.title}</strong>. Elle s’inscrit dans le chapitre <strong>{lesson.chapter}</strong> de la matière <strong>{lesson.subject}</strong> au niveau <strong>{lesson.level}</strong>. L’objectif est de fournir une compréhension rapide et opérationnelle en moins de {lesson.duration_min} minutes.</>
                  )}
                </p>
              </section>

              {(Array.isArray(sections?.objectives) ? sections.objectives : lesson.objectives)?.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xl font-bold text-blue-700 mb-2">Objectifs</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {(Array.isArray(sections?.objectives) ? sections.objectives : lesson.objectives).map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </section>
              )}

              {(Array.isArray(sections?.prerequisites) ? sections.prerequisites : lesson.prerequisites)?.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xl font-bold text-blue-700 mb-2">Prérequis</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {(Array.isArray(sections?.prerequisites) ? sections.prerequisites : lesson.prerequisites).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="mb-6">
                <h2 className="text-xl font-bold text-blue-700 mb-2">Méthode pas à pas</h2>
                {Array.isArray(sections?.method) ? (
                  <ol className="list-decimal list-inside text-gray-700 space-y-1">
                    {sections.method.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside text-gray-700 space-y-1">
                    <li>Identifier le type de tâche: se référer aux objectifs ci‑dessus.</li>
                    <li>Choisir la bonne stratégie: s’appuyer sur les formules/outils du chapitre « {lesson.chapter} ».</li>
                    <li>Appliquer la procédure avec rigueur et unités correctes.</li>
                    <li>Vérifier l’ordre de grandeur et la cohérence du résultat.</li>
                  </ol>
                )}
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold text-blue-700 mb-2">Exemple guidé</h2>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                  <p className="text-purple-700 font-semibold mb-2">Énoncé</p>
                  <p className="text-gray-700 mb-4">{sections?.example?.statement || <>Illustrer la notion de « {lesson.title} » sur un cas simple du chapitre {lesson.chapter}.</>}</p>
                  <p className="text-purple-700 font-semibold mb-2">Solution</p>
                  {Array.isArray(sections?.example?.solution) ? (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {sections.example.solution.map((s, i) => (<li key={i}>{s}</li>))}
                    </ul>
                  ) : (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Analyser les données connues et la question posée.</li>
                      <li>Sélectionner la formule/méthode correspondante.</li>
                      <li>Effectuer le calcul/raisonnement étape par étape.</li>
                      <li>Conclure clairement et interpréter le résultat.</li>
                    </ul>
                  )}
                </div>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold text-blue-700 mb-2">Exercices rapides</h2>
                {Array.isArray(sections?.exercises) ? (
                  <ul className="space-y-2 text-gray-700">
                    {sections.exercises.map((ex, i) => (<li key={i}>• {ex}</li>))}
                  </ul>
                ) : (
                  <ul className="space-y-2 text-gray-700">
                    <li>• Application directe de la définition sur un cas élémentaire.</li>
                    <li>• Variante avec piège classique (unité/signe/étape manquante).</li>
                    <li>• Mini‑problème d’intégration au chapitre {lesson.chapter}.</li>
                  </ul>
                )}
              </section>

              <section>
                <h2 className="text-xl font-bold text-blue-700 mb-2">Résumé</h2>
                {Array.isArray(sections?.summary) ? (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {sections.summary.map((s, i) => (<li key={i}>{s}</li>))}
                  </ul>
                ) : (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Notion clé: {lesson.title} — comprendre l’idée centrale.</li>
                    <li>Méthode: analyser → choisir → appliquer → vérifier.</li>
                    <li>Prochaine étape: poursuivre le chapitre « {lesson.chapter} ».</li>
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


