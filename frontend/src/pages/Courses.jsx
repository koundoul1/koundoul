import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { BookOpen, Target, Sparkles, Zap, TrendingUp } from 'lucide-react';

const Courses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubjectClick = (subject) => {
    const subjectMap = {
      'math': 'Mathématiques',
      'physics': 'Physique',
      'chemistry': 'Chimie'
    };
    const subjectValue = subjectMap[subject] || 'all';
    navigate(`/micro-lessons?subject=${encodeURIComponent(subjectValue)}`);
  };

  const subjects = [
    { 
      key: 'math', 
      icon: '📐', 
      gradient: 'from-blue-500 to-blue-600',
      count: 290
    },
    { 
      key: 'physics', 
      icon: '⚛️', 
      gradient: 'from-purple-500 to-purple-600',
      count: 80
    },
    { 
      key: 'chemistry', 
      icon: '🧪', 
      gradient: 'from-emerald-500 to-emerald-600',
      count: 50
    }
  ];

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
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">{t('courses.title')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('courses.title')}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Explorez tous les cours par matière et progressez à votre rythme
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {subjects.map((subject) => (
            <div
              key={subject.key}
              onClick={() => handleSubjectClick(subject.key)}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative z-10 text-center">
                <div className="text-6xl sm:text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {subject.icon}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-3">
                  {t(`courses.${subject.key}`)}
                </h2>
                <p className="text-gray-400 mb-4 text-sm sm:text-base">
                  {t(`courses.explore${subject.key.charAt(0).toUpperCase() + subject.key.slice(1)}`)}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-sm sm:text-base">
                    {subject.count} {t('courses.lessons')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Strengths Section */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {t('courses.strengths')}
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              { icon: '✅', title: t('courses.microLessons'), desc: t('courses.microLessonsDesc'), gradient: 'from-blue-500 to-cyan-500' },
              { icon: '🎮', title: t('courses.playfulLearning'), desc: t('courses.playfulLearningDesc'), gradient: 'from-purple-500 to-pink-500' },
              { icon: '🤖', title: t('courses.integratedAI'), desc: t('courses.integratedAIDesc'), gradient: 'from-amber-500 to-orange-500' },
              { icon: '📊', title: t('courses.progressTracking'), desc: t('courses.progressTrackingDesc'), gradient: 'from-green-500 to-emerald-500' }
            ].map((strength, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${strength.gradient} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                    {strength.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg mb-2">{strength.title}</h3>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                      {strength.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
