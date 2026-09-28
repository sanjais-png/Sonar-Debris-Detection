/**
 * DetectionMap — shared map component for the full /map page and views.
 *
 * Leaflet dynamically imported with CSS inside the lazy-loaded chunk.
 * Uses plain L.circleMarker with preferCanvas: true (no markercluster).
 * Map instance is kept mounted; markers updated via diffing.
 * Filter-driven updates debounced by 250 ms.
 * Tooltips built lazily via function passed to bindTooltip.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Detection } from '../../types/sonar';
import { useSonarContext } from '../../context/SonarContext';
import { formatCoordinate } from '../../lib/coordinates';
import { getDebrisClassInfo } from '../../config/classes';
import {
  MAPTILER_KEY,
  TILE_URL,
  TILE_ATTRIBUTION,
} from '../../config/map';
import { MapLegend } from './MapLegend';
import {
  Maximize2, Minimize2, Compass, Download,
  Filter, Map as MapIcon, AlertTriangle, RefreshCw, X,
} from 'lucide-react';
import { exportDetectionsToCSV, exportDetectionsToGeoJSON } from '../../lib/export';
import { Skeleton } from '../common/SkeletonLoader';
import { useDebounce } from '../../hooks/useDebounce';

interface DetectionMapProps {
  detections: Detection[];
  onSelectDetection: (detection: Detection) => void;
  colorBy: 'status' | 'class';
  onColorByChange: (mode: 'status' | 'class') => void;
  onOpenFilters?: () => void;
  isFilterOpen?: boolean;
  onToggleFilterOpen?: () => void;
  activeCount?: number;
  totalCount?: number;
  /** Pass true for full Map page (enables detectRetina and scrollWheelZoom) */
  showBasemapSwitcher?: boolean;
  isFullPage?: boolean;
}

const TILE_OPTIONS = {
  updateWhenIdle: true,
  keepBuffer: 3,
  maxZoom: 17,
} as const;

