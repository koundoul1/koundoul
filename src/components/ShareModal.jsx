import React, { useState } from 'react'
import { X, Copy, Check, Mail } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../context/AuthContext'

const SHARE_URL = 'https://www.koundoul.com'
const SHARE_TEXT_WA = 'Rejoins-moi sur Koundoul, la plateforme pour réussir en Maths, Physique et Chimie ! 🚀 https://www.koundoul.com'
const SHARE_TEXT_X = 'Je progresse en sciences avec Koundoul ! 🚀'
const EMAIL_SUBJECT = 'Rejoins Koundoul'
const EMAIL_BODY = 'Salut ! Rejoins-moi sur Koundoul pour progresser en Maths, Physique et Chimie : https://www.koundoul.com'

const ShareModal = ({ onClose }) => {
  const { user, isAuthenticated } = useAuth()
  const [linkCopied, setLinkCopied] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch { /* fallback silently */ }
  }

  const copyCode = async () => {
    if (!user?.invitationCode) return
    try {
      await navigator.clipboard.writeText(user.invitationCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch { /* fallback silently */ }
  }

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      color: 'bg-green-600 hover:bg-green-700',
      href: `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT_WA)}`
    },
    {
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`
    },
    {
      name: 'X',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'bg-gray-800 hover:bg-gray-900',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT_X)}&url=${encodeURIComponent(SHARE_URL)}`
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      color: 'bg-orange-600 hover:bg-orange-700',
      href: `mailto:?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(EMAIL_BODY)}`
    }
  ]

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'shareFadeIn 0.2s ease-out' }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-kprimary/30 overflow-hidden"
        style={{
          background: '#0F0F1E',
          animation: 'shareSlideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white">Partage Koundoul 🚀</h2>
            <p className="text-sm text-white/50 mt-0.5">Invite tes amis à progresser avec toi</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-5">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-4">
              <QRCodeSVG
                value={SHARE_URL}
                size={200}
                fgColor="#6C63FF"
                bgColor="#FFFFFF"
                level="M"
                imageSettings={{
                  src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#6C63FF"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="22" font-weight="900" font-family="sans-serif">K</text></svg>'),
                  width: 36,
                  height: 36,
                  excavate: true
                }}
              />
            </div>
          </div>

          {/* Link copy */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
            <input
              type="text"
              readOnly
              value={SHARE_URL}
              className="flex-1 bg-transparent text-white/70 text-sm px-3 py-2 outline-none"
            />
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                linkCopied
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-kprimary text-white hover:bg-kprimary/90'
              }`}
            >
              {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {linkCopied ? 'Copié !' : 'Copier'}
            </button>
          </div>

          {/* Social share buttons */}
          <div className="grid grid-cols-4 gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-white transition-all active:scale-95 ${social.color}`}
              >
                {social.icon}
                <span className="text-[10px] font-medium">{social.name}</span>
              </a>
            ))}
          </div>

          {/* Referral code */}
          {isAuthenticated && user?.invitationCode && (
            <div className="bg-kprimary/10 border border-kprimary/20 rounded-xl p-4">
              <p className="text-sm text-white/60 mb-2">Partage ton code perso :</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 text-lg font-bold text-kprimary tracking-wider">
                  {user.invitationCode}
                </span>
                <button
                  onClick={copyCode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    codeCopied
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {codeCopied ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shareSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes shareFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default ShareModal
