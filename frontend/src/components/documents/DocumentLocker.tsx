import React, { useState, useEffect, useCallback } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Download, 
  Layers, 
  Trash2,
  FileCheck,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import type { DocumentModel, DocumentCategory, UserRole } from '../../types';
import { DocumentEvidenceModal } from './DocumentEvidenceModal';

interface DocumentLockerProps {
  applicationId: number | string;
  userRole?: UserRole;
}

export const DocumentLocker: React.FC<DocumentLockerProps> = ({ applicationId, userRole = 'INSTITUTION_ADMIN' }) => {
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upload Form State
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('FIRE_SAFETY_NOC');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Inspector Modal State
  const [inspectDoc, setInspectDoc] = useState<DocumentModel | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.documents.listByApplication(applicationId);
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file type. Only PDF documents (.pdf) are permitted by AICTE guidelines.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15MB regulatory limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const uploaded = await api.documents.upload(applicationId, selectedCategory, selectedFile);
      setSuccessMsg(`Document "${uploaded.fileName}" successfully parsed via ${uploaded.extractionMethod.replace(/_/g, ' ')} (${uploaded.pageCount} pages extracted).`);
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload and extract PDF. Ensure the file is not corrupted.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-7 h-7 text-blue-700" />
            Institutional Document Locker & Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Application: <span className="font-mono font-bold text-slate-800">AICTE-2025-APP-89421</span> • Engine: <span className="font-semibold text-slate-700">Apache PDFBox 3.0.3 Native OCR Extraction</span>
          </p>
        </div>
        <button
          onClick={fetchDocuments}
          disabled={loading}
          className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50"
          title="Refresh Documents"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Advisory Legal Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-amber-900 font-medium shadow-sm">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
        <div>
          <span className="font-bold">Advisory System Disclaimer:</span> AI-extracted information is advisory and may contain errors. All extracted values require human verification before regulatory use.
        </div>
      </div>

      {/* Upload Dropzone Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-700" />
          Upload Statutory Compliance Certificate (PDF)
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Document Category Classification
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 font-medium"
              >
                <option value="FIRE_SAFETY_NOC">Fire Safety NOC (Chief Fire Officer)</option>
                <option value="LAND_TITLE_DEED">Land Title Deed / Registered Sale Deed</option>
                <option value="BUILDING_COMPLETION_PLAN">Building Completion Plan & Occupancy Certificate</option>
                <option value="FACULTY_CADRE_LIST">Faculty Staff Cadre & Form 16 / Salary Register</option>
                <option value="BARRIER_FREE_PWD_CERT">Barrier-Free Environment / PwD Ramp Certificate</option>
                <option value="AUDITED_FINANCIALS">Audited Financial Statements & Corpus Fund Receipt</option>
                <option value="AFFIDAVIT_STAMP_PAPER">AICTE Prescribed Affidavit (Stamp Paper)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Regulatory Standards
              </label>
              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                AICTE APH 2024-27 requires official seals, validity timestamps, and clear page resolutions.
              </div>
            </div>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-blue-600 bg-blue-50/50'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            <UploadCloud className={`w-10 h-10 mx-auto mb-2 ${selectedFile ? 'text-emerald-600' : 'text-slate-400'}`} />
            
            {selectedFile ? (
              <div className="text-xs">
                <p className="font-bold text-slate-900">{selectedFile.name}</p>
                <p className="text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for Apache PDFBox 3 Extraction</p>
              </div>
            ) : (
              <div className="text-xs">
                <p className="font-semibold text-slate-800">
                  Click to select or drag and drop statutory PDF certificate
                </p>
                <p className="text-slate-400 mt-1">PDF format only • Maximum 15MB • Automatic SHA-256 duplicate check</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Extracting Text via PDFBox 3...
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload & Extract Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Document Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Extracted Documents Inventory</h2>
            <p className="text-xs text-slate-500">Page-level evidence indexed for compliance validation</p>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{documents.length} Files Uploaded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Document Category</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Pages</th>
                <th className="py-3 px-4">Extraction Engine</th>
                <th className="py-3 px-4">SHA-256 Fingerprint</th>
                <th className="py-3 px-6 text-right">Evidence Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading document vault...</td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No documents uploaded yet. Use the upload box above to add compliance certificates.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {doc.documentCategory.replace(/_/g, ' ')}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate max-w-xs">{doc.fileName}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {doc.pageCount} Pages
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        doc.extractionMethod === 'PDFBOX_NATIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {doc.extractionMethod.replace(/_/g, ' ')}
                      </span>
                      {doc.duplicateFlag && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Duplicate
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-[10px] text-slate-500">
                      {doc.sha256Hash ? doc.sha256Hash.substring(0, 14) + '...' : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setInspectDoc(doc)}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-200" /> Inspect & AI Extract
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Page Evidence & Gemini Inspector Modal */}
      <DocumentEvidenceModal
        document={inspectDoc}
        userRole={userRole}
        onClose={() => setInspectDoc(null)}
        onExtractionUpdated={fetchDocuments}
      />
    </div>
  );
};
