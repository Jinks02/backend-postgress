import express from 'express';
import auth from '../middleware/auth.js';
import { addThaliController, updateThaliController, deleteThaliController, getThalisController, publishThaliController, getMessSpecificThalis } from '../controllers/thalis.controller.js';
const router = express.Router();

router.post('/add-thali', auth, addThaliController);
router.put('/update-thali/:id', auth, updateThaliController);
router.delete('/delete-thali/:id', auth, deleteThaliController);
router.get('/get-thali', auth, getThalisController);
router.get('/get-mess-specific-thalis', auth, getMessSpecificThalis )
router.patch('/publish-thali/:id', auth, publishThaliController);

export default router;