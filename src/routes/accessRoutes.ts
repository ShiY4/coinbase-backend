import { login, refresh } from "@/controllers/accessController";
import { Router } from "express";

const router = Router()

router.post('/login', login);
router.post('/refresh', refresh);

export default router