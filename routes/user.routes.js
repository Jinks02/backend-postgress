import express from 'express';
import {  createProduct, fetchProducts, testing} from '../controllers/prodcut.controller.js';
import auth from '../middleware/auth.js';
import { fetchUsers } from '../controllers/user.controller.js';
import { createMess, getMessLocation, isMessExist } from '../controllers/mess-config.controller.js';
import { createIntentsController, getUserIntentController} from '../controllers/intents.controller.js';

const router = express.Router();

router.get('/fetch', auth, fetchProducts);
router.get('/user', auth, fetchUsers);
router.get('/messlocation',auth, getMessLocation);
router.post('/mess/create', createMess);
router.get('/mess/exist', isMessExist);
router.post('/save', createProduct);
router.post('/save-intent',auth, createIntentsController);
router.get('/get-intent',auth, getUserIntentController);
router.get('/test',  testing);

//mess routes
router.post('/add-mess', createProduct);

export default router;
