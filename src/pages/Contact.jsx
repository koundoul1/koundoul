/**
 * Contact / Support — Formulaire de contact + historique des tickets
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Send,
  Loader2,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react'

const CATEGORIES = [
  { value: 'general', label: 'Question generale', emoji: '💬' },
  { value: 'bug', label: 'Signaler un bug', emoji: '🐛' },
  { value: 'billing', label: 'Paiement / Abonnement', emoji: '💳' },
  { value: 'account', label: 'Mon compte', emoji: '👤' },
  { value: 'feature', label: 'Suggestion', emoji: '💡' },
]

const STATUS_LABELS = {
  open: { label: 'Ouvert', color: 'bg-blue-500/20 text-blue-400' },
  in_progress: { label: 'En cours', color: 'bg-yellow-500/20 text-yellow-400' },
  resolved: { label: 'Resolu', color: 'bg-green-500/20 text-green-400' },
  closed: { label: 'Ferme', color: 'bg-gray-500/20 text-gray-400' },
}

const Contact = () => {
  const { user, isAuthenticated } = useAuth()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('general')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [tickets, setTickets] = useState([])
  const [expandedTicket, setExpandedTicket] = useState(null)
  const [ticketDetail, setTicketDetail] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)

  const loadTickets = async () => {
    try {
      const data = await api.support.getTickets()
      setTickets(Array.isArray(data) ? data : [])
    } catch (e) { /* ignore */ }
  }

  useEffect(() => {
    if (isAuthenticated) loadTickets()
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      setError('Sujet et message requis')
      return
    }
    setSending(true)
    setError('')
    setSuccess('')
    try {
      await api.support.createTicket({ subject: subject.trim(), message: message.trim(), category })
      setSuccess('Message envoye ! Notre equipe vous repondra rapidement.')
      setSubject('')
      setMessage('')
      setCategory('general')
      loadTickets()
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi')
    }
    setSending(false)
  }

  const loadDetail = async (id) => {
    if (expandedTicket === id) { setExpandedTicket(null); return }
    setExpandedTicket(id)
    try {
      const data = await api.support.getTicket(id)
      setTicketDetail(data)
    } catch (e) { setTicketDetail(null) }
  }

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return
    setReplying(true)
    try {
      await api.support.replyTicket(ticketId, replyText.trim())
      setReplyText('')
      loadDetail(ticketId)
      loadTickets()
    } catch (e) { /* ignore */ }
    setReplying(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Contactez-nous</h1>
          <p className="text-gray-400 text-sm">Une question, un probleme, une suggestion ? Ecrivez-nous !</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 mb-8">
          {/* Categorie */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Categorie</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    category === cat.value
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sujet */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Sujet</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Decrivez brievement votre demande..."
              maxLength={200}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Expliquez en detail..."
              rows={5}
              maxLength={2000}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{message.length}/2000</p>
          </div>

          {/* Erreur / Succes */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Bouton envoyer */}
          <button
            type="submit"
            disabled={sending || !subject.trim() || !message.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {sending ? 'Envoi en cours...' : 'Envoyer le message'}
          </button>
        </form>

        {/* Historique des tickets */}
        {isAuthenticated && tickets.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Mes messages ({tickets.length})
            </h2>
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const status = STATUS_LABELS[ticket.status] || STATUS_LABELS.open
                const isExpanded = expandedTicket === ticket.id
                return (
                  <div key={ticket.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    {/* Header ticket */}
                    <button
                      onClick={() => loadDetail(ticket.id)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{ticket.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          {ticket._count?.replies > 0 && (
                            <span className="text-xs text-gray-500">{ticket._count.replies} reponse(s)</span>
                          )}
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {/* Detail + replies */}
                    {isExpanded && ticketDetail && (
                      <div className="border-t border-white/10 p-4 space-y-3">
                        {/* Message original */}
                        <div className="bg-blue-500/10 rounded-lg p-3">
                          <p className="text-xs text-blue-400 font-semibold mb-1">Votre message :</p>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">{ticketDetail.message}</p>
                        </div>

                        {/* Replies */}
                        {ticketDetail.replies?.map((reply) => (
                          <div
                            key={reply.id}
                            className={`rounded-lg p-3 ${
                              reply.isAdmin
                                ? 'bg-green-500/10 border border-green-500/20'
                                : 'bg-white/5'
                            }`}
                          >
                            <p className={`text-xs font-semibold mb-1 ${reply.isAdmin ? 'text-green-400' : 'text-gray-400'}`}>
                              {reply.isAdmin ? 'Support Koundoul' : 'Vous'} — {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{reply.message}</p>
                          </div>
                        ))}

                        {/* Reply form */}
                        {ticket.status !== 'closed' && (
                          <div className="flex gap-2">
                            <input
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Repondre..."
                              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(ticket.id); } }}
                            />
                            <button
                              onClick={() => handleReply(ticket.id)}
                              disabled={replying || !replyText.trim()}
                              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-colors"
                            >
                              {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Contact
