import { Router } from 'express';

import notifications from './notifications';

const router = Router();

router.use('/notifications', notifications);

export default router;