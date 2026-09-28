# DD AI — Sonar Debris Detection & GIS Platform

A SaaS/GIS web application built for marine survey hydrographers, AUV operators, and environmental survey teams. **DD AI** processes high-resolution side-scan and multibeam sonar imagery, runs automated machine learning inferencing to detect and label marine debris targets, and triages low-confidence predictions to human hydrographers for verification.

---

## PERFORMANCE RULES & BENCHMARKS

The codebase enforces strict performance budgets and lazy-loading rules:

1. **Bundle Budget Target**: Initial JS bundle MUST remain under 200 KB gzipped (Current: **73.00 KB gzipped**).
2. **Lazy-Loaded Routes**: All page routes MUST be loaded via `React.lazy` and wrapped in `Suspense` inside `AppShell` with a `PageSkeletonFallback` to prevent layout flashes.
3. **Dynamic GIS Map Engine**: `leaflet` and `leaflet.markercluster` MUST only load on demand when map features render. Never import Leaflet synchronously in top-level app bundles.
4. **No Unapproved Dependencies**: Do NOT add new third-party npm packages without explicit confirmation.
5. **Lightweight Image Pipeline**: Use `thumbnailUrl` (max 320px wide) with `loading="lazy"`, explicit `width`/`height` attributes, and skeleton placeholders for all lists and tables. Full resolution `imageUrl` is reserved strictly for detail inspection and verification views.
6. **High-Performance Map Rendering**: Enable `preferCanvas: true` in Leaflet. Automatically switch to lightweight `L.circleMarker` canvas elements when rendering >500 detection markers while preserving hover tooltips.
7. **Fine-Grained Memoization**: Wrap `ClassChip`, `ConfidenceBadge`, `StatusBadge`, map markers, and table rows in `React.memo` to ensure hovering or selecting an item does not trigger full list re-renders.
8. **Input Debouncing**: All search filters and range sliders MUST be debounced by 250 ms using `useDebounce`.
9. **Query Caching Defaults**: Maintain `staleTime: 60000` (60s) and `refetchOnWindowFocus: false` in TanStack Query defaults to prevent unnecessary network requests.

---

## Key Features & Capabilities

- **Dashboard Operations**: Overview metrics (Images analyzed, Debris detected, Pending review count, Average confidence), recent survey campaigns table, custom SVG debris classification distribution charts, and interactive mini map.
- **New Analysis Campaign Upload**: Drag-and-drop zone supporting PNG, JPG, and high-res GeoTIFF files with per-file progress tracking, size validation, campaign metadata, and spatial position settings (EXIF extraction or GNSS trackline input).
- **Interactive Analysis Viewer (70% / 30% Split)**: Wide sonar waterfall view with zoom/pan controls (`react-zoom-pan-pinch`), SVG bounding box overlays, debounced confidence threshold sliders, bidirectional hover highlights, and spatial map previews.
- **Hydrographer Review Queue**: Focused 3-part triage interface for predictions below the review threshold (default 70%). Includes candidate alternatives, keyboard shortcuts (`A` confirm, `R` reject, `C` change class, arrow keys next/previous), undo toasts, and audit logs.
- **Full GIS Map View**: Full-height Leaflet map with CartoDB Positron basemap, optional OpenSeaMap nautical chart overlay, marker clustering (`leaflet.markercluster`), live cursor coordinate readout (DD/DMS), marker hover tooltips, filter panels, and GeoJSON/CSV exports.
- **Reports & Exporting**: Filterable global detections database with instant one-click CSV and GeoJSON downloads.
- **System Settings**: Configurable human review thresholds, debris class management, measurement units (metric/nautical), coordinate format, and default map viewports.

---

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + custom design tokens mapped to CSS variables
- **Icons**: Lucide React
- **Data Fetching & State**: TanStack Query (React Query v5) + React Context
- **Mapping & GIS**: Leaflet + React-Leaflet + Leaflet MarkerCluster (Dynamic Import)
- **Charts**: Custom Lightweight Zero-Dependency SVG Charts (`src/components/charts/`)
- **Image Inspection**: react-zoom-pan-pinch
- **UI Primitives**: Radix UI (Dialog, Dropdown, Slider, Tooltip)

---

## Swapping the Mock API for Real Endpoints

The project uses a decoupled API abstraction located in `src/api/sonarApi.ts`.

To connect your real backend REST API:

1. Open `src/api/sonarApi.ts`.
2. Change `USE_MOCK_API = false` (or set `VITE_USE_MOCK_API=false` in your `.env` file).
3. Update `REAL_API_BASE_URL` with your server's endpoint (e.g. `https://api.yourdomain.com/v1`).
4. Ensure your server returns JSON payloads matching the TypeScript contracts in `src/types/sonar.ts`.

---

## Running the Application Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle & check performance budget
npm run build
```

---

## Map Setup

### Getting a MapTiler Key

1. Create a free account at **https://cloud.maptiler.com** (free tier covers 100 k tile requests/month).
2. In **Account → Keys**, create a new key. Copy the key string.
3. Copy `.env.example` → `.env.local` (never commit `.env.local`):
   ```
   VITE_MAPTILER_KEY=your_key_here
   ```
4. Restart the Vite dev server (`npm run dev`) — Vite only picks up env variables on start.

### Restricting the Key's Origins (Required Before Deploying)

In the MapTiler dashboard → **Keys → Edit** → add your production domain(s) under **Allowed HTTP Referers**, e.g.:
```
https://yourdomain.com/*
https://staging.yourdomain.com/*
```

### Fallback Behaviour (No Key)

If `VITE_MAPTILER_KEY` is empty or missing, the app automatically falls back to **OpenStreetMap standard tiles** (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`). A small dismissible notice appears in the map corner. No crash, no console errors from the map.

### Changing the Tile Provider

All tile URLs, attributions, and map defaults live in **one file**: [`src/config/map.ts`](./src/config/map.ts).

- **To switch provider entirely** (e.g., to Mapbox or Carto): update `TILE_URL` and `TILE_ATTRIBUTION` in `src/config/map.ts` — the rest of the app is provider-agnostic.
- **Default center/zoom** for a different survey area: update `DEFAULT_CENTER` and `DEFAULT_ZOOM` in `map.ts` — `storage.ts` reads them automatically.
