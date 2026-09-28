import React, { useState, useEffect } from 'react';
import { Search, X, Calendar } from 'lucide-react';
import { FilterOptions } from '../../types/sonar';
import { useSonarContext } from '../../context/SonarContext';
import { useDebounce } from '../../hooks/useDebounce';
import { DEBRIS_CLASSES } from '../../config/classes';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: Partial<FilterOptions>) => void;
  onReset: () => void;
  showClassFilter?: boolean;
  showStatusFilter?: boolean;
  showSurveyFilter?: boolean;
  surveyOptions?: { label: string; value: string }[];
  showMinConfidenceFilter?: boolean;
  showDateRangeFilter?: boolean;
  showLowConfidenceToggle?: boolean;
  statusOptions?: { label: string; value: string }[];
}

export const FilterBar: React.FC<FilterBarProps> = React.memo(({
  filters,
  onFilterChange,
  onReset,
  showClassFilter = true,
  showStatusFilter = true,
  showSurveyFilter = false,
  surveyOptions = [],
  showMinConfidenceFilter = false,
  showDateRangeFilter = false,
  showLowConfidenceToggle = false,
  statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Auto Accepted', value: 'auto_accepted' },
    { label: 'Pending Review', value: 'pending_review' },
    { label: 'Verified', value: 'verified' },
    { label: 'Corrected', value: 'corrected' },
    { label: 'Rejected', value: 'rejected' },
  ],
}) => {
  const { settings } = useSonarContext();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 250);

  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) {
      onFilterChange({ search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search, onFilterChange]);

  const activeCount = Object.entries(filters).filter(
    ([key, val]) => val !== undefined && val !== '' && val !== 'ALL' && val !== false && val !== 0
  ).length;

  return (
    <div className="flex flex-wrap items-center gap-3 p-3.5 bg-surface border border-border rounded-card mb-6">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search by ID, class, vessel, or keyword..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted"
        />
        {searchInput && (
          <button
            onClick={() => {
              setSearchInput('');
              onFilterChange({ search: '' });
            }}
            className="absolute right-2.5 top-2.5 text-muted hover:text-text"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Survey Filter Dropdown */}
      {showSurveyFilter && surveyOptions.length > 0 && (
        <select
          value={filters.surveyName || 'ALL'}
          onChange={(e) => onFilterChange({ surveyName: e.target.value })}
          className="px-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">All Surveys</option>
          {surveyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Debris Class Filter */}
      {showClassFilter && (
        <select
          value={filters.debrisClass || 'ALL'}
          onChange={(e) => onFilterChange({ debrisClass: e.target.value })}
          className="px-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">All Classes</option>
          {DEBRIS_CLASSES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      )}

      {/* Verification Status Filter */}
      {showStatusFilter && (
        <select
          value={filters.status || 'ALL'}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="px-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Min Confidence Threshold */}
      {showMinConfidenceFilter && (
        <div className="flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-input text-xs">
          <span className="text-muted font-medium">Min Conf:</span>
          <select
            value={filters.minConfidence || 0}
            onChange={(e) => onFilterChange({ minConfidence: Number(e.target.value) })}
            className="bg-transparent text-text font-semibold focus:outline-none"
          >
            <option value={0}>0%</option>
            <option value={0.5}>50%</option>
            <option value={0.7}>70%</option>
            <option value={0.85}>85%</option>
            <option value={0.95}>95%</option>
          </select>
        </div>
      )}

      {/* Date Range Inputs */}
      {showDateRangeFilter && (
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1 bg-background border border-border rounded-input px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-muted" />
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
              className="bg-transparent text-xs text-text focus:outline-none"
              title="Date From"
            />
          </div>
          <span className="text-muted text-xs">to</span>
          <div className="flex items-center gap-1 bg-background border border-border rounded-input px-2 py-1">
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFilterChange({ dateTo: e.target.value })}
              className="bg-transparent text-xs text-text focus:outline-none"
              title="Date To"
            />
          </div>
        </div>
      )}

      {/* Low Confidence Toggle */}
      {showLowConfidenceToggle && (
        <label className="flex items-center gap-2 text-xs font-medium text-text cursor-pointer select-none px-2.5 py-1 bg-background rounded-input border border-border">
          <input
            type="checkbox"
            checked={!!filters.hasLowConfidence}
            onChange={(e) => onFilterChange({ hasLowConfidence: e.target.checked })}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span>Has Low Confidence (&lt;{Math.round(settings.reviewThreshold * 100)}%)</span>
        </label>
      )}

      {/* Clear Filters Button */}
      {activeCount > 0 && (
        <button
          onClick={() => {
            setSearchInput('');
            onReset();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-danger border border-border hover:border-danger/30 rounded-button bg-background transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reset Filters ({activeCount})</span>
        </button>
      )}
    </div>
  );
});

FilterBar.displayName = 'FilterBar';
