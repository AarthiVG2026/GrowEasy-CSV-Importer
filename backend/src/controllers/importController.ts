import { Request, Response } from 'express';
import { parseCsvFile } from '../services/csvService';
import { processAllRecords } from '../services/aiService';
import { ImportResponse, CRMRecord } from '../types';
import fs from 'fs';
import path from 'path';

export async function handleImport(req: Request, res: Response) {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = file.path;
    
    // 1. Parse CSV
    const rows = await parseCsvFile(filePath);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Empty CSV file' });
    }

    const startTime = Date.now();

    // The new two-step process handles its own chunking for ambiguous rows internally
    const result = await processAllRecords(rows);
    
    const processingTimeMs = Date.now() - startTime;

    const response: ImportResponse = {
      success: true,
      summary: {
        total: rows.length,
        parsed: result.records.length,
        skipped: result.skipped.length,
        processingTimeMs,
        aiModelUsed: 'Gemini 2.5 Flash'
      },
      records: result.records,
      skipped: result.skipped
    };

    res.json(response);
  } catch (error) {
    console.error('Import controller error:', error);
    res.status(500).json({ error: 'Failed to process import' });
  }
}
