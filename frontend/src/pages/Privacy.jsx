import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Politique de Confidentialité
            </h1>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Dernière mise à jour: 9 novembre 2025
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              1. Données collectées
            </h2>
            <p className="text-gray-700 mb-3">
              Nous collectons les données suivantes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Informations de compte (nom, prénom, email)</li>
              <li>Données d'utilisation (progression, exercices complétés)</li>
              <li>Données techniques (adresse IP, navigateur)</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              2. Utilisation des données
            </h2>
            <p className="text-gray-700 mb-3">
              Vos données sont utilisées pour:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Fournir et améliorer nos services</li>
              <li>Personnaliser votre expérience d'apprentissage</li>
              <li>Communiquer avec vous (notifications, mises à jour)</li>
              <li>Analyser l'utilisation de la plateforme</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              3. Protection des données
            </h2>
            <p className="text-gray-700">
              Nous mettons en œuvre des mesures de sécurité appropriées pour
              protéger vos données personnelles contre tout accès non autorisé,
              modification, divulgation ou destruction.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              4. Partage des données
            </h2>
            <p className="text-gray-700 mb-3">
              Nous ne vendons ni ne louons vos données personnelles à des tiers.
              Nous pouvons partager vos données uniquement dans les cas suivants:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Avec votre consentement explicite</li>
              <li>Pour se conformer à la loi</li>
              <li>Avec des prestataires de services (hébergement, analytics)</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              5. Vos droits (RGPD)
            </h2>
            <p className="text-gray-700 mb-3">
              Conformément au RGPD, vous disposez des droits suivants:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement ("droit à l'oubli")</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              6. Cookies
            </h2>
            <p className="text-gray-700">
              Nous utilisons des cookies essentiels pour le fonctionnement du site
              (authentification, préférences). Vous pouvez désactiver les cookies
              dans votre navigateur, mais certaines fonctionnalités pourraient ne
              plus fonctionner.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              7. Données des mineurs
            </h2>
            <p className="text-gray-700">
              Koundoul est destiné aux élèves de lycée (15-18 ans). Pour les
              utilisateurs mineurs, nous recommandons l'accord parental. Les parents
              peuvent accéder au dashboard parents pour suivre la progression.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              8. Modifications de la politique
            </h2>
            <p className="text-gray-700">
              Nous pouvons modifier cette politique de confidentialité. Les
              modifications seront publiées sur cette page avec la date de mise à jour.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              9. Contact
            </h2>
            <p className="text-gray-700">
              Pour exercer vos droits ou pour toute question:
              <a href="mailto:privacy@koundoul.com" className="text-blue-600 hover:text-blue-700 ml-1">
                privacy@koundoul.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Privacy