export const DetectionMap: React.FC<DetectionMapProps> = React.memo(({
  detections,
  onSelectDetection,
  colorBy,
  onColorByChange,
  onOpenFilters,
  isFilterOpen,
  onToggleFilterOpen,
  activeCount,
  totalCount,
  showBasemapSwitcher = false,
  isFullPage = showBasemapSwitcher,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const baseTileRef  = useRef<any>(null);
  // Map from detection id → L.CircleMarker
  const markerMapRef = useRef<Map<string, any>>(new Map());

  const { settings } = useSonarContext();

  const [cursorPos, setCursorPos] = useState<{ lat: number; lon: number } | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [noKeyNotice, setNoKeyNotice] = useState(!MAPTILER_KEY);
  const [retryKey, setRetryKey] = useState(0);

  // Debounce rapid filter changes by 250ms
  const debouncedDetections = useDebounce(detections, 250);

  // Colour resolver
  const getMarkerColor = useCallback((d: Detection): string => {
    if (colorBy === 'status') {
      switch (d.status) {
        case 'verified':
        case 'auto_accepted':  return '#5E9C7E';
        case 'pending_review': return '#C79A4B';
        case 'corrected':      return '#3D7A94';
        case 'rejected':       return '#BC6A66';
        default:               return '#64748B';
      }
    }
    return getDebrisClassInfo(d.class).color;
  }, [colorBy]);

  // One-time map init
  useEffect(() => {
    let isMounted = true;

    import('leaflet').then(async (mod) => {
      await import('leaflet/dist/leaflet.css');
      if (!isMounted || !containerRef.current || mapRef.current) return;

      const LObj = mod.default;

      const map = LObj.map(containerRef.current, {
        zoomControl: false,
        preferCanvas: true,
        scrollWheelZoom: isFullPage,
      }).setView(
        [settings.defaultMapView.lat, settings.defaultMapView.lon],
        settings.defaultMapView.zoom,
      );

      baseTileRef.current = LObj.tileLayer(TILE_URL, {
        ...TILE_OPTIONS,
        attribution: TILE_ATTRIBUTION,
        detectRetina: isFullPage,
      });
      baseTileRef.current.addTo(map);
      baseTileRef.current.on('tileerror', () => { if (isMounted) setTileError(true); });

      LObj.control.zoom({ position: 'topright' }).addTo(map);
      LObj.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

      map.on('mousemove', (e: any) => setCursorPos({ lat: e.latlng.lat, lon: e.latlng.lng }));

      mapRef.current = map;
      setIsMapLoaded(true);

      // ResizeObserver → invalidateSize
      if (wrapperRef.current) {
        const ro = new ResizeObserver(() => requestAnimationFrame(() => map.invalidateSize()));
        ro.observe(wrapperRef.current);
        (map as any)._sonar_ro = ro;
      }
    });

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tile retry effect
  useEffect(() => {
    if (!mapRef.current || retryKey === 0) return;
    import('leaflet').then((mod) => {
      const LObj = mod.default;
      if (baseTileRef.current) {
        mapRef.current.removeLayer(baseTileRef.current);
      }
      baseTileRef.current = LObj.tileLayer(TILE_URL, {
        ...TILE_OPTIONS,
        attribution: TILE_ATTRIBUTION,
        detectRetina: isFullPage,
      });
      baseTileRef.current.addTo(mapRef.current);
      baseTileRef.current.on('tileerror', () => setTileError(true));
      setTileError(false);
    });
  }, [retryKey, isFullPage]);

  // Marker diffing effect
  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then((mod) => {
      if (!mapRef.current) return;
      const LObj = mod.default;
      const map = mapRef.current;
      const existing = markerMapRef.current;

      const incoming = new Map(debouncedDetections.map((d) => [d.id, d]));

      // Remove stale markers
      for (const [id, marker] of existing) {
        if (!incoming.has(id)) {
          try { map.removeLayer(marker); } catch (_) {}
          existing.delete(id);
        }
      }

      const coordFormat = settings.coordFormat;

      // Add or update markers
      for (const [id, d] of incoming) {
        const color = getMarkerColor(d);

        if (existing.has(id)) {
          // Update style in place
          existing.get(id)!.setStyle({ fillColor: color });
        } else {
          // Create plain L.circleMarker with preferCanvas
          const circle = LObj.circleMarker([d.lat, d.lon], {
            radius: 6,
            fillColor: color,
            color: '#FFFFFF',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.85,
          });

          // Lazy tooltip built only when opened
          const capturedD = d;
          circle.bindTooltip(
            () => buildTooltip(getDebrisClassInfo(capturedD.class).label, capturedD, coordFormat),
            {
              direction: 'auto',
              sticky: true,
              opacity: 1,
              offset: [0, -6],
              className: 'sonar-tooltip',
            },
          );

          circle.on('click', () => onSelectDetection(capturedD));
          circle.addTo(map);
          existing.set(id, circle);
        }
      }
    });
  }, [debouncedDetections, colorBy, getMarkerColor, onSelectDetection, settings.coordFormat]);

  // Fit to detections
  const fitBounds = useCallback(() => {
    if (!mapRef.current || detections.length === 0) return;
    import('leaflet').then((mod) => {
      const bounds = mod.default.latLngBounds(detections.map((d) => [d.lat, d.lon] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    });
  }, [detections]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-[calc(100vh-140px)] min-h-[520px] rounded-card border border-border overflow-hidden shadow-subtle flex flex-col select-none"
    >
      {/* Map skeleton while Leaflet loads */}
      {!isMapLoaded && (
        <div className="absolute inset-0 z-30 bg-surface flex flex-col items-center justify-center gap-3">
          <Skeleton className="absolute inset-0 w-full h-full" />
          <MapIcon className="relative z-10 w-8 h-8 text-muted/50" />
          <span className="relative z-10 text-xs font-semibold text-muted">Loading map…</span>
        </div>
      )}

      {/* No-key notice */}
      {noKeyNotice && isMapLoaded && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-2 bg-warning-tint border border-warning/40 rounded-button text-xs text-text shadow-popover max-w-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
          <span>Using development tiles. Add a MapTiler key for production.</span>
          <button type="button" onClick={() => setNoKeyNotice(false)}
            className="ml-auto p-0.5 hover:text-danger transition-colors" aria-label="Dismiss">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Tile error banner */}
      {tileError && isMapLoaded && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-button text-xs text-text shadow-popover max-w-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0" />
          <span>Map tiles couldn't load. Check your connection or map key.</span>
          <button type="button"
            onClick={() => { setTileError(false); setRetryKey((k) => k + 1); }}
            className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-primary text-white rounded font-semibold hover:bg-primary/90 transition-colors">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Top-left controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <button type="button"
          onClick={() => { if (onToggleFilterOpen) onToggleFilterOpen(); else if (onOpenFilters) onOpenFilters(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-button shadow-popover border transition-colors ${
            isFilterOpen
              ? 'bg-primary text-white border-primary'
              : 'bg-surface/90 backdrop-blur-md text-text border-border hover:bg-surface'
          }`}>
          <Filter className="w-4 h-4" />
          <span>Filter Panel</span>
        </button>

        <button type="button" onClick={fitBounds}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text bg-surface/90 backdrop-blur-md border border-border rounded-button shadow-popover hover:bg-surface transition-colors">
          <Maximize2 className="w-4 h-4 text-primary" />
          <span>Fit to Detections</span>
        </button>

        {/* Color-by segmented toggle */}
        <div className="flex items-center bg-surface/90 backdrop-blur-md border border-border rounded-button p-0.5 shadow-popover text-xs font-medium">
          {(['status', 'class'] as const).map((mode) => (
            <button key={mode} type="button" onClick={() => onColorByChange(mode)}
              className={`px-2.5 py-1 rounded transition-colors ${
                colorBy === mode ? 'bg-primary text-white font-semibold' : 'text-text hover:text-primary'
              }`}>
              {mode === 'status' ? 'By Status' : 'By Debris Type'}
            </button>
          ))}
        </div>
      </div>

      {/* Top-right: export + fullscreen */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button type="button" onClick={() => exportDetectionsToGeoJSON(detections)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text bg-surface/90 backdrop-blur-md border border-border rounded-button shadow-popover hover:bg-surface transition-colors">
          <Download className="w-3.5 h-3.5 text-primary" /><span>GeoJSON</span>
        </button>
        <button type="button" onClick={() => exportDetectionsToCSV(detections)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text bg-surface/90 backdrop-blur-md border border-border rounded-button shadow-popover hover:bg-surface transition-colors">
          <Download className="w-3.5 h-3.5 text-primary" /><span>CSV</span>
        </button>
        <button type="button" onClick={toggleFullscreen}
          className="p-2 text-text bg-surface/90 backdrop-blur-md border border-border rounded-button shadow-popover hover:bg-surface transition-colors"
          title="Toggle Fullscreen">
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Map canvas */}
      <div ref={containerRef} className="w-full flex-1 z-10" />

      <MapLegend colorBy={colorBy} />

      {/* Cursor coordinate readout + detection counter */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3">
        <div className="px-3 py-1 bg-surface/90 backdrop-blur-md border border-border rounded-button shadow-popover text-xs font-mono text-muted flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-primary" />
          {cursorPos
            ? <span>{formatCoordinate(cursorPos.lat, cursorPos.lon, settings.coordFormat)}</span>
            : <span>Hover map for coordinates</span>}
        </div>
        {activeCount !== undefined && totalCount !== undefined && (
          <div className="px-3 py-1 bg-surface/90 backdrop-blur-md border border-border rounded-button shadow-popover text-xs text-muted font-medium">
            Showing <strong className="text-text font-bold font-mono">{activeCount}</strong> of{' '}
            <strong className="text-text font-bold font-mono">{totalCount}</strong> detections
          </div>
        )}
      </div>
    </div>
  );
});

DetectionMap.displayName = 'DetectionMap';

// Tooltip HTML — built lazily only when a tooltip opens
function buildTooltip(label: string, d: Detection, coordFormat: 'DD' | 'DMS'): string {
  return `<div class="space-y-1 p-0.5">
    <div class="font-bold text-text">${label}</div>
    <div class="font-mono text-muted text-[11px]">${formatCoordinate(d.lat, d.lon, coordFormat)}</div>
    <div class="flex items-center justify-between gap-2 mt-1 pt-1 border-t border-border/60">
      <span class="font-semibold text-primary font-mono">${Math.round(d.confidence * 100)}% Conf</span>
      <span class="capitalize text-muted text-[10px]">${d.status.replace(/_/g, ' ')}</span>
    </div>
  </div>`;
}
