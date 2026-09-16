import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Missing token — bad URL
  useEffect(() => {
    if (!token) setError('Lien invalide. Fais une nouvelle demande de réinitialisation.');
  }, [token]);

  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirm && confirm.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordValid) { setError('Le mot de passe doit faire au moins 8 caractères.'); return; }
    if (!passwordsMatch) { setError('Les mots de passe ne correspondent pas.'); return; }
    try {
      setLoading(true);
      setError('');
      await api.auth.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">

          <div className="w-16 h-16 rounded-full bg-kprimary/10 flex items-center justify-center mx-auto mb-6">
            {done
              ? <CheckCircle className="w-8 h-8 text-emerald-400" />
              : error && !password
              ? <XCircle className="w-8 h-8 text-red-400" />
              : <KeyRound className="w-8 h-8 text-kprimary" />
            }
          </div>

          {done ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-3">Mot de passe modifié !</h1>
              <p className="text-gray-400 text-sm mb-6">
                Tu vas être redirigé vers la connexion dans quelques secondes…
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-kprimary hover:underline">
                <ArrowLeft className="w-4 h-4" /> Se connecter maintenant
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">
                Nouveau mot de passe
              </h1>
              <p className="text-gray-400 text-sm text-center mb-6">
                Choisis un mot de passe solide d'au moins 8 caractères.
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {token && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Minimum 8 caractères"
                        autoFocus
                        className="w-full pr-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-kprimary/50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <p className={`text-xs mt-1 ${passwordValid ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {passwordValid ? '✓ Longueur correcte' : `${8 - password.length} caractère(s) manquant(s)`}
                      </p>
                    )}
                  </div>

                  {/* Confirm */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Répète le mot de passe"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-kprimary/50 transition-colors"
                    />
                    {confirm.length > 0 && (
                      <p className={`text-xs mt-1 ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                        {passwordsMatch ? '✓ Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !passwordValid || !passwordsMatch}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-kprimary to-ksecondary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
                  </button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Nouvelle demande de lien
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
