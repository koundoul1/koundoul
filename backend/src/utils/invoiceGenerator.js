/**
 * Invoice PDF Generator — generates professional receipts for Koundoul payments.
 * Returns a Buffer containing the PDF.
 */

const PDFDocument = require('pdfkit');

function generateInvoice(payment, user, subscription, plan) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Recu Koundoul - ${payment.id.slice(-8).toUpperCase()}`,
          Author: 'Koundoul',
          Subject: 'Recu de paiement'
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const primaryColor = '#7C3AED';
      const darkColor = '#1F2937';
      const grayColor = '#6B7280';
      const lightBg = '#F9FAFB';

      // ── Header ──
      doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

      doc.fontSize(28).fillColor('#FFFFFF').font('Helvetica-Bold')
        .text('KOUNDOUL', 50, 35);
      doc.fontSize(10).fillColor('#E0D4FF').font('Helvetica')
        .text('Plateforme educative', 50, 68);

      // Invoice number top-right
      doc.fontSize(12).fillColor('#FFFFFF').font('Helvetica-Bold')
        .text('RECU DE PAIEMENT', 350, 35, { align: 'right', width: 195 });
      const invoiceNum = `KDL-${payment.id.slice(-8).toUpperCase()}`;
      doc.fontSize(10).fillColor('#E0D4FF').font('Helvetica')
        .text(`N° ${invoiceNum}`, 350, 55, { align: 'right', width: 195 });
      const dateStr = new Date(payment.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
      doc.text(`Date: ${dateStr}`, 350, 72, { align: 'right', width: 195 });

      // ── Client info ──
      let y = 145;
      doc.fontSize(10).fillColor(grayColor).font('Helvetica')
        .text('FACTURE A :', 50, y);
      y += 18;
      doc.fontSize(12).fillColor(darkColor).font('Helvetica-Bold')
        .text(`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email, 50, y);
      y += 18;
      doc.fontSize(10).fillColor(grayColor).font('Helvetica')
        .text(user.email, 50, y);
      if (user.phone || user.phoneNumber) {
        y += 15;
        doc.text(user.phone || user.phoneNumber, 50, y);
      }

      // Company info right
      doc.fontSize(10).fillColor(grayColor).font('Helvetica')
        .text('EMETTEUR :', 350, 145, { align: 'right', width: 195 });
      doc.fontSize(11).fillColor(darkColor).font('Helvetica-Bold')
        .text('Koundoul SAS', 350, 163, { align: 'right', width: 195 });
      doc.fontSize(9).fillColor(grayColor).font('Helvetica')
        .text('Dakar, Senegal', 350, 178, { align: 'right', width: 195 })
        .text('contact@koundoul.com', 350, 193, { align: 'right', width: 195 });

      // ── Separator ──
      y = 230;
      doc.moveTo(50, y).lineTo(545, y).strokeColor('#E5E7EB').lineWidth(1).stroke();

      // ── Payment details table ──
      y += 20;

      // Table header
      doc.rect(50, y, 495, 30).fill('#F3F4F6');
      doc.fontSize(9).fillColor(grayColor).font('Helvetica-Bold');
      doc.text('DESCRIPTION', 60, y + 10, { width: 220 });
      doc.text('METHODE', 280, y + 10, { width: 80 });
      doc.text('STATUT', 365, y + 10, { width: 70 });
      doc.text('MONTANT', 440, y + 10, { width: 95, align: 'right' });

      y += 35;

      // Table row
      const planName = plan?.displayName || plan?.name || 'Abonnement';
      const planDesc = plan ? `${planName} — ${plan.duration} jours` : 'Paiement';
      const methodLabels = { wave: 'Wave', orange_money: 'Orange Money', STRIPE: 'Carte bancaire' };
      const methodStr = methodLabels[payment.paymentMethod] || payment.paymentMethod;
      const statusLabels = { completed: 'Paye', pending: 'En attente', failed: 'Echoue' };
      const statusStr = statusLabels[payment.status] || payment.status;

      doc.fontSize(10).fillColor(darkColor).font('Helvetica-Bold')
        .text(planDesc, 60, y);
      if (subscription) {
        doc.fontSize(8).fillColor(grayColor).font('Helvetica')
          .text(`Valide du ${new Date(subscription.startDate).toLocaleDateString('fr-FR')} au ${new Date(subscription.endDate).toLocaleDateString('fr-FR')}`, 60, y + 15);
      }

      doc.fontSize(10).fillColor(darkColor).font('Helvetica')
        .text(methodStr, 280, y)
        .text(statusStr, 365, y);

      const amount = `${(payment.amount || 0).toLocaleString('fr-FR')} FCFA`;
      doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold')
        .text(amount, 440, y, { width: 95, align: 'right' });

      // Row border
      y += 35;
      doc.moveTo(50, y).lineTo(545, y).strokeColor('#E5E7EB').lineWidth(0.5).stroke();

      // ── Total ──
      y += 15;
      doc.rect(350, y, 195, 40).fill(lightBg);
      doc.fontSize(10).fillColor(grayColor).font('Helvetica')
        .text('TOTAL', 360, y + 13);
      doc.fontSize(14).fillColor(darkColor).font('Helvetica-Bold')
        .text(amount, 440, y + 10, { width: 95, align: 'right' });

      // ── Transaction details ──
      y += 65;
      doc.fontSize(9).fillColor(grayColor).font('Helvetica')
        .text('DETAILS DE LA TRANSACTION', 50, y);
      y += 18;

      const details = [
        ['Reference', invoiceNum],
        ['ID Paiement', payment.id],
        ['Date', new Date(payment.createdAt).toLocaleString('fr-FR')],
        ['Methode', methodStr],
        ['Devise', (payment.currency || 'XOF').toUpperCase()],
      ];

      if (payment.waveCheckoutId) details.push(['ID Wave', payment.waveCheckoutId]);
      if (payment.orange_money_id) details.push(['ID Orange Money', payment.orange_money_id]);
      if (payment.metadata?.waveTransactionId) details.push(['Transaction Wave', payment.metadata.waveTransactionId]);
      if (payment.metadata?.omTransactionId) details.push(['Transaction OM', payment.metadata.omTransactionId]);

      for (const [label, value] of details) {
        doc.fontSize(9).fillColor(grayColor).font('Helvetica')
          .text(label + ' :', 60, y, { continued: true, width: 130 });
        doc.fillColor(darkColor).font('Helvetica-Bold')
          .text('  ' + (value || '-'), { width: 350 });
        y += 16;
      }

      // ── Footer ──
      y = doc.page.height - 100;
      doc.moveTo(50, y).lineTo(545, y).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
      y += 15;
      doc.fontSize(8).fillColor(grayColor).font('Helvetica')
        .text('Ce document est un recu de paiement genere automatiquement par Koundoul.', 50, y, { align: 'center', width: 495 });
      doc.text('Pour toute question, contactez-nous a contact@koundoul.com', 50, y + 12, { align: 'center', width: 495 });
      doc.text('Koundoul — Apprendre, progresser, reussir.', 50, y + 28, { align: 'center', width: 495 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateInvoice };
