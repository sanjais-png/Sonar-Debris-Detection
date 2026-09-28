import { AppSettings, Analysis, Detection } from '../types/sonar';
import { DEBRIS_CLASSES } from '../config/classes';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../config/map';

const SETTINGS_KEY = 'sonar_trace_settings_v2';
const ANALYSES_KEY = 'sonar_trace_analyses_v2';

export const DEFAULT_SETTINGS: AppSettings = {
  reviewThreshold: 0.70,
  coordFormat: 'DD',
  unitSystem: 'metric',
  defaultMapView: {
    lat: DEFAULT_CENTER[0],
    lon: DEFAULT_CENTER[1],
    zoom: DEFAULT_ZOOM,
  },
  debrisClasses: DEBRIS_CLASSES,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadStoredAnalyses(): Analysis[] | null {
  try {
    const raw = localStorage.getItem(ANALYSES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load stored analyses', e);
  }
  return null;
}

export function saveStoredAnalyses(analyses: Analysis[]): void {
  try {
    localStorage.setItem(ANALYSES_KEY, JSON.stringify(analyses));
  } catch (e) {
    console.error('Failed to save analyses to localStorage', e);
  }
}

export function resetStoredState(): void {
  localStorage.removeItem(ANALYSES_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
