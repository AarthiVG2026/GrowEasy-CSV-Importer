import Papa from 'papaparse';
import fs from 'fs';

export async function parseCsvFile(filePath: string): Promise<any[]> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length && !results.data.length) {
          reject(new Error('Failed to parse CSV'));
        } else {
          resolve(results.data);
        }
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
