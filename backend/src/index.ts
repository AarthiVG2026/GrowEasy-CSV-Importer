import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import importRoutes from './routes/import';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

import { errorHandler } from './middleware/errorHandler';

app.use('/api/import', importRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
