import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { BookOpen, ChevronRight } from 'lucide-react';

const subjects = [
  { key: 'math', value: 'Mathématiques', icon: '📐', color: 'from-blue-600 to-blue-700' },
  { key: 'physics', value: 'Physique', icon: '⚛️', color: 'from-purple-600 to-purple-700' },
  { key: 'chemistry', value: 'Chimie', icon: '🧪', color: 'from-emerald-600 to-emerald-700' }
];

const Courses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubjectClick = (subjectValue) => {
    navigate(`/micro-lessons?subject=${encodeURIComponent(subjectValue)}`);
  };

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">{t('courses.title')}</h1>
          <p className="text-gray-400">{t('courses.subtitle') || 'Explore les matieres et commence a apprendre'}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {subjects.map(sub => (
            <div
              key={sub.key}
              onClick={() => handleSubjectClick(sub.value)}
              className="k-card k-card-glow cursor-pointer hover:scale-[1.03] transition-all p-6"
            >
              <div className="text-5xl mb-4 text-center">{sub.icon}</div>
              <h2 className="text-xl font-black text-center text-white mb-2">
                {t(`courses.${sub.key}`)}
              </h2>
              <p className="text-gray-400 text-center text-sm mb-4">
                {t(`courses.explore${sub.key.charAt(0).toUpperCase() + sub.key.slice(1)}`) || ''}
              </p>
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r ${sub.color} text-white text-xs font-bold`}>
                  <BookOpen className="w-3.5 h-3.5" /> {t('courses.lessons')}
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="k-card p-6 sm:p-8">
          <h2 className="text-2xl font-black mb-6">{t('courses.strengths')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '✅', title: t('courses.microLessons'), desc: t('courses.microLessonsDesc') },
              { icon: '🎮', title: t('courses.playfulLearning'), desc: t('courses.playfulLearningDesc') },
              { icon: '🤖', title: t('courses.integratedAI'), desc: t('courses.integratedAIDesc') },
              { icon: '📊', title: t('courses.progressTracking'), desc: t('courses.progressTrackingDesc') }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
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
