import solverService from './solver.service.js';
import generateGuidedPrompt from './prompts/guidedMode.js';
import { validateDomain, validateInput } from './prompts/validation.js';

class SolverController {
  
  async solve(req, res) {
    try {
      const { 
        input, 
        domain, 
        level,
        guidedMode,
        learningProfile 
      } = req.body;
      
      const userId = req.user?.userId || req.user?.id;

      console.log('🔍 Solver request:', { 
        userId, 
        inputLength: input?.length || 0,
        inputPreview: input?.substring(0, 100) || '',
        domain, 
        level,
        guidedMode,
        learningProfile
      });

      // 1. VALIDATION DE L'INPUT
      const inputValidation = validateInput(input);
      if (!inputValidation.isValid) {
        console.warn('❌ Validation input échouée:', inputValidation.reason, '| Input length:', input?.length || 0);
      }
      if (!inputValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: inputValidation.reason
          }
        });
      }
      
      const sanitizedInput = inputValidation.sanitized;
      
      // 2. VALIDATION DU DOMAINE (CRITIQUE)
      const domainValidation = validateDomain(sanitizedInput, domain || 'general');
      
      if (!domainValidation.isValid) {
        // Question hors cadre de l'app
        if (domainValidation.reason === 'out_of_scope') {
          return res.status(400).json({
            success: false,
            error: {
              code: 'OUT_OF_SCOPE',
              message: domainValidation.message
            }
          });
        }
        
        return res.status(400).json({
          success: false,
          error: {
            code: 'DOMAIN_ERROR',
            message: domainValidation.reason
          }
        });
      }
      
      // Utiliser le domaine suggéré si détecté
      const finalDomain = domainValidation.suggestedDomain || domain || 'general';
      
      // 3. RÉCUPÉRER LES FAIBLESSES DE L'ÉLÈVE (si connecté)
      let studentWeaknesses = [];
      if (userId) {
        // TODO: Récupérer depuis la DB
        // const userData = await User.findById(userId)
        // studentWeaknesses = userData.weaknesses || []
        studentWeaknesses = [];
      }
      
      // 4. GÉNÉRER LE PROMPT OPTIMISÉ (si mode guidé)
      let customPrompt = null;
      if (guidedMode) {
        customPrompt = generateGuidedPrompt({
          problem: sanitizedInput,
          subject: finalDomain,
          difficulty: level || 'medium',
          learningProfile: learningProfile || 'balanced',
          studentWeaknesses
        });
      }

      // 5. RÉSOUDRE LE PROBLÈME
      let result;
      if (userId) {
        result = await solverService.solveProblem(
          userId, 
          sanitizedInput, 
          finalDomain, 
          level,
          customPrompt
        );
      } else {
        result = await solverService.solveProblemAnonymous(
          sanitizedInput, 
          finalDomain, 
          level,
          customPrompt
        );
      }

      // 6. RÉPONSE SUCCÈS avec headers UTF-8 explicites
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json({
        success: true,
        message: 'Problème résolu avec succès',
        data: {
          ...result,
          domainUsed: finalDomain,
          warning: domainValidation.warning || null
        }
      });

    } catch (error) {
      console.error('❌ Solver controller error:', error);
      
      // Gestion des erreurs spécifiques
      if (error.message.includes('out_of_scope')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'OUT_OF_SCOPE',
            message: 'Cette question ne concerne pas les matières supportées (Maths, Physique, Chimie)'
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SOLVER_ERROR',
          message: error.message || 'Erreur lors de la résolution'
        }
      });
    }
  }

  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;

      const history = await solverService.getUserHistory(userId, limit);

      res.json({
        success: true,
        data: history
      });

    } catch (error) {
      console.error('❌ History error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'HISTORY_ERROR',
          message: error.message
        }
      });
    }
  }

  async getProblem(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const problem = await solverService.getProblemById(id, userId);

      res.json({
        success: true,
        data: problem
      });

    } catch (error) {
      console.error('❌ Get problem error:', error);
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }
  }
}

export default new SolverController();
