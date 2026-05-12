/**
 * Coach IA — Chat conversationnel pédagogique.
 * Dialogue multi-tour avec mémoire de session via SSE streaming.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import api from '../services/api';
import {
  Brain,
  Send,
  Plus,
  MessageSquare,
  Loader2,
  Menu,
  X,
  Trash2,
  AlertCircle
} from 'lucide-react';
import useAiQuota from '../hooks/useAiQuota';
import AiQuotaBadge from '../components/AiQuotaBadge';
import QuotaReachedModal from '../components/QuotaReachedModal';

// ── LaTeX-aware message renderer ────────────────────────────────────

const MessageContent = ({ content }) => {
  if (!content || typeof content !== 'string') return null;

  const latexBlocks = [];
  let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, f) => {
    const id = `__BLK_${latexBlocks.length}__`;
    latexBlocks.push(f.trim());
    return id;
  });

  const latexInline = [];
  processed = processed.replace(/\$([^$\n]+?)\$/g, (_, f) => {
    const id = `__INL_${latexInline.length}__`;
    latexInline.push(f.trim());
    return id;
  });

  const tokens = [
    ...latexBlocks.map((f, i) => ({ type: 'block', formula: f, index: processed.indexOf(`__BLK_${i}__`), len: `__BLK_${i}__`.length })),
    ...latexInline.map((f, i) => ({ type: 'inline', formula: f, index: processed.indexOf(`__INL_${i}__`), len: `__INL_${i}__`.length }))
  ].sort((a, b) => a.index - b.index);

  const parts = [];
  let last = 0;

  for (const t of tokens) {
    if (t.index > last) {
      parts.push(<span key={`t-${last}`} className="whitespace-pre-wrap">{processed.slice(last, t.index)}</span>);
    }
    try {
      if (t.type === 'block') {
        parts.push(<div key={`b-${t.index}`} className="my-3 flex justify-center overflow-x-auto"><BlockMath math={t.formula} /></div>);
      } else {
        parts.push(<InlineMath key={`i-${t.index}`} math={t.formula} />);
      }
    } catch {
      parts.push(<code key={`e-${t.index}`} className="text-red-300">{`$${t.formula}$`}</code>);
    }
    last = t.index + t.len;
  }
  if (last < processed.length) {
    parts.push(<span key="end" className="whitespace-pre-wrap">{processed.slice(last)}</span>);
  }

  return <div className="leading-relaxed">{parts}</div>;
};

// ── Main component ──────────────────────────────────────────────────

const VirtualCoach = () => {
  // AI Quota
  const { quota, refreshQuota, warningToast } = useAiQuota();
  const [quotaModalData, setQuotaModalData] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');

  // Conversation state
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamRef = useRef(null);

  // ── Load conversations on mount ──

  useEffect(() => {
    loadConversations();
  }, []);

  // ── Auto-scroll on new messages ──

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await api.coach.getConversations(30);
      setConversations(res.data || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadConversation = async (id) => {
    try {
      const res = await api.coach.getConversation(id);
      setMessages(res.data.messages || []);
      setCurrentConversationId(id);
      setError('');
      setSidebarOpen(false);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Impossible de charger la conversation');
    }
  };

  const handleNewChat = useCallback(() => {
    if (streamRef.current) streamRef.current.abort();
    setCurrentConversationId(null);
    setMessages([]);
    setInput('');
    setError('');
    setIsStreaming(false);
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    try {
      await api.coach.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) handleNewChat();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // ── Send message ──

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    if (streamRef.current) streamRef.current.abort();

    const userMsg = { role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError('');
    setIsStreaming(true);

    // Placeholder for assistant response (will be filled by chunks)
    let assistantText = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '', createdAt: new Date().toISOString() }]);

    streamRef.current = api.coach.chatStream({
      message: text,
      conversationId: currentConversationId,
      onMeta: (data) => {
        if (data.conversationId && !currentConversationId) {
          setCurrentConversationId(data.conversationId);
        }
      },
      onChunk: ({ text: chunk }) => {
        assistantText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: assistantText
          };
          return updated;
        });
      },
      onDone: () => {
        setIsStreaming(false);
        streamRef.current = null;
        loadConversations();
        refreshQuota();
        window.dispatchEvent(new Event('ai-quota-changed'));
      },
      onError: (msg, quotaInfo) => {
        if (quotaInfo?.quotaReached) {
          setQuotaModalData(quotaInfo);
        } else {
          setError(msg || 'Erreur de communication avec le Coach');
        }
        setIsStreaming(false);
        streamRef.current = null;
        // Remove empty assistant placeholder if error
        if (!assistantText) {
          setMessages(prev => prev.slice(0, -1));
        }
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Current conversation title ──
  const currentTitle = conversations.find(c => c.id === currentConversationId)?.title || 'Nouveau chat';

  // ── Render ──

  return (
    <div className="h-screen flex bg-gray-900">

      {/* Quota reached modal */}
      {quotaModalData && (
        <QuotaReachedModal quotaData={quotaModalData} onClose={() => setQuotaModalData(null)} />
      )}

      {/* Warning toast */}
      {warningToast && (
        <div className="fixed top-4 right-4 z-50 bg-orange-500/90 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium">
          {warningToast}
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-gray-950 border-r border-gray-800 flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        {/* New chat button */}
        <div className="p-3 border-b border-gray-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            Nouveau chat
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto py-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center py-8 px-4 text-center">
              <MessageSquare className="h-8 w-8 text-gray-600 mb-2" />
              <p className="text-sm text-gray-500">Aucune conversation</p>
              <p className="text-xs text-gray-600 mt-1">Envoie un message pour commencer</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`group flex items-center gap-2 px-3 py-2.5 mx-2 rounded-lg cursor-pointer text-sm transition-colors ${
                  conv.id === currentConversationId
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-60" />
                <span className="truncate flex-1">{conv.title || 'Sans titre'}</span>
                <button
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Brain className="h-6 w-6 text-blue-400" />
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold text-gray-200 truncate">
              Coach IA
            </h1>
            <p className="text-xs text-gray-500 truncate">{currentTitle}</p>
          </div>
          <AiQuotaBadge quota={quota} />
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Brain className="h-16 w-16 text-blue-400/30 mb-4" />
              <h2 className="text-xl font-semibold text-gray-300 mb-2">
                Comment puis-je t&apos;aider ?
              </h2>
              <p className="text-gray-500 text-sm max-w-md">
                Pose-moi une question de maths, physique ou chimie.
                Je suis ton coach personnel pour t&apos;accompagner pas à pas.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {[
                  'Explique-moi le discriminant',
                  'Je bloque sur les vecteurs',
                  'Comment équilibrer une réaction ?'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                    className="px-3 py-2 sm:py-1.5 text-sm rounded-lg border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-800 text-gray-200 rounded-bl-md border border-gray-700'
                }`}>
                  {msg.role === 'assistant' && !msg.content && isStreaming && i === messages.length - 1 ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Le Coach réfléchit...</span>
                    </div>
                  ) : (
                    <MessageContent content={msg.content} />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-400/30 text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-gray-800 px-4 py-3 bg-gray-900">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose ta question au Coach..."
              rows={1}
              className="flex-1 resize-none bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-h-32 overflow-y-auto"
              style={{ minHeight: '42px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
              disabled={isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="flex-shrink-0 p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Envoyer"
            >
              {isStreaming ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">
            Maths, physique, chimie uniquement. Enter pour envoyer, Shift+Enter pour une nouvelle ligne.
          </p>
        </div>
      </main>
    </div>
  );
};

export default VirtualCoach;
