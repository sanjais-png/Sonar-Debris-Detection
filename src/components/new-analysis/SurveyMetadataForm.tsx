import React from 'react';
import { Card } from '../common/Card';
import { Compass, Ship, Calendar, Tag, MapPin, AlertTriangle } from 'lucide-react';

export interface SurveyMetadata {
  surveyName: string;
  surveyDate: string;
  vessel: string;
  sonarType: string;
  positionSource: 'metadata' | 'manual';
  lat: number;
  lon: number;
  heading: number;
}

interface SurveyMetadataFormProps {
  metadata: SurveyMetadata;
  onChange: (updated: Partial<SurveyMetadata>) => void;
}

export const SurveyMetadataForm: React.FC<SurveyMetadataFormProps> = React.memo(({ metadata, onChange }) => {
  const isLatInvalid = metadata.positionSource === 'manual' && (metadata.lat < -90 || metadata.lat > 90);
  const isLonInvalid = metadata.positionSource === 'manual' && (metadata.lon < -180 || metadata.lon > 180);
  const isHeadingInvalid = metadata.positionSource === 'manual' && (metadata.heading < 0 || metadata.heading > 360);

  return (
    <Card className="space-y-4">
      <div className="border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-text">Survey Parameters & Metadata (Optional)</h3>
        <p className="text-xs text-muted">Acoustic sensor configuration and position spatial referencing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Survey Campaign Name */}
        <div>
          <label className="block text-xs font-semibold text-text mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary" /> Survey Campaign Name
          </label>
          <input
            type="text"
            value={metadata.surveyName}
            onChange={(e) => onChange({ surveyName: e.target.value })}
            placeholder="e.g. Survey 2026-SF-901"
            className="w-full px-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Survey Date */}
        <div>
          <label className="block text-xs font-semibold text-text mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Survey Timestamp
          </label>
          <input
            type="datetime-local"
            value={metadata.surveyDate.substring(0, 16)}
            onChange={(e) => onChange({ surveyDate: e.target.value })}
            className="w-full px-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Vessel Name */}
        <div>
          <label className="block text-xs font-semibold text-text mb-1 flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-primary" /> Survey Vessel / AUV
          </label>
          <input
            type="text"
            value={metadata.vessel}
            onChange={(e) => onChange({ vessel: e.target.value })}
            placeholder="e.g. RV Oceanus"
            className="w-full px-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Sonar System Model Select */}
        <div>
          <label className="block text-xs font-semibold text-text mb-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-primary" /> Sonar System Model
          </label>
          <select
            value={metadata.sonarType}
            onChange={(e) => onChange({ sonarType: e.target.value })}
            className="w-full px-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Klein 4900 Side-Scan Sonar">Klein 4900 Dual-Freq Side-Scan</option>
            <option value="EdgeTech 4200 Dual-Freq">EdgeTech 4200 MP Multibeam/Side-Scan</option>
            <option value="Innomar SES-2000 Sub-bottom">Innomar SES-2000 Sub-bottom Profiler</option>
            <option value="Norbit iWBMS Multibeam">Norbit iWBMS Integrated Multibeam</option>
          </select>
        </div>
      </div>

      {/* Position Source Segmented Control */}
      <div className="pt-3 border-t border-border space-y-3">
        <label className="block text-xs font-semibold text-text flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" /> Spatial Georeferencing Source
        </label>

        {/* Segmented Control */}
        <div className="inline-flex p-1 bg-background border border-border rounded-button text-xs font-medium">
          <button
            type="button"
            onClick={() => onChange({ positionSource: 'metadata' })}
            className={`px-3 py-1.5 rounded-button transition-colors ${
              metadata.positionSource === 'metadata'
                ? 'bg-surface text-primary font-semibold shadow-subtle border border-border'
                : 'text-muted hover:text-text'
            }`}
          >
            Use image metadata (EXIF/GeoTIFF)
          </button>
          <button
            type="button"
            onClick={() => onChange({ positionSource: 'manual' })}
            className={`px-3 py-1.5 rounded-button transition-colors ${
              metadata.positionSource === 'manual'
                ? 'bg-surface text-primary font-semibold shadow-subtle border border-border'
                : 'text-muted hover:text-text'
            }`}
          >
            Enter manually (GNSS Trackline)
          </button>
        </div>

        {/* Manual Position Inputs with Bounds Validation */}
        {metadata.positionSource === 'manual' && (
          <div className="p-4 bg-background rounded-card border border-border space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-text">
                  Latitude (-90° to +90°)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={metadata.lat}
                  onChange={(e) => onChange({ lat: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-2.5 py-1.5 text-xs text-text bg-surface border rounded-input font-mono ${
                    isLatInvalid ? 'border-danger text-danger focus:ring-danger' : 'border-border'
                  }`}
                />
                {isLatInvalid && (
                  <p className="text-[10px] text-danger mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> Must be between -90 and 90
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text">
                  Longitude (-180° to +180°)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={metadata.lon}
                  onChange={(e) => onChange({ lon: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-2.5 py-1.5 text-xs text-text bg-surface border rounded-input font-mono ${
                    isLonInvalid ? 'border-danger text-danger focus:ring-danger' : 'border-border'
                  }`}
                />
                {isLonInvalid && (
                  <p className="text-[10px] text-danger mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> Must be between -180 and 180
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text">
                  Heading (0° to 360°)
                </label>
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={metadata.heading}
                  onChange={(e) => onChange({ heading: parseInt(e.target.value, 10) || 0 })}
                  className={`w-full px-2.5 py-1.5 text-xs text-text bg-surface border rounded-input font-mono ${
                    isHeadingInvalid ? 'border-danger text-danger focus:ring-danger' : 'border-border'
                  }`}
                />
                {isHeadingInvalid && (
                  <p className="text-[10px] text-danger mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> Must be between 0 and 360
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});

SurveyMetadataForm.displayName = 'SurveyMetadataForm';
