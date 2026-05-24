import express from 'express';
import { protect } from '../middleware/auth.js';
import * as fsController from '../controllers/fsController.js';

const router = express.Router();

router.use(protect); // Ensure all FS routes are authenticated

router.get('/tree', fsController.getFileTree);
router.get('/file', fsController.getFileContent);
router.post('/file', fsController.saveFileContent);
router.post('/create', fsController.createFileOrFolder);

export default router;
