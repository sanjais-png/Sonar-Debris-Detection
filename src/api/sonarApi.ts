/**
 * SonarTrace API Interface Layer
 * 
 * TO SWAP WITH A REAL BACKEND ENDPOINT:
 * 1. Set `USE_MOCK_API = false` below or set environment variable VITE_USE_MOCK_API=false.
 * 2. Update `REAL_API_BASE_URL` with your REST API server URL.
 * 3. The data contracts (Analysis, Detection, Settings) match standard JSON payloads.
 */

import { mockApi } from './mockApi';
import { Analysis, Detection, DetectionStatus, FilterOptions, SummaryStats, AppSettings, BoundingBox } from '../types/sonar';

const USE_MOCK_API = true;
const REAL_API_BASE_URL = 'https://api.sonartrace.example.com/v1';

export const sonarApi = {
  async getAnalyses(filters?: FilterOptions): Promise<Analysis[]> {
    if (USE_MOCK_API) return mockApi.getAnalyses(filters);

    const params = new URLSearchParams(filters as Record<string, string>).toString();
    const res = await fetch(`${REAL_API_BASE_URL}/analyses?${params}`);
    if (!res.ok) throw new Error('Failed to fetch analyses');
    return res.json();
  },

  async getAnalysisById(id: string): Promise<Analysis | null> {
    if (USE_MOCK_API) return mockApi.getAnalysisById(id);

    const res = await fetch(`${REAL_API_BASE_URL}/analyses/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  async createAnalysis(formData: {
    name: string;
    vessel?: string;
    sonarType?: string;
    positionSource?: 'metadata' | 'manual';
    lat?: number;
    lon?: number;
    heading?: number;
    fileSize?: number;
    filesCount?: number;
  }): Promise<Analysis> {
    if (USE_MOCK_API) return mockApi.createAnalysis(formData);

    const res = await fetch(`${REAL_API_BASE_URL}/analyses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error('Failed to create analysis');
    return res.json();
  },

  async deleteAnalysis(id: string): Promise<boolean> {
    if (USE_MOCK_API) return mockApi.deleteAnalysis(id);

    const res = await fetch(`${REAL_API_BASE_URL}/analyses/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  async getDetections(filters?: FilterOptions): Promise<Detection[]> {
    if (USE_MOCK_API) return mockApi.getDetections(filters);

    const params = new URLSearchParams(filters as Record<string, string>).toString();
    const res = await fetch(`${REAL_API_BASE_URL}/detections?${params}`);
    if (!res.ok) throw new Error('Failed to fetch detections');
    return res.json();
  },

  async getReviewQueue(filters?: FilterOptions): Promise<Detection[]> {
    if (USE_MOCK_API) return mockApi.getReviewQueue(filters);

    const params = new URLSearchParams(filters as Record<string, string>).toString();
    const res = await fetch(`${REAL_API_BASE_URL}/review-queue?${params}`);
    if (!res.ok) throw new Error('Failed to fetch review queue');
    return res.json();
  },

  async updateDetectionStatus(
    detectionId: string,
    status: DetectionStatus,
    classOverride?: string,
    note?: string
  ): Promise<Detection | null> {
    if (USE_MOCK_API) return mockApi.updateDetectionStatus(detectionId, status, classOverride, note);

    const res = await fetch(`${REAL_API_BASE_URL}/detections/${detectionId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, classOverride, note }),
    });
    if (!res.ok) throw new Error('Failed to update detection status');
    return res.json();
  },

  async updateDetectionBBox(detectionId: string, bbox: BoundingBox): Promise<Detection | null> {
    if (USE_MOCK_API) return mockApi.updateDetectionBBox(detectionId, bbox);

    const res = await fetch(`${REAL_API_BASE_URL}/detections/${detectionId}/bbox`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bbox }),
    });
    if (!res.ok) throw new Error('Failed to update bounding box');
    return res.json();
  },

  async getSummaryStats(): Promise<SummaryStats> {
    if (USE_MOCK_API) return mockApi.getSummaryStats();

    const res = await fetch(`${REAL_API_BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch summary stats');
    return res.json();
  },

  async getSettings(): Promise<AppSettings> {
    if (USE_MOCK_API) return mockApi.getSettings();

    const res = await fetch(`${REAL_API_BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
    if (USE_MOCK_API) return mockApi.updateSettings(newSettings);

    const res = await fetch(`${REAL_API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },
};
