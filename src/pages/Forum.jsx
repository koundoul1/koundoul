import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { MessageSquare, Construction } from 'lucide-react';

const Forum = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="h-6 w-6 text-kprimary" />
          <h1 className="text-2xl font-bold">{t('forum.title')}</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-kprimary/10 flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-kprimary" />
          </div>
          <h2 className="text-xl font-semibold text-gray-300 mb-2">
            Forum bientot disponible
          </h2>
          <p className="text-sm text-gray-500 max-w-md">
            Le forum communautaire est en cours de developpement.
            Tu pourras bientot poser des questions, echanger avec d&apos;autres eleves
            et partager tes solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forum;
