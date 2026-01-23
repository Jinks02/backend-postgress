import { createMess, getMessDetail, getMessLocation, isMessExist } from '../controllers/mess-config.controller.js';
import auth from '../middleware/auth.js';
import express from 'express';

const router = express.Router();


router.get('/messlocation',auth, getMessLocation);
router.post('/create', createMess);
router.get('/mess-details', auth, getMessDetail);
router.get('/exist', isMessExist);

export default router;