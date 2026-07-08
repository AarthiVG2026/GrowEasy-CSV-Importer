import { mapHeadersWithGemini, processBatchWithGemini } from '../ai/geminiProvider';
import { normalizeRecord, deduplicateRecords } from '../utils/validation';
import { CRMRecord, SkippedRecord, AIReponse } from '../types';

export async function processAllRecords(rows: any[]): Promise<AIReponse> {
  if (rows.length === 0) return { records: [], skipped: [] };

  const headers = Object.keys(rows[0]);
  let headerMap: Record<string, string> = {};
  
  try {
    headerMap = await mapHeadersWithGemini(headers);
  } catch (err) {
    console.error('Failed to map headers via AI. Falling back to row-by-row AI.', err);
  }

  const allRecords: CRMRecord[] = [];
  const allSkipped: SkippedRecord[] = [];
  const ambiguousRows: any[] = [];

  // Step 2: Apply mapping locally
  for (const row of rows) {
    if (Object.keys(headerMap).length > 0) {
      const mappedRow: any = {};
      for (const [originalHeader, value] of Object.entries(row)) {
        const crmField = headerMap[originalHeader];
        if (crmField && typeof value === 'string' && value.trim() !== '') {
          mappedRow[crmField] = value;
        }
      }
      
      const { data, reason } = normalizeRecord(mappedRow);
      if (data) {
        allRecords.push(data);
      } else {
        // If local mapping failed (e.g. missing email/phone), send to ambiguous batch
        ambiguousRows.push(row);
      }
    } else {
      ambiguousRows.push(row);
    }
  }

  // Step 3: Process ambiguous rows via detailed AI prompt in batches of 50
  if (ambiguousRows.length > 0) {
    const batches = chunkArray(ambiguousRows, 50);
    // Concurrent AI batches (Promise.all)
    const batchResults = await Promise.all(batches.map(b => processBatchWithGemini(b).catch(() => ({ records: [], skipped: b.map((r: any) => ({ row: r, reason: 'AI Processing Failed' })) }))));
    
    for (const res of batchResults) {
      if (res.records) {
        res.records.forEach((r: any) => {
          const { data, reason } = normalizeRecord(r);
          if (data) allRecords.push(data);
          else allSkipped.push({ row: r, reason: reason || 'Unknown validation failure' });
        });
      }
      if (res.skipped) {
        res.skipped.forEach((s: any) => {
           // Handle if skipped is just an array of rows or array of {row, reason} objects
           if (s.row && s.reason) allSkipped.push(s);
           else allSkipped.push({ row: s, reason: 'Skipped by AI logic' });
        });
      }
    }
  }

  // Final deduplication
  const deduplicated = deduplicateRecords(allRecords);
  
  return { records: deduplicated, skipped: allSkipped };
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
