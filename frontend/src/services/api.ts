import axios from 'axios';
import type { ApplicationSummary, DocumentModel, DocumentPageModel, DocumentCategory } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercept requests to inject JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('reguflow_jwt');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    },
    register: async (data: any) => {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    },
    me: async () => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
  },
  applications: {
    list: async (): Promise<ApplicationSummary[]> => {
      const res = await apiClient.get('/applications');
      return res.data;
    },
    get: async (id: string | number) => {
      const res = await apiClient.get(`/applications/${id}`);
      return res.data;
    },
    create: async (data: any) => {
      const res = await apiClient.post('/applications', data);
      return res.data;
    },
    submit: async (id: string | number) => {
      const res = await apiClient.post(`/applications/${id}/submit`);
      return res.data;
    },
    updateStatus: async (id: string | number, status: string, remarks?: string) => {
      const res = await apiClient.patch(`/applications/${id}/status`, { status, remarks });
      return res.data;
    },
  },
  documents: {
    upload: async (applicationId: number | string, category: DocumentCategory, file: File): Promise<DocumentModel> => {
      const formData = new FormData();
      formData.append('applicationId', String(applicationId));
      formData.append('documentCategory', category);
      formData.append('file', file);

      const res = await apiClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    listByApplication: async (applicationId: number | string): Promise<DocumentModel[]> => {
      const res = await apiClient.get(`/documents/application/${applicationId}`);
      return res.data;
    },
    getPages: async (documentId: number | string): Promise<DocumentPageModel[]> => {
      const res = await apiClient.get(`/documents/${documentId}/pages`);
      return res.data;
    },
    getDownloadUrl: (documentId: number | string): string => {
      return `${API_BASE_URL}/documents/${documentId}/download`;
    },
  },
  extractions: {
    extract: async (documentId: number | string): Promise<any> => {
      const res = await apiClient.post(`/documents/${documentId}/extract`);
      return res.data;
    },
    getLatest: async (documentId: number | string): Promise<any> => {
      const res = await apiClient.get(`/documents/${documentId}/extraction`);
      return res.data;
    },
    getHistory: async (documentId: number | string): Promise<any[]> => {
      const res = await apiClient.get(`/documents/${documentId}/extraction/history`);
      return res.data;
    },
    reviewField: async (
      extractionId: number | string,
      fieldId: number | string,
      data: { reviewStatus: string; updatedValue?: string; officerRemarks?: string }
    ): Promise<any> => {
      const res = await apiClient.patch(`/extractions/${extractionId}/fields/${fieldId}/review`, data);
      return res.data;
    },
  },
  health: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },
};
