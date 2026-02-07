import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { MessageSquare, Sparkles } from 'lucide-react';

const Forum = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-20 lg:pb-0">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 backdrop-blur-sm mb-6">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Forum Communautaire</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              💬 {t('forum.title')}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            {t('forum.description')}
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-white/10 text-center">
          <MessageSquare className="w-16 h-16 sm:w-20 sm:h-20 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-black mb-4 text-gray-300">
            Forum en développement
          </h2>
          <p className="text-gray-400 text-lg">
            Le forum communautaire sera bientôt disponible. Revenez bientôt pour partager vos questions et solutions !
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forum;
