import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings } from '../types/sonar';
import { sonarApi } from '../api/sonarApi';
import { DEFAULT_SETTINGS } from '../lib/storage';

interface SonarContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  pendingReviewCount: number;
  refreshStats: () => Promise<void>;
  isLoadingSettings: boolean;
}

const SonarContext = createContext<SonarContextType | undefined>(undefined);

export const SonarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);

  const refreshStats = useCallback(async () => {
    try {
      const stats = await sonarApi.getSummaryStats();
      setPendingReviewCount(stats.pendingReviewCount);
    } catch (e) {
      console.error('Failed to fetch summary stats', e);
    }
  }, []);

  const loadSettingsData = useCallback(async () => {
    try {
      setIsLoadingSettings(true);
      const data = await sonarApi.getSettings();
      setSettings(data);
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    loadSettingsData();
    refreshStats();
  }, [loadSettingsData, refreshStats]);

  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = await sonarApi.updateSettings(newSettings);
      setSettings(updated);
      await refreshStats();
    } catch (e) {
      console.error('Failed to save settings', e);
      throw e;
    }
  };

  return (
    <SonarContext.Provider
      value={{
        settings,
        updateSettings: handleUpdateSettings,
        pendingReviewCount,
        refreshStats,
        isLoadingSettings,
      }}
    >
      {children}
    </SonarContext.Provider>
  );
};

export function useSonarContext() {
  const context = useContext(SonarContext);
  if (!context) {
    throw new Error('useSonarContext must be used within a SonarProvider');
  }
  return context;
}
