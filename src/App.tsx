import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { SonarProvider } from './context/SonarContext';
import { AppShell } from './components/common/AppShell';
import { PageSkeletonFallback } from './components/common/SkeletonLoader';

// Lazy-load routes for sub-200 KB initial bundle budget
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const NewAnalysisPage = React.lazy(() => import('./pages/NewAnalysisPage').then((m) => ({ default: m.NewAnalysisPage })));
const AnalysesPage = React.lazy(() => import('./pages/AnalysesPage').then((m) => ({ default: m.AnalysesPage })));
const AnalysisDetailPage = React.lazy(() => import('./pages/AnalysisDetailPage').then((m) => ({ default: m.AnalysisDetailPage })));
const ReviewQueuePage = React.lazy(() => import('./pages/ReviewQueuePage').then((m) => ({ default: m.ReviewQueuePage })));
const MapPage = React.lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 60s
      gcTime: 1000 * 60 * 10,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SonarProvider>
          <BrowserRouter>
            <AppShell>
              <Suspense fallback={<PageSkeletonFallback />}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/new-analysis" element={<NewAnalysisPage />} />
                  <Route path="/analyses" element={<AnalysesPage />} />
                  <Route path="/analyses/:id" element={<AnalysisDetailPage />} />
                  <Route path="/review" element={<ReviewQueuePage />} />
                  <Route path="/review-queue" element={<ReviewQueuePage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Suspense>
            </AppShell>
          </BrowserRouter>
        </SonarProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
