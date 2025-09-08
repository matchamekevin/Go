import { Router } from 'express';
import QRCode from 'qrcode';
import { TicketRepository } from './Ticket.repository';
import { TicketController } from './Ticket.controller';
import { authMiddleware, AuthenticatedRequest } from '../../shared/midddleawers/auth.middleware';

const router = Router();

// Routes publiques
router.get('/products', TicketController.getAllProducts);
router.get('/routes', TicketController.getAllRoutes);
router.get('/routes/category/:category', TicketController.getRoutesByPriceCategory);

// Routes protégées (nécessitent une authentification)
// Rendre le QR public pour être scanné sans auth (lecture seule)
router.get('/:code/qrcode', async (req, res) => {
	try {
		const { code } = req.params;
		const ticket = await TicketRepository.getTicketByCode(code);
		if (!ticket) return res.status(404).json({ success: false, error: 'Ticket introuvable' });
		const qrPayload = (ticket as any)?.metadata?.qr || {
			type: 'ticket',
			code: ticket.code,
			user_id: ticket.user_id,
			product_code: ticket.product_code,
			route_code: ticket.route_code || null,
			issued_at: ticket.purchased_at
		};
		const buffer = await QRCode.toBuffer(JSON.stringify(qrPayload), { type: 'png', scale: 6 });
		res.setHeader('Content-Type', 'image/png');
		return res.status(200).send(buffer);
	} catch (error) {
		return res.status(500).json({ success: false, error: 'Erreur lors de la génération du QR code' });
	}
});

router.use(authMiddleware as any);

// Routes pour les utilisateurs
router.post('/purchase', TicketController.purchaseTicket);
router.get('/my-tickets', TicketController.getUserTickets);

// Routes pour les validateurs et admins
router.post('/validate', TicketController.validateTicket);

// Routes pour les admins uniquement
router.get('/stats', TicketController.getTicketStats);

export default router;
