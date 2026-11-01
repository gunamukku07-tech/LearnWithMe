import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function extractHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split('\n');
  const headings: TocHeading[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    if (line.startsWith('## ')) {
      const text = line.replace(/^##\s+/, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      headings.push({ id, text, level: 2 });
    } else if (line.startsWith('### ')) {
      const text = line.replace(/^###\s+/, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      headings.push({ id, text, level: 3 });
    }
  }
  return headings;
}

const CODE_KEYWORDS = new Set([
  'public',
  'private',
  'protected',
  'class',
  'interface',
  'abstract',
  'extends',
  'implements',
  'static',
  'final',
  'void',
  'int',
  'double',
  'boolean',
  'String',
  'return',
  'if',
  'else',
  'for',
  'while',
  'new',
  'import',
  'true',
  'false',
  'null',
  'this',
  'throw',
  'const',
  'let',
  'function',
]);

function highlightCodeLine(line: string): React.ReactNode {
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
    return <span className="italic text-[#887467]">{line}</span>;
  }

  const tokens = line.split(/("(?:[^"\\]|\\.)*"|\b[A-Za-z_][A-Za-z0-9_]*\b|\b\d+(?:\.\d+)?\b)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('"') && token.endsWith('"')) {
      return (
        <span key={idx} className="text-[#9e5858]">
          {token}
        </span>
      );
    }
    if (CODE_KEYWORDS.has(token)) {
      return (
        <span key={idx} className="font-semibold text-[#594438]">
          {token}
        </span>
      );
    }
    if (/^\d+(\.\d+)?$/.test(token)) {
      return (
        <span key={idx} className="text-[#8a6548]">
          {token}
        </span>
      );
    }
    return token;
  });
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (language === 'diagram') {
    return (
      <figure className="my-6 sm:my-8 rounded-[16px] sm:rounded-[18px] bg-[#F9EFE8] border border-[#EDE0D5] p-3.5 sm:p-6 max-w-full overflow-x-auto shadow-xs">
        <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 mb-2.5 sm:mb-3 border-b border-[#EDE0D5] text-[11px] sm:text-xs font-mono text-[#594438]">
          <span>ARCHITECTURE & MEMORY DIAGRAM</span>
          <span className="text-[#887467] hidden sm:inline">Visual Mental Model</span>
        </div>
        <pre className="font-mono text-[11px] sm:text-[13px] leading-relaxed text-[#594438] overflow-x-auto">
          {code}
        </pre>
      </figure>
    );
  }

  const lines = code.split('\n');

  return (
    <div className="my-6 sm:my-7 max-w-full rounded-[16px] sm:rounded-[18px] overflow-hidden border border-[#EDE0D5] bg-[#FFFFFF] shadow-[0_6px_24px_-10px_rgba(89,68,56,0.07)]">
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 bg-[#EADCCB]/75 border-b border-[#EDE0D5]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#594438]" />
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#594438]">
            {language || 'code'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-1 rounded-lg bg-[#FFF8EF] border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] active:scale-95 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#594438]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#887467]" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 sm:p-5 overflow-x-auto bg-[#FFF8EF]/55">
        <pre className="font-mono text-[11.5px] sm:text-[13.5px] leading-relaxed text-[#6b5649]">
          {lines.map((line, i) => (
            <div key={i} className="table-row">
              <span className="table-cell pr-3 sm:pr-4 select-none text-right text-[#887467]/60 text-[10px] sm:text-[11px] tabular-nums">
                {i + 1}
              </span>
              <span className="table-cell whitespace-pre">{highlightCodeLine(line)}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#F9EFE8] border border-[#EDE0D5] font-mono text-[0.88em] text-[#594438]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#594438]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic text-[#594438]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const blocks: React.ReactNode[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Fenced code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(<CodeBlock key={`code-${i}`} language={lang} code={codeLines.join('\n')} />);
      continue;
    }

    // 2. Markdown Image ![alt](url)
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const [, altText, imgUrl] = imgMatch;
      blocks.push(
        <figure key={`img-${i}`} className="my-8 space-y-2">
          <div className="rounded-[18px] overflow-hidden border border-[#EDE0D5] bg-[#F9EFE8]">
            <img
              src={imgUrl}
              alt={altText}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover"
            />
          </div>
          {altText && (
            <figcaption className="text-xs italic text-[#887467] text-center">
              {altText}
            </figcaption>
          )}
        </figure>
      );
      i++;
      continue;
    }

    // 3. Table block
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const headerCells = line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const rowCells = lines[i]
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean);
        rows.push(rowCells);
        i++;
      }
      blocks.push(
        <div
          key={`table-${i}`}
          className="my-7 overflow-x-auto rounded-[16px] border border-[#EDE0D5] bg-white shadow-xs"
        >
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F9EFE8] border-b border-[#EDE0D5] text-[#594438]">
                {headerCells.map((cell, cIdx) => (
                  <th key={cIdx} className="py-3.5 px-4 font-semibold">
                    {renderInlineFormatting(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE0D5]">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#FFF8EF]/70 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-3 px-4 text-[#887467] tabular-nums">
                      {renderInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 4. Headings
    if (line.startsWith('## ')) {
      const text = line.replace(/^##\s+/, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      blocks.push(
        <h2
          key={`h2-${i}`}
          id={id}
          className="scroll-mt-28 font-serif-section text-2xl sm:text-[28px] text-[#594438] mt-11 mb-4 pb-2 border-b border-[#EDE0D5]"
        >
          {text}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      const text = line.replace(/^###\s+/, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      blocks.push(
        <h3
          key={`h3-${i}`}
          id={id}
          className="scroll-mt-28 font-serif-section text-xl text-[#594438] mt-8 mb-3"
        >
          {text}
        </h3>
      );
      i++;
      continue;
    }

    // 5. Callout / Blockquote
    if (line.trim().startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().replace(/^>\s+/, ''));
        i++;
      }
      blocks.push(
        <aside
          key={`quote-${i}`}
          className="my-7 p-5 sm:p-6 rounded-[18px] bg-[#F7DDE1]/40 border border-[#EDE0D5] text-[#594438] text-[15px] leading-relaxed"
        >
          {renderInlineFormatting(quoteLines.join(' '))}
        </aside>
      );
      continue;
    }

    // 6. Unordered or Ordered Lists
    if (/^(\s*[-*]|\s*\d+\.)\s+/.test(line)) {
      const isOrdered = /^\s*\d+\.\s+/.test(line);
      const listItems: string[] = [];
      while (i < lines.length && /^(\s*[-*]|\s*\d+\.)\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^(\s*[-*]|\s*\d+\.)\s+/, '').trim());
        i++;
      }
      const ListTag = isOrdered ? 'ol' : 'ul';
      blocks.push(
        <ListTag
          key={`list-${i}`}
          className={`my-5 pl-6 space-y-2.5 text-[16px] leading-[1.8] text-[#887467] ${
            isOrdered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ListTag>
      );
      continue;
    }

    // 7. Blank lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // 8. Standard paragraph
    blocks.push(
      <p key={`p-${i}`} className="my-4 text-[16px] sm:text-[17px] leading-[1.85] text-[#887467]">
        {renderInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return <div className="editorial-prose">{blocks}</div>;
};
