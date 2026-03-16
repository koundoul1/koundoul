const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');
const { addConnection, removeConnection } = require('../utils/notificationService');

// GET /stream — SSE endpoint for real-time notifications
router.get('/stream', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Register connection
  addConnection(userId, res);

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 30000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    removeConnection(userId, res);
  });
});

// GET / — List notifications
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    next(error);
  }
});

// PUT /:id/read — Mark as read
router.put('/:id/read', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await prisma.notification.updateMany({
      where: { id: req.params.id, userId },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// PUT /read-all — Mark all as read
router.put('/read-all', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
