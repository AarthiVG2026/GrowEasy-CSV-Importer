import { Router } from 'express';
import multer from 'multer';
import { handleImport } from '../controllers/importController';

const router = Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

router.post('/', upload.single('file'), handleImport);

export default router;
