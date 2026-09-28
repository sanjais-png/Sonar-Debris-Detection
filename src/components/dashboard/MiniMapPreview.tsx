/**
 * MiniMapPreview — Dashboard spatial overview card.
 * Mini map rules:
 *  - No scroll-wheel zoom
 *  - No basemap switcher, no detectRetina
 *  - No clustering below 50 markers (plain circleMarkers directly on map)
 *  - Tile options: updateWhenIdle, !updateWhenZooming, keepBuffer 3, maxZoom 17
 *  - Nautical overlay not shown here
 *  - Uses MapTiler Light (falls back to OSM if no key)
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Detection } from '../../types/sonar';
import { Card } from '../common/Card';
import { ExternalLink } from 'lucide-react';
import { TILE_URL, TILE_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../config/map';
import { getDebrisClassInfo } from '../../config/classes';

interface MiniMapPreviewProps {
  detections: Detection[];
}

const MINI_TILE_OPTIONS = {
  updateWhenIdle: true,
  keepBuffer: 3,
  maxZoom: 17,
  detectRetina: false,
} as const;

export const MiniMapPreview: React.FC<MiniMapPreviewProps> = ({ detections }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
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
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
        scrollWheelZoom: false,   // disabled on mini maps
        dragging: true,
        doubleClickZoom: false,
      }).setView(DEFAULT_CENTER, DEFAULT_ZOOM - 3);

      LObj.tileLayer(TILE_URL, { ...MINI_TILE_OPTIONS, attribution: TILE_ATTRIBUTION }).addTo(map);

      mapRef.current = map;
      setIsLoaded(true);
    });

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marker update (diff on detections change)
  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then((L) => {
      if (!mapRef.current) return;
      const LObj = L.default;
      const map = mapRef.current;

      // Remove previous markers
      if (markerGroupRef.current) {
        try { map.removeLayer(markerGroupRef.current); } catch (_) {}
      }

      const group = LObj.layerGroup();

      if (detections.length > 0) {
        const bounds = LObj.latLngBounds([]);
        detections.forEach((d) => {
          const color = getDebrisClassInfo(d.class).color;
          LObj.circleMarker([d.lat, d.lon], {
            radius: 6,
            fillColor: color,
            color: '#FFFFFF',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.85,
          }).addTo(group);
          bounds.extend([d.lat, d.lon] as [number, number]);
        });

        group.addTo(map);
        markerGroupRef.current = group;

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20], maxZoom: 13 });
        }
      }
    });
  }, [detections]);

  return (
    <Card padding="none" className="overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
        <div>
          <h3 className="text-sm font-semibold text-text">Geographic Spatial Overview</h3>
          <p className="text-xs text-muted">Recent target coordinates</p>
        </div>
        <Link
          to="/map"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover"
        >
          <span>Open Full Map</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="relative flex-1 min-h-[200px]">
        {!isLoaded && (
          <div className="absolute inset-0 z-20 bg-[#E2E8F0] animate-pulse flex items-center justify-center text-xs text-muted">
            Loading spatial preview...
          </div>
        )}
        <div ref={containerRef} className="w-full h-full min-h-[220px]" />
      </div>
    </Card>
  );
};
