"use client";

import React, { useState } from 'react';
import { FileUpload } from '@/components/importer/FileUpload';
import { DataPreview } from '@/components/importer/DataPreview';
import { ImportResults } from '@/components/importer/ImportResults';
import { useImportCSV } from '@/hooks/useImportCSV';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const { uploadFile, isUploading, error, result, reset, retry } = useImportCSV();

  const handleFileSelect = (file: File, data: any[]) => {
    setSelectedFile(file);
    setPreviewData(data);
    toast.success("CSV Uploaded Successfully", {
      description: `Ready to preview ${file.name}`
    });
  };

  const handleConfirm = () => {
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewData([]);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData([]);
    reset();
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex-1 max-w-7xl mx-auto w-full p-6 relative z-10">
        <header className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/20 backdrop-blur-md">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            GrowEasy AI Importer
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Intelligently map arbitrary CSV records into CRM fields using the power of AI.
            No more manual column mapping. Just drop your file and let AI do the rest.
          </p>
        </header>

        <div className="flex flex-col items-center justify-center w-full min-h-[400px]">
          <AnimatePresence mode="wait">
            {!selectedFile && !result && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <FileUpload onFileSelect={handleFileSelect} />
              </motion.div>
            )}

            {selectedFile && !result && !error && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <DataPreview 
                  file={selectedFile}
                  data={previewData} 
                  onConfirm={handleConfirm} 
                  onCancel={handleCancel}
                  isUploading={isUploading}
                />
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl mx-auto"
              >
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 flex flex-col items-center text-center backdrop-blur-md shadow-2xl shadow-red-500/10">
                  <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <Database className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-400 mb-2">Import Failed</h2>
                  <p className="text-gray-300 mb-8">{error}</p>
                  
                  <div className="flex gap-4">
                    <button onClick={handleCancel} className="px-6 py-2 rounded-md border border-white/20 hover:bg-white/5 text-white transition-all">Cancel</button>
                    <button onClick={retry} className="px-6 py-2 rounded-md bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-medium shadow-lg shadow-red-500/20 transition-all">Retry Failed Import</button>
                  </div>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <ImportResults result={result} onReset={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Toaster theme="dark" />
    </main>
  );
}
