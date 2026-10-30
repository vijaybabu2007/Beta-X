import React, { useState, useEffect } from 'react';
import { FileText, Download, X, Layers, AlertCircle, Cpu, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import type { DocumentModel, DocumentPageModel } from '../../types';

interface EvidenceModalProps {
  document: DocumentModel | null;
  onClose: () => void;
}

export const DocumentEvidenceModal: React.FC<EvidenceModalProps> = ({ document, onClose }) => {
  const [pages, setPages] = useState<DocumentPageModel[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!document) return;
    const fetchPages = async () => {
      setLoading(true);
      try {
        const data = await api.documents.getPages(document.id);
        setPages(data);
        setSelectedPageIndex(0);
      } catch (err) {
        console.error('Failed to load document pages', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, [document]);

  if (!document) return null;

  const activePage = pages[selectedPageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold truncate max-w-md">{document.fileName}</h3>
              <p className="text-[11px] text-slate-400">
                Category: <span className="text-amber-400 font-semibold">{document.documentCategory.replace(/_/g, ' ')}</span> • {document.pageCount} Pages • SHA-256: <span className="font-mono">{document.sha256Hash.substring(0, 12)}...</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={api.documents.getDownloadUrl(document.id)}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Raw PDF
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Page Navigation Strip */}
          <div className="w-56 bg-slate-100 border-r border-slate-200 p-3 overflow-y-auto space-y-2 shrink-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
              Page Evidence Index
            </p>
            {loading ? (
              <div className="text-xs text-slate-500 p-2">Extracting pages with PDFBox 3...</div>
            ) : pages.length === 0 ? (
              <div className="text-xs text-slate-500 p-2">No pages found.</div>
            ) : (
              pages.map((p, idx) => (
                <button
                  key={p.id || idx}
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    selectedPageIndex === idx
                      ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Page {p.pageNumber}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      selectedPageIndex === idx 
                        ? 'bg-blue-800 text-blue-200' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.characterCount} chars
                    </span>
                  </div>
                  {p.ocrApplied && (
                    <span className="inline-block mt-1 text-[9px] font-bold text-amber-300 bg-amber-950/40 px-1 rounded">
                      OCR Fallback
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Right: Extracted Page Text Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Page Header */}
            <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-800">
                  Page {activePage ? activePage.pageNumber : 1} Evidence Citation
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Engine: Apache PDFBox 3.0.3
                </span>
              </div>
              <span className="text-slate-500">
                Ground truth source for regulatory compliance
              </span>
            </div>

            {/* Extracted Text Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Loading extracted page text...
                </div>
              ) : activePage ? (
                <pre className="font-mono text-xs leading-relaxed text-slate-800 bg-white p-5 rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap">
                  {activePage.pageText}
                </pre>
              ) : (
                <div className="text-slate-500 text-xs text-center mt-12">
                  No text content available for this page.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
