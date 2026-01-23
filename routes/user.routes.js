import express from 'express';
import { testing } from '../controllers/prodcut.controller.js';
import { fetchUsers } from '../controllers/user.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/user', auth, fetchUsers);
router.get('/test',  testing);


export default router;
