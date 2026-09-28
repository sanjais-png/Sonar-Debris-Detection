import React, { useRef, useState } from 'react';
import { UploadCloud, FileImage, AlertCircle } from 'lucide-react';

interface ValidationError {
  fileName: string;
  message: string;
}

interface DragDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export const DragDropZone: React.FC<DragDropZoneProps> = React.memo(({
  onFilesSelected,
  maxSizeMB = 50,
  acceptedFormats = ['.png', '.jpg', '.jpeg', '.tif', '.tiff'],
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (fileList: FileList | File[]) => {
    const newErrors: ValidationError[] = [];
    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    Array.from(fileList).forEach((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedFormats.includes(ext)) {
        newErrors.push({
          fileName: file.name,
          message: `Unsupported format '${ext}'. Accepted formats: PNG, JPG, TIFF.`,
        });
        return;
      }
      if (file.size > maxSizeBytes) {
        newErrors.push({
          fileName: file.name,
          message: `Exceeds max file size limit of ${maxSizeMB} MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
        });
        return;
      }
      validFiles.push(file);
    });

    setValidationErrors(newErrors);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full space-y-3">
      <div
        tabIndex={0}
        role="button"
        aria-label="Upload sonar image dropzone. Drag and drop files or press Enter to browse."
        onKeyDown={handleKeyDown}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-card cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          isDragOver
            ? 'border-primary bg-primary-tint/50 scale-[0.99]'
            : 'border-border bg-surface hover:border-primary/50 hover:bg-background'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.tif,.tiff"
          onChange={(e) => e.target.files && validateAndAddFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-primary-tint text-primary flex items-center justify-center mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-sm font-semibold text-text text-center">
          Drag and drop sonar imagery here, or{' '}
          <span className="text-primary hover:underline font-semibold">Browse Files</span>
        </p>

        <p className="text-xs text-muted text-center mt-1">
          Supports PNG, JPG, and GeoTIFF side-scan & multibeam acoustic imagery up to {maxSizeMB} MB per file
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <FileImage className="w-3.5 h-3.5 text-primary" /> High-Resolution Acoustics
          </span>
          <span>•</span>
          <span>Multi-file Batching</span>
          <span>•</span>
          <span>EXIF Georeferencing</span>
        </div>
      </div>

      {/* Inline Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="space-y-1.5">
          {validationErrors.map((err, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-3 bg-danger-tint text-danger rounded-button text-xs border border-danger/30"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  <strong className="font-semibold">{err.fileName}:</strong> {err.message}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setValidationErrors((prev) => prev.filter((_, i) => i !== idx))}
                className="text-xs font-semibold hover:underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

DragDropZone.displayName = 'DragDropZone';
