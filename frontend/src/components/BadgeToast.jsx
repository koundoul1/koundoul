import { useEffect, useState } from 'react';
import { X, Award } from 'lucide-react';

export default function BadgeToast({ badge, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 100);

    // Auto-fermeture après 5 secondes
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-white rounded-xl shadow-2xl border-2 border-yellow-400 p-4 w-80">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl animate-bounce"
              style={{ backgroundColor: badge.color + '20' }}
            >
              {badge.icon}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-gray-900">
                Nouveau Badge !
              </h3>
            </div>
            <p className="font-bold text-lg text-gray-900 mb-1">
              {badge.name}
            </p>
            <p className="text-sm text-gray-600">
              {badge.description}
            </p>
            <p className="text-xs text-green-600 font-semibold mt-2">
              +50 XP bonus !
            </p>
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}


