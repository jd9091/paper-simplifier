'use client';

import { useState } from 'react';

interface URLInputProps {
  onURLSubmit: (url: string) => void;
}

export default function URLInput({ onURLSubmit }: URLInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onURLSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://arxiv.org/abs/2301.00000"
          className="input-field"
          required
        />
        <div className="text-xs text-accent mt-2">
          Supported sources: arXiv, PubMed, or any public URL
        </div>
      </div>
      <button type="submit" className="btn-primary w-full">
        Fetch Paper
      </button>
    </form>
  );
}
