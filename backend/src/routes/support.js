const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');

// User creates a support ticket
router.post('/tickets', authenticateToken, async (req, res, next) => {
  try {
    const { subject, message, category } = req.body;
    if (!subject || !message) return res.status(400).json({ error: 'subject et message requis' });

    const validCategories = ['general', 'bug', 'billing', 'account', 'feature'];
    const cat = validCategories.includes(category) ? category : 'general';

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user.userId,
        subject: subject.slice(0, 200),
        message: message.slice(0, 2000),
        category: cat,
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    next(error);
  }
});

// User lists their own tickets
router.get('/tickets', authenticateToken, async (req, res, next) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { replies: true } },
        admin: { select: { firstName: true, lastName: true } },
      }
    });
    res.json(tickets);
  } catch (error) {
    console.error('List user tickets error:', error);
    next(error);
  }
});

// User views a specific ticket with replies
router.get('/tickets/:id', authenticateToken, async (req, res, next) => {
  try {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, firstName: true, lastName: true, is_admin: true } } }
        },
        admin: { select: { firstName: true, lastName: true } },
      }
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket non trouvé' });
    res.json(ticket);
  } catch (error) {
    console.error('Get user ticket error:', error);
    next(error);
  }
});

// User replies to their own ticket
router.post('/tickets/:id/reply', authenticateToken, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message requis' });

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: req.params.id, userId: req.user.userId }
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket non trouvé' });
    if (ticket.status === 'closed') return res.status(400).json({ error: 'Ticket fermé' });

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: req.params.id,
        userId: req.user.userId,
        message: message.slice(0, 2000),
        isAdmin: false,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, is_admin: true } } }
    });

    // Reopen ticket if it was resolved
    if (ticket.status === 'resolved') {
      await prisma.supportTicket.update({
        where: { id: req.params.id },
        data: { status: 'open' }
      });
    }

    res.json(reply);
  } catch (error) {
    console.error('User reply ticket error:', error);
    next(error);
  }
});

module.exports = router;
