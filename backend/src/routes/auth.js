const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');
const { normalizePhoneNumber, isPhoneIdentifier, isValidPin } = require('../utils/phoneValidator');
const { findUserByIdentifier, verifyCredential, isLockedOut, handleLoginAttempt } = require('../services/authService');

// ── Rate limiters ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Trop de tentatives de connexion. Reessayez dans 15 minutes.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Trop de tentatives d\'inscription. Reessayez dans 1 heure.' }
});

const deleteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Reessayez dans 1 heure.' }
});

// ── Helper: build JWT ──
function buildToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      is_admin: user.is_admin || false,
      is_super_admin: user.is_super_admin || false
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function userResponse(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    phoneNumber: user.phoneNumber || null,
    is_admin: user.is_admin || false,
    is_super_admin: user.is_super_admin || false,
    isParent: user.isParent || false
  };
}

// ══════════════════════════════════════════════════════════════════════
// POST /register — dual: email always required + password OR phone+PIN
// ══════════════════════════════════════════════════════════════════════
router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, username, phoneNumber, pin, role } = req.body;

    // Email always required
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // At least one auth method
    const hasPassword = password && password.length > 0;
    const hasPhone = phoneNumber && pin;

    if (!hasPassword && !hasPhone) {
      return res.status(400).json({ error: 'Mot de passe ou telephone+PIN requis' });
    }

    if (hasPassword && password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caracteres' });
    }

    if (hasPhone) {
      if (!isValidPin(pin)) {
        return res.status(400).json({ error: 'Le PIN doit etre exactement 4 chiffres' });
      }
    }

    // Normalize phone
    let normalizedPhone = null;
    if (phoneNumber) {
      normalizedPhone = normalizePhoneNumber(phoneNumber);
      if (!normalizedPhone) {
        return res.status(400).json({ error: 'Numero de telephone invalide. Format attendu: +221XXXXXXXXX' });
      }
      // Check uniqueness
      const phoneExists = await prisma.user.findFirst({ where: { phoneNumber: normalizedPhone } });
      if (phoneExists) {
        return res.status(409).json({ error: 'Ce numero de telephone est deja utilise' });
      }
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Cet email est deja utilise' });
    }

    // Check username uniqueness
    if (username) {
      const existingUsername = await prisma.user.findFirst({ where: { username } });
      if (existingUsername) {
        return res.status(409).json({ error: 'Ce nom d\'utilisateur est deja pris' });
      }
    }

    // Build user data
    const userData = {
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      username: username || email.split('@')[0],
      xp: 0,
      level: 1,
      streak: 0
    };

    if (hasPassword) {
      userData.password = await bcrypt.hash(password, 10);
    } else {
      // Phone-only accounts get a random password (unusable, login via PIN only)
      const crypto = require('crypto');
      userData.password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    }
    if (normalizedPhone) {
      userData.phoneNumber = normalizedPhone;
    }
    if (hasPhone) {
      userData.pinHash = await bcrypt.hash(pin, 10);
    }
    if (role === 'parent') {
      userData.isParent = true;
    }

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        username: true, xp: true, level: true, streak: true,
        phoneNumber: true, is_admin: true, is_super_admin: true,
        isParent: true, createdAt: true
      }
    });

    // Auto-link family: if this user has a phoneNumber, check for children with pendingParentPhone
    if (normalizedPhone) {
      try {
        const pendingChildren = await prisma.user.findMany({
          where: { pendingParentPhone: normalizedPhone },
          select: { id: true }
        });
        for (const child of pendingChildren.slice(0, 3)) {
          await prisma.parent_child_links.create({
            data: { parent_id: user.id, child_id: child.id }
          }).catch(() => {}); // ignore if link already exists
          await prisma.user.update({
            where: { id: child.id },
            data: { pendingParentPhone: null, parentId: user.id }
          }).catch(() => {});
        }
        if (pendingChildren.length > 0) {
          console.log('[Auth] Auto-linked ' + pendingChildren.length + ' child(ren) to new parent ' + user.id);
        }
      } catch (err) {
        console.warn('[Auth] Family auto-link error:', err.message);
      }
    }

    // Handle referral code — both referrer and new user get 24h premium
    const referralCode = req.body.referralCode || req.body.ref;
    if (referralCode) {
      try {
        const referrer = await prisma.user.findFirst({
          where: { invitationCode: referralCode }
        });
        // Store referral link on the new user
        if (referrer) {
          await prisma.user.update({
            where: { id: user.id },
            data: { parentInvitationCode: referralCode }
          }).catch(() => {});
        }
        if (referrer && referrer.id !== user.id) {
          // Find a daily plan for referral reward (try PREMIUM_DAILY, then DAILY)
          const dailyPlan = await prisma.subscriptionPlan.findFirst({
            where: { name: { in: ['PREMIUM_DAILY', 'DAILY'] }, isActive: true },
            orderBy: { name: 'asc' }
          });
          if (!dailyPlan) {
            console.warn('[Referral] No daily plan found (PREMIUM_DAILY or DAILY) — skipping premium reward');
          }
          if (dailyPlan) {
            const now = new Date();
            const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Give 24h premium to new user
            await prisma.subscription.create({
              data: { userId: user.id, planId: dailyPlan.id, status: 'ACTIVE', startDate: now, endDate, autoRenew: false }
            }).catch(() => {});

            // Give 24h premium to referrer — cumulative (extends if already premium)
            const referrerSub = await prisma.subscription.findFirst({
              where: { userId: referrer.id, status: { in: ['active', 'ACTIVE'] }, endDate: { gte: now } },
              orderBy: { endDate: 'desc' }
            });
            if (referrerSub) {
              // Extend existing subscription by 24h
              const newEnd = new Date(referrerSub.endDate.getTime() + 24 * 60 * 60 * 1000);
              await prisma.subscription.update({
                where: { id: referrerSub.id },
                data: { endDate: newEnd }
              }).catch(() => {});
              console.log(`[Referral] Extended ${referrer.email} premium to ${newEnd.toISOString()}`);
            } else {
              // Create new 24h subscription
              await prisma.subscription.create({
                data: { userId: referrer.id, planId: dailyPlan.id, status: 'ACTIVE', startDate: now, endDate, autoRenew: false }
              }).catch(() => {});
            }

            // Notify referrer
            const { sendNotification } = require('../utils/notificationService');
            sendNotification(
              referrer.id,
              'Parrainage reussi !',
              `${user.firstName || user.username} s'est inscrit avec ton code ! Vous avez tous les deux recu Premium 24h gratuit.`,
              '/dashboard'
            ).catch(() => {});

            console.log(`[Referral] ${user.email} referred by ${referrer.email} — both get 24h premium`);
          }
        }
      } catch (refErr) {
        console.warn('[Referral] Error:', refErr.message);
      }
    }

    const token = buildToken(user);

    res.status(201).json({
      success: true,
      data: { user: userResponse(user), token }
    });
  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════════
