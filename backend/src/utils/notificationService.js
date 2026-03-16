/**
 * Notification Service — SSE-based real-time notifications
 * Manages active SSE connections and sends push notifications
 */
const prisma = require('../config/database');

// Active SSE connections: Map<userId, Set<res>>
const activeConnections = new Map();

/**
 * Register an SSE connection for a user
 */
function addConnection(userId, res) {
  if (!activeConnections.has(userId)) {
    activeConnections.set(userId, new Set());
  }
  activeConnections.get(userId).add(res);
}

/**
 * Remove an SSE connection
 */
function removeConnection(userId, res) {
  const conns = activeConnections.get(userId);
  if (conns) {
    conns.delete(res);
    if (conns.size === 0) activeConnections.delete(userId);
  }
}

/**
 * Push an SSE event to all active connections for a user
 */
function pushToUser(userId, eventData) {
  const conns = activeConnections.get(userId);
  if (!conns || conns.size === 0) return false;

  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  for (const res of conns) {
    try {
      res.write(payload);
    } catch {
      conns.delete(res);
    }
  }
  return true;
}

/**
 * Send a notification to a user
 * Saves to DB and pushes via SSE if connected
 */
async function sendNotification(userId, type, title, message, data = null) {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, data }
    });

    pushToUser(userId, {
      type: 'notification',
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: false,
        createdAt: notification.createdAt
      }
    });

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

module.exports = {
  addConnection,
  removeConnection,
  pushToUser,
  sendNotification
};
