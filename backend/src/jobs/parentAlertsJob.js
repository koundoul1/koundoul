/**
 * Parent Alerts Cron — daily at 18:00 UTC.
 * Checks each linked child and sends notifications to parents.
 */

const cron = require('node-cron');
const prisma = require('../config/database');
const { sendNotification } = require('../utils/notificationService');

async function getLinkedChildren() {
  // Get all parent-child links from both systems
  var links = await prisma.parent_child_links.findMany({
    where: { approved: true },
    select: { parent_id: true, child_id: true }
  });

  // Also get children linked via invitation code
  var parents = await prisma.user.findMany({
    where: { invitationCode: { not: null }, isParent: true },
    select: { id: true, invitationCode: true, notificationsEnabled: true }
  });

  for (var i = 0; i < parents.length; i++) {
    var p = parents[i];
    if (!p.invitationCode) continue;
    var children = await prisma.user.findMany({
      where: { parentInvitationCode: p.invitationCode },
      select: { id: true }
    });
    for (var j = 0; j < children.length; j++) {
      // Avoid duplicates
      var exists = links.some(function(l) { return l.parent_id === p.id && l.child_id === children[j].id; });
      if (!exists) {
        links.push({ parent_id: p.id, child_id: children[j].id });
      }
    }
  }

  return links;
}

async function checkChildAlerts(childId) {
  var alerts = [];
  var now = new Date();
  var sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  var child = await prisma.user.findUnique({
    where: { id: childId },
    select: { firstName: true, lastName: true, lastLoginAt: true, streak: true }
  });

  if (!child) return alerts;
  var name = child.firstName || 'Votre enfant';

  // Alert: inactive 7+ days
  if (!child.lastLoginAt || new Date(child.lastLoginAt) < sevenDaysAgo) {
    alerts.push({
      type: 'child_inactive',
      title: name + ' est inactif',
      message: name + ' ne s\'est pas connecte depuis plus de 7 jours. Encouragez-le a revenir etudier !',
      severity: 'warning'
    });
  }

  // Alert: quiz score drop (avg < 50% on last 7 days)
  try {
    var recentQuizzes = await prisma.quizAttempt.findMany({
      where: { userId: childId, completedAt: { gte: sevenDaysAgo } },
      select: { score: true }
    });
    if (recentQuizzes.length >= 3) {
      var avg = recentQuizzes.reduce(function(s, q) { return s + (q.score || 0); }, 0) / recentQuizzes.length;
      if (avg < 50) {
        alerts.push({
          type: 'quiz_score_drop',
          title: 'Score en baisse pour ' + name,
          message: 'La moyenne des quiz de ' + name + ' est de ' + Math.round(avg) + '% cette semaine. Un peu de revision supplementaire pourrait aider.',
          severity: 'warning'
        });
      }
    }
  } catch (e) { /* ignore */ }

  // Alert: streak milestone
  if (child.streak === 7 || child.streak === 14 || child.streak === 30) {
    alerts.push({
      type: 'streak_milestone',
      title: 'Bravo ' + name + ' !',
      message: name + ' a atteint un streak de ' + child.streak + ' jours consecutifs. Felicitez-le !',
      severity: 'success'
    });
  }

  // Alert: AI quota > 80%
  try {
    var todayStr = new Date().toISOString().slice(0, 10);
    var usage = await prisma.dailyAiUsage.findFirst({
      where: { userId: childId, date: new Date(todayStr) }
    });
    if (usage && usage.count > 0) {
      // Get child plan quota
      var sub = await prisma.subscription.findFirst({
        where: { userId: childId, status: { in: ['ACTIVE', 'active'] }, endDate: { gte: now } },
        include: { plan: true }
      });
      var limit = sub ? (sub.plan.aiCallsPerDay || 6) : 6;
      if (usage.count >= limit * 0.8) {
        alerts.push({
          type: 'quota_high',
          title: 'Quota IA bientot epuise pour ' + name,
          message: name + ' a utilise ' + usage.count + '/' + limit + ' appels IA aujourd\'hui.',
          severity: 'info'
        });
      }
    }
  } catch (e) { /* ignore */ }

  return alerts;
}

async function runParentAlerts() {
  console.log('[ParentAlerts] Verification des alertes...');

  try {
    var links = await getLinkedChildren();
    var sentCount = 0;

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var alerts = await checkChildAlerts(link.child_id);

      // Check parent notifications enabled
      var parent = await prisma.user.findUnique({
        where: { id: link.parent_id },
        select: { notificationsEnabled: true }
      });
      if (parent && parent.notificationsEnabled === false) continue;

      for (var j = 0; j < alerts.length; j++) {
        var alert = alerts[j];
        // Check if already sent today (avoid duplicates)
        var todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        var alreadySent = await prisma.notification.findFirst({
          where: {
            userId: link.parent_id,
            type: alert.type,
            createdAt: { gte: todayStart }
          }
        });

        if (!alreadySent) {
          await sendNotification(link.parent_id, alert.type, alert.title, alert.message, {
            childId: link.child_id,
            severity: alert.severity
          });
          sentCount++;
        }
      }
    }

    console.log('[ParentAlerts] ' + sentCount + ' alerte(s) envoyee(s) pour ' + links.length + ' lien(s).');
  } catch (error) {
    console.error('[ParentAlerts] Erreur:', error.message);
  }
}

function setupParentAlertsJob() {
  // Run daily at 18:00 UTC (19h Dakar)
  cron.schedule('0 18 * * *', function() {
    runParentAlerts();
  });
  console.log('Cron parent alerts: configure (18h UTC quotidien)');
}

module.exports = { setupParentAlertsJob, runParentAlerts, checkChildAlerts };
