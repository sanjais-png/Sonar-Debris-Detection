import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SettingsManager } from '../components/settings/SettingsManager';
import { useSonarContext } from '../context/SonarContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, isLoadingSettings } = useSonarContext();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration & Preferences"
        subtitle="Configure triage review thresholds, spatial coordinate standards, and debris categories"
      />

      {!isLoadingSettings && (
        <SettingsManager settings={settings} onSaveSettings={updateSettings} />
      )}
    </div>
  );
};
