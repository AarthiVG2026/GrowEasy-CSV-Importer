import { useState } from 'react';
import axios from 'axios';
import { ImportResponse } from '../types';
import { toast } from 'sonner';

export function useImportCSV() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setResult(null);
    setLastFile(file);

    toast.info('AI Processing Started', { description: 'Uploading and parsing CSV...' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<ImportResponse>('http://localhost:3001/api/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
      toast.success('Import Completed Successfully', {
        description: `Successfully parsed ${response.data.summary.parsed} records.`
      });
    } catch (err: any) {
      console.error(err);
      let errMsg = err.response?.data?.error || 'An error occurred during import.';
      if (err.code === 'ERR_NETWORK') errMsg = 'Network Error: Backend server is unreachable.';
      if (err.response?.status === 429) errMsg = 'Rate limit exceeded. Please wait and retry.';
      
      setError(errMsg);
      toast.error('Import Failed', { description: errMsg });
    } finally {
      setIsUploading(false);
    }
  };

  const retry = () => {
    if (lastFile) {
      toast.info('Retry Started', { description: 'Attempting to process the file again.' });
      uploadFile(lastFile);
    } else {
      toast.error('No file to retry.');
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsUploading(false);
    setLastFile(null);
  };

  return { uploadFile, isUploading, error, result, reset, retry };
}
