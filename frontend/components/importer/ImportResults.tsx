"use client";

import React, { useState } from 'react';
import { ImportResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle2, AlertTriangle, Download, RefreshCw, Clock, Cpu, Plus, Search, HelpCircle, Database } from 'lucide-react';
import Papa from 'papaparse';
import { motion } from 'framer-motion';

interface ImportResultsProps {
  result: ImportResponse;
  onReset: () => void;
}

export function ImportResults({ result, onReset }: ImportResultsProps) {
  const { summary, records, skipped } = result;
  const [searchTerm, setSearchTerm] = useState('');
  
  const successRate = summary.total > 0 ? ((summary.parsed / summary.total) * 100).toFixed(1) : '0.0';

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "groweasy_crm_records.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(records);
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "groweasy_crm_records.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredRecords = records.filter(r => 
    Object.values(r).some(v => v && String(v).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 w-full max-w-7xl mx-auto"
    >
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-default group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Rows</span>
              <Database className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-200">{summary.total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-green-500/20 hover:border-green-500/40 transition-all cursor-default group overflow-hidden relative shadow-[0_0_15px_rgba(34,197,94,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-green-400/70 font-medium uppercase tracking-wider">Imported</span>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">{summary.parsed.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-orange-500/20 hover:border-orange-500/40 transition-all cursor-default group overflow-hidden relative shadow-[0_0_15px_rgba(249,115,22,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-orange-400/70 font-medium uppercase tracking-wider">Skipped</span>
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-400">{summary.skipped.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-blue-500/20 hover:border-blue-500/40 transition-all cursor-default group overflow-hidden relative shadow-[0_0_15px_rgba(59,130,246,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-blue-400/70 font-medium uppercase tracking-wider">Success Rate</span>
              <RefreshCw className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">{successRate}%</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-default group overflow-hidden relative shadow-[0_0_15px_rgba(168,85,247,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-purple-400/70 font-medium uppercase tracking-wider">Time</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400">
               {summary.processingTimeMs ? (summary.processingTimeMs / 1000).toFixed(1) : '0'}s
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-pink-500/20 hover:border-pink-500/40 transition-all cursor-default group overflow-hidden relative shadow-[0_0_15px_rgba(236,72,153,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-pink-400/70 font-medium uppercase tracking-wider">AI Model</span>
              <Cpu className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-sm font-bold text-pink-400 mt-2 truncate">{summary.aiModelUsed || 'Gemini 2.5 Flash'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* PARSED CRM TABLE */}
         <Card className="lg:col-span-2 border-white/10 bg-white/5 backdrop-blur-md overflow-hidden flex flex-col shadow-2xl">
            <CardHeader className="border-b border-white/10 bg-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
               <CardTitle className="text-lg text-white">Parsed CRM Records</CardTitle>
               {records.length > 0 && (
                 <div className="relative w-full sm:w-64">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                   <input
                     type="text"
                     placeholder="Search records..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-md pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                   />
                 </div>
               )}
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto max-h-[500px] custom-scrollbar">
               {records.length === 0 ? (
                 <div className="flex flex-col items-center justify-center p-16 text-center">
                   <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                     <AlertTriangle className="w-8 h-8 text-red-500/50" />
                   </div>
                   <p className="text-gray-300 font-medium text-lg">No valid CRM records were found in this CSV.</p>
                   <p className="text-gray-500 text-sm mt-2">Make sure your CSV contains email addresses or phone numbers.</p>
                 </div>
               ) : (
                 <table className="w-full text-sm text-left">
                    <thead className="bg-[#09090b] sticky top-0 text-xs uppercase tracking-wider text-gray-400 z-10 shadow-md">
                       <tr>
                          <th className="px-4 py-4 font-semibold whitespace-nowrap">Name</th>
                          <th className="px-4 py-4 font-semibold whitespace-nowrap">Email</th>
                          <th className="px-4 py-4 font-semibold whitespace-nowrap">Phone</th>
                          <th className="px-4 py-4 font-semibold whitespace-nowrap">Company</th>
                          <th className="px-4 py-4 font-semibold whitespace-nowrap">City</th>
                          <th className="px-4 py-4 font-semibold whitespace-nowrap">State</th>
                          <th className="px-4 py-4 font-semibold whitespace-nowrap">Country</th>
                          <th className="px-4 py-4 font-semibold whitespace-nowrap">Lead Owner</th>
                          <th className="px-4 py-4 font-semibold whitespace-nowrap">Status</th>
                          <th className="px-4 py-4 font-semibold whitespace-nowrap">Source</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {filteredRecords.slice(0, 100).map((r, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                             <td className="px-4 py-3 text-gray-200 whitespace-nowrap">{r.name || '-'}</td>
                             <td className="px-4 py-3 text-gray-300">{r.email || '-'}</td>
                             <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{r.mobile_without_country_code || '-'}</td>
                             <td className="px-4 py-3 text-gray-400 truncate max-w-[150px]" title={r.company}>{r.company || '-'}</td>
                             <td className="px-4 py-3 text-gray-400">{r.city || '-'}</td>
                             <td className="px-4 py-3 text-gray-400">{r.state || '-'}</td>
                             <td className="px-4 py-3 text-gray-400">{r.country || '-'}</td>
                             <td className="px-4 py-3 text-gray-400">{r.lead_owner || '-'}</td>
                             <td className="px-4 py-3 whitespace-nowrap">
                                {r.crm_status ? (
                                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                                    {r.crm_status.replace(/_/g, ' ')}
                                  </span>
                                ) : '-'}
                             </td>
                             <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{r.data_source || '-'}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               )}
               {filteredRecords.length > 100 && (
                 <div className="p-4 text-center text-gray-500 text-xs border-t border-white/10 bg-black/20">
                   Showing first 100 results. Export to view all {records.length.toLocaleString()} records.
                 </div>
               )}
            </CardContent>
         </Card>

         {/* SKIPPED RECORDS TABLE */}
         <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden flex flex-col shadow-2xl">
            <CardHeader className="border-b border-white/10 bg-black/20 p-4">
               <CardTitle className="text-lg text-orange-400 flex items-center gap-2">
                 Skipped Records
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto max-h-[500px] custom-scrollbar">
               {skipped.length === 0 ? (
                 <div className="flex flex-col items-center justify-center p-16 text-center">
                   <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                     <CheckCircle2 className="w-8 h-8 text-green-500/50" />
                   </div>
                   <p className="text-gray-300 font-medium text-lg">No skipped records.</p>
                   <p className="text-gray-500 text-sm mt-2">All rows were successfully imported!</p>
                 </div>
               ) : (
                 <table className="w-full text-sm text-left">
                    <thead className="bg-[#09090b] sticky top-0 text-xs uppercase tracking-wider text-gray-400 z-10 shadow-md">
                       <tr>
                          <th className="px-4 py-4 font-semibold whitespace-nowrap">Reason</th>
                          <th className="px-4 py-4 font-semibold">Row Data</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {skipped.slice(0, 100).map((s, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors group">
                             <td className="px-4 py-3 text-orange-300 font-medium text-xs max-w-[150px] leading-relaxed">
                               {s.reason}
                             </td>
                             <td className="px-4 py-3">
                               <div className="relative flex items-center">
                                 <code className="text-[10px] text-gray-400 bg-black/40 px-2 py-1.5 rounded block truncate w-[180px] border border-white/5">
                                   {JSON.stringify(s.row)}
                                 </code>
                                 <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black p-1 rounded z-20 shadow-xl border border-white/10 hidden group-hover:block ml-2 w-64 text-[10px] text-gray-300 break-all whitespace-normal">
                                   {JSON.stringify(s.row)}
                                 </div>
                               </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               )}
            </CardContent>
         </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-white/10 pt-8 mt-8">
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={onReset} 
          className="text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" /> Start New Import
        </Button>
        
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative group w-full sm:w-auto">
             <Button 
               onClick={downloadJSON} 
               disabled={records.length === 0}
               className="w-full sm:w-auto bg-black border border-white/20 hover:bg-white/5 text-white disabled:opacity-50 transition-all"
             >
               <Download className="w-4 h-4 mr-2" /> Download JSON
             </Button>
             {records.length === 0 && (
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                 No CRM records available.
               </div>
             )}
          </div>
          <div className="relative group w-full sm:w-auto">
             <Button 
               onClick={downloadCSV} 
               disabled={records.length === 0}
               className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 border-0 shadow-lg shadow-purple-500/20 transition-all"
             >
               <Download className="w-4 h-4 mr-2" /> Download CSV
             </Button>
             {records.length === 0 && (
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                 No CRM records available.
               </div>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
