import auth from '../middleware/auth.js';
import express from 'express';
import { createIntentsController, getMessIntentsController, getUserIntentController } from '../controllers/intents.controller.js';

const router = express.Router();

router.post('/share-intent',auth, createIntentsController);
router.get('/get-intent',auth, getUserIntentController);
router.get('/get-mess-intents',auth, getMessIntentsController);

export default router;