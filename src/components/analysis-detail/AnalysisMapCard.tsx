/**
 * AnalysisMapCard — mini map on the Analysis Detail page.
 * Same mini-map performance rules as MiniMapPreview:
 *  - No scroll-wheel zoom, no detectRetina, no clustering
 *  - MapTiler Light (OSM fallback)
 *  - perf tile options: updateWhenIdle, !updateWhenZooming, keepBuffer 3, maxZoom 17
 *  - Markers diffed by selectedDetectionId so only style changes on selection
 */
import React, { useEffect, useRef, useState } from 'react';
import { Detection } from '../../types/sonar';
import { Card } from '../common/Card';
import { MapPin } from 'lucide-react';
import { TILE_URL, TILE_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../config/map';
import { getDebrisClassInfo } from '../../config/classes';

interface AnalysisMapCardProps {
  detections: Detection[];
  selectedDetectionId: string | null;
  onSelectDetection: (id: string) => void;
}

const MINI_TILE_OPTIONS = {
  updateWhenIdle: true,
  keepBuffer: 3,
  maxZoom: 17,
  detectRetina: false,
} as const;

export const AnalysisMapCard: React.FC<AnalysisMapCardProps> = ({
  detections,
  selectedDetectionId,
  onSelectDetection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  // Map from detection id → circleMarker, for in-place style updates
  const markerMapRef = useRef<Map<string, any>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // One-time map init
  useEffect(() => {
    let isMounted = true;
    if (!containerRef.current) return;

    import('leaflet').then(async (L) => {
      await import('leaflet/dist/leaflet.css');
      if (!isMounted || !containerRef.current || mapRef.current) return;

      const LObj = L.default;

      const map = LObj.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
      }).setView(DEFAULT_CENTER, DEFAULT_ZOOM - 1);

      LObj.tileLayer(TILE_URL, { ...MINI_TILE_OPTIONS, attribution: TILE_ATTRIBUTION }).addTo(map);

      mapRef.current = map;
      setIsLoaded(true);
    });

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marker sync — add new, remove stale, re-style changed selection
  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then((L) => {
      if (!mapRef.current) return;
      const LObj = L.default;
      const map = mapRef.current;
      const existing = markerMapRef.current;

      const incoming = new Map(detections.map((d) => [d.id, d]));

      // Remove stale
      for (const [id, marker] of existing) {
        if (!incoming.has(id)) {
          try { map.removeLayer(marker); } catch (_) {}
          existing.delete(id);
        }
      }

      const bounds = LObj.latLngBounds([]);

      for (const [id, d] of incoming) {
        const isSelected = selectedDetectionId === id;
        const baseColor = getDebrisClassInfo(d.class).color;

        if (existing.has(id)) {
          // Just update style for selection change — no re-add
          existing.get(id)!.setStyle({
            radius: isSelected ? 9 : 6,
            fillColor: isSelected ? '#3D7A94' : baseColor,
            weight: isSelected ? 3 : 1.5,
          });
        } else {
          // New marker
          const marker = LObj.circleMarker([d.lat, d.lon], {
            radius: isSelected ? 9 : 6,
            fillColor: isSelected ? '#3D7A94' : baseColor,
            color: '#FFFFFF',
            weight: isSelected ? 3 : 1.5,
            opacity: 1,
            fillOpacity: 0.9,
          });

          // Lazy tooltip
          const capturedD = d;
          marker.bindTooltip(
            () => `<strong>${getDebrisClassInfo(capturedD.class).label}</strong> (${Math.round(capturedD.confidence * 100)}%)`,
            { direction: 'top' },
          );
          marker.on('click', () => onSelectDetection(id));
          marker.addTo(map);
          existing.set(id, marker);
        }

        bounds.extend([d.lat, d.lon] as [number, number]);
      }

      // Fit to all markers only when detection set changes (not on selection)
      if (bounds.isValid() && existing.size !== markerMapRef.current.size) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
      }
    });
  }, [detections, selectedDetectionId, onSelectDetection]);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text">Survey Spatial Location</h3>
        </div>
        <span className="text-xs text-muted font-mono">{detections.length} georeferenced points</span>
      </div>
      <div className="relative w-full h-48 bg-[#E2E8F0]">
        {!isLoaded && (
          <div className="absolute inset-0 z-20 bg-[#E2E8F0] animate-pulse flex items-center justify-center text-xs text-muted">
            Loading spatial map...
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </Card>
  );
};
