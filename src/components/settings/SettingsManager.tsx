import React, { useState, useEffect, useMemo } from 'react';
import { AppSettings } from '../../types/sonar';
import { DEFAULT_SETTINGS } from '../../lib/storage';
import { DEBRIS_CLASSES } from '../../config/classes';
import { Card } from '../common/Card';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Sliders, MapPin, Tag, Compass, Save, RotateCcw, AlertTriangle, Check, Info } from 'lucide-react';
import { formatPercent } from '../../lib/utils';
import { formatCoordinate } from '../../lib/coordinates';
import { useToast } from '../../context/ToastContext';
import { useDetections } from '../../hooks/useDetections';

interface SettingsManagerProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onSaveSettings,
}) => {
  const { showToast } = useToast();
  const { detections } = useDetections();

  // Local form state
  const [reviewThreshold, setReviewThreshold] = useState<number>(settings.reviewThreshold);
  const [coordFormat, setCoordFormat] = useState<'DD' | 'DMS'>(settings.coordFormat);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'nautical'>(settings.unitSystem);
  const [defaultLat, setDefaultLat] = useState<number>(settings.defaultMapView.lat);
  const [defaultLon, setDefaultLon] = useState<number>(settings.defaultMapView.lon);
  const [defaultZoom, setDefaultZoom] = useState<number>(settings.defaultMapView.zoom);

  const [isSaving, setIsSaving] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Synchronize local form state if external settings change
  useEffect(() => {
    setReviewThreshold(settings.reviewThreshold);
    setCoordFormat(settings.coordFormat);
    setUnitSystem(settings.unitSystem);
    setDefaultLat(settings.defaultMapView.lat);
    setDefaultLon(settings.defaultMapView.lon);
    setDefaultZoom(settings.defaultMapView.zoom);
  }, [settings]);

  // Live evaluation of low-confidence detections count for threshold preview
  const liveReviewCount = useMemo(() => {
    return detections.filter((d) => d.confidence < reviewThreshold).length;
  }, [detections, reviewThreshold]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (reviewThreshold !== settings.reviewThreshold) return true;
    if (coordFormat !== settings.coordFormat) return true;
    if (unitSystem !== settings.unitSystem) return true;
    if (defaultLat !== settings.defaultMapView.lat) return true;
    if (defaultLon !== settings.defaultMapView.lon) return true;
    if (defaultZoom !== settings.defaultMapView.zoom) return true;
    return false;
  }, [
    reviewThreshold,
    coordFormat,
    unitSystem,
    defaultLat,
    defaultLon,
    defaultZoom,
    settings,
  ]);

  const handleDiscardChanges = () => {
    setReviewThreshold(settings.reviewThreshold);
    setCoordFormat(settings.coordFormat);
    setUnitSystem(settings.unitSystem);
    setDefaultLat(settings.defaultMapView.lat);
    setDefaultLon(settings.defaultMapView.lon);
    setDefaultZoom(settings.defaultMapView.zoom);
    showToast({
      type: 'info',
      title: 'Changes Discarded',
      description: 'Form preferences reset back to current saved settings.',
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSaveSettings({
        reviewThreshold,
        coordFormat,
        unitSystem,
        defaultMapView: {
          lat: defaultLat,
          lon: defaultLon,
          zoom: defaultZoom,
        },
      });
      showToast({
        type: 'success',
        title: 'Settings Saved Successfully',
        description: 'Updated triage rules and coordinate display standards across the system.',
      });
    } catch (e) {
      showToast({
        type: 'danger',
        title: 'Failed to Save Settings',
        description: 'An error occurred while persisting system preferences.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    try {
      setIsSaving(true);
      await onSaveSettings(DEFAULT_SETTINGS);
      setReviewThreshold(DEFAULT_SETTINGS.reviewThreshold);
      setCoordFormat(DEFAULT_SETTINGS.coordFormat);
      setUnitSystem(DEFAULT_SETTINGS.unitSystem);
      setDefaultLat(DEFAULT_SETTINGS.defaultMapView.lat);
      setDefaultLon(DEFAULT_SETTINGS.defaultMapView.lon);
      setDefaultZoom(DEFAULT_SETTINGS.defaultMapView.zoom);
      setIsResetConfirmOpen(false);
      showToast({
        type: 'success',
        title: 'Reset to Factory Defaults',
        description: 'All threshold limits, spatial units, and viewports have been restored.',
      });
    } catch (e) {
      showToast({
        type: 'danger',
        title: 'Reset Failed',
        description: 'Could not restore default settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-24">
      {/* 1. Review Confidence Threshold Card */}
      <Card className="space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-base font-semibold text-text">Human Triage Confidence Threshold</h3>
              <p className="text-xs text-muted">Automated triage review rules for ML model output</p>
            </div>
          </div>
          <span className="text-sm font-bold font-mono text-primary bg-primary-tint px-3 py-1 rounded-full border border-primary/20">
            {formatPercent(reviewThreshold)}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted font-medium">
            <span>Aggressive (50%)</span>
            <span>Balanced (70% Default)</span>
            <span>Conservative (90%)</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="0.95"
            step="0.05"
            value={reviewThreshold}
            onChange={(e) => setReviewThreshold(parseFloat(e.target.value))}
            className="w-full accent-primary cursor-pointer h-2 bg-border rounded-lg"
          />

          {/* Live Preview Bar */}
          <div className="p-3.5 rounded-card bg-primary-tint/30 border border-primary/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-text font-medium">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span>
                Live Impact Preview: <strong className="font-mono text-primary font-bold">{liveReviewCount}</strong> of <strong className="font-mono font-bold">{detections.length}</strong> active detections would be routed to human verification.
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Read-Only Detection Classes List */}
      <Card className="space-y-4">
        <div className="border-b border-border pb-3 flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-text">Detection classes</h3>
            <p className="text-xs text-muted">Neural model acoustic taxonomy and color swatches</p>
          </div>
        </div>

        {/* Read-Only Category List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEBRIS_CLASSES.map((cls) => (
            <div
              key={cls.id}
              className="flex items-center gap-3 p-3 bg-background border border-border rounded-card"
            >
              <div
                className="w-4 h-4 rounded-full border border-border shrink-0 shadow-xs"
                style={{ backgroundColor: cls.color }}
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-text truncate">{cls.label}</h4>
                <p className="text-[11px] text-muted truncate">{cls.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-surface border border-border rounded-card text-xs text-muted flex items-center gap-2">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span>Classes are defined by the detection model and can't be changed here.</span>
        </div>
      </Card>

      {/* 3. Coordinates & Measurement Display Preferences Card */}
      <Card className="space-y-4">
        <div className="border-b border-border pb-3 flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-text">Spatial Reference & Measurement Standards</h3>
            <p className="text-xs text-muted">Coordinate notation format and distance unit system</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Coordinate Format */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text">Coordinate Notation Format</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCoordFormat('DD')}
                className={`py-2.5 px-3 rounded-button border text-center transition-colors ${
                  coordFormat === 'DD'
                    ? 'bg-primary-tint border-primary text-primary font-bold shadow-subtle'
                    : 'bg-background border-border text-text hover:bg-surface'
                }`}
              >
                Decimal Degrees (DD)
              </button>
              <button
                type="button"
                onClick={() => setCoordFormat('DMS')}
                className={`py-2.5 px-3 rounded-button border text-center transition-colors ${
                  coordFormat === 'DMS'
                    ? 'bg-primary-tint border-primary text-primary font-bold shadow-subtle'
                    : 'bg-background border-border text-text hover:bg-surface'
                }`}
              >
                Degrees Min Sec (DMS)
              </button>
            </div>

            {/* Live Format Example */}
            <div className="p-3 bg-background border border-border rounded-card text-xs space-y-1">
              <span className="text-muted font-medium block">Live Format Example:</span>
              <p className="font-mono text-primary font-bold tabular-nums">
                {formatCoordinate(37.8049, -122.4194, coordFormat)}
              </p>
            </div>
          </div>

          {/* Unit System */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text">Measurement Unit Standard</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setUnitSystem('metric')}
                className={`py-2.5 px-3 rounded-button border text-center transition-colors ${
                  unitSystem === 'metric'
                    ? 'bg-primary-tint border-primary text-primary font-bold shadow-subtle'
                    : 'bg-background border-border text-text hover:bg-surface'
                }`}
              >
                Metric System
              </button>
              <button
                type="button"
                onClick={() => setUnitSystem('nautical')}
                className={`py-2.5 px-3 rounded-button border text-center transition-colors ${
                  unitSystem === 'nautical'
                    ? 'bg-primary-tint border-primary text-primary font-bold shadow-subtle'
                    : 'bg-background border-border text-text hover:bg-surface'
                }`}
              >
                Nautical System
              </button>
            </div>

            <div className="p-3 bg-background border border-border rounded-card text-xs space-y-1">
              <span className="text-muted font-medium block">Standard Distance & Velocity Units:</span>
              <p className="font-mono text-text">
                {unitSystem === 'metric' ? 'Meters (m), Kilometers (km), m/s' : 'Nautical Miles (NM), Knots (kn)'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Default GIS Map Viewport Card */}
      <Card className="space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-base font-semibold text-text">Default GIS Map Viewport & Layers</h3>
              <p className="text-xs text-muted">Initial map centroid coordinates and layer defaults</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDefaultLat(37.8049);
              setDefaultLon(-122.4194);
              setDefaultZoom(11);
            }}
            className="px-2.5 py-1 text-xs font-medium text-primary hover:underline"
          >
            Use SF Bay Default
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">Center Latitude (°N)</label>
            <input
              type="number"
              step="0.0001"
              value={defaultLat}
              onChange={(e) => setDefaultLat(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text mb-1">Center Longitude (°E/W)</label>
            <input
              type="number"
              step="0.0001"
              value={defaultLon}
              onChange={(e) => setDefaultLon(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text mb-1">Default Zoom Level</label>
            <input
              type="number"
              min="1"
              max="18"
              value={defaultZoom}
              onChange={(e) => setDefaultZoom(parseInt(e.target.value, 10) || 11)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-input"
            />
          </div>
        </div>
      </Card>

      {/* Sticky Bottom Action Bar when there are unsaved changes */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-popover p-4 animate-in slide-in-from-bottom-5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-text font-semibold">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span>You have unsaved configuration changes.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="px-3.5 py-1.5 text-xs font-semibold text-text bg-background border border-border rounded-button hover:bg-surface transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-button transition-colors shadow-subtle"
              >
                {isSaving ? <Check className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset to Factory Defaults Option */}
      <div className="pt-4 border-t border-border flex justify-between items-center text-xs">
        <span className="text-muted">Restore factory settings and triage defaults:</span>
        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger-tint rounded-button transition-colors border border-danger/30"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to System Defaults</span>
        </button>
      </div>

      {/* Reset System Defaults Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="Reset System Preferences to Factory Defaults?"
        description="This action will restore all triage review thresholds (70%), coordinate notation standards (DD), metric units, and default map viewports."
        confirmLabel="Reset Defaults"
        isDanger={true}
        onConfirm={handleResetToDefaults}
      />
    </div>
  );
};
