import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react'
import api from '../services/api'

/**
 * LessonChat — Floating contextual AI chat panel for course pages.
 * Uses the existing Coach SSE endpoint. The lesson context is injected
 * silently in the first message so the Coach knows what's being studied.
 */
export default function LessonChat({ lessonTitle, subject, level, chapter }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const abortRef = useRef(null)
  const bottomRef = useRef(null)
  const isFirstMessage = useRef(true)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [open])

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || streaming) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // On first message, prefix with lesson context (invisible to user)
    let messageToSend = text
    if (isFirstMessage.current) {
      isFirstMessage.current = false
      const parts = [`[Contexte leçon en cours]`]
      if (subject) parts.push(`Matière : ${subject}`)
      if (chapter) parts.push(`Chapitre : ${chapter}`)
      if (lessonTitle) parts.push(`Leçon : "${lessonTitle}"`)
      if (level) parts.push(`Niveau : ${level}`)
      parts.push(`\nQuestion de l'élève : ${text}`)
      messageToSend = parts.join('\n')
    }

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setStreaming(true)

    // Placeholder for streaming assistant response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    let assistantText = ''

    abortRef.current = api.coach.chatStream({
      message: messageToSend,
      conversationId,
      onMeta: (data) => {
        if (data.conversationId) setConversationId(data.conversationId)
      },
      onChunk: (data) => {
        assistantText += data.text || ''
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantText }
          return updated
        })
      },
      onDone: () => {
        setStreaming(false)
        abortRef.current = null
      },
      onError: (err) => {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: err || 'Une erreur est survenue. Réessaie.',
            error: true
          }
          return updated
        })
        setStreaming(false)
        abortRef.current = null
      }
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleClose = () => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setOpen(false)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-kprimary to-ksecondary rounded-2xl text-white font-bold shadow-lg shadow-kprimary/30 hover:opacity-90 active:scale-95 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">Coach IA</span>
          {messages.length > 0 && (
            <span className="ml-1 w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-xs">
              {messages.filter(m => m.role === 'assistant').length}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{ background: '#13131f', height: '480px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-kprimary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-kprimary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Coach IA</p>
                {lessonTitle && (
                  <p className="text-xs text-white/40 truncate">{lessonTitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/40 hover:text-white transition-colors flex-shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center pb-4">
                <div className="w-12 h-12 rounded-2xl bg-kprimary/10 flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6 text-kprimary/60" />
                </div>
                <p className="text-sm font-semibold text-white/60 mb-1">
                  Pose une question sur cette leçon
                </p>
                <p className="text-xs text-white/30">
                  Je connais le contexte de la leçon en cours.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-kprimary/15 border border-kprimary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-kprimary" />
                  </div>
                )}
                <div className={`max-w-[78%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-kprimary text-white rounded-br-sm'
                    : msg.error
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20 rounded-bl-sm'
                      : 'bg-white/5 text-white/90 border border-white/8 rounded-bl-sm'
                }`}>
                  {msg.content || (
                    streaming && i === messages.length - 1
                      ? <span className="flex gap-1 items-center py-0.5">
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      : null
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-white/50" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/10 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ta question sur la leçon..."
                rows={1}
                disabled={streaming}
                className="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-kprimary/40 disabled:opacity-50 transition-colors"
                style={{ minHeight: '38px', maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={streaming || !input.trim()}
                className="p-2.5 rounded-xl bg-kprimary text-white hover:bg-kprimary/80 active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
              >
                {streaming
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </div>
            <p className="text-xs text-white/20 mt-1.5 text-center">Entrée pour envoyer · Shift+Entrée pour sauter une ligne</p>
          </div>
        </div>
      )}
    </>
  )
}
