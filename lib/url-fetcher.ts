import axios from 'axios';
import * as cheerio from 'cheerio';
import { PaperMetadata } from './types';

export type PaperSource = 'arxiv' | 'pubmed' | 'doi' | 'generic';

export function detectSource(url: string): PaperSource {
  if (url.includes('arxiv.org')) return 'arxiv';
  if (url.includes('pubmed') || url.includes('ncbi.nlm.nih.gov')) return 'pubmed';
  if (url.startsWith('10.') || url.includes('doi.org')) return 'doi';
  return 'generic';
}

export async function fetchArxivPaper(url: string): Promise<{ text: string; metadata: PaperMetadata }> {
  try {
    // Extract arXiv ID
    const arxivId = url.match(/(\d{4}\.\d{4,5})/)?.[1];
    if (!arxivId) throw new Error('Invalid arXiv URL');

    // Fetch abstract page
    const absUrl = `https://arxiv.org/abs/${arxivId}`;
    const response = await axios.get(absUrl);
    const $ = cheerio.load(response.data);

    const title = $('.title').text().replace('Title:', '').trim();
    const authors = $('.authors a')
      .map((_, el) => $(el).text())
      .get();
    const abstract = $('.abstract').text().replace('Abstract:', '').trim();

    // Note: We can't get full text directly from arXiv HTML
    // We would need to download the PDF or source files
    const metadata: PaperMetadata = {
      title,
      authors,
      abstract,
      url: absUrl,
    };

    // For now, return abstract as the text
    // In production, you'd want to download the PDF
    return {
      text: `Title: ${title}\n\nAuthors: ${authors.join(', ')}\n\nAbstract: ${abstract}`,
      metadata,
    };
  } catch (error) {
    console.error('Error fetching arXiv paper:', error);
    throw new Error('Failed to fetch paper from arXiv');
  }
}

export async function fetchPubMedPaper(url: string): Promise<{ text: string; metadata: PaperMetadata }> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $('h1.heading-title').text().trim() || $('.content-title').text().trim();
    const authors = $('.authors-list a')
      .map((_, el) => $(el).text())
      .get();
    const abstract = $('.abstract-content').text().trim() || $('#abstract').text().trim();

    const metadata: PaperMetadata = {
      title,
      authors,
      abstract,
      url,
    };

    return {
      text: `Title: ${title}\n\nAuthors: ${authors.join(', ')}\n\nAbstract: ${abstract}`,
      metadata,
    };
  } catch (error) {
    console.error('Error fetching PubMed paper:', error);
    throw new Error('Failed to fetch paper from PubMed');
  }
}

export async function fetchGenericPaper(url: string): Promise<{ text: string; metadata: PaperMetadata }> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Try to extract common elements
    const title = $('h1').first().text().trim() || $('title').text().trim();
    const text = $('body').text().trim();

    const metadata: PaperMetadata = {
      title,
      authors: [],
      url,
    };

    return {
      text,
      metadata,
    };
  } catch (error) {
    console.error('Error fetching generic paper:', error);
    throw new Error('Failed to fetch paper from URL');
  }
}

export async function fetchPaperFromURL(url: string): Promise<{ text: string; metadata: PaperMetadata }> {
  const source = detectSource(url);

  switch (source) {
    case 'arxiv':
      return fetchArxivPaper(url);
    case 'pubmed':
      return fetchPubMedPaper(url);
    case 'generic':
    default:
      return fetchGenericPaper(url);
  }
}
