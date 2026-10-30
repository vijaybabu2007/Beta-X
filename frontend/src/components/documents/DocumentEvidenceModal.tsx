import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  Layers, 
  AlertCircle, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Edit3,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { api } from '../../services/api';
import type { 
  DocumentModel, 
  DocumentPageModel, 
  DocumentExtractionModel, 
  ExtractedFieldModel,
  UserRole,
  FieldReviewStatus 
} from '../../types';

interface EvidenceModalProps {
  document: DocumentModel | null;
  userRole?: UserRole;
  onClose: () => void;
  onExtractionUpdated?: () => void;
}

export const DocumentEvidenceModal: React.FC<EvidenceModalProps> = ({ 
  document, 
  userRole = 'INSTITUTION_ADMIN',
  onClose,
  onExtractionUpdated 
}) => {
  const [activeTab, setActiveTab] = useState<'gemini' | 'pages'>('gemini');
  const [pages, setPages] = useState<DocumentPageModel[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [loadingPages, setLoadingPages] = useState<boolean>(true);

  // Gemini Extraction State
  const [extraction, setExtraction] = useState<DocumentExtractionModel | null>(null);
  const [loadingExtraction, setLoadingExtraction] = useState<boolean>(true);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Officer Review State
  const [reviewingFieldId, setReviewingFieldId] = useState<number | null>(null);
  const [reviewStatus, setReviewStatus] = useState<FieldReviewStatus>('VERIFIED');
  const [reviewValue, setReviewValue] = useState<string>('');
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const fetchPages = useCallback(async () => {
    if (!document) return;
    setLoadingPages(true);
    try {
      const data = await api.documents.getPages(document.id);
      setPages(data);
      setSelectedPageIndex(0);
    } catch (err) {
      console.error('Failed to load document pages', err);
    } finally {
      setLoadingPages(false);
    }
  }, [document]);

  const fetchLatestExtraction = useCallback(async () => {
    if (!document) return;
    setLoadingExtraction(true);
    setExtractionError(null);
    try {
      const data = await api.extractions.getLatest(document.id);
      setExtraction(data);
    } catch (err) {
      console.warn('No previous extraction found or failed to load extraction', err);
      setExtraction(null);
    } finally {
      setLoadingExtraction(false);
    }
  }, [document]);

  useEffect(() => {
    if (document) {
      fetchPages();
      fetchLatestExtraction();
      setActiveTab('gemini');
      setReviewingFieldId(null);
    }
  }, [document, fetchPages, fetchLatestExtraction]);

  const handleTriggerExtraction = async () => {
    if (!document) return;
    setExtracting(true);
    setExtractionError(null);
    try {
      const res = await api.extractions.extract(document.id);
      setExtraction(res);
      if (onExtractionUpdated) onExtractionUpdated();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Gemini extraction failed. Check API key configuration.';
      setExtractionError(msg);
    } finally {
      setExtracting(false);
    }
  };

  const handleOpenReview = (field: ExtractedFieldModel) => {
    setReviewingFieldId(field.id);
    setReviewStatus(field.reviewStatus === 'NEEDS_REVIEW' || field.reviewStatus === 'EXTRACTED' ? 'VERIFIED' : field.reviewStatus);
    setReviewValue(field.fieldValue || '');
    setReviewRemarks(field.officerRemarks || '');
  };

  const handleSaveReview = async (fieldId: number) => {
    if (!extraction) return;
    setSubmittingReview(true);
    try {
      const updatedField = await api.extractions.reviewField(extraction.id, fieldId, {
        reviewStatus,
        updatedValue: reviewValue,
        officerRemarks: reviewRemarks,
      });

      // Update in local state
      setExtraction((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          fields: prev.fields.map((f) => (f.id === fieldId ? updatedField : f)),
        };
      });

      setReviewingFieldId(null);
      if (onExtractionUpdated) onExtractionUpdated();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit officer review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!document) return null;

  const isOfficer = userRole === 'REVIEWING_OFFICER' || userRole === 'SYSTEM_ADMIN';
  const activePage = pages[selectedPageIndex];

  const formatFieldName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 bg-blue-600 rounded-lg shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold truncate max-w-md">{document.fileName}</h3>
              <p className="text-[11px] text-slate-400">
                Category: <span className="text-amber-400 font-semibold">{document.documentCategory.replace(/_/g, ' ')}</span> • {document.pageCount} Pages • SHA-256: <span className="font-mono">{document.sha256Hash?.substring(0, 10)}...</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={api.documents.getDownloadUrl(document.id)}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Advisory Legal Disclaimer */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-2 text-[11px] text-amber-900 font-medium shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Mandatory AICTE Advisory Notice:</strong> AI-extracted information is advisory and may contain errors. All extracted values require human verification before regulatory use.
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-100/80 border-b border-slate-200 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setActiveTab('gemini')}
            className={`py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'gemini'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Gemini Structured Extraction (Phase 4A)
            {extraction && (
              <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                extraction.extractionStatus === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : extraction.extractionStatus === 'PARTIALLY_VALIDATED'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {extraction.extractionStatus} (v{extraction.version})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            className={`py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'pages'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            PDFBox 3 Page Evidence ({pages.length} Pages)
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'gemini' ? (
            /* TAB 1: Gemini Extraction View */
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50">
              
              {/* Extraction Action Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Structured Fact Extraction Pipeline
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Model: <span className="font-semibold text-slate-700">{extraction?.modelIdentifier || 'Configured via GEMINI_MODEL'}</span> • Evidence Citations Verified against Page Content
                  </p>
                </div>

                <button
                  onClick={handleTriggerExtraction}
                  disabled={extracting}
                  className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${extracting ? 'animate-spin' : ''}`} />
                  {extracting ? 'Extracting with Gemini...' : extraction ? 'Re-extract with Gemini' : 'Extract with Gemini'}
                </button>
              </div>

              {/* Extraction Error or Config Error */}
              {extractionError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Extraction Error</p>
                    <p className="mt-0.5 text-red-700">{extractionError}</p>
                  </div>
                </div>
              )}

              {/* Server Warnings */}
              {extraction && extraction.warnings && extraction.warnings.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Extraction Validation Warnings:
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-800 pl-1">
                    {extraction.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Content Canvas */}
              {loadingExtraction ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                  Checking extraction records...
                </div>
              ) : !extraction ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Document Not Extracted with Gemini Yet</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Click the "Extract with Gemini" button above to run controlled structured extraction against this document's text.
                    </p>
                  </div>
                  <button
                    onClick={handleTriggerExtraction}
                    disabled={extracting}
                    className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Trigger Gemini Extraction
                  </button>
                </div>
              ) : extraction.fields.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  No statutory fields returned by extraction model.
                </div>
              ) : (
                /* Fields Grid */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="font-bold text-slate-800">Extracted Regulatory Facts ({extraction.fields.length} Fields)</span>
                    <span className="text-[11px] text-slate-500">
                      Version: <span className="font-bold text-slate-700">v{extraction.version}</span> • Model: <span className="font-mono text-slate-700">{extraction.modelIdentifier}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extraction.fields.map((field) => (
                      <div
                        key={field.id}
                        className={`bg-white rounded-xl border p-4 shadow-sm transition-all flex flex-col justify-between ${
                          field.reviewStatus === 'VERIFIED'
                            ? 'border-emerald-200 bg-emerald-50/10'
                            : field.reviewStatus === 'FLAGGED_INCORRECT'
                            ? 'border-red-200 bg-red-50/10'
                            : field.reviewStatus === 'NEEDS_REVIEW'
                            ? 'border-amber-200 bg-amber-50/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {formatFieldName(field.fieldName)}
                            </span>

                            {/* Status Chip */}
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                              field.reviewStatus === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : field.reviewStatus === 'FLAGGED_INCORRECT'
                                ? 'bg-red-50 text-red-800 border-red-300'
                                : field.reviewStatus === 'CLARIFICATION_REQUESTED'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : field.reviewStatus === 'NEEDS_REVIEW'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                              {field.reviewStatus === 'VERIFIED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                              {field.reviewStatus === 'FLAGGED_INCORRECT' && <XCircle className="w-2.5 h-2.5" />}
                              {field.reviewStatus === 'NEEDS_REVIEW' && <AlertTriangle className="w-2.5 h-2.5" />}
                              {field.reviewStatus.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Extracted Value */}
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <p className="text-[11px] text-slate-500 font-semibold mb-0.5">Value:</p>
                            <p className="text-xs font-bold text-slate-900 break-words font-mono">
                              {field.fieldValue ? field.fieldValue : <span className="text-slate-400 italic">null (Not stated in document)</span>}
                            </p>
                            {field.originalValue && field.originalValue !== field.fieldValue && (
                              <p className="text-[10px] text-slate-500 mt-1">
                                Original extracted: <span className="line-through">{field.originalValue}</span>
                              </p>
                            )}
                          </div>

                          {/* Page citation & Evidence Quotation */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                              <span className="font-bold text-slate-800">Source:</span>
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px] border border-blue-200">
                                {field.sourcePage ? `Page ${field.sourcePage}` : 'Page unassigned'}
                              </span>
                              {field.confidenceScore && (
                                <span className="text-[10px] text-slate-400">
                                  ({(field.confidenceScore * 100).toFixed(0)}% confidence)
                                </span>
                              )}
                            </div>

                            {field.evidenceQuotation ? (
                              <blockquote className="text-[11px] italic text-slate-600 bg-slate-100/70 p-2 rounded border-l-2 border-blue-500">
                                "{field.evidenceQuotation}"
                              </blockquote>
                            ) : (
                              <p className="text-[10px] text-amber-700 italic">
                                Missing quotation evidence from document text.
                              </p>
                            )}
                          </div>

                          {/* Officer Remarks Display */}
                          {field.officerRemarks && (
                            <div className="text-[11px] bg-indigo-50 p-2 rounded border border-indigo-200 text-indigo-900">
                              <span className="font-bold">Officer Remarks:</span> {field.officerRemarks}
                              {field.reviewedByEmail && (
                                <span className="block text-[10px] text-indigo-700 mt-0.5">
                                  By: {field.reviewedByEmail}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Officer Review Form or Trigger */}
                        {isOfficer && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            {reviewingFieldId === field.id ? (
                              <div className="space-y-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-200">
                                <p className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                                  <UserCheck className="w-3.5 h-3.5" /> Review & Verification Verdict
                                </p>
                                
                                <div className="grid grid-cols-3 gap-1 text-[11px]">
                                  {(['VERIFIED', 'FLAGGED_INCORRECT', 'CLARIFICATION_REQUESTED'] as FieldReviewStatus[]).map((st) => (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => setReviewStatus(st)}
                                      className={`py-1 px-1.5 rounded font-bold border transition-colors ${
                                        reviewStatus === st
                                          ? 'bg-indigo-700 text-white border-indigo-700'
                                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                      }`}
                                    >
                                      {st === 'VERIFIED' ? 'Verify' : st === 'FLAGGED_INCORRECT' ? 'Flag' : 'Clarify'}
                                    </button>
                                  ))}
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                                    Corrected Value (optional):
                                  </label>
                                  <input
                                    type="text"
                                    value={reviewValue}
                                    onChange={(e) => setReviewValue(e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                                    placeholder="Enter verified value"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                                    Officer Remarks / Rationale:
                                  </label>
                                  <textarea
                                    value={reviewRemarks}
                                    onChange={(e) => setReviewRemarks(e.target.value)}
                                    rows={2}
                                    className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                                    placeholder="e.g. Cross-checked with municipal registry page 2."
                                  />
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    onClick={() => setReviewingFieldId(null)}
                                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveReview(field.id)}
                                    disabled={submittingReview}
                                    className="px-3 py-1 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded shadow-sm flex items-center gap-1"
                                  >
                                    {submittingReview ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                    Save Verdict
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenReview(field)}
                                className="w-full py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 rounded text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                              >
                                <Edit3 className="w-3 h-3 text-indigo-700" />
                                Officer Review Verdict
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: PDFBox 3 Page Evidence View */
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Page Navigation Strip */}
              <div className="w-56 bg-slate-100 border-r border-slate-200 p-3 overflow-y-auto space-y-2 shrink-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
                  Page Evidence Index
                </p>
                {loadingPages ? (
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
                <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
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
                  {loadingPages ? (
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
          )}
        </div>
      </div>
    </div>
  );
};
