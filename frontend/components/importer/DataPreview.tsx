"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Columns, Rows, HardDrive, Loader2, Database, Zap, ShieldCheck } from 'lucide-react';

interface DataPreviewProps {
  file: File;
  data: any[];
  onConfirm: () => void;
  onCancel: () => void;
  isUploading: boolean;
}

const processingSteps = [
  { text: "Uploading CSV to secure server...", icon: <HardDrive className="w-5 h-5 text-blue-400" /> },
  { text: "Parsing and validating structures...", icon: <ShieldCheck className="w-5 h-5 text-green-400" /> },
  { text: "AI identifying column headers...", icon: <Zap className="w-5 h-5 text-yellow-400" /> },
  { text: "Extracting CRM records (Batching)...", icon: <Database className="w-5 h-5 text-purple-400" /> },
  { text: "Finalizing import...", icon: <Loader2 className="w-5 h-5 text-pink-400 animate-spin" /> },
];

export function DataPreview({ file, data, onConfirm, onCancel, isUploading }: DataPreviewProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(true);

  // Simulate a brief loading skeleton for the frontend parsing UX
  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingSkeleton(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulate step progression for the processing screen
  useEffect(() => {
    if (isUploading) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => Math.min(prev + 1, processingSteps.length - 1));
      }, 2500); // Progress to next step every 2.5s
      return () => clearInterval(interval);
    }
  }, [isUploading]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow).map((key, index) => ({
      id: key || `col_${index}`,
      accessorFn: (row: any) => row[key],
      header: key || `Column ${index + 1}`,
      cell: (info: any) => (
        <span className="truncate block max-w-[200px]" title={String(info.getValue())}>
          {String(info.getValue())}
        </span>
      ),
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const { rows } = table.getRowModel();
  
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const currentStep = processingSteps[loadingStep];
  const progressPercent = Math.min(100, Math.round(((loadingStep + 1) / processingSteps.length) * 100));

  if (isUploading) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
        <CardContent className="p-12 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 p-4 bg-primary/10 rounded-full"
          >
            {currentStep.icon}
          </motion.div>
          <motion.h2 
            key={currentStep.text}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {currentStep.text}
          </motion.h2>
          <p className="text-gray-400 mb-8">Please wait while our AI engine maps your data.</p>
          
          <div className="w-full max-w-md bg-black/50 h-3 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-gray-400 mt-4 font-mono text-sm">{progressPercent}% Completed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      {/* File Information Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-default group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg group-hover:scale-110 transition-transform"><FileText className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">File</p>
              <p className="font-semibold text-white truncate max-w-[120px]" title={file.name}>{file.name}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-default group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg group-hover:scale-110 transition-transform"><HardDrive className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Size</p>
              <p className="font-semibold text-white">{formatSize(file.size)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-default group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-lg group-hover:scale-110 transition-transform"><Rows className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Rows</p>
              <p className="font-semibold text-white">{data.length.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-default group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-pink-500/20 text-pink-400 rounded-lg group-hover:scale-110 transition-transform"><Columns className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Columns</p>
              <p className="font-semibold text-white">{columns.length.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full shadow-2xl border-white/10 bg-white/5 backdrop-blur-md">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-4">
          <CardTitle className="text-xl text-gray-100 flex items-center gap-2">
            Data Preview
            <span className="text-xs px-2 py-1 bg-white/10 rounded-full font-normal">First {Math.min(100, data.length)} rows</span>
          </CardTitle>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search all rows..."
              className="px-3 py-2 bg-black/40 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64 transition-all focus:w-72"
            />
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onConfirm} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/25">
              Confirm Import
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          
          {isLoadingSkeleton ? (
            <div className="p-6 space-y-4">
               {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="h-6 bg-white/10 rounded animate-pulse flex-1" style={{ animationDelay: `${i * 100}ms` }}></div>
                     <div className="h-6 bg-white/10 rounded animate-pulse flex-1" style={{ animationDelay: `${i * 100}ms` }}></div>
                     <div className="h-6 bg-white/10 rounded animate-pulse flex-1" style={{ animationDelay: `${i * 100}ms` }}></div>
                     <div className="h-6 bg-white/10 rounded animate-pulse flex-1" style={{ animationDelay: `${i * 100}ms` }}></div>
                  </div>
               ))}
            </div>
          ) : (
            <div ref={parentRef} className="overflow-auto max-h-[500px] custom-scrollbar w-full">
              <table className="w-full text-sm text-left relative">
                <thead className="text-xs text-gray-400 uppercase bg-[#09090b] sticky top-0 z-10 shadow-md">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-6 py-4 border-b border-white/10 whitespace-nowrap min-w-[150px] font-semibold tracking-wider">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  style={{
                    display: 'block',
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors absolute w-full flex items-center"
                        style={{
                          top: 0,
                          left: 0,
                          transform: `translateY(${virtualRow.start}px)`,
                          height: `${virtualRow.size}px`,
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-gray-300 min-w-[150px] flex-1 truncate">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length === 0 && (
                <div className="p-12 text-center text-gray-500">No results found for your search.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
