import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { ProcessedPaper } from './types';
import { put, list, del } from '@vercel/blob';

const DATA_DIR = path.join(process.cwd(), 'data', 'papers');
const isVercel = process.env.VERCEL === '1';

// ============ Local Filesystem Storage ============

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function savePaperLocal(paper: ProcessedPaper): Promise<string> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${paper.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(paper, null, 2));
  return paper.id;
}

async function getPaperLocal(id: string): Promise<ProcessedPaper | null> {
  try {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function listPapersLocal(): Promise<ProcessedPaper[]> {
  try {
    await ensureDataDir();
    const files = await fs.readdir(DATA_DIR);
    const papers = await Promise.all(
      files
        .filter((file) => file.endsWith('.json'))
        .map(async (file) => {
          const id = file.replace('.json', '');
          return getPaperLocal(id);
        })
    );
    return papers.filter((p): p is ProcessedPaper => p !== null);
  } catch {
    return [];
  }
}

// ============ Vercel Blob Storage ============

async function savePaperBlob(paper: ProcessedPaper): Promise<string> {
  const blob = await put(`papers/${paper.id}.json`, JSON.stringify(paper), {
    access: 'public',
    contentType: 'application/json',
  });
  console.log('Saved paper to blob:', blob.url);
  return paper.id;
}

async function getPaperBlob(id: string): Promise<ProcessedPaper | null> {
  try {
    const { blobs } = await list({ prefix: `papers/${id}.json` });
    if (blobs.length === 0) return null;
    
    const response = await fetch(blobs[0].url);
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching paper from blob:', error);
    return null;
  }
}

async function listPapersBlob(): Promise<ProcessedPaper[]> {
  try {
    const { blobs } = await list({ prefix: 'papers/' });
    const papers = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url);
          if (!response.ok) return null;
          return await response.json();
        } catch {
          return null;
        }
      })
    );
    return papers.filter((p): p is ProcessedPaper => p !== null);
  } catch {
    return [];
  }
}

// ============ Unified API ============

export async function savePaper(paper: Omit<ProcessedPaper, 'id' | 'createdAt'>): Promise<string> {
  const id = nanoid(10);
  const processedPaper: ProcessedPaper = {
    ...paper,
    id,
    createdAt: new Date().toISOString(),
  };

  if (isVercel) {
    return savePaperBlob(processedPaper);
  } else {
    return savePaperLocal(processedPaper);
  }
}

export async function getPaper(id: string): Promise<ProcessedPaper | null> {
  if (isVercel) {
    return getPaperBlob(id);
  } else {
    return getPaperLocal(id);
  }
}

export async function listPapers(): Promise<ProcessedPaper[]> {
  if (isVercel) {
    return listPapersBlob();
  } else {
    return listPapersLocal();
  }
}
