import React, { useMemo } from "react";
import { ExternalLink, BookOpen, FileText } from "lucide-react";

type Resource = {
  title: string;
  url?: string;
  type?: string;
};

type MessageRendererProps = {
  content: string;
  resources?: Resource[];
};

// Utility functions
const isValidString = (text: any): text is string => 
  Boolean(text && typeof text === 'string');

// Shared class constants
const TEXT_RESPONSIVE = "text-xs sm:text-sm md:text-base";
const TEXT_SMALL = "text-xs sm:text-sm";
const BREAK_SAFE = "break-words overflow-wrap-anywhere max-w-full";
const MARGIN_BLOCK = "mb-3 sm:mb-4";
const PADDING_RESPONSIVE = "p-2 sm:p-3 md:p-4";

export default function MessageRenderer({ content, resources }: MessageRendererProps) {
  const renderContent = useMemo(() => {
    return (text: string) => {
      if (!isValidString(text)) {
        return [
          <p key="empty" className="text-gray-400 italic text-xs sm:text-sm">
            No content available
          </p>
        ];
      }

      const lines = text.split('\n');
      const elements: JSX.Element[] = [];
      let currentListItems: string[] = [];
      let currentListType: 'ordered' | 'unordered' | null = null;
      let inCodeBlock = false;
      let codeBlockContent: string[] = [];
      let codeBlockLanguage = '';
      let skipUntilIndex = -1;

      const flushList = () => {
        if (currentListItems.length > 0) {
          const ListTag = currentListType === 'ordered' ? 'ol' : 'ul';
          const listClass = currentListType === 'ordered' ? 'list-decimal' : 'list-disc';
          
          elements.push(
            <ListTag 
              key={`list-${elements.length}`} 
              className={`${listClass} list-inside space-y-1 ${MARGIN_BLOCK} ml-3 sm:ml-4 ${TEXT_SMALL}`}
            >
              {currentListItems.map((item, i) => (
                <li key={`li-${i}`} className={`text-gray-100 leading-relaxed ${BREAK_SAFE}`}>
                  {renderInlineFormatting(item, `list-${elements.length}-${i}`)}
                </li>
              ))}
            </ListTag>
          );
          currentListItems = [];
          currentListType = null;
        }
      };

      const flushCodeBlock = () => {
        if (codeBlockContent.length > 0) {
          elements.push(
            <div key={`code-${elements.length}`} className={`${MARGIN_BLOCK} w-full overflow-hidden`}>
              <pre className={`bg-neutral-900 rounded-lg ${PADDING_RESPONSIVE} border border-neutral-700 overflow-x-auto max-w-full ${TEXT_SMALL}`}>
                <code className={`text-gray-100 block whitespace-pre ${codeBlockLanguage ? `language-${codeBlockLanguage}` : ''}`}>
                  {codeBlockContent.join('\n')}
                </code>
              </pre>
            </div>
          );
          codeBlockContent = [];
          codeBlockLanguage = '';
        }
      };

      lines.forEach((line, index) => {
        // Skip lines already processed (e.g., in tables)
        if (index < skipUntilIndex) return;

        const trimmedLine = line.trim();

        // Code block delimiters
        if (trimmedLine.startsWith('```')) {
          if (inCodeBlock) {
            inCodeBlock = false;
            flushCodeBlock();
          } else {
            flushList();
            inCodeBlock = true;
            codeBlockLanguage = trimmedLine.slice(3).trim();
          }
          return;
        }

        if (inCodeBlock) {
          codeBlockContent.push(line);
          return;
        }

        // Headers (improved regex to prevent false matches)
        const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+?)(?:\s*#+)?$/);
        if (headerMatch) {
          flushList();
          const level = headerMatch[1].length;
          const text = headerMatch[2];
          
          const headerClasses = {
            1: `text-lg sm:text-xl md:text-2xl font-bold text-green-200 ${MARGIN_BLOCK} mt-4 sm:mt-6 first:mt-0`,
            2: `text-base sm:text-lg md:text-xl font-semibold text-green-300 mb-2 sm:mb-3 mt-3 sm:mt-5`,
            3: `text-sm sm:text-base md:text-lg font-semibold text-neutral-100 mb-2 mt-3 sm:mt-4`,
          };
          
          const className = `${headerClasses[level as keyof typeof headerClasses] || headerClasses[3]} ${BREAK_SAFE}`;
          const Tag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
          
          elements.push(
            React.createElement(
              Tag,
              { key: `h${level}-${elements.length}`, className },
              renderInlineFormatting(text, `h${level}-${elements.length}`)
            )
          );
          return;
        }

        // Horizontal rules
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmedLine)) {
          flushList();
          elements.push(
            <hr key={`hr-${elements.length}`} className="border-neutral-700 my-3 sm:my-4 w-full" />
          );
          return;
        }

        // Blockquotes
        if (trimmedLine.startsWith('>')) {
          flushList();
          const quoteText = trimmedLine.replace(/^>\s*/, '');
          elements.push(
            <blockquote 
              key={`quote-${elements.length}`} 
              className={`border-l-4 border-green-600 pl-3 sm:pl-4 py-2 ${MARGIN_BLOCK} bg-neutral-800/50 rounded-r w-full overflow-hidden`}
            >
              <p className={`text-gray-200 italic ${BREAK_SAFE} ${TEXT_SMALL}`}>
                {renderInlineFormatting(quoteText, `quote-${elements.length}`)}
              </p>
            </blockquote>
          );
          return;
        }

        // Tables (FIXED: properly track processed lines)
        if (trimmedLine.includes('|') && lines[index + 1]?.includes('|')) {
          flushList();
          const tableLines = [];
          let i = index;
          while (i < lines.length && lines[i].trim().includes('|')) {
            tableLines.push(lines[i]);
            i++;
          }
          if (tableLines.length >= 2) {
            elements.push(renderTable(tableLines, `table-${elements.length}`));
            skipUntilIndex = i; // Mark lines as processed
          }
          return;
        }

        // Ordered lists
        if (/^\d+\.\s+/.test(trimmedLine)) {
          if (currentListType !== 'ordered') {
            flushList();
            currentListType = 'ordered';
          }
          currentListItems.push(trimmedLine.replace(/^\d+\.\s+/, ''));
          return;
        }

        // Unordered lists
        if (/^[-*+]\s+/.test(trimmedLine)) {
          if (currentListType !== 'unordered') {
            flushList();
            currentListType = 'unordered';
          }
          currentListItems.push(trimmedLine.replace(/^[-*+]\s+/, ''));
          return;
        }

        // Math equations
        if (/^(\\\[.*?\\\]|\$\$.*?\$\$)$/.test(trimmedLine)) {
          flushList();
          const equation = trimmedLine
            .replace(/^(\\\[|\$\$)/, '')
            .replace(/(\\\]|\$\$)$/, '');
          elements.push(
            <div 
              key={`math-${elements.length}`} 
              className={`${MARGIN_BLOCK} p-3 sm:p-4 bg-neutral-900 rounded-lg border border-neutral-700 overflow-x-auto w-full max-w-full`}
            >
              <code className={`text-green-300 text-center block font-mono ${TEXT_SMALL} ${BREAK_SAFE}`}>
                {equation}
              </code>
            </div>
          );
          return;
        }

        // Inline code blocks (full line)
        if (/^`[^`]+`$/.test(trimmedLine)) {
          flushList();
          const codeText = trimmedLine.replace(/^`|`$/g, '');
          elements.push(
            <div key={`inline-code-block-${elements.length}`} className="mb-2 sm:mb-3 w-full max-w-full overflow-hidden">
              <code className={`bg-neutral-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-green-300 font-mono ${TEXT_SMALL} ${BREAK_SAFE} inline-block`}>
                {codeText}
              </code>
            </div>
          );
          return;
        }

        // Empty lines
        if (trimmedLine === '') {
          flushList();
          if (elements.length > 0 && !elements[elements.length - 1].key?.toString().startsWith('empty')) {
            elements.push(<div key={`empty-${elements.length}`} className="mb-1 sm:mb-2" />);
          }
          return;
        }

        // Regular paragraphs
        flushList();
        elements.push(
          <p 
            key={`p-${elements.length}`} 
            className={`text-gray-100 mb-2 sm:mb-3 leading-relaxed ${BREAK_SAFE} ${TEXT_RESPONSIVE}`}
          >
            {renderInlineFormatting(trimmedLine, `p-${elements.length}`)}
          </p>
        );
      });

      flushList();
      flushCodeBlock();

      return elements;
    };
  }, []);

  // FIXED: More efficient inline formatting with proper regex and key management
  const renderInlineFormatting = (text: string, baseKey: string): React.ReactNode => {
    if (!isValidString(text)) {
      return '';
    }

    const parts: React.ReactNode[] = [];
    let remaining = text;
    let segmentIndex = 0;

    while (remaining.length > 0) {
      let matched = false;

      // Bold text (more specific regex to avoid matching single asterisks)
      const boldMatch = remaining.match(/\*\*([^*]+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(remaining.slice(0, boldMatch.index));
        }
        parts.push(
          <strong key={`${baseKey}-bold-${segmentIndex++}`} className={`font-semibold text-white ${BREAK_SAFE}`}>
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        matched = true;
        continue;
      }

      // Italic text (negative lookbehind/ahead to avoid matching bold markers)
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);
      if (italicMatch && italicMatch.index !== undefined) {
        if (italicMatch.index > 0) {
          parts.push(remaining.slice(0, italicMatch.index));
        }
        parts.push(
          <em key={`${baseKey}-italic-${segmentIndex++}`} className={`italic text-gray-200 ${BREAK_SAFE}`}>
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
        matched = true;
        continue;
      }

      // Inline code (improved to not break code)
      const codeMatch = remaining.match(/`([^`]+?)`/);
      if (codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) {
          parts.push(remaining.slice(0, codeMatch.index));
        }
        parts.push(
          <code 
            key={`${baseKey}-code-${segmentIndex++}`} 
            className={`bg-neutral-900 px-1 sm:px-1.5 py-0.5 rounded text-green-300 font-mono text-[10px] sm:text-xs ${BREAK_SAFE} inline-block`}
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
        matched = true;
        continue;
      }

      // Links
      const linkMatch = remaining.match(/\[([^\]]+?)\]\(([^)]+?)\)/);
      if (linkMatch && linkMatch.index !== undefined) {
        if (linkMatch.index > 0) {
          parts.push(remaining.slice(0, linkMatch.index));
        }
        parts.push(
          <a
            key={`${baseKey}-link-${segmentIndex++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 ${TEXT_SMALL} ${BREAK_SAFE}`}
          >
            <span className={BREAK_SAFE}>{linkMatch[1]}</span>
            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
          </a>
        );
        remaining = remaining.slice(linkMatch.index + linkMatch[0].length);
        matched = true;
        continue;
      }

      if (!matched) {
        parts.push(remaining);
        break;
      }
    }

    return parts.length === 0 ? '' : parts.length === 1 ? parts[0] : parts;
  };

  const renderTable = (tableLines: string[], key: string) => {
    const rows = tableLines.map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
    );
    
    const headerRow = rows[0];
    const dataRows = rows.slice(2); // Skip separator line

    return (
      <div key={key} className={`${MARGIN_BLOCK} w-full overflow-x-auto max-w-full`}>
        <table className={`min-w-full border-collapse border border-neutral-700 rounded-lg overflow-hidden ${TEXT_SMALL}`}>
          <thead className="bg-neutral-800">
            <tr>
              {headerRow.map((header, i) => (
                <th 
                  key={`${key}-th-${i}`} 
                  className={`border border-neutral-700 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-green-300 whitespace-normal min-w-[80px] sm:min-w-[100px] max-w-[200px] ${BREAK_SAFE}`}
                >
                  {renderInlineFormatting(header, `${key}-th-${i}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, i) => (
              <tr key={`${key}-tr-${i}`} className={i % 2 === 0 ? 'bg-neutral-900/50' : 'bg-neutral-800/30'}>
                {row.map((cell, j) => (
                  <td 
                    key={`${key}-td-${i}-${j}`} 
                    className={`border border-neutral-700 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-100 whitespace-normal max-w-[200px] ${BREAK_SAFE}`}
                  >
                    {renderInlineFormatting(cell, `${key}-td-${i}-${j}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!content && (!resources || resources.length === 0)) {
    return (
      <div className={`text-gray-400 italic ${TEXT_SMALL}`}>
        No content to display
      </div>
    );
  }

  return (
    <div className="space-y-1 w-full max-w-full overflow-x-hidden overflow-y-visible">
      {content && (
        <div className={`${BREAK_SAFE} overflow-hidden`}>
          {renderContent(content)}
        </div>
      )}
      
      {resources && resources.length > 0 && (
        <div className={`mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-neutral-700 w-full max-w-full overflow-hidden`}>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
            <h3 className={`${TEXT_SMALL} font-semibold text-green-300`}>
              Further Resources
            </h3>
          </div>
          <div className="space-y-2 w-full max-w-full">
            {resources.map((resource, index) => (
              <div 
                key={`resource-${index}`} 
                className="flex items-start gap-2 p-2 sm:p-3 bg-neutral-800/50 rounded-lg border border-neutral-700 w-full max-w-full overflow-hidden"
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-gray-100 ${BREAK_SAFE} ${TEXT_SMALL}`}>
                      {resource.title}
                    </span>
                    {resource.type && (
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-neutral-700 rounded text-gray-300 flex-shrink-0 whitespace-nowrap">
                        {resource.type}
                      </span>
                    )}
                  </div>
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${TEXT_SMALL} text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 mt-1 ${BREAK_SAFE}`}
                    >
                      <span className="break-all overflow-wrap-anywhere truncate max-w-[250px] sm:max-w-full">
                        View Resource
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}