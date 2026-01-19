import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, ArrowLeft } from 'lucide-react'

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Conditions d'Utilisation
            </h1>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Dernière mise à jour: 9 novembre 2025
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              1. Acceptation des conditions
            </h2>
            <p className="text-gray-700">
              En utilisant Koundoul, vous acceptez ces conditions d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              2. Description du service
            </h2>
            <p className="text-gray-700">
              Koundoul est une plateforme éducative en ligne proposant des cours,
              exercices et outils d'apprentissage pour les matières scientifiques
              (Mathématiques, Physique, Chimie) au niveau lycée.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              3. Compte utilisateur
            </h2>
            <p className="text-gray-700">
              Vous êtes responsable de maintenir la confidentialité de votre compte
              et de votre mot de passe. Vous acceptez de nous notifier immédiatement
              de toute utilisation non autorisée de votre compte.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              4. Utilisation acceptable
            </h2>
            <p className="text-gray-700">
              Vous vous engagez à utiliser Koundoul uniquement à des fins éducatives
              légales. Toute utilisation abusive, frauduleuse ou contraire à l'éthique
              peut entraîner la suspension de votre compte.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              5. Propriété intellectuelle
            </h2>
            <p className="text-gray-700">
              Tout le contenu présent sur Koundoul (cours, exercices, solutions)
              est protégé par le droit d'auteur. Vous ne pouvez pas copier,
              distribuer ou vendre ce contenu sans autorisation écrite.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              6. Limitation de responsabilité
            </h2>
            <p className="text-gray-700">
              Koundoul est fourni "tel quel". Nous ne garantissons pas que le service
              sera exempt d'erreurs ou disponible en permanence. Nous ne sommes pas
              responsables des résultats scolaires obtenus par les utilisateurs.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              7. Modifications des conditions
            </h2>
            <p className="text-gray-700">
              Nous nous réservons le droit de modifier ces conditions à tout moment.
              Les modifications prendront effet dès leur publication sur le site.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
              8. Contact
            </h2>
            <p className="text-gray-700">
              Pour toute question concernant ces conditions, contactez-nous à:
              <a href="mailto:contact@koundoul.com" className="text-blue-600 hover:text-blue-700 ml-1">
                contact@koundoul.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms









