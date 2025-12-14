import { useState, useEffect } from 'react';
import { Download, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export default function DownloadChapterButton({ chapterId, chapterTitle }) {
  const { downloadChapter, removeDownloadedChapter, getDownloadedChapters } = usePWA();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    checkIfDownloaded();

    // Écouter les événements de téléchargement
    const handleChapterCached = (event) => {
      if (event.detail.chapterId === chapterId) {
        setIsDownloaded(true);
        setIsDownloading(false);
      }
    };

    const handleChapterRemoved = (event) => {
      if (event.detail.chapterId === chapterId) {
        setIsDownloaded(false);
        setIsRemoving(false);
      }
    };

    const handleCacheError = (event) => {
      if (event.detail.chapterId === chapterId) {
        setIsDownloading(false);
        alert('Erreur lors du téléchargement: ' + event.detail.error);
      }
    };

    window.addEventListener('chapter-cached', handleChapterCached);
    window.addEventListener('chapter-removed', handleChapterRemoved);
    window.addEventListener('chapter-cache-error', handleCacheError);

    return () => {
      window.removeEventListener('chapter-cached', handleChapterCached);
      window.removeEventListener('chapter-removed', handleChapterRemoved);
      window.removeEventListener('chapter-cache-error', handleCacheError);
    };
  }, [chapterId]);

  const checkIfDownloaded = async () => {
    const chapters = await getDownloadedChapters();
    const found = chapters.find(c => c.id === chapterId);
    setIsDownloaded(!!found);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const success = await downloadChapter(chapterId);
    
    if (!success) {
      setIsDownloading(false);
      alert('Impossible de télécharger le chapitre. Vérifiez votre connexion.');
    }
  };

  const handleRemove = async () => {
    if (!confirm(`Supprimer "${chapterTitle}" du stockage hors ligne ?`)) {
      return;
    }

    setIsRemoving(true);
    await removeDownloadedChapter(chapterId);
    setIsDownloaded(false);
    setIsRemoving(false);
  };

  if (isDownloaded) {
    return (
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border-2 border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
        title="Supprimer du stockage hors ligne"
      >
        {isRemoving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Suppression...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Téléchargé</span>
            <Trash2 className="w-4 h-4 ml-1 opacity-50" />
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border-2 border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
      title="Télécharger pour accès hors ligne"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">Téléchargement...</span>
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          <span className="text-sm font-semibold">Télécharger</span>
        </>
      )}
    </button>
  );
}


