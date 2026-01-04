import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { ProcessedPaper } from './types';

const DATA_DIR = path.join(process.cwd(), 'data', 'papers');

export async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function savePaper(paper: Omit<ProcessedPaper, 'id' | 'createdAt'>): Promise<string> {
  await ensureDataDir();

  const id = nanoid(10);
  const processedPaper: ProcessedPaper = {
    ...paper,
    id,
    createdAt: new Date().toISOString(),
  };

  const filePath = path.join(DATA_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(processedPaper, null, 2));

  return id;
}

export async function getPaper(id: string): Promise<ProcessedPaper | null> {
  try {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading paper:', error);
    return null;
  }
}

export async function listPapers(): Promise<ProcessedPaper[]> {
  try {
    await ensureDataDir();
    const files = await fs.readdir(DATA_DIR);
    const papers = await Promise.all(
      files
        .filter((file) => file.endsWith('.json'))
        .map(async (file) => {
          const id = file.replace('.json', '');
          return getPaper(id);
        })
    );
    return papers.filter((p): p is ProcessedPaper => p !== null);
  } catch (error) {
    console.error('Error listing papers:', error);
    return [];
  }
}
