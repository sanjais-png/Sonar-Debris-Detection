import React from 'react';
import { FileImage, Trash2, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatFileSize } from '../../lib/utils';
import { Card } from '../common/Card';

export interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'queued' | 'analyzing' | 'completed' | 'failed';
  error?: string;
}

interface FileListProps {
  files: UploadItem[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export const FileList: React.FC<FileListProps> = React.memo(({ files, onRemove, onRetry }) => {
  if (files.length === 0) return null;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-text">Selected Image Batch ({files.length})</h3>
        <span className="text-xs text-muted font-mono">{files.filter(f => f.status === 'completed').length} / {files.length} Analyzed</span>
      </div>

      <div className="divide-y divide-border max-h-[360px] overflow-y-auto pr-1">
        {files.map((item) => (
          <div key={item.id} className="py-3 flex items-center justify-between gap-4">
            {/* Thumbnail Preview & Metadata */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded bg-background border border-border overflow-hidden shrink-0 flex items-center justify-center">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileImage className="w-6 h-6 text-muted" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-text truncate">{item.file.name}</p>
                <p className="text-[11px] text-muted tabular-nums mt-0.5">
                  {formatFileSize(item.file.size)}
                </p>

                {/* Progress bar when analyzing */}
                {item.status === 'analyzing' && (
                  <div className="w-full bg-border rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Status Badges & Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {item.status === 'queued' && (
                <span className="text-xs font-medium text-muted px-2.5 py-0.5 rounded bg-background border border-border">
                  Queued
                </span>
              )}
              {item.status === 'analyzing' && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing {item.progress}%</span>
                </span>
              )}
              {item.status === 'completed' && (
                <span className="flex items-center gap-1 text-xs font-semibold text-success px-2.5 py-0.5 rounded bg-success-tint border border-success/30">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </span>
              )}
              {item.status === 'failed' && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-semibold text-danger px-2.5 py-0.5 rounded bg-danger-tint border border-danger/30">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Failed</span>
                  </span>
                  <button
                    onClick={() => onRetry(item.id)}
                    className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-primary hover:text-primary-hover border border-primary/30 rounded bg-primary-tint"
                    title="Retry Analysis"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {/* Remove button */}
              {item.status !== 'analyzing' && (
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-1.5 text-muted hover:text-danger rounded hover:bg-background transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});

FileList.displayName = 'FileList';
