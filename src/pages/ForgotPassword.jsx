import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const ForgotPassword = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-kprimary/10 flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-8 h-8 text-kprimary" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            {t('auth.forgotPassword.title')}
          </h1>

          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {t('auth.forgotPassword.description')}
          </p>

          <a
            href="mailto:contact@koundoul.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-kprimary text-white font-semibold rounded-xl hover:bg-kprimary/90 transition-colors mb-4"
          >
            <Mail className="w-4 h-4" />
            contact@koundoul.com
          </a>

          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
