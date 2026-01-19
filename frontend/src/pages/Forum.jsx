import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const Forum = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">💬 {t('forum.title')}</h1>
      <p className="text-gray-600">{t('forum.description')}</p>
    </div>
  );
};

export default Forum;
