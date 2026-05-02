import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import {
  ArrowLeft, Clock, Star, Tag, CheckCircle2, ChevronRight,
  BookOpen, AlertCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useGamification } from '../hooks/useGamification'
import { useTranslation } from '../hooks/useTranslation'

export default function MicroLessonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { processActionResult } = useGamification()
  const { t } = useTranslation()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [completionData, setCompletionData] = useState(null)
  const [nextLesson, setNextLesson] = useState(null)
  const [completing, setCompleting] = useState(false)
  const mountedAt = useRef(Date.now())

  useEffect(() => {
    mountedAt.current = Date.now()
    const run = async () => {
      setLoading(true)
      try {
        const [lessonRes, nextRes] = await Promise.all([
          api.microlessons.get(id),
          api.microlessons.getNext(id).catch(() => ({ data: null }))
        ])
        setLesson(lessonRes.data || lessonRes)
        setNextLesson(nextRes.data || null)

        try {
          const completionRes = await api.microlessons.getCompletion(id)
          if (completionRes?.success && completionRes?.data?.completed === true) {
            setCompletionData(completionRes.data)
            setCompleted(true)
          } else {
            setCompletionData(null)
            setCompleted(false)
          }
        } catch (e) {
          setCompleted(false)
          setCompletionData(null)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const hasContent = (() => {
    const s = lesson?.content_sections
    if (!s) return false
    if (Array.isArray(s) && s.length === 0) return false
    if (typeof s === 'object' && !Array.isArray(s) && Object.keys(s).length === 0) return false
    return true
  })()

  const handleComplete = async () => {
    if (!user || completing) return
    setCompleting(true)
    try {
      // score=100 because micro-lessons have no end-of-lesson quiz yet.
      // When quizzes are added (Phase 2B.2), score should come from quiz result.
      const timeSpent = Math.round((Date.now() - mountedAt.current) / 1000)
      const res = await api.microlessons.complete(id, { score: 100, timeSpent })

      if (res.success) {
        setCompleted(true)
        setCompletionData(res.data)
        if (!res.alreadyCompleted) {
          processActionResult(res.gamification)
        }
      }
    } catch (error) {
      console.error('Completion error:', error)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kprimary"></div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="k-card p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-white font-bold mb-2">{t('microLessons.lessonNotFound')}</p>
          <Link to="/micro-lessons" className="text-kprimary font-semibold hover:underline">
            {t('microLessons.backToList')}
          </Link>
        </div>
      </div>
    )
  }

  const sections = lesson.content_sections || null
  const isArrayFormat = Array.isArray(sections) && sections.length > 0

  const renderSection = (section, idx) => {
    if (!section) return null
    const { title, content, items } = section
    if (title && content) {
      return (
        <section key={`${title}-${idx}`} className="mb-6">
          <h2 className="text-xl font-bold text-kprimary mb-2">{title}</h2>
          <p className="text-gray-300 leading-relaxed">{content}</p>
        </section>
      )
    }
    if (title && items && Array.isArray(items)) {
      return (
        <section key={`${title}-${idx}`} className="mb-6">
          <h2 className="text-xl font-bold text-kprimary mb-2">{title}</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> {t('microLessons.back')}
        </button>

        {/* Header card */}
        <div className="k-card p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{lesson.title}</h1>
            <span className="px-3 py-1 rounded-full bg-kprimary/20 text-kprimary text-xs font-bold flex-shrink-0">
              {t(`common.levels.${lesson.level}`) || lesson.level}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            {t(`common.subjects.${lesson.subject}`) || lesson.subject} &bull; {lesson.chapter}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {lesson.duration_min} min</span>
            <span className="flex items-center gap-1 text-yellow-400"><Star className="w-4 h-4" /> {lesson.xp_reward} XP</span>
            <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> Diff. {lesson.difficulty}/5</span>
            {completed && (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> {t('microLessons.alreadyCompleted')}
              </span>
            )}
          </div>
        </div>

        {/* Content or placeholder */}
        {!hasContent ? (
          /* Empty content placeholder */
          <div className="k-card p-8 sm:p-12 text-center mb-6">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">{t('microLessons.contentComingSoon')}</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">{t('microLessons.contentComingSoonDesc')}</p>
            <Link to="/micro-lessons" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kprimary rounded-xl text-white font-bold hover:bg-kprimary/80 transition-colors">
              <BookOpen className="w-4 h-4" /> {t('microLessons.backToList')}
            </Link>
          </div>
        ) : (
          /* Lesson content */
          <div className="k-card p-6 sm:p-8 mb-6">
            {isArrayFormat ? (
              sections.map((s, i) => renderSection(s, i))
            ) : (
              <>
                <section className="mb-6">
                  <h2 className="text-xl font-bold text-kprimary mb-2">Introduction</h2>
                  <p className="text-gray-300 leading-relaxed">
                    {sections?.introduction || (
                      <>Cette micro-lecon presente les notions essentielles de <strong className="text-white">{lesson.title}</strong>. Elle s'inscrit dans le chapitre <strong className="text-white">{lesson.chapter}</strong> de la matiere <strong className="text-white">{lesson.subject}</strong> au niveau <strong className="text-white">{lesson.level}</strong>.</>
                    )}
                  </p>
                </section>

                {(Array.isArray(sections?.objectives) ? sections.objectives : lesson.objectives)?.length > 0 && (
                  <section className="mb-6">
                    <h2 className="text-xl font-bold text-kprimary mb-2">Objectifs</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {(Array.isArray(sections?.objectives) ? sections.objectives : lesson.objectives).map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </section>
                )}

                {(Array.isArray(sections?.prerequisites) ? sections.prerequisites : lesson.prerequisites)?.length > 0 && (
                  <section className="mb-6">
                    <h2 className="text-xl font-bold text-kprimary mb-2">Prerequis</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {(Array.isArray(sections?.prerequisites) ? sections.prerequisites : lesson.prerequisites).map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </section>
                )}

                <section className="mb-6">
                  <h2 className="text-xl font-bold text-kprimary mb-2">Methode pas a pas</h2>
                  {Array.isArray(sections?.method) ? (
                    <ol className="list-decimal list-inside text-gray-300 space-y-1">
                      {sections.method.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  ) : (
                    <ol className="list-decimal list-inside text-gray-300 space-y-1">
                      <li>Identifier le type de tache.</li>
                      <li>Choisir la bonne strategie.</li>
                      <li>Appliquer la procedure avec rigueur.</li>
                      <li>Verifier l'ordre de grandeur du resultat.</li>
                    </ol>
                  )}
                </section>

                {sections?.example && (
                  <section className="mb-6">
                    <h2 className="text-xl font-bold text-kprimary mb-2">Exemple guide</h2>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-kprimary font-semibold mb-2">Enonce</p>
                      <p className="text-gray-300 mb-4">{sections.example.statement || `Illustrer la notion de ${lesson.title}.`}</p>
                      <p className="text-kprimary font-semibold mb-2">Solution</p>
                      {Array.isArray(sections.example.solution) ? (
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                          {sections.example.solution.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      ) : (
                        <p className="text-gray-300">Solution detaillee a venir.</p>
                      )}
                    </div>
                  </section>
                )}

                {Array.isArray(sections?.exercises) && sections.exercises.length > 0 && (
                  <section className="mb-6">
                    <h2 className="text-xl font-bold text-kprimary mb-2">Exercices rapides</h2>
                    <ul className="space-y-2 text-gray-300">
                      {sections.exercises.map((ex, i) => <li key={i}>&#8226; {ex}</li>)}
                    </ul>
                  </section>
                )}

                {Array.isArray(sections?.summary) && sections.summary.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-kprimary mb-2">Resume</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {sections.summary.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* Bottom action bar — Mark complete + Next lesson */}
        {user && hasContent && (
          <div className="k-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            {completed ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                {t('microLessons.alreadyCompleted')}
                {completionData?.completedAt && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({new Date(completionData.completedAt).toLocaleDateString()})
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-kprimary to-ksecondary rounded-xl text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {completing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {t('microLessons.markCompleted')}
              </button>
            )}

            {nextLesson ? (
              <Link
                to={`/microlessons/${nextLesson.id}`}
                className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-colors"
              >
                {t('microLessons.nextLesson')}
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <div className="text-sm text-gray-500 text-center">
                {t('microLessons.allDone')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
