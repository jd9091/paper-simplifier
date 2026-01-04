'use client';

import { useState, useRef } from 'react';

interface UploadFormProps {
  onFileSelect: (file: File) => void;
}

export default function UploadForm({ onFileSelect }: UploadFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setFileName(files[0].name);
      setFileSize(formatFileSize(files[0].size));
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      setFileSize(formatFileSize(files[0].size));
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragging ? 'var(--color-fg)' : 'var(--color-border)'}`,
        borderRadius: '0.5rem',
        padding: '3rem 2rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        background: isDragging ? 'var(--color-hover)' : 'transparent',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {fileName ? (
        <div>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{fileName}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-fg-muted)' }}>{fileSize}</div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--color-fg-muted)',
            marginTop: '0.75rem'
          }}>
            Click to change file
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📎</div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            Drop PDF here or click to upload
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-fg-muted)' }}>
            Maximum file size: 10MB
          </div>
        </div>
      )}
    </div>
  );
}
