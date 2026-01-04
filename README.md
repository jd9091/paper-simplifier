# Paper Simplifier

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Demo](https://img.shields.io/badge/Demo-Live-green)](https://paper-simplifier.vercel.app)

Transform academic papers into clear, digestible content with AI-powered analysis and visualization.

**🚀 [Try the Live Demo](https://paper-simplifier.vercel.app)**


## Features

### Content Processing
- **Multiple Input Methods**: Upload PDFs or paste URLs (arXiv, PubMed, etc.)
- **Adaptive Simplification**: Choose from 5 knowledge levels (Expert to General Audience)
- **Key Findings Extraction**: Automatically identifies research questions, main findings, and implications
- **Smart Section Parsing**: AI identifies and organizes paper sections (Abstract, Methods, Results, etc.)

### Interactive Reading Experience
- **Short/Long Toggle**: Switch between brief summaries (3-5 sentences) and full explanations per section
- **Original/Simplified Views**: Compare original academic text with simplified versions
- **Interactive Diagrams**: Click any diagram to open full-screen modal with zoom controls (50%-300%)
- **Visual Diagrams**: Auto-generated Mermaid flowcharts for methodology, results, and concepts
- **Reading Progress Bar**: Green indicator at top shows your scroll progress through the paper
- **Collapsible Sections**: Expand/collapse sections to focus on what matters

### User Interface
- **Dark/Light Themes**: Toggle between themes for comfortable reading in any environment
- **Font Size Control**: Adjust text size (Small/Medium/Large) for optimal readability
- **Floating Navigation**: Quick-access menu to jump between sections
- **Shareable Links**: Generate permanent links to share simplified papers
- **Clean Interface**: Monospace fonts (JetBrains Mono) and minimal design for distraction-free reading

## Tech Stack

- **Framework**: Next.js 16.1.1 with App Router & Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom theme system (CSS variables)
- **AI**: Claude API (Anthropic) - Sonnet 4.5 & Haiku 3.5
- **PDF Processing**: pdf2json for text extraction
- **Diagrams**: Mermaid.js with dynamic rendering
- **Markdown**: react-markdown with rehype-raw and remark-gfm
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/settings/keys))

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd ~/Documents/paper-simplifier
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Processing a Paper

1. **Select Your Level**: Choose from Expert, Graduate, Undergraduate, High School, or General Audience
2. **Upload or Paste**:
   - Upload a PDF (max 10MB)
   - Paste a URL from arXiv, PubMed, or other sources
3. **Wait for Processing**: The AI analyzes and simplifies the paper (typically 2-5 minutes)
4. **Review Results**: Read simplified sections with visual diagrams
5. **Share**: Generate a shareable link for others to view

### Navigating Results

- **View Modes**:
  - Switch between **Simplified** and **Original** text for each section
  - Toggle **Short** (3-5 sentence summary) vs **Full** explanation
- **Interactive Features**:
  - Click diagrams to open in full-screen modal with zoom controls
  - Expand/collapse sections to manage what's visible
  - Use floating ☰ menu to quickly navigate between sections
  - Track reading progress with the green bar at the top
- **Visual Diagrams**: Auto-generated flowcharts show methodology, results, and concepts
- **Customization**:
  - Toggle dark/light theme with 🌙/☀️ button
  - Adjust font size (S/M/L) for comfortable reading
- **Share Button**: Copy a permanent link to share the simplified paper

## Project Structure

```
paper-simplifier/
├── app/
│   ├── api/              # API routes
│   │   ├── upload/       # PDF upload handler
│   │   ├── fetch-url/    # URL fetcher
│   │   └── process/      # Main processing pipeline
│   ├── results/[id]/     # Results display page
│   ├── share/[id]/       # Shared paper view
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── LevelSelector.tsx      # User level selection
│   ├── UploadForm.tsx          # PDF upload
│   ├── URLInput.tsx            # URL input
│   ├── PaperSection.tsx        # Individual section display
│   ├── PaperOverview.tsx       # Paper structure diagram
│   ├── KeyFindingsSection.tsx  # Main findings display
│   ├── MermaidDiagram.tsx      # Diagram renderer
│   ├── DiagramModal.tsx        # Full-screen diagram viewer
│   ├── ReadingProgress.tsx     # Scroll progress indicator
│   ├── MarkdownContent.tsx     # Markdown renderer
│   ├── FloatingNav.tsx         # Navigation menu
│   ├── ThemeToggle.tsx         # Dark/light theme switcher
│   └── ShareButton.tsx         # Share functionality
├── lib/                  # Core logic
│   ├── types.ts          # TypeScript definitions
│   ├── prompts.ts        # Claude API prompts
│   ├── claude-client.ts  # AI processing
│   ├── pdf-processor.ts  # PDF extraction
│   ├── url-fetcher.ts    # URL fetching
│   └── storage.ts        # Paper storage
└── data/papers/          # Stored processed papers
```

## How It Works

1. **Input Processing**: Extract text from PDF or URL
2. **Parallel AI Processing**:
   - **Metadata Extraction** (Haiku): Fast extraction of title, authors, abstract
   - **Key Findings** (Sonnet): Deep analysis of research questions, findings, conclusions
3. **Section Parsing** (Haiku): AI identifies main sections (Intro, Methods, Results, etc.)
4. **Parallel Simplification** (Sonnet): Each section simplified based on knowledge level
5. **Diagram Generation** (Haiku): Mermaid flowcharts created for visualizable content
6. **Storage**: Processed paper saved with unique ID for sharing

**AI Model Usage:**
- **Claude Sonnet 4.5**: Quality simplification and key findings (slower, more accurate)
- **Claude Haiku 3.5**: Fast metadata, section parsing, and diagram generation

## Customization

### User Levels

Edit `lib/types.ts` to modify knowledge level descriptions or add new levels.

### Prompts

Customize AI behavior in `lib/prompts.ts`:
- `SECTION_PARSER_PROMPT`: How sections are identified
- `getSimplificationPrompt()`: Simplification instructions per level
- `getDiagramPrompt()`: Diagram generation logic

### Styling

Modify the grayscale theme in `tailwind.config.ts` and `app/globals.css`.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
4. Deploy

### Other Platforms

Build for production:
```bash
npm run build
npm run start
```

## Limitations

- PDF size limited to 10MB
- Processing time: 2-5 minutes per paper
- URL fetching may not work for paywalled content
- Diagrams generated for visualizable sections only

## Recent Enhancements (January 2025)

- ✅ Interactive diagram modal with zoom (50%-300%)
- ✅ Short/long content toggle per section
- ✅ Reading progress indicator
- ✅ Dark/light theme support
- ✅ Font size controls
- ✅ Improved markdown rendering
- ✅ Key findings extraction

## Future Enhancements

- Export to PDF/Markdown
- Multi-paper comparison
- User accounts and saved papers
- Citation graph visualization
- Annotation and highlighting tools
- Batch processing
- Term glossary with hover tooltips
- AI-generated Q&A for each section

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Jay Dave**

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## Support

For issues or questions, please [open an issue](../../issues) on GitHub.
