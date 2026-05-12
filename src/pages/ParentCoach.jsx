import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Send, MessageSquare, Loader2, ChevronDown, Shield, Trash2, Plus, Info } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ParentCoach() {
  var { user, isAuthenticated } = useAuth();
  var navigate = useNavigate();
  var [mode, setMode] = useState('general');
  var [children, setChildren] = useState([]);
  var [selectedChild, setSelectedChild] = useState(null);
  var [conversations, setConversations] = useState([]);
  var [activeConvId, setActiveConvId] = useState(null);
  var [messages, setMessages] = useState([]);
  var [input, setInput] = useState('');
  var [streaming, setStreaming] = useState(false);
  var [streamText, setStreamText] = useState('');
  var messagesEndRef = useRef(null);

  useEffect(function() {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!user?.isParent) { navigate('/dashboard'); return; }
    loadChildren();
    loadConversations();
  }, [isAuthenticated]);

  useEffect(function() {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  var loadChildren = async function() {
    try {
      var res = await api.parent.getChildren();
      var data = res.data || res || [];
      setChildren(data);
      if (data.length > 0 && !selectedChild) setSelectedChild(data[0].id);
    } catch (e) {}
  };

  var loadConversations = async function() {
    try {
      var res = await api.parentCoach.getConversations(20);
      setConversations(res.data || []);
    } catch (e) {}
  };

  var startNewChat = function() {
    setActiveConvId(null);
    setMessages([]);
    setStreamText('');
  };

  var loadConversation = async function(convId) {
    setActiveConvId(convId);
    try {
      var base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : 'http://localhost:5000/api';
      var token = localStorage.getItem('token');
      var res = await fetch(base + '/parent-coach/conversations/' + convId, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        // Parent coach reuses coachConversation — load from admin endpoint or direct
      }
    } catch (e) {}
  };

  var deleteConversation = async function(convId) {
    try {
      await api.parentCoach.deleteConversation(convId);
      setConversations(function(prev) { return prev.filter(function(c) { return c.id !== convId; }); });
      if (activeConvId === convId) startNewChat();
    } catch (e) {}
  };

  var sendMessage = async function() {
    if (!input.trim() || streaming) return;
    var msg = input.trim();
    setInput('');
    setMessages(function(prev) { return prev.concat([{ role: 'user', content: msg }]); });
    setStreaming(true);
    setStreamText('');

    var childId = mode === 'contextualized' ? selectedChild : null;

    await api.parentCoach.chatStream(
      msg,
      mode,
      childId,
      activeConvId,
      function onChunk(text) { setStreamText(function(prev) { return prev + text; }); },
      function onDone(data) {
        setStreamText(function(prev) {
          setMessages(function(msgs) { return msgs.concat([{ role: 'assistant', content: prev }]); });
          return '';
        });
        if (data.conversationId) setActiveConvId(data.conversationId);
        setStreaming(false);
        loadConversations();
      },
      function onError(err) {
        setMessages(function(prev) { return prev.concat([{ role: 'assistant', content: 'Erreur : ' + err }]); });
        setStreaming(false);
      }
    );
  };

  var selectedChildName = '';
  if (selectedChild) {
    var ch = children.find(function(c) { return c.id === selectedChild; });
    selectedChildName = ch ? (ch.firstName || ch.email) : '';
  }

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-7 h-7 text-kprimary" />
          <h1 className="text-xl sm:text-2xl font-bold">Coach IA Parent</h1>
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-2 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-300">
            Le Coach Parent vous aide a accompagner votre enfant. En mode contextualise, il connait les statistiques mais pas les conversations privees de votre enfant.
          </p>
        </div>

        {/* Mode toggle + child selector */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={function() { setMode('general'); }}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (mode === 'general' ? 'bg-kprimary text-white' : 'text-gray-400 hover:text-white')}
            >
              Question generale
            </button>
            <button
              onClick={function() { setMode('contextualized'); }}
              disabled={children.length === 0}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 ' + (mode === 'contextualized' ? 'bg-kprimary text-white' : 'text-gray-400 hover:text-white')}
            >
              Sur mon enfant
            </button>
          </div>

          {mode === 'contextualized' && children.length > 0 && (
            <select
              value={selectedChild || ''}
              onChange={function(e) { setSelectedChild(e.target.value); }}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-kprimary"
            >
              {children.map(function(c) {
                return <option key={c.id} value={c.id}>{c.firstName || c.email}</option>;
              })}
            </select>
          )}
        </div>

        <div className="flex gap-4" style={{ minHeight: '500px' }}>

          {/* Sidebar conversations */}
          <div className="hidden md:flex flex-col w-56 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex-shrink-0">
            <button onClick={startNewChat} className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-kprimary hover:bg-white/5 border-b border-white/5">
              <Plus className="w-4 h-4" /> Nouveau chat
            </button>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-6">Aucune conversation</p>
              ) : conversations.map(function(conv) {
                return (
                  <div
                    key={conv.id}
                    className={'flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer border-b border-white/5 ' + (activeConvId === conv.id ? 'bg-kprimary/10 text-white' : 'text-gray-400 hover:bg-white/5')}
                    onClick={function() { loadConversation(conv.id); }}
                  >
                    <span className="truncate flex-1 text-xs">{conv.title}</span>
                    <button
                      onClick={function(e) { e.stopPropagation(); deleteConversation(conv.id); }}
                      className="text-gray-600 hover:text-red-400 ml-1 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && !streamText && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Brain className="w-12 h-12 text-gray-600 mb-3" />
                  <h3 className="text-gray-400 font-medium mb-1">
                    {mode === 'general' ? 'Posez une question sur la pedagogie' : 'Posez une question sur ' + selectedChildName}
                  </h3>
                  <p className="text-xs text-gray-600 max-w-sm">
                    {mode === 'general'
                      ? 'Motivation, organisation, gestion du stress, dialogue parent-enfant...'
                      : 'Le coach analysera les statistiques de votre enfant pour vous donner des conseils personnalises.'
                    }
                  </p>
                </div>
              )}

              {messages.map(function(msg, i) {
                return (
                  <div key={i} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={'max-w-[85%] px-4 py-3 rounded-2xl text-sm ' + (msg.role === 'user' ? 'bg-kprimary/20 text-gray-200' : 'bg-gray-800 text-gray-300')}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })}

              {streamText && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] px-4 py-3 rounded-2xl text-sm bg-gray-800 text-gray-300">
                    <p className="whitespace-pre-wrap">{streamText}</p>
                  </div>
                </div>
              )}

              {streaming && !streamText && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl bg-gray-800">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/5 p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={function(e) { setInput(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={mode === 'general' ? 'Comment motiver mon enfant...' : 'Comment aider ' + selectedChildName + ' en maths...'}
                  className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-kprimary"
                  disabled={streaming}
                />
                <button
                  onClick={sendMessage}
                  disabled={streaming || !input.trim()}
                  className="px-4 py-2.5 bg-kprimary text-white rounded-xl hover:bg-kprimary/90 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
