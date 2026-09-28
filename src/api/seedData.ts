import { Analysis, Detection } from '../types/sonar';

/**
 * Creates realistic SVG data URLs for Sonar side-scan images
 * Acoustic waterfall style: dark navy/teal background, acoustic yellow-green waterfall returns
 */
export function generateSonarImage(
  title: string,
  width = 1200,
  height = 600,
  debrisPoints: { x: number; y: number; w: number; h: number; label: string }[] = []
): string {
  const noiseLines = Array.from({ length: 30 })
    .map((_, i) => {
      const y = (i * height) / 30;
      const opacity = (Math.sin(i * 0.7) * 0.15 + 0.25).toFixed(2);
      return `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#4E788B" stroke-width="1.5" stroke-opacity="${opacity}" stroke-dasharray="8 4" />`;
    })
    .join('');

  const nadirWidth = width > 400 ? 40 : 16;
  const centerNadir = `<rect x="${width / 2 - nadirWidth / 2}" y="0" width="${nadirWidth}" height="${height}" fill="#0A131C" opacity="0.9" />
    <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="#3D7A94" stroke-width="1" stroke-dasharray="4 4" opacity="0.6"/>`;

  const highlights = debrisPoints
    .map((p) => {
      const px = p.x * width;
      const py = p.y * height;
      const pw = p.w * width;
      const ph = p.h * height;
      return `
      <rect x="${px + pw * 0.8}" y="${py}" width="${pw * 1.5}" height="${ph}" fill="#080F18" opacity="0.95" rx="1" />
      <rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="#E8C372" opacity="0.95" rx="2" stroke="#FFF" stroke-width="1"/>
    `;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#183242"/>
    ${noiseLines}
    ${centerNadir}
    ${highlights}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_ANALYSES: Analysis[] = [
  {
    id: 'an-001',
    name: 'Survey 2026-A101 (Golden Gate Channel)',
    surveyDate: '2026-09-24T08:30:00Z',
    createdAt: '2026-09-24T09:15:22Z',
    status: 'completed',
    imageUrl: '',
    thumbnailUrl: '',
    previewUrl: '',
    imageWidth: 1600,
    imageHeight: 800,
    vessel: 'RV Oceanus',
    sonarType: 'Klein 4900 Side-Scan Sonar',
    positionSource: 'metadata',
    lat: 37.8123,
    lon: -122.4785,
    heading: 245,
    fileSize: 18450000,
    analysisDurationSec: 42,
    detections: [
      {
        id: 'det-101',
        analysisId: 'an-001',
        analysisName: 'Survey 2026-A101 (Golden Gate Channel)',
        class: 'ship_wreck',
        confidence: 0.94,
        bbox: { x: 0.22, y: 0.35, w: 0.18, h: 0.14 },
        lat: 37.8135,
        lon: -122.4792,
        status: 'verified',
        reviewedBy: 'Hydrographer Reviewer',
        reviewedAt: '2026-09-24T10:02:11Z',
        note: 'Confirmed historical wooden vessel frame section.',
        alternatives: [
          { class: 'pipe', confidence: 0.04 },
          { class: 'ghost_net', confidence: 0.02 },
        ],
      },
      {
        id: 'det-102',
        analysisId: 'an-001',
        analysisName: 'Survey 2026-A101 (Golden Gate Channel)',
        class: 'ghost_net',
        confidence: 0.62,
        bbox: { x: 0.65, y: 0.52, w: 0.16, h: 0.12 },
        lat: 37.8112,
        lon: -122.4770,
        status: 'pending_review',
        alternatives: [
          { class: 'pipe', confidence: 0.28 },
          { class: 'cylinder', confidence: 0.10 },
        ],
      },
      {
        id: 'det-103',
        analysisId: 'an-001',
        analysisName: 'Survey 2026-A101 (Golden Gate Channel)',
        class: 'cylinder',
        confidence: 0.88,
        bbox: { x: 0.41, y: 0.18, w: 0.06, h: 0.06 },
        lat: 37.8141,
        lon: -122.4781,
        status: 'auto_accepted',
      },
      {
        id: 'det-104',
        analysisId: 'an-001',
        analysisName: 'Survey 2026-A101 (Golden Gate Channel)',
        class: 'pipe',
        confidence: 0.48,
        bbox: { x: 0.78, y: 0.70, w: 0.22, h: 0.05 },
        lat: 37.8105,
        lon: -122.4762,
        status: 'pending_review',
        alternatives: [
          { class: 'ghost_net', confidence: 0.35 },
          { class: 'cylinder', confidence: 0.17 },
        ],
      },
      {
        id: 'det-105',
        analysisId: 'an-001',
        analysisName: 'Survey 2026-A101 (Golden Gate Channel)',
        class: 'cylinder',
        confidence: 0.82,
        bbox: { x: 0.15, y: 0.72, w: 0.06, h: 0.06 },
        lat: 37.8118,
        lon: -122.4801,
        status: 'auto_accepted',
      },
      {
        id: 'det-106',
        analysisId: 'an-001',
        analysisName: 'Survey 2026-A101 (Golden Gate Channel)',
        class: 'ship_wreck',
        confidence: 0.55,
        bbox: { x: 0.32, y: 0.81, w: 0.18, h: 0.14 },
        lat: 37.8099,
        lon: -122.4788,
        status: 'pending_review',
        alternatives: [
          { class: 'ghost_net', confidence: 0.32 },
          { class: 'pipe', confidence: 0.13 },
        ],
      },
    ],
  },
  {
    id: 'an-002',
    name: 'Survey 2026-B204 (Alcatraz Shoals)',
    surveyDate: '2026-09-22T14:10:00Z',
    createdAt: '2026-09-22T15:00:10Z',
    status: 'completed',
    imageUrl: '',
    thumbnailUrl: '',
    previewUrl: '',
    imageWidth: 1600,
    imageHeight: 800,
    vessel: 'SV Sentinel',
    sonarType: 'EdgeTech 4200 Dual-Freq',
    positionSource: 'metadata',
    lat: 37.8268,
    lon: -122.4230,
    heading: 180,
    fileSize: 22100000,
    analysisDurationSec: 51,
    detections: [
      {
        id: 'det-201',
        analysisId: 'an-002',
        analysisName: 'Survey 2026-B204 (Alcatraz Shoals)',
        class: 'ship_wreck',
        confidence: 0.91,
        bbox: { x: 0.28, y: 0.40, w: 0.18, h: 0.14 },
        lat: 37.8280,
        lon: -122.4245,
        status: 'verified',
        reviewedBy: 'Hydrographer Reviewer',
        reviewedAt: '2026-09-22T16:20:00Z',
        note: 'Scuttled barge return.',
      },
      {
        id: 'det-202',
        analysisId: 'an-002',
        analysisName: 'Survey 2026-B204 (Alcatraz Shoals)',
        class: 'pipe',
        confidence: 0.42,
        bbox: { x: 0.60, y: 0.25, w: 0.22, h: 0.05 },
        lat: 37.8291,
        lon: -122.4215,
        status: 'pending_review',
        alternatives: [
          { class: 'cylinder', confidence: 0.38 },
          { class: 'ghost_net', confidence: 0.20 },
        ],
      },
      {
        id: 'det-203',
        analysisId: 'an-002',
        analysisName: 'Survey 2026-B204 (Alcatraz Shoals)',
        class: 'cylinder',
        confidence: 0.86,
        bbox: { x: 0.72, y: 0.60, w: 0.06, h: 0.06 },
        lat: 37.8252,
        lon: -122.4208,
        status: 'auto_accepted',
      },
      {
        id: 'det-204',
        analysisId: 'an-002',
        analysisName: 'Survey 2026-B204 (Alcatraz Shoals)',
        class: 'cylinder',
        confidence: 0.67,
        bbox: { x: 0.18, y: 0.15, w: 0.06, h: 0.06 },
        lat: 37.8298,
        lon: -122.4251,
        status: 'pending_review',
        alternatives: [
          { class: 'pipe', confidence: 0.22 },
        ],
      },
      {
        id: 'det-205',
        analysisId: 'an-002',
        analysisName: 'Survey 2026-B204 (Alcatraz Shoals)',
        class: 'ghost_net',
        confidence: 0.89,
        bbox: { x: 0.44, y: 0.75, w: 0.16, h: 0.12 },
        lat: 37.8241,
        lon: -122.4232,
        status: 'auto_accepted',
      },
      {
        id: 'det-206',
        analysisId: 'an-002',
        analysisName: 'Survey 2026-B204 (Alcatraz Shoals)',
        class: 'ship_wreck',
        confidence: 0.36,
        bbox: { x: 0.82, y: 0.30, w: 0.18, h: 0.14 },
        lat: 37.8275,
        lon: -122.4190,
        status: 'pending_review',
        alternatives: [
          { class: 'ghost_net', confidence: 0.40 },
          { class: 'pipe', confidence: 0.24 },
        ],
      },
      {
        id: 'det-207',
        analysisId: 'an-002',
        analysisName: 'Survey 2026-B204 (Alcatraz Shoals)',
        class: 'pipe',
        confidence: 0.79,
        bbox: { x: 0.10, y: 0.80, w: 0.22, h: 0.05 },
        lat: 37.8248,
        lon: -122.4260,
        status: 'verified',
        reviewedBy: 'Hydrographer Reviewer',
        reviewedAt: '2026-09-22T16:25:00Z',
      },
    ],
  },
  {
    id: 'an-003',
    name: 'Survey 2026-C309 (Richmond Anchorage)',
    surveyDate: '2026-09-18T11:00:00Z',
    createdAt: '2026-09-18T12:05:40Z',
    status: 'completed',
    imageUrl: '',
    thumbnailUrl: '',
    previewUrl: '',
    imageWidth: 1600,
    imageHeight: 800,
    vessel: 'RV Oceanus',
    sonarType: 'Klein 4900 Side-Scan Sonar',
    positionSource: 'metadata',
    lat: 37.9150,
    lon: -122.3820,
    heading: 90,
    fileSize: 19800000,
    analysisDurationSec: 38,
    detections: [
      {
        id: 'det-301',
        analysisId: 'an-003',
        analysisName: 'Survey 2026-C309 (Richmond Anchorage)',
        class: 'pipe',
        confidence: 0.95,
        bbox: { x: 0.15, y: 0.45, w: 0.22, h: 0.05 },
        lat: 37.9162,
        lon: -122.3850,
        status: 'verified',
        reviewedBy: 'Hydrographer Reviewer',
        reviewedAt: '2026-09-18T14:10:00Z',
        note: 'Exposed utility pipeline section.',
      },
      {
        id: 'det-302',
        analysisId: 'an-003',
        analysisName: 'Survey 2026-C309 (Richmond Anchorage)',
        class: 'ghost_net',
        confidence: 0.58,
        bbox: { x: 0.55, y: 0.20, w: 0.16, h: 0.12 },
        lat: 37.9170,
        lon: -122.3800,
        status: 'pending_review',
        alternatives: [{ class: 'pipe', confidence: 0.30 }],
      },
      {
        id: 'det-303',
        analysisId: 'an-003',
        analysisName: 'Survey 2026-C309 (Richmond Anchorage)',
        class: 'cylinder',
        confidence: 0.84,
        bbox: { x: 0.70, y: 0.65, w: 0.06, h: 0.06 },
        lat: 37.9141,
        lon: -122.3780,
        status: 'auto_accepted',
      },
      {
        id: 'det-304',
        analysisId: 'an-003',
        analysisName: 'Survey 2026-C309 (Richmond Anchorage)',
        class: 'ship_wreck',
        confidence: 0.38,
        bbox: { x: 0.85, y: 0.12, w: 0.18, h: 0.14 },
        lat: 37.9181,
        lon: -122.3760,
        status: 'rejected',
        reviewedBy: 'Hydrographer Reviewer',
        reviewedAt: '2026-09-18T14:15:00Z',
        note: 'False positive; natural rock outcrop shadowing.',
      },
      {
        id: 'det-305',
        analysisId: 'an-003',
        analysisName: 'Survey 2026-C309 (Richmond Anchorage)',
        class: 'cylinder',
        confidence: 0.92,
        bbox: { x: 0.38, y: 0.70, w: 0.06, h: 0.06 },
        lat: 37.9135,
        lon: -122.3830,
        status: 'auto_accepted',
      },
      {
        id: 'det-306',
        analysisId: 'an-003',
        analysisName: 'Survey 2026-C309 (Richmond Anchorage)',
        class: 'ship_wreck',
        confidence: 0.64,
        bbox: { x: 0.22, y: 0.18, w: 0.18, h: 0.14 },
        lat: 37.9175,
        lon: -122.3845,
        status: 'pending_review',
        alternatives: [{ class: 'ghost_net', confidence: 0.26 }],
      },
    ],
  },
];

// Attach dynamically generated full resolution, preview, and thumbnail image URLs
INITIAL_ANALYSES.forEach((analysis) => {
  const points = analysis.detections.map((d) => ({
    x: d.bbox.x,
    y: d.bbox.y,
    w: d.bbox.w,
    h: d.bbox.h,
    label: d.class,
  }));
  analysis.imageUrl = generateSonarImage(analysis.name, analysis.imageWidth, analysis.imageHeight, points);
  analysis.previewUrl = generateSonarImage(analysis.name, 640, 320, points);
  analysis.thumbnailUrl = generateSonarImage(analysis.name, 320, 160, points);
});
