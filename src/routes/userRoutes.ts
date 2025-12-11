import { Router } from 'express';
import {registration } from '@/controllers/userController';

const router = Router();

router.post('/registration', registration);

export default router;
