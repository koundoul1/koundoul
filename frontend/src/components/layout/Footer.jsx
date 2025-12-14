/**
 * 🦶 Footer Koundoul
 * Pied de page avec liens et informations
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Brain, 
  Mail, 
  Twitter, 
  Github, 
  Linkedin,
  Heart,
  ExternalLink
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Résolveur IA', href: '/solver' },
      { name: 'Quiz', href: '/quiz' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'API', href: '/api-docs' }
    ],
    support: [
      { name: 'Centre d\'aide', href: '/help' },
      { name: 'Documentation', href: '/docs' },
      { name: 'Contact', href: '/contact' },
      { name: 'Statut', href: '/status' }
    ],
    company: [
      { name: 'À propos', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Carrières', href: '/careers' },
      { name: 'Presse', href: '/press' }
    ],
    legal: [
      { name: 'Conditions d\'utilisation', href: '/terms' },
      { name: 'Politique de confidentialité', href: '/privacy' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'RGPD', href: '/gdpr' }
    ]
  }

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/koundoul', icon: Twitter },
    { name: 'GitHub', href: 'https://github.com/koundoul', icon: Github },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/koundoul', icon: Linkedin },
    { name: 'Email', href: 'mailto:contact@koundoul.com', icon: Mail }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Koundoul</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              La plateforme de résolution de problèmes scientifiques alimentée par l'IA. 
              Apprenez, résolvez et excellez en sciences.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Produit
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors flex items-center"
                  >
                    {link.name}
                    {link.href.startsWith('http') && (
                      <ExternalLink className="h-3 w-3 ml-1" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors flex items-center"
                  >
                    {link.name}
                    {link.href.startsWith('http') && (
                      <ExternalLink className="h-3 w-3 ml-1" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Entreprise
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors flex items-center"
                  >
                    {link.name}
                    {link.href.startsWith('http') && (
                      <ExternalLink className="h-3 w-3 ml-1" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Légal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors flex items-center"
                  >
                    {link.name}
                    {link.href.startsWith('http') && (
                      <ExternalLink className="h-3 w-3 ml-1" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-white mb-2">
              Restez informé
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Recevez les dernières actualités et fonctionnalités de Koundoul.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors">
                S'abonner
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center text-gray-400 text-sm">
            <span>© {currentYear} Koundoul. Fait avec</span>
            <Heart className="h-4 w-4 text-red-500 mx-1" />
            <span>en France</span>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-400 text-sm">
              Version 1.0.0 • Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


