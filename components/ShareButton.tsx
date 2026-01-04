'use client';

import { useState } from 'react';

interface ShareButtonProps {
  paperId: string;
}

export default function ShareButton({ paperId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/${paperId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="btn-secondary"
    >
      {copied ? '✓ Copied!' : '🔗 Share Link'}
    </button>
  );
}
