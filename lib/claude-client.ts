import Anthropic from '@anthropic-ai/sdk';
import {
  SECTION_PARSER_PROMPT,
  getSimplificationPrompt,
  getDiagramPrompt,
  getEnhancedDiagramPrompt,
  KEY_FINDINGS_PROMPT,
  METADATA_EXTRACTION_PROMPT,
} from './prompts';
import { UserLevel, PaperMetadata, PaperSection, KeyFindings } from './types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 10 * 60 * 1000,
});

const MODEL_SONNET = 'claude-sonnet-4-5-20250929';
const MODEL_HAIKU = 'claude-3-5-haiku-20241022';

// Helper to extract JSON from response text
function extractJSON(responseText: string): unknown {
  let text = responseText.trim();

  // Remove markdown code blocks if present
  if (text.includes('```json')) {
    const start = text.indexOf('```json') + 7;
    const end = text.indexOf('```', start);
    text = text.substring(start, end).trim();
  } else if (text.includes('```')) {
    const start = text.indexOf('```') + 3;
    const end = text.indexOf('```', start);
    text = text.substring(start, end).trim();
  }

  // Find JSON object by looking for first { and last }
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    const jsonText = text.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonText);
  }

  throw new Error('No valid JSON found in response');
}

// Helper to call Claude API
async function callClaudeAPI(prompt: string, model: 'haiku' | 'sonnet', maxTokens: number): Promise<string> {
  const message = await client.messages.create({
    model: model === 'haiku' ? MODEL_HAIKU : MODEL_SONNET,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text.trim();
  }
  throw new Error('Unexpected response format');
}

export async function extractMetadata(text: string): Promise<PaperMetadata> {
  try {
    const prompt = `${METADATA_EXTRACTION_PROMPT}\n\nPaper text (first 10000 characters):\n${text.substring(0, 10000)}`;
    const responseText = await callClaudeAPI(prompt, 'haiku', 2048);
    const metadata = extractJSON(responseText) as PaperMetadata;
    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      title: 'Untitled Paper',
      authors: [],
    };
  }
}

export async function parseSections(text: string): Promise<Array<{ title: string; content: string }>> {
  try {
    // AI identifies section boundaries (fast - small output)
    const prompt = `${SECTION_PARSER_PROMPT}\n\nPaper text:\n${text}`;
    const responseText = await callClaudeAPI(prompt, 'sonnet', 4000);
    const response = extractJSON(responseText) as {
      sections: Array<{ title: string; startPhrase: string }>
    };
    const boundaries = response.sections || [];

    if (boundaries.length === 0) {
      console.log('No sections found by AI, using fallback');
      return createFallbackSections(text);
    }

    // Find positions of each section using the start phrases
    const positions: Array<{ title: string; start: number }> = [];
    for (const boundary of boundaries) {
      // Search for the start phrase in the text
      const phraseIndex = text.indexOf(boundary.startPhrase);
      if (phraseIndex !== -1) {
        positions.push({ title: boundary.title, start: phraseIndex });
      } else {
        // Try case-insensitive search
        const lowerText = text.toLowerCase();
        const lowerPhrase = boundary.startPhrase.toLowerCase();
        const lowerIndex = lowerText.indexOf(lowerPhrase);
        if (lowerIndex !== -1) {
          positions.push({ title: boundary.title, start: lowerIndex });
        }
      }
    }

    // Sort by position
    positions.sort((a, b) => a.start - b.start);

    if (positions.length === 0) {
      console.log('Could not locate sections in text, using fallback');
      return createFallbackSections(text);
    }

    // Extract content between consecutive sections
    const sections: Array<{ title: string; content: string }> = [];
    for (let i = 0; i < positions.length; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      const endIndex = next ? next.start : text.length;
      const content = text.substring(current.start, endIndex).trim();

      if (content) {
        sections.push({ title: current.title, content });
      }
    }

    console.log(`AI parsed ${sections.length} sections`);
    return sections;
  } catch (error) {
    console.error('Error parsing sections:', error);
    return createFallbackSections(text);
  }
}

