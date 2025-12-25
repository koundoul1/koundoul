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
      
      // Gestion spécifique des erreurs Gemini
      if (error.message?.includes('API_KEY') || error.message?.includes('403') || error.message?.includes('401')) {
        throw new Error('❌ Clé API Gemini refusée. Vérifiez votre clé ou votre quota.')
      }
      
      throw new Error(`Erreur lors de la génération de l'aide pédagogique: ${error.message || 'Erreur inconnue'}`)
    }
  }

  async analyzeExercise(imageData) {
    if (!this.genAI) {
      return {
        success: false,
        error: { message: 'Coach AI non configuré. Ajoutez GOOGLE_AI_API_KEY dans .env' }
      }
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

      // Convertir l'image base64 en format pour Gemini
      const imagePart = {
        inlineData: {
          data: imageData.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: imageData.match(/^data:image\/(\w+);base64,/)?.[1] || 'image/png'
        }
      }

      const prompt = `Tu es un coach pédagogique expert en sciences (mathématiques, physique, chimie).

Analyse cette image d'exercice et fournis :
1. Une description claire de l'exercice
2. Les concepts scientifiques impliqués
3. Une stratégie de résolution étape par étape (sans donner la réponse complète)
4. Des indices progressifs pour guider l'élève
5. Les formules et concepts clés à utiliser

Réponds en français, de manière pédagogique et encourageante.`

      const result = await model.generateContent([prompt, imagePart])
      const response = await result.response
      const text = response.text()

      return {
        success: true,
        data: {
          analysis: text,
          type: 'image',
          source: 'Gemini AI'
        }
      }

    } catch (error) {
      console.error('❌ Erreur Coach AI (image):', error)
      
      // Gestion spécifique des erreurs Gemini
      if (error.message?.includes('API_KEY') || error.message?.includes('403') || error.message?.includes('401')) {
        throw new Error('❌ Clé API Gemini refusée. Vérifiez votre clé ou votre quota.')
      }
      
      throw new Error(`Erreur lors de l'analyse de l'image: ${error.message || 'Erreur inconnue'}`)
    }
  }

  async analyzeText(text) {
    if (!this.genAI) {
      return {
        success: false,
        error: { message: 'Coach AI non configuré. Ajoutez GOOGLE_AI_API_KEY dans .env' }
      }
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

      const prompt = `Tu es un coach pédagogique expert en sciences (mathématiques, physique, chimie).

Analyse cet exercice et fournis :
1. Une description claire de l'exercice
2. Les concepts scientifiques impliqués
3. Une stratégie de résolution étape par étape (sans donner la réponse complète)
4. Des indices progressifs pour guider l'élève
5. Les formules et concepts clés à utiliser

Exercice :
${text}

Réponds en français, de manière pédagogique et encourageante.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const textResponse = response.text()

      return {
        success: true,
        data: {
          analysis: textResponse,
          type: 'text',
          source: 'Gemini AI'
        }
      }

    } catch (error) {
      console.error('❌ Erreur Coach AI (texte):', error)
      
      // Gestion spécifique des erreurs Gemini
      if (error.message?.includes('API_KEY') || error.message?.includes('403') || error.message?.includes('401')) {
        throw new Error('❌ Clé API Gemini refusée. Vérifiez votre clé ou votre quota.')
      }
      
      throw new Error(`Erreur lors de l'analyse du texte: ${error.message || 'Erreur inconnue'}`)
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
