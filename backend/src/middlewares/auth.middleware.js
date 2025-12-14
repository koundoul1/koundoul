import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token d\'authentification manquant'
        }
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Token invalide ou expiré'
          }
        });
      }

      req.user = decoded;
      next();
    });

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Erreur d\'authentification'
      }
    });
  }
};

// Middleware d'authentification optionnelle (ne bloque pas si pas de token)
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Si pas de token, continuer sans utilisateur
    if (!token) {
      req.user = null;
      return next();
    }

    // Si token présent, essayer de le vérifier
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Token invalide, continuer sans utilisateur
        req.user = null;
      } else {
        // Token valide, ajouter l'utilisateur
        req.user = decoded;
      }
      next();
    });

  } catch (error) {
    console.error('❌ Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Alias pour compatibilité
export const requireAuth = authenticateToken;

export default authenticateToken;