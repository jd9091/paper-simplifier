import { UserLevel } from './types';

export const SECTION_PARSER_PROMPT = `You are analyzing an academic paper. Your task is to identify and extract ALL sections of the paper comprehensively.

IMPORTANT: Do NOT truncate or summarize the content. Extract the FULL text of each section.

Identify these standard sections if they exist:
- Abstract
- Introduction
- Background / Literature Review
- Methods / Methodology
- Results / Findings
- Discussion
- Conclusion
- Acknowledgments
- References (you can summarize this as "[References section with N citations]")

For each section, provide:
1. The section title (use the actual title from the paper)
2. The COMPLETE text content of that section - do not truncate or summarize

Return ONLY a valid JSON object with no additional text, explanations, or commentary:
{
  "sections": [
    {
      "title": "Section Name",
      "content": "Full section text without any truncation..."
    }
  ]
}

CRITICAL:
- Extract ALL content from each section
- Do NOT add "..." or "[truncated]"
- Do NOT summarize - include the complete text
- If a section is long, include it all
- Preserve important figures, tables, and equations descriptions
- Return ONLY the JSON object - no text before or after it`;

export const getSimplificationPrompt = (level: UserLevel): string => {
  const levelInstructions: Record<UserLevel, string> = {
    expert: `You are writing for an expert researcher in this field.
- Maintain ALL technical terminology exactly as used in the paper
- Preserve exact numerical results, statistical significance values (p-values, confidence intervals, effect sizes)
- Keep methodology details intact with all parameters, sample sizes, and experimental conditions
- Highlight novel contributions and how they advance the field
- Explicitly note limitations mentioned by authors
- Discuss implications for future research
- Preserve equations, formulas, and mathematical notation
- Maintain scientific rigor - do not oversimplify or omit critical details
- If results contradict or support specific hypotheses, state this explicitly
- Include exact measurement units, error margins, and statistical tests used

FORMAT: Use markdown formatting:
- Use **bold** for key findings and critical results
- Use bullet points for lists of findings or parameters
- Use \`code\` style for formulas, p-values, or technical notation`,

    graduate: `You are writing for a graduate student with foundational knowledge.
- Keep most technical terms but briefly define complex ones
- Explain the significance of methods chosen
- Connect findings to broader field context
- Include key equations with explanations
- Highlight practical applications

FORMAT: Use markdown formatting:
- Use **bold** for important terms and key findings
- Use bullet points for method steps or result lists
- Use \`code\` style for equations or statistical values`,

    undergraduate: `You are writing for an undergraduate student.
- Explain technical terms in accessible language
- Use analogies to illustrate complex concepts
- Break down methodology into clear steps
- Focus on the "why" behind each part
- Relate findings to real-world applications

FORMAT: Use markdown formatting extensively:
- Use **bold** for key terms (when first introduced)
- Use bullet points for steps, lists, or key takeaways
- Use numbered lists for sequential processes
- Use *italic* for emphasis on important concepts`,

    highschool: `You are writing for a high school student.
- Use everyday language throughout
- Replace jargon with simple explanations
- Use relatable analogies (sports, cooking, everyday life)
- Focus on the big picture and main findings
- Explain why this research matters to society

FORMAT: Use markdown formatting for clarity:
- Use **bold** for main ideas and important points
- Use bullet points to list key findings or steps
- Use short paragraphs with clear structure
- Use numbered lists for sequential explanations`,

    general: `You are writing for someone with no scientific background.
- Use the simplest possible language
- Avoid ALL technical terms or explain them immediately
- Use vivid analogies and examples from daily life
- Focus on: What did they do? What did they find? Why does it matter?
- Make it interesting and engaging like a news article

FORMAT: Use markdown formatting to aid readability:
- Use **bold** for the main discovery or key point
- Use bullet points for simple lists of findings
- Use short, clear paragraphs
- Avoid complex formatting, keep it simple`,
  };

  return `${levelInstructions[level]}

Your task: Simplify the following academic paper section while preserving ALL key information.

IMPORTANT GUIDELINES:
- Do NOT truncate the content
- Cover ALL main points from the original
- Preserve the logical flow and structure
- Include all significant findings, methods, and conclusions
- If there are figures/tables mentioned, describe what they show
- Make it comprehensive but readable

Output ONLY the simplified text. Do not add meta-commentary like "Here's the simplified version" or "In summary".`;
};

export const getDiagramPrompt = (sectionTitle: string): string => {
  return `Create a Mermaid diagram to visualize the key concepts from this "${sectionTitle}" section.

Choose the most appropriate diagram type:
- flowchart TD (top-down) for processes, methodologies, workflows
- flowchart LR (left-right) for timelines, progressions
- graph TD for relationships, hierarchies
- pie for proportions (if relevant data exists)

Requirements:
1. Use clear, concise labels (max 5-6 words per node)
2. Include 5-12 nodes (enough detail but not overwhelming)
3. Show meaningful relationships with arrows
4. Use subgraphs to group related concepts if helpful
5. Make it self-explanatory even without reading the text

Return ONLY valid Mermaid code starting with the diagram type (e.g., "flowchart TD" or "graph TD").
If this section doesn't lend itself to visualization (e.g., abstract only, or no clear relationships), return exactly: SKIP

Example format:
flowchart TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Outcome 1]
    C -->|No| E[Outcome 2]`;
};

