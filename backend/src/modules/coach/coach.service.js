import { GoogleGenerativeAI } from '@google/generative-ai'

class CoachService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      console.warn('⚠️  GEMINI_API_KEY ou GOOGLE_AI_API_KEY manquant - Coach AI désactivé')
      this.genAI = null
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
  }

  async getHelp({ subject, level, topic, question, studentContext = {} }) {
    if (!this.genAI) {
      return {
        success: false,
        error: { message: 'Coach AI non configuré. Ajoutez GEMINI_API_KEY dans .env' }
      }
    }
    
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

      const prompt = `Tu es un coach pédagogique expert en ${subject} pour un élève de ${level}.

Contexte de l'élève :
- Niveau : ${level}
- Matière : ${subject}
- Sujet : ${topic || 'général'}
${studentContext.strengths ? `- Points forts : ${studentContext.strengths.join(', ')}` : ''}
${studentContext.weaknesses ? `- Difficultés : ${studentContext.weaknesses.join(', ')}` : ''}

Question de l'élève :
${question}

Fournis une aide pédagogique personnalisée :
1. Reformule la question pour vérifier la compréhension
2. Donne des indices progressifs (sans donner la réponse complète)
3. Suggère des ressources ou concepts à revoir
4. Encourage l'élève avec un ton bienveillant

Réponds en français, de manière claire et pédagogique.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return {
        success: true,
        data: {
          response: text,
          source: 'Gemini AI',
          context: { subject, level, topic }
        }
      }

    } catch (error) {
      console.error('❌ Erreur Coach AI:', error)
      throw new Error('Erreur lors de la génération de l\'aide pédagogique')
    }
  }

  async getPersonalizedGuidance({ userId, subject, level }) {
    // Pour l'instant, retourne des conseils génériques
    // TODO: Intégrer l'historique de l'utilisateur pour personnaliser
    
    const guidance = {
      subject,
      level,
      recommendations: [
        'Revoir les bases du chapitre en cours',
        'Pratiquer avec des exercices progressifs',
        'Identifier les points à améliorer'
      ],
      nextSteps: [
        'Compléter les micro-leçons du niveau actuel',
        'Tester avec des QCM pour évaluer la compréhension',
        'Faire des exercices pour approfondir'
      ]
    }

    return {
      success: true,
      data: guidance
    }
  }
}

export default new CoachService()
