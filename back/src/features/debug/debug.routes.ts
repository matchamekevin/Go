import { Router } from 'express';
import { DebugController } from './Debug.controller';

const router = Router();

router.post('/test-phone-login', DebugController.testPhoneLogin);

export default router;