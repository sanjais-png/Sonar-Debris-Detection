import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { useSonarContext } from '../../context/SonarContext';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pendingReviewCount } = useSonarContext();
  const [searchQuery, setSearchQuery] = useState('');

  // Breadcrumb mapping
  const pathParts = location.pathname.split('/').filter(Boolean);
  const getBreadcrumbName = (part: string) => {
    switch (part) {
      case 'new-analysis':
        return 'New Analysis';
      case 'analyses':
        return 'Analyses';
      case 'review-queue':
        return 'Review Queue';
      case 'map':
        return 'Map View';
      case 'reports':
        return 'Reports';
      case 'settings':
        return 'Settings';
      default:
        return part.startsWith('an-') ? `Analysis ${part}` : part;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/analyses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-[64px] bg-surface border-b border-border px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left: Mobile Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-muted hover:text-text rounded-button hover:bg-background"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Trail */}
        <nav className="flex items-center gap-2 text-xs text-muted font-medium">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          {pathParts.length > 0 ? (
            pathParts.map((part, i) => (
              <React.Fragment key={part}>
                <span>/</span>
                <span
                  className={
                    i === pathParts.length - 1 ? 'text-text font-semibold' : 'hover:text-primary'
                  }
                >
                  {getBreadcrumbName(part)}
                </span>
              </React.Fragment>
            ))
          ) : (
            <>
              <span>/</span>
              <span className="text-text font-semibold">Dashboard</span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Search & Notifications */}
      <div className="flex items-center gap-4">
        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Global search (survey, debris)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted"
          />
        </form>

        {/* Review Notification Badge */}
        <Link
          to="/review-queue"
          className="relative p-2 text-muted hover:text-text rounded-button hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Review Queue Notifications"
        >
          <Bell className="w-4 h-4" />
          {pendingReviewCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-warning rounded-full ring-2 ring-surface animate-pulse" />
          )}
        </Link>
      </div>
    </header>
  );
};
