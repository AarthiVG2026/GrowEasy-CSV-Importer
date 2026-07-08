"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { parseLocalCsv } from '@/lib/csv';

interface FileUploadProps {
  onFileSelect: (file: File, previewData: any[]) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB.');
      return;
    }

    setIsProcessing(true);
    try {
      const previewData = await parseLocalCsv(file);
      onFileSelect(file, previewData);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file.');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-lg border-white/10 bg-white/5 backdrop-blur-md">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-500 hover:border-primary/50 hover:bg-white/5'}
            ${error ? 'border-red-500 bg-red-500/10' : ''}`}
        >
          <input {...getInputProps()} />
          
          {isProcessing ? (
            <div className="flex flex-col items-center animate-pulse text-primary">
              <UploadCloud className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Processing CSV...</p>
            </div>
          ) : (
            <>
              <div className="p-4 mb-4 rounded-full bg-primary/10 text-primary">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="mb-2 text-lg font-semibold text-gray-200">
                {isDragActive ? 'Drop your CSV here' : 'Click or drag CSV to upload'}
              </p>
              <p className="text-sm text-gray-400">Max file size 20MB</p>
            </>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-4 text-red-400 bg-red-400/10 p-3 rounded-md">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
