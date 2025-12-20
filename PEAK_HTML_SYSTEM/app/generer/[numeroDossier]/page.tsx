import { Suspense } from 'react'
import Link from 'next/link'
import PromptCopyCard from '@/components/PromptCopyCard'
import HTMLUploadCard from '@/components/HTMLUploadCard'
import { InscriptionData } from '@/lib/prompt-builder'

// Simuler la récupération des données (à adapter selon votre DB)
async function getInscription(numeroDossier: string): Promise<InscriptionData> {
  // TODO: Remplacer par votre vraie fonction de récupération
  // Par exemple depuis Supabase, Prisma, etc.
  return {
    numero_dossier: numeroDossier,
    nom_entreprise: 'Exemple Entreprise',
    categorie: 'Services professionnels',
    domaine_complet: 'exemple.business.sn',
    slogan: 'Votre slogan ici',
    email: 'contact@exemple.sn',
    telephone: '+221 77 123 45 67',
    adresse: 'Dakar, Sénégal',
    horaires: 'Lun-Ven: 9h-18h',
    services: 'Service 1 | Service 2 | Service 3'
  }
}

export default async function GenererPage({
  params
}: {
  params: { numeroDossier: string }
}) {
  const inscription = await getInscription(params.numeroDossier)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link 
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium mb-3 inline-flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {inscription.nom_entreprise}
          </h1>
          <p className="text-gray-600 mt-1">
            {inscription.numero_dossier} • {inscription.categorie} • {inscription.domaine_complet}
          </p>
        </div>
      </header>
      
      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Infos rapides */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-3">📋 Informations de l'inscription</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email</span>
                <p className="font-medium text-gray-900">{inscription.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Téléphone</span>
                <p className="font-medium text-gray-900">{inscription.telephone}</p>
              </div>
              <div>
                <span className="text-gray-500">Adresse</span>
                <p className="font-medium text-gray-900">{inscription.adresse}</p>
              </div>
              <div>
                <span className="text-gray-500">Horaires</span>
                <p className="font-medium text-gray-900">{inscription.horaires}</p>
              </div>
            </div>
          </div>
          
          {/* Étape 1 : Prompt */}
          <PromptCopyCard inscription={inscription} />
          
          {/* Étape 2 : Upload */}
          <HTMLUploadCard numeroDossier={inscription.numero_dossier} />
        </div>
      </main>
    </div>
  )
}