// Helper for limiting concurrency
async function mapAsync<T, U>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<U>
): Promise<U[]> {
  const results: U[] = [];
  const chunks = [];

  for (let i = 0; i < items.length; i += concurrency) {
    chunks.push(items.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }

  return results;
}

function createFallbackSections(text: string): Array<{ title: string; content: string }> {
  const sections: Array<{ title: string; content: string }> = [];

  // Find all matches
  const allMatches: Array<{ index: number; title: string; length: number }> = [];

  // Pattern 1: Arabic numeral sections like "1 Introduction", "2.1 Background", etc.
  // Must start with section number (1-9, not years like 2023)
  const arabicPattern = /(?:^|\n)(\d{1,2}(?:\.\d+)*\.?\s+[A-Z][a-zA-Z\s&/,\-:]+?)(?=\s+[A-Z][a-z]|\n|$)/gm;
  let match;
  while ((match = arabicPattern.exec(text)) !== null) {
    const title = match[1].trim();
    const sectionNum = parseInt(title.match(/^\d+/)?.[0] || '0');
    // Skip if:
    // - Too short (< 8 chars)
    // - Looks like a year (2020-2030)
    // - Looks like a page header (number + paper title fragment)
    // - Section number > 20 (unlikely to have 20+ sections)
    if (title.length >= 8 &&
        sectionNum > 0 && sectionNum <= 20 &&
        !/^\d{4}\./.test(title) && // Skip years like "2023."
        !/Pre-print|MAESTRO:/i.test(title) && // Skip page headers
        !/^\d+\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(title)) {
      allMatches.push({ index: match.index, title, length: match[0].length });
    }
  }

  // Pattern 2: Roman numeral sections like "I. INTRODUCTION", "II. Methods", "III-A. Subsection"
  const romanPattern = /(?:^|\n)((?:X{0,3}(?:IX|IV|V?I{0,3})|[IVX]+)(?:\.[A-Z])?[\.\s]+[A-Z][A-Za-z\s&/,\-:]+?)(?=\s+[A-Z][a-z]|\s+We|\s+The|\s+In|\s+This|\n|$)/gm;
  while ((match = romanPattern.exec(text)) !== null) {
    const title = match[1].trim();
    // Validate it's a real Roman numeral section (I through XX)
    const romanMatch = title.match(/^([IVX]+)/);
    if (romanMatch) {
      const roman = romanMatch[1];
      // Simple Roman numeral validation - must be valid and not too long
      if (/^(X{0,2})(IX|IV|V?I{0,3})$/.test(roman) && title.length >= 5) {
        // Check if this position already has a match (avoid duplicates)
        const exists = allMatches.some(m => Math.abs(m.index - match.index) < 5);
        if (!exists) {
          allMatches.push({ index: match.index, title, length: match[0].length });
        }
      }
    }
  }

  // Also find Abstract and References
  const abstractMatch = text.match(/(?:^|\n)(Abstract)(?:\n|\s+[A-Z])/i);
  if (abstractMatch && abstractMatch.index !== undefined) {
    const exists = allMatches.some(m => m.title.toLowerCase() === 'abstract');
    if (!exists) {
      allMatches.push({ index: abstractMatch.index, title: 'Abstract', length: abstractMatch[0].length });
    }
  }

  const refsMatch = text.match(/(?:^|\n)(References)(?:\n|\s*\[)/i);
  if (refsMatch && refsMatch.index !== undefined) {
    const exists = allMatches.some(m => m.title.toLowerCase() === 'references');
    if (!exists) {
      allMatches.push({ index: refsMatch.index, title: 'References', length: refsMatch[0].length });
    }
  }

  // Sort by position in text
  allMatches.sort((a, b) => a.index - b.index);

  // Extract content between sections
  for (let i = 0; i < allMatches.length; i++) {
    const currentMatch = allMatches[i];
    const nextMatch = allMatches[i + 1];

    const startIndex = currentMatch.index + currentMatch.length;
    const endIndex = nextMatch ? nextMatch.index : text.length;

    const content = text.substring(startIndex, endIndex).trim();
    if (content) {
      sections.push({
        title: currentMatch.title,
        content,
      });
    }
  }

  // If no sections found, return the whole text as one section
  if (sections.length === 0) {
    return [{ title: 'Full Paper', content: text }];
  }

  return sections;
}

export async function simplifySection(
  sectionContent: string,
  userLevel: UserLevel
): Promise<string> {
  try {
    const prompt = `${getSimplificationPrompt(userLevel)}\n\nSection content to simplify:\n${sectionContent}`;
    return await callClaudeAPI(prompt, 'sonnet', 8000);
  } catch (error) {
    console.error('Error simplifying section:', error);
    return sectionContent; // Return original if simplification fails
  }
}

export async function generateDiagram(
  sectionTitle: string,
  sectionContent: string
): Promise<string | null> {
  try {
    const prompt = `${getEnhancedDiagramPrompt(sectionTitle, sectionContent)}\n\nSection content:\n${sectionContent.substring(0, 5000)}`;
    let diagram = await callClaudeAPI(prompt, 'haiku', 2000);

    // Remove markdown code block if present
    if (diagram.startsWith('```mermaid')) {
      diagram = diagram.slice(10);
    } else if (diagram.startsWith('```')) {
      diagram = diagram.slice(3);
    }

    // Remove closing ``` and any text after it (Claude sometimes adds explanations)
    const closingBackticks = diagram.indexOf('```');
    if (closingBackticks !== -1) {
      diagram = diagram.slice(0, closingBackticks);
    }
    diagram = diagram.trim();

    // Strip trailing explanatory text (sentences after the diagram)
    // Split into lines and keep only valid Mermaid lines
    const lines = diagram.split('\n');
    const validLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      // Empty lines are ok
      if (!trimmed) {
        validLines.push(line);
        continue;
      }
      // Valid Mermaid: starts with node ID, keyword, or is a connection/style
      const isMermaidLine = /^(graph|flowchart|pie|subgraph|end|style|classDef|linkStyle|class|direction|\w+[\[\(\{<]|[\w\d]+\s*(-->|---|->|--)|%%|:::|\s)/.test(trimmed);
      if (isMermaidLine) {
        validLines.push(line);
      } else {
        // Hit explanatory text, stop here
        break;
      }
    }
    diagram = validLines.join('\n').trim();

    // Validate it's actually Mermaid code, not explanatory text
    // Must START with graph/flowchart/pie (not just contain those words)
    const isValidMermaid = diagram.startsWith('graph ') ||
                          diagram.startsWith('flowchart ') ||
                          diagram.startsWith('pie ');

    if (diagram === 'SKIP' || diagram.includes('SKIP') || !isValidMermaid) {
      return null;
    }

    // Sanitize diagram: replace problematic characters in node labels
    // Parentheses inside brackets break Mermaid parsing
    diagram = diagram.replace(/\[([^\]]*)\]/g, (match, content) => {
      // Replace parentheses with alternatives inside node labels
      const sanitized = content
        .replace(/\(/g, '❨')  // Use Unicode alternatives
        .replace(/\)/g, '❩');
      return `[${sanitized}]`;
    });

    return diagram;
  } catch (error) {
    console.error('Error generating diagram:', error);
    return null;
  }
}

export async function extractKeyFindings(text: string): Promise<KeyFindings | null> {
  try {
    const prompt = `${KEY_FINDINGS_PROMPT}\n\nFull paper text:\n${text}`;
    const responseText = await callClaudeAPI(prompt, 'sonnet', 4096);
    const findings = extractJSON(responseText) as KeyFindings;
    return findings;
  } catch (error) {
    console.error('Error extracting key findings:', error);
    return null;
  }
}

export type ProgressCallback = (message: string, step?: number, totalSteps?: number) => void;

export async function processPaper(
  text: string,
  userLevel: UserLevel,
  existingMetadata?: PaperMetadata,
  onProgress?: ProgressCallback
): Promise<{ metadata: PaperMetadata; sections: PaperSection[]; keyFindings?: KeyFindings }> {
  const log = onProgress || (() => {});

  // Extract metadata and key findings in parallel
  log('Extracting paper metadata...', 1, 5);
  const [metadata, keyFindings] = await Promise.all([
    existingMetadata || extractMetadata(text),
    extractKeyFindings(text),
  ]);
  log(`Found: "${metadata.title}" by ${metadata.authors?.length || 0} authors`, 1, 5);

  // Parse sections
  log('Parsing paper sections...', 2, 5);
  const rawSections = await parseSections(text);
  log(`Detected ${rawSections.length} sections`, 2, 5);

  // Process sections with concurrency limit of 3 to avoid timeouts/rate-limits
  log('Simplifying sections...', 3, 5);
  let processedCount = 0;
  const sections = await mapAsync(rawSections, 3, async (section) => {
    const lowerTitle = section.title.toLowerCase();
    const isReferences = lowerTitle.includes('reference') || lowerTitle.includes('bibliography');

    // Skip simplification for References - just keep original (saves API call)
    if (isReferences) {
      processedCount++;
      log(`[${processedCount}/${rawSections.length}] Formatting references...`, 3, 5);
      // Format references: add line breaks before each [N] for readability
      const formattedRefs = section.content
        .replace(/\s*\[(\d+)\]/g, '\n\n[$1]')  // Add double newline before each [N]
        .trim();

      return {
        title: section.title,
        originalContent: formattedRefs,
        simplifiedContent: formattedRefs,
        diagram: undefined, // No diagram for references
      };
    }

    processedCount++;
    log(`[${processedCount}/${rawSections.length}] Simplifying: ${section.title}`, 3, 5);

    const [simplifiedContent, diagram] = await Promise.all([
      simplifySection(section.content, userLevel),
      generateDiagram(section.title, section.content),
    ]);

    log(`[${processedCount}/${rawSections.length}] Completed: ${section.title}${diagram ? ' (with diagram)' : ''}`, 3, 5);

    return {
      title: section.title,
      originalContent: section.content,
      simplifiedContent,
      diagram: diagram || undefined,
    };
  });

  log('Generating key findings summary...', 4, 5);
  log('Saving results...', 5, 5);

  return {
    metadata,
    sections,
    keyFindings: keyFindings || undefined,
  };
}
