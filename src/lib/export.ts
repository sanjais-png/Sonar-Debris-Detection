import { Detection } from '../types/sonar';

/**
 * Download content as a file in browser
 */
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export detections list to CSV format
 */
export function exportDetectionsToCSV(detections: Detection[], filename = 'sonar_detections_export.csv') {
  const headers = [
    'Detection ID',
    'Analysis ID',
    'Survey Name',
    'Debris Class',
    'Confidence Score',
    'Latitude',
    'Longitude',
    'Verification Status',
    'Reviewed By',
    'Reviewed At',
    'Notes',
    'BBox (x,y,w,h)',
  ];

  const rows = detections.map((d) => [
    `"${d.id}"`,
    `"${d.analysisId}"`,
    `"${d.analysisName || ''}"`,
    `"${d.class}"`,
    (d.confidence * 100).toFixed(1) + '%',
    d.lat.toFixed(6),
    d.lon.toFixed(6),
    `"${d.status}"`,
    `"${d.reviewedBy || ''}"`,
    `"${d.reviewedAt || ''}"`,
    `"${(d.note || '').replace(/"/g, '""')}"`,
    `"${d.bbox.x.toFixed(3)},${d.bbox.y.toFixed(3)},${d.bbox.w.toFixed(3)},${d.bbox.h.toFixed(3)}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export detections list to GeoJSON format
 */
export function exportDetectionsToGeoJSON(detections: Detection[], filename = 'sonar_detections_export.geojson') {
  const geojson = {
    type: 'FeatureCollection',
    features: detections.map((d) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [d.lon, d.lat],
      },
      properties: {
        id: d.id,
        analysisId: d.analysisId,
        surveyName: d.analysisName || '',
        class: d.class,
        confidence: d.confidence,
        status: d.status,
        reviewedBy: d.reviewedBy || null,
        reviewedAt: d.reviewedAt || null,
        note: d.note || null,
        bbox: d.bbox,
      },
    })),
  };

  const jsonContent = JSON.stringify(geojson, null, 2);
  downloadBlob(jsonContent, filename, 'application/geo+json;charset=utf-8;');
}
