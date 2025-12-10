import { Router } from 'express';
import {login, registration } from '@/controllers/userController';

const router = Router();

router.post('/registartion', registration);
router.post('/login', login);

export default router;