export const METADATA_EXTRACTION_PROMPT = `Extract the paper metadata from this text.

Identify:
- Title (the main title of the paper - look for it at the very beginning)
- Authors (all authors listed, as an array)
- Abstract (if present - this is usually a summary paragraph at the start)
- DOI (if present, format: 10.xxxx/xxxxx)
- Keywords (if listed)
- Publication venue/journal (if mentioned)

CRITICAL: Return ONLY valid JSON with no additional text, explanations, or commentary.

Format:
{
  "title": "Full Paper Title",
  "authors": ["Author 1", "Author 2", "Author 3"],
  "abstract": "The complete abstract text...",
  "doi": "10.xxxx/xxxxx",
  "keywords": ["keyword1", "keyword2"],
  "venue": "Journal or Conference Name"
}

Rules:
- Only include fields that you can identify. Omit fields that are not found.
- For the abstract, include the COMPLETE text, not a truncated version.
- Return ONLY the JSON object - no text before or after it.`;

export const getKeyInsightsPrompt = (userLevel: UserLevel): string => {
  return `Generate 3-5 key insights/takeaways from this paper section for a ${userLevel} reader.

Format each insight as:
- A clear, memorable statement
- Why it matters
- One sentence of context

Return as JSON array:
{
  "insights": [
    {
      "point": "Main insight statement",
      "significance": "Why this matters",
      "context": "Brief context"
    }
  ]
}`;
};

export const KEY_FINDINGS_PROMPT = `Analyze this complete paper and extract the main findings and outcomes.

CRITICAL: Be precise and accurate. Extract:

1. **Main Research Question/Hypothesis**: What did the authors set out to investigate?

2. **Key Findings** (3-5 main results):
   - State each finding precisely with numerical values where applicable
   - Include statistical significance (p-values, confidence intervals)
   - Note the strength of effects (effect sizes, percentages, ratios)
   - Specify what was compared to what

3. **Main Conclusion**: What is the authors' primary conclusion from these findings?

4. **Limitations**: What limitations do the authors acknowledge?

5. **Implications**: What do the authors say this means for the field or practice?

Return ONLY valid JSON with no additional text, explanations, or commentary:
{
  "research_question": "The primary research question or hypothesis",
  "key_findings": [
    {
      "finding": "Precise statement of the finding",
      "evidence": "Supporting evidence with numbers/statistics",
      "significance": "Statistical or practical significance"
    }
  ],
  "main_conclusion": "The authors' main conclusion",
  "limitations": ["Limitation 1", "Limitation 2"],
  "implications": "What this means for future research or practice"
}

Base this ONLY on what the paper explicitly states. Do not infer or add interpretations.
Return ONLY the JSON object - no text before or after it.`;

export const getEnhancedDiagramPrompt = (sectionTitle: string, sectionContent: string): string => {
  // Check if this is a results/methods section to provide specialized prompts
  const lowerTitle = sectionTitle.toLowerCase();

  if (lowerTitle.includes('result') || lowerTitle.includes('finding')) {
    return `Create a Mermaid diagram showing the KEY RESULTS and their relationships from this "${sectionTitle}" section.

Focus on:
- Main outcomes and findings
- Relationships between variables tested
- Comparisons made (control vs treatment, before vs after, etc.)
- Flow from hypothesis to results to conclusion

Use flowchart format showing:
- Independent variables → Methods → Dependent variables → Outcomes
- Include specific results where possible (e.g., "↑45% increase", "p<0.05")

Requirements:
1. Use clear, specific labels with key numbers/percentages
2. Show causal or correlational relationships with labeled arrows
3. Include 6-10 nodes
4. Highlight significant findings
5. Make the logic flow obvious

Return ONLY valid Mermaid code starting with "flowchart TD" or "flowchart LR".
If results cannot be visualized meaningfully, return: SKIP`;
  }

  if (lowerTitle.includes('method') || lowerTitle.includes('procedure')) {
    return `Create a Mermaid flowchart showing the METHODOLOGY used in this "${sectionTitle}" section.

Show:
- Step-by-step research process
- Sample/participant flow
- Experimental conditions or groups
- Measurement/analysis procedures
- Timeline if applicable

Requirements:
1. Clear process flow from start to finish
2. Include key parameters (sample size, duration, conditions)
3. Show decision points if applicable
4. Use 6-12 nodes
5. Label arrows with actions or transitions

Return ONLY valid Mermaid code starting with "flowchart TD".
If methodology cannot be visualized, return: SKIP`;
  }

  // Default diagram prompt for other sections
  return getDiagramPrompt(sectionTitle);
};
