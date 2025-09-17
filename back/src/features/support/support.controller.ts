import { Router, Request, Response } from 'express';
import { sendEmail } from '../../shared/utils/email.service';

const router = Router();

// POST /support/contact
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { subject, body, to } = req.body as { subject?: string; body?: string; to?: string };
    const target = to || process.env.ADMIN_EMAIL || 'matchamegnatikevin894@gmail.com';
    if (!subject || !body) {
      return res.status(400).json({ success: false, error: 'subject and body are required' });
    }

    await sendEmail(target, subject, body);
    return res.json({ success: true });
  } catch (error) {
    console.error('[Support] error sending contact email', error);
    return res.status(500).json({ success: false, error: 'internal error' });
  }
});

export default router;
