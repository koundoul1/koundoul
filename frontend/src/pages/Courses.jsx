import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const Courses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubjectClick = (subject) => {
    // Rediriger vers /micro-lessons avec filtre par matière
    // Les valeurs correspondent aux noms exacts utilisés dans MicroLessons
    const subjectMap = {
      'math': 'Mathématiques',
      'physics': 'Physique',
      'chemistry': 'Chimie'
    };
    const subjectValue = subjectMap[subject] || 'all';
    navigate(`/micro-lessons?subject=${encodeURIComponent(subjectValue)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">📚 {t('courses.title')}</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Mathématiques */}
        <div 
          onClick={() => handleSubjectClick('math')}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition"
        >
          <div className="text-6xl mb-4 text-center">📐</div>
          <h2 className="text-2xl font-bold text-center mb-4">{t('courses.math')}</h2>
          <p className="text-gray-600 text-center mb-4">
            {t('courses.exploreMath')}
          </p>
          <div className="text-center">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              290 {t('courses.lessons')}
            </span>
          </div>
        </div>

        {/* Physique */}
        <div 
          onClick={() => handleSubjectClick('physics')}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition"
        >
          <div className="text-6xl mb-4 text-center">⚛️</div>
          <h2 className="text-2xl font-bold text-center mb-4">{t('courses.physics')}</h2>
          <p className="text-gray-600 text-center mb-4">
            {t('courses.discoverPhysics')}
          </p>
          <div className="text-center">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              80 {t('courses.lessons')}
            </span>
          </div>
        </div>

        {/* Chimie */}
        <div 
          onClick={() => handleSubjectClick('chemistry')}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition"
        >
          <div className="text-6xl mb-4 text-center">🧪</div>
          <h2 className="text-2xl font-bold text-center mb-4">{t('courses.chemistry')}</h2>
          <p className="text-gray-600 text-center mb-4">
            {t('courses.exploreChemistry')}
          </p>
          <div className="text-center">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              50 {t('courses.lessons')}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">🎯 {t('courses.strengths')}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <h3 className="font-bold">{t('courses.microLessons')}</h3>
              <p className="text-gray-600">
                {t('courses.microLessonsDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🎮</span>
            <div>
              <h3 className="font-bold">{t('courses.playfulLearning')}</h3>
              <p className="text-gray-600">
                {t('courses.playfulLearningDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🤖</span>
            <div>
              <h3 className="font-bold">{t('courses.integratedAI')}</h3>
              <p className="text-gray-600">
                {t('courses.integratedAIDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">📊</span>
            <div>
              <h3 className="font-bold">{t('courses.progressTracking')}</h3>
              <p className="text-gray-600">
                {t('courses.progressTrackingDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