// POST /login — dual: email+password OR phone+PIN
// ══════════════════════════════════════════════════════════════════════
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    // Support both old format {email, password} and new {identifier, password/pin}
    const identifier = req.body.identifier || req.body.email;
    const password = req.body.password;
    const pin = req.body.pin;

    if (!identifier) {
      return res.status(400).json({ error: 'Email ou numero de telephone requis' });
    }

    const isPhone = isPhoneIdentifier(identifier);

    if (isPhone && !pin) {
      return res.status(400).json({ error: 'PIN requis pour la connexion par telephone' });
    }
    if (!isPhone && !password) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }

    // Find user
    const user = await findUserByIdentifier(identifier);

    if (!user) {
      return res.status(401).json({ error: isPhone ? 'Numero ou PIN incorrect' : 'Email ou mot de passe incorrect' });
    }

    // Check suspended
    if (!user.isActive) {
      const reason = user.suspendedReason || 'Votre compte a ete suspendu.';
      return res.status(403).json({ error: reason, suspended: true });
    }

    // Check lockout
    if (isLockedOut(user)) {
      const unlockTime = new Date(user.lockedUntil);
      const hh = String(unlockTime.getUTCHours()).padStart(2, '0');
      const mm = String(unlockTime.getUTCMinutes()).padStart(2, '0');
      return res.status(429).json({
        error: 'Compte temporairement verrouille jusqu\'a ' + hh + ':' + mm + ' UTC',
        lockedUntil: user.lockedUntil
      });
    }

    // Verify credentials
    const mode = isPhone ? 'pin' : 'password';
    const credential = isPhone ? pin : password;
    const isValid = await verifyCredential(user, credential, mode);

    // Handle attempt
    await handleLoginAttempt(user.id, isValid);

    if (!isValid) {
      return res.status(401).json({ error: isPhone ? 'Numero ou PIN incorrect' : 'Email ou mot de passe incorrect' });
    }

    const token = buildToken(user);

    // Check premium status
    var { getUserPlanInfo } = require('../middlewares/premiumCheck');
    var planInfo = await getUserPlanInfo(user.id);

    res.json({
      success: true,
      data: { user: { ...userResponse(user), isPremium: planInfo.isPremium, planName: planInfo.displayName }, token }
    });
  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════════
