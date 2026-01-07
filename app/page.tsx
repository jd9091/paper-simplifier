'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LevelSelector from '@/components/LevelSelector';
import UploadForm from '@/components/UploadForm';
import URLInput from '@/components/URLInput';
import ProcessingProgress from '@/components/ProcessingProgress';
import { UserLevel } from '@/lib/types';

type InputMode = 'upload' | 'url';

// Helper to process with SSE streaming
async function processWithStream(
  text: string,
  metadata: any,
  userLevel: string,
  onLog: (message: string, step?: number, totalSteps?: number) => void
): Promise<string> {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, metadata, userLevel }),
  });

  if (!response.ok) {
    throw new Error(`Processing failed: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response stream available');
  }

  const decoder = new TextDecoder();
  let resultId: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));

          if (data.type === 'progress') {
            onLog(data.message, data.step, data.totalSteps);
          } else if (data.type === 'complete') {
            resultId = data.id;
          } else if (data.type === 'error') {
            throw new Error(data.error || 'Processing failed');
          }
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  }

  if (!resultId) {
    throw new Error('No result ID received');
  }

  return resultId;
}

export default function Home() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>('undergraduate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ message: string; timestamp: Date }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(5);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleLog = (message: string, step?: number, total?: number) => {
    setLogs(prev => [...prev, { message, timestamp: new Date() }]);
    if (step !== undefined) setCurrentStep(step);
    if (total !== undefined) setTotalSteps(total);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setLogs([]);
    setCurrentStep(0);
    handleLog('Uploading paper...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      let uploadData;
      try {
        uploadData = await uploadResponse.json();
      } catch {
        throw new Error('Server returned an invalid response. Please try again.');
      }

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload file');
      }

      handleLog('PDF uploaded successfully, starting analysis...');

      const resultId = await processWithStream(
        uploadData.text,
        uploadData.metadata,
        selectedLevel,
        handleLog
      );

      handleLog('Complete! Redirecting to results...');
      router.push(`/results/${resultId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsProcessing(false);
    }
  };

  const handleURLSubmit = async (url: string) => {
    setIsProcessing(true);
    setError(null);
    setLogs([]);
    setCurrentStep(0);
    handleLog('Fetching paper from URL...');

    try {
      const fetchResponse = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        throw new Error(`Fetch failed: ${errorText}`);
      }

      let fetchData;
      try {
        fetchData = await fetchResponse.json();
      } catch {
        throw new Error('Server returned an invalid response while fetching URL.');
      }

      if (!fetchData.success) {
        throw new Error(fetchData.error || 'Failed to fetch URL');
      }

      handleLog('Paper fetched successfully, starting analysis...');

      const resultId = await processWithStream(
        fetchData.text,
        fetchData.metadata,
        selectedLevel,
        handleLog
      );

      handleLog('Complete! Redirecting to results...');
      router.push(`/results/${resultId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <ProcessingProgress
        show={isProcessing}
        logs={logs}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Level Selector */}
        <LevelSelector selectedLevel={selectedLevel} onLevelChange={setSelectedLevel} />

        {/* Input Methods */}
        <div className="section-container">
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => setInputMode('upload')}
              style={{
                padding: '0.75rem 1.25rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderBottom: inputMode === 'upload' ? '2px solid var(--color-fg)' : '2px solid transparent',
                color: inputMode === 'upload' ? 'var(--color-fg)' : 'var(--color-fg-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              Upload PDF
            </button>
            <button
              onClick={() => setInputMode('url')}
              style={{
                padding: '0.75rem 1.25rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderBottom: inputMode === 'url' ? '2px solid var(--color-fg)' : '2px solid transparent',
                color: inputMode === 'url' ? 'var(--color-fg)' : 'var(--color-fg-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              Paste URL
            </button>
          </div>

          {inputMode === 'upload' ? (
            <div>
              <UploadForm onFileSelect={handleFileSelect} />
              {selectedFile && (
                <button
                  onClick={handleUploadSubmit}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  Process Paper
                </button>
              )}
            </div>
          ) : (
            <URLInput onURLSubmit={handleURLSubmit} />
          )}

          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              border: '1px solid var(--color-fg)',
              borderRadius: '0.375rem',
              background: 'var(--color-hover)'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Error</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-fg-muted)' }}>{error}</div>
            </div>
          )}
        </div>

        {/* Features Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Auto Diagrams</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-fg-muted)' }}>
              Visual flowcharts for methodology & results
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Adaptive Level</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-fg-muted)' }}>
              Content tailored to your background
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔗</div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Shareable</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-fg-muted)' }}>
              Generate links to share with others
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
