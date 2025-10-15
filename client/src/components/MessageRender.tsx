import React from "react";
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

export default function MessageRenderer({ content, resources }: MessageRendererProps) {
  const renderContent = (text: string) => {
    if (!text || typeof text !== 'string') {
      return [<p key="empty" className="text-gray-400 italic text-xs sm:text-sm">No content available</p>];
    }

    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentListItems: string[] = [];
    let currentListType: 'ordered' | 'unordered' | null = null;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';

    const flushList = () => {
      if (currentListItems.length > 0) {
        if (currentListType === 'ordered') {
          elements.push(
            <ol key={elements.length} className="list-decimal list-inside space-y-1 mb-3 sm:mb-4 ml-3 sm:ml-4 text-xs sm:text-sm">
              {currentListItems.map((item, i) => (
                <li key={i} className="text-gray-100 leading-relaxed break-words overflow-wrap-anywhere">
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={elements.length} className="list-disc list-inside space-y-1 mb-3 sm:mb-4 ml-3 sm:ml-4 text-xs sm:text-sm">
              {currentListItems.map((item, i) => (
                <li key={i} className="text-gray-100 leading-relaxed break-words overflow-wrap-anywhere">
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ul>
          );
        }
        currentListItems = [];
        currentListType = null;
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <div key={elements.length} className="mb-3 sm:mb-4 w-full overflow-hidden">
            <pre className="bg-neutral-900 rounded-lg p-2 sm:p-3 md:p-4 border border-neutral-700 overflow-x-auto max-w-full text-xs sm:text-sm">
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
      const trimmedLine = line.trim();

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

      // Headers
      if (trimmedLine.match(/^#{1,6}\s+/)) {
        flushList();
        const level = trimmedLine.match(/^#+/)?.[0].length || 1;
        const text = trimmedLine.replace(/^#+\s*/, '').replace(/\s*#+$/, '');
        
        if (level === 1) {
          elements.push(
            <h1 key={elements.length} className="text-lg sm:text-xl md:text-2xl font-bold text-green-200 mb-3 sm:mb-4 mt-4 sm:mt-6 first:mt-0 break-words overflow-wrap-anywhere max-w-full">
              {renderInlineFormatting(text)}
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2 key={elements.length} className="text-base sm:text-lg md:text-xl font-semibold text-green-300 mb-2 sm:mb-3 mt-3 sm:mt-5 break-words overflow-wrap-anywhere max-w-full">
              {renderInlineFormatting(text)}
            </h2>
          );
        } else if (level === 3) {
          elements.push(
            <h3 key={elements.length} className="text-sm sm:text-base md:text-lg font-semibold text-neutral-100 mb-2 mt-3 sm:mt-4 break-words overflow-wrap-anywhere max-w-full">
              {renderInlineFormatting(text)}
            </h3>
          );
        } else {
          elements.push(
            <h4 key={elements.length} className="text-sm sm:text-base font-medium text-neutral-200 mb-2 mt-2 sm:mt-3 break-words overflow-wrap-anywhere max-w-full">
              {renderInlineFormatting(text)}
            </h4>
          );
        }
        return;
      }

      // Horizontal rules
      if (trimmedLine.match(/^---+$|^\*\*\*+$|^___+$/)) {
        flushList();
        elements.push(
          <hr key={elements.length} className="border-neutral-700 my-3 sm:my-4 w-full" />
        );
        return;
      }

      // Blockquotes
      if (trimmedLine.startsWith('>')) {
        flushList();
        const quoteText = trimmedLine.replace(/^>\s*/, '');
        elements.push(
          <blockquote key={elements.length} className="border-l-4 border-green-600 pl-3 sm:pl-4 py-2 mb-3 sm:mb-4 bg-neutral-800/50 rounded-r w-full overflow-hidden">
            <p className="text-gray-200 italic break-words overflow-wrap-anywhere text-xs sm:text-sm">{renderInlineFormatting(quoteText)}</p>
          </blockquote>
        );
        return;
      }

      // Tables
      if (trimmedLine.includes('|') && lines[index + 1]?.includes('|')) {
        flushList();
        const tableLines = [];
        let i = index;
        while (i < lines.length && lines[i].includes('|')) {
          tableLines.push(lines[i]);
          i++;
        }
        if (tableLines.length >= 2) {
          elements.push(renderTable(tableLines, elements.length));
        }
        return;
      }

      // Ordered lists
      if (trimmedLine.match(/^\d+\.\s+/)) {
        if (currentListType !== 'ordered') {
          flushList();
          currentListType = 'ordered';
        }
        currentListItems.push(trimmedLine.replace(/^\d+\.\s+/, ''));
        return;
      }

      // Unordered lists
      if (trimmedLine.match(/^[-*+]\s+/)) {
        if (currentListType !== 'unordered') {
          flushList();
          currentListType = 'unordered';
        }
        currentListItems.push(trimmedLine.replace(/^[-*+]\s+/, ''));
        return;
      }

      // Math equations
      if (trimmedLine.match(/^\\\[.*\\\]$/) || trimmedLine.match(/^\$\$.*\$\$/)) {
        flushList();
        const equation = trimmedLine
          .replace(/^\\\[|\\\]$/g, '')
          .replace(/^\$\$|\$\$/g, '');
        elements.push(
          <div key={elements.length} className="mb-3 sm:mb-4 p-3 sm:p-4 bg-neutral-900 rounded-lg border border-neutral-700 overflow-x-auto w-full max-w-full">
            <code className="text-green-300 text-center block font-mono text-xs sm:text-sm break-all">{equation}</code>
          </div>
        );
        return;
      }

      // Inline code blocks
      if (trimmedLine.match(/^`.*`$/)) {
        flushList();
        const codeText = trimmedLine.replace(/^`|`$/g, '');
        elements.push(
          <div key={elements.length} className="mb-2 sm:mb-3 w-full max-w-full overflow-hidden">
            <code className="bg-neutral-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-green-300 font-mono text-xs sm:text-sm break-all inline-block max-w-full">
              {codeText}
            </code>
          </div>
        );
        return;
      }

      // Empty lines
      if (trimmedLine === '') {
        flushList();
        if (elements.length > 0 && elements[elements.length - 1].type !== 'br') {
          elements.push(<div key={elements.length} className="mb-1 sm:mb-2" />);
        }
        return;
      }

      // Regular paragraphs
      flushList();
      elements.push(
        <p key={elements.length} className="text-gray-100 mb-2 sm:mb-3 leading-relaxed break-words overflow-wrap-anywhere max-w-full text-xs sm:text-sm md:text-base">
          {renderInlineFormatting(trimmedLine)}
        </p>
      );
    });

    flushList();
    flushCodeBlock();

    return elements;
  };

  const renderInlineFormatting = (text: string): React.ReactNode => {
    if (!text || typeof text !== 'string') {
      return '';
    }

    const parts = [];
    let currentText = text;
    let key = 0;

    while (currentText.length > 0) {
      // Bold text **text**
      const boldMatch = currentText.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        const beforeBold = currentText.slice(0, boldMatch.index);
        if (beforeBold) parts.push(beforeBold);
        parts.push(
          <strong key={key++} className="font-semibold text-white break-words overflow-wrap-anywhere">
            {boldMatch[1]}
          </strong>
        );
        currentText = currentText.slice((boldMatch.index || 0) + boldMatch[0].length);
        continue;
      }

      // Italic text *text*
      const italicMatch = currentText.match(/\*(.*?)\*/);
      if (italicMatch) {
        const beforeItalic = currentText.slice(0, italicMatch.index);
        if (beforeItalic) parts.push(beforeItalic);
        parts.push(
          <em key={key++} className="italic text-gray-200 break-words overflow-wrap-anywhere">
            {italicMatch[1]}
          </em>
        );
        currentText = currentText.slice((italicMatch.index || 0) + italicMatch[0].length);
        continue;
      }

      // Inline code `code`
      const codeMatch = currentText.match(/`(.*?)`/);
      if (codeMatch) {
        const beforeCode = currentText.slice(0, codeMatch.index);
        if (beforeCode) parts.push(beforeCode);
        parts.push(
          <code key={key++} className="bg-neutral-900 px-1 sm:px-1.5 py-0.5 rounded text-green-300 font-mono text-[10px] sm:text-xs break-all max-w-full inline-block">
            {codeMatch[1]}
          </code>
        );
        currentText = currentText.slice((codeMatch.index || 0) + codeMatch[0].length);
        continue;
      }

      // Links [text](url)
      const linkMatch = currentText.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const beforeLink = currentText.slice(0, linkMatch.index);
        if (beforeLink) parts.push(beforeLink);
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 break-all max-w-full text-xs sm:text-sm overflow-wrap-anywhere"
          >
            <span className="break-all overflow-wrap-anywhere">{linkMatch[1]}</span>
            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
          </a>
        );
        currentText = currentText.slice((linkMatch.index || 0) + linkMatch[0].length);
        continue;
      }

      parts.push(currentText);
      break;
    }

    return parts.length === 1 ? parts[0] : parts;
  };

  const renderTable = (tableLines: string[], key: number) => {
    const rows = tableLines.map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
    );
    
    const headerRow = rows[0];
    const dataRows = rows.slice(2);

    return (
      <div key={key} className="mb-3 sm:mb-4 w-full overflow-x-auto max-w-full">
        <table className="min-w-full border-collapse border border-neutral-700 rounded-lg overflow-hidden text-xs sm:text-sm">
          <thead className="bg-neutral-800">
            <tr>
              {headerRow.map((header, i) => (
                <th key={i} className="border border-neutral-700 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-green-300 break-words whitespace-normal min-w-[80px] sm:min-w-[100px] max-w-[200px] overflow-wrap-anywhere">
                  {renderInlineFormatting(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-neutral-900/50' : 'bg-neutral-800/30'}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-neutral-700 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-100 break-words whitespace-normal max-w-[200px] overflow-wrap-anywhere">
                    {renderInlineFormatting(cell)}
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
      <div className="text-gray-400 italic text-xs sm:text-sm">
        No content to display
      </div>
    );
  }

  return (
    <div className="space-y-1 w-full max-w-full overflow-x-hidden overflow-y-visible">

      {content && <div className="break-words w-full max-w-full overflow-hidden">{renderContent(content)}</div>}
      
      {/* Resources Section - FULLY RESPONSIVE */}
      {resources && resources.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-neutral-700 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-green-300">
              Further Resources
            </h3>
          </div>
          <div className="space-y-2 w-full max-w-full">
            {resources.map((resource, index) => (
              <div key={index} className="flex items-start gap-2 p-2 sm:p-3 bg-neutral-800/50 rounded-lg border border-neutral-700 w-full max-w-full overflow-hidden">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-100 break-words overflow-wrap-anywhere text-xs sm:text-sm max-w-full">{resource.title}</span>
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
                      className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 mt-1 break-all overflow-wrap-anywhere max-w-full"
                    >
                      <span className="break-all overflow-wrap-anywhere truncate max-w-[250px] sm:max-w-full">View Resource</span>
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