// GET /profile
// ══════════════════════════════════════════════════════════════════════
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        username: true, xp: true, level: true, streak: true,
        is_admin: true, is_super_admin: true, createdAt: true, updatedAt: true,
        phoneNumber: true, notificationsEnabled: true,
        country: true, region: true, department: true, school: true,
        language: true, bio: true, phone: true,
        invitationCode: true, parentId: true, isParent: true,
        pendingParentPhone: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouve' });
    }

    // Check premium status (same as POST /login)
    var { getUserPlanInfo } = require('../middlewares/premiumCheck');
    var planInfo = await getUserPlanInfo(user.id);

    res.json({
      success: true,
      data: {
        ...user,
        isPremium: planInfo.isPremium,
        planName: planInfo.displayName,
        planType: planInfo.planName,
        hasPassword: !!(await prisma.user.findUnique({ where: { id: user.id }, select: { password: true } }))?.password,
        hasPin: !!(await prisma.user.findUnique({ where: { id: user.id }, select: { pinHash: true } }))?.pinHash
      }
    });
  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════════
// PUT /profile
// ══════════════════════════════════════════════════════════════════════
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { firstName, lastName, username, notificationsEnabled } = req.body;
    const data = {};

    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (notificationsEnabled !== undefined) data.notificationsEnabled = notificationsEnabled;

    if (username) {
      const existingUsername = await prisma.user.findFirst({
        where: { username, NOT: { id: req.user.userId } }
      });
      if (existingUsername) {
        return res.status(409).json({ error: 'Ce nom d\'utilisateur est deja pris' });
      }
      data.username = username;
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        username: true, xp: true, level: true, streak: true,
        notificationsEnabled: true
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════════
// PUT /change-password
// ══════════════════════════════════════════════════════════════════════
router.put('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caracteres' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    if (!user || !user.password) {
      return res.status(404).json({ error: 'Utilisateur non trouve' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Mot de passe modifie avec succes' });
  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════════
// POST /set-pin — set or change PIN (from Settings)
// ══════════════════════════════════════════════════════════════════════
router.post('/set-pin', authenticateToken, async (req, res, next) => {
  try {
    const { newPin, phoneNumber, currentPassword } = req.body;

    if (!isValidPin(newPin)) {
      return res.status(400).json({ error: 'Le PIN doit etre exactement 4 chiffres' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouve' });
    }

    // If user has a password, require it for confirmation
    if (user.password && currentPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Mot de passe incorrect' });
      }
    }

    const data = { pinHash: await bcrypt.hash(newPin, 10) };

    // If phoneNumber provided and user doesn't have one, set it
    if (phoneNumber && !user.phoneNumber) {
      const normalized = normalizePhoneNumber(phoneNumber);
      if (!normalized) {
        return res.status(400).json({ error: 'Numero de telephone invalide' });
      }
      const phoneExists = await prisma.user.findFirst({ where: { phoneNumber: normalized } });
      if (phoneExists) {
        return res.status(409).json({ error: 'Ce numero est deja utilise' });
      }
      data.phoneNumber = normalized;
    }

    await prisma.user.update({ where: { id: req.user.userId }, data });

    res.json({ success: true, message: 'PIN defini avec succes' });
  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════════
// DELETE /delete-account — user-initiated account deletion
// ══════════════════════════════════════════════════════════════════════
router.delete('/delete-account', authenticateToken, deleteLimiter, async (req, res, next) => {
  try {
    const { confirmation } = req.body;
    const userId = req.user.userId;

    if (!confirmation) {
      return res.status(400).json({ error: 'Confirmation requise (mot de passe ou PIN)' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouve' });
    }

    // Verify confirmation: try password first, then PIN
    let verified = false;
    if (user.password) {
      verified = await bcrypt.compare(confirmation, user.password);
    }
    if (!verified && user.pinHash) {
      verified = await bcrypt.compare(confirmation, user.pinHash);
    }
    if (!verified) {
      return res.status(401).json({ error: 'Confirmation incorrecte' });
    }

    // Cascade delete (same logic as admin.js)
    await prisma.$transaction(async (tx) => {
      await tx.flashcardReview.deleteMany({ where: { userId } });
      await tx.quizAttempt.deleteMany({ where: { userId } });
      await tx.lesson_completions.deleteMany({ where: { userId } });
      await tx.exercise_attempts.deleteMany({ where: { userId } });
      await tx.discussion_votes.deleteMany({ where: { userId } });
      await tx.reply_votes.deleteMany({ where: { userId } });
      await tx.forumReply.deleteMany({ where: { userId } });
      await tx.forumDiscussion.deleteMany({ where: { userId } });
      await tx.coachSession.deleteMany({ where: { userId } });
      await tx.user_masteries.deleteMany({ where: { userId } });
      await tx.userBadge.deleteMany({ where: { userId } });
      await tx.solutions.deleteMany({ where: { userId } });
      await tx.problems.deleteMany({ where: { userId } });
      await tx.parent_child_links.deleteMany({ where: { OR: [{ parent_id: userId }, { child_id: userId }] } });
      await tx.payment.deleteMany({ where: { userId } });
      await tx.subscription.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.solverHistory.deleteMany({ where: { userId } });
      await tx.coachConversation.deleteMany({ where: { userId } });
      await tx.dailyAiUsage.deleteMany({ where: { userId } });
      await tx.challengeAttempt.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    res.json({ success: true, message: 'Compte supprime' });
  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════════
// Check email availability
// ══════════════════════════════════════════════════════════════════════
router.get('/check-email', async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    res.json({ available: !exists });
  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════════
// Check username availability
// ══════════════════════════════════════════════════════════════════════
router.get('/check-username', async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'Username requis' });
    }
    const exists = await prisma.user.findFirst({ where: { username } });
    res.json({ available: !exists });
  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════════
// Refresh token
// ══════════════════════════════════════════════════════════════════════
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token requis' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, is_admin: decoded.is_admin || false, is_super_admin: decoded.is_super_admin || false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ success: true, data: { token: newToken } });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token invalide ou expire' });
    }
    next(error);
  }
});

// ── GET /referral — Get or generate referral code ──
router.get('/referral', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, invitationCode: true, firstName: true }
    });

    let code = user.invitationCode;
    if (!code) {
      // Generate a unique 8-char referral code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let attempts = 0;
      do {
        code = '';
        for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
        const exists = await prisma.user.findFirst({ where: { invitationCode: code } });
        if (!exists) break;
        attempts++;
      } while (attempts < 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { invitationCode: code }
      });
    }

    // Count successful referrals
    const referralCount = await prisma.user.count({
      where: { parentInvitationCode: code }
    });

    res.json({
      success: true,
      data: {
        code,
        referralCount,
        shareUrl: `${process.env.FRONTEND_URL || 'https://koundoul.com'}/register?ref=${code}`
      }
    });
  } catch (error) {
    console.error('Referral code error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
