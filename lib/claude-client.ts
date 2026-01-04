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
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL_SONNET = 'claude-sonnet-4-5-20250929';
const MODEL_HAIKU = 'claude-3-5-haiku-20241022'; // Fast model for structured tasks

export async function extractMetadata(text: string): Promise<PaperMetadata> {
  try {
    // Use Haiku for fast metadata extraction
    const message = await client.messages.create({
      model: MODEL_HAIKU,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `${METADATA_EXTRACTION_PROMPT}\n\nPaper text (first 10000 characters):\n${text.substring(0, 10000)}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      let responseText = content.text.trim();

      // Remove markdown code blocks if present
      if (responseText.includes('```json')) {
        const start = responseText.indexOf('```json') + 7;
        const end = responseText.indexOf('```', start);
        responseText = responseText.substring(start, end).trim();
      } else if (responseText.includes('```')) {
        const start = responseText.indexOf('```') + 3;
        const end = responseText.indexOf('```', start);
        responseText = responseText.substring(start, end).trim();
      }

      // Find JSON object by looking for first { and last }
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonText = responseText.substring(jsonStart, jsonEnd + 1);
        const metadata = JSON.parse(jsonText);
        return metadata;
      }

      throw new Error('No valid JSON found in response');
    }
    throw new Error('Unexpected response format');
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
    // Use Haiku for fast section parsing
    const message = await client.messages.create({
      model: MODEL_HAIKU,
      max_tokens: 16000, // Increased from 4096
      messages: [
        {
          role: 'user',
          content: `${SECTION_PARSER_PROMPT}\n\nFull paper text:\n${text}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      let responseText = content.text.trim();

      // Remove markdown code blocks if present
      if (responseText.includes('```json')) {
        const start = responseText.indexOf('```json') + 7;
        const end = responseText.indexOf('```', start);
        responseText = responseText.substring(start, end).trim();
      } else if (responseText.includes('```')) {
        const start = responseText.indexOf('```') + 3;
        const end = responseText.indexOf('```', start);
        responseText = responseText.substring(start, end).trim();
      }

      // Find JSON object by looking for first { and last }
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonText = responseText.substring(jsonStart, jsonEnd + 1);
        const response = JSON.parse(jsonText);
        return response.sections || [];
      }

      throw new Error('No valid JSON found in response');
    }
    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error parsing sections:', error);
    // Fallback: create sections based on common patterns
    return createFallbackSections(text);
  }
}

function createFallbackSections(text: string): Array<{ title: string; content: string }> {
  // Try to split by common section headers
  const sectionPatterns = [
    /(?:^|\n)(Abstract|Introduction|Background|Methods?|Methodology|Results?|Discussion|Conclusion|References)[\s:]*\n/gi,
  ];

  const sections: Array<{ title: string; content: string }> = [];
  let remainingText = text;

  for (const pattern of sectionPatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      let lastIndex = 0;
      matches.forEach((match, i) => {
        if (i > 0) {
          const prevMatch = matches[i - 1];
          const content = text.substring(
            prevMatch.index! + prevMatch[0].length,
            match.index
          ).trim();
          if (content) {
            sections.push({
              title: prevMatch[1],
              content,
            });
          }
        }
        lastIndex = match.index! + match[0].length;
      });

      // Last section
      const lastMatch = matches[matches.length - 1];
      const lastContent = text.substring(lastIndex).trim();
      if (lastContent) {
        sections.push({
          title: lastMatch[1],
          content: lastContent,
        });
      }
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
    // Use Sonnet for quality simplification
    const message = await client.messages.create({
      model: MODEL_SONNET,
      max_tokens: 8000, // Increased from 4096
      messages: [
        {
          role: 'user',
          content: `${getSimplificationPrompt(userLevel)}\n\nSection content to simplify:\n${sectionContent}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }
    throw new Error('Unexpected response format');
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
    // Use Haiku for fast diagram generation
    const message = await client.messages.create({
      model: MODEL_HAIKU,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `${getEnhancedDiagramPrompt(sectionTitle, sectionContent)}\n\nSection content:\n${sectionContent.substring(0, 5000)}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      let diagram = content.text.trim();

      // Remove markdown code block if present
      if (diagram.startsWith('```mermaid')) {
        diagram = diagram.slice(10);
      } else if (diagram.startsWith('```')) {
        diagram = diagram.slice(3);
      }
      if (diagram.endsWith('```')) {
        diagram = diagram.slice(0, -3);
      }
      diagram = diagram.trim();

      if (diagram === 'SKIP' || (!diagram.includes('flowchart') && !diagram.includes('graph') && !diagram.includes('pie'))) {
        return null;
      }
      return diagram;
    }
    return null;
  } catch (error) {
    console.error('Error generating diagram:', error);
    return null;
  }
}

export async function extractKeyFindings(text: string): Promise<KeyFindings | null> {
  try {
    // Use Sonnet for accurate key findings extraction
    const message = await client.messages.create({
      model: MODEL_SONNET,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${KEY_FINDINGS_PROMPT}\n\nFull paper text:\n${text}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      let responseText = content.text.trim();

      // Remove markdown code blocks if present
      if (responseText.includes('```json')) {
        const start = responseText.indexOf('```json') + 7;
        const end = responseText.indexOf('```', start);
        responseText = responseText.substring(start, end).trim();
      } else if (responseText.includes('```')) {
        const start = responseText.indexOf('```') + 3;
        const end = responseText.indexOf('```', start);
        responseText = responseText.substring(start, end).trim();
      }

      // Find JSON object by looking for first { and last }
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonText = responseText.substring(jsonStart, jsonEnd + 1);
        const findings = JSON.parse(jsonText);
        return findings;
      }

      throw new Error('No valid JSON found in response');
    }
    return null;
  } catch (error) {
    console.error('Error extracting key findings:', error);
    return null;
  }
}

export async function processPaper(
  text: string,
  userLevel: UserLevel,
  existingMetadata?: PaperMetadata
): Promise<{ metadata: PaperMetadata; sections: PaperSection[]; keyFindings?: KeyFindings }> {
  // Extract metadata and key findings in parallel
  const [metadata, keyFindings] = await Promise.all([
    existingMetadata || extractMetadata(text),
    extractKeyFindings(text),
  ]);

  // Parse sections
  const rawSections = await parseSections(text);

  // Process each section in parallel
  const sections: PaperSection[] = await Promise.all(
    rawSections.map(async (section) => {
      const [simplifiedContent, diagram] = await Promise.all([
        simplifySection(section.content, userLevel),
        generateDiagram(section.title, section.content),
      ]);

      return {
        title: section.title,
        originalContent: section.content,
        simplifiedContent,
        diagram: diagram || undefined,
      };
    })
  );

  return {
    metadata,
    sections,
    keyFindings: keyFindings || undefined,
  };
}
