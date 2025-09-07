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
            <ol key={elements.length} className="list-decimal list-inside space-y-1 mb-4 ml-4">
              {currentListItems.map((item, i) => (
                <li key={i} className="text-gray-100 leading-relaxed">
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={elements.length} className="list-disc list-inside space-y-1 mb-4 ml-4">
              {currentListItems.map((item, i) => (
                <li key={i} className="text-gray-100 leading-relaxed">
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
          <div key={elements.length} className="mb-4">
            <pre className="bg-neutral-900 rounded-lg p-4 overflow-x-auto border border-neutral-700">
              <code className={`text-sm text-gray-100 ${codeBlockLanguage ? `language-${codeBlockLanguage}` : ''}`}>
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

      // Handle code blocks
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
            <h1 key={elements.length} className="text-2xl font-bold text-green-200 mb-4 mt-6 first:mt-0">
              {renderInlineFormatting(text)}
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2 key={elements.length} className="text-xl font-semibold text-green-300 mb-3 mt-5">
              {renderInlineFormatting(text)}
            </h2>
          );
        } else if (level === 3) {
          elements.push(
            <h3 key={elements.length} className="text-lg font-semibold text-neutral-100 mb-2 mt-4">
              {renderInlineFormatting(text)}
            </h3>
          );
        } else {
          elements.push(
            <h4 key={elements.length} className="text-base font-medium text-neutral-200 mb-2 mt-3">
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
          <hr key={elements.length} className="border-neutral-700 my-4" />
        );
        return;
      }

      // Blockquotes
      if (trimmedLine.startsWith('>')) {
        flushList();
        const quoteText = trimmedLine.replace(/^>\s*/, '');
        elements.push(
          <blockquote key={elements.length} className="border-l-4 border-green-600 pl-4 py-2 mb-4 bg-neutral-800/50 rounded-r">
            <p className="text-gray-200 italic">{renderInlineFormatting(quoteText)}</p>
          </blockquote>
        );
        return;
      }

      // Tables (basic detection)
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

      // Math equations (LaTeX style)
      if (trimmedLine.match(/^\\\[.*\\\]$/) || trimmedLine.match(/^\$\$.*\$\$$/)) {
        flushList();
        const equation = trimmedLine
          .replace(/^\\\[|\\\]$/g, '')
          .replace(/^\$\$|\$\$$/g, '');
        elements.push(
          <div key={elements.length} className="mb-4 p-4 bg-neutral-900 rounded-lg border border-neutral-700">
            <code className="text-green-300 text-center block font-mono">{equation}</code>
          </div>
        );
        return;
      }

      // Inline code blocks (single backticks)
      if (trimmedLine.match(/^`.*`$/)) {
        flushList();
        const codeText = trimmedLine.replace(/^`|`$/g, '');
        elements.push(
          <div key={elements.length} className="mb-3">
            <code className="bg-neutral-900 px-2 py-1 rounded text-green-300 font-mono text-sm">
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
          elements.push(<div key={elements.length} className="mb-2" />);
        }
        return;
      }

      // Regular paragraphs
      flushList();
      elements.push(
        <p key={elements.length} className="text-gray-100 mb-3 leading-relaxed">
          {renderInlineFormatting(trimmedLine)}
        </p>
      );
    });

    // Flush any remaining lists or code blocks
    flushList();
    flushCodeBlock();

    return elements;
  };

  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Handle bold, italic, code, and links
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
          <strong key={key++} className="font-semibold text-white">
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
          <em key={key++} className="italic text-gray-200">
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
          <code key={key++} className="bg-neutral-900 px-1 py-0.5 rounded text-green-300 font-mono text-sm">
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
            className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
          >
            {linkMatch[1]}
            <ExternalLink className="w-3 h-3" />
          </a>
        );
        currentText = currentText.slice((linkMatch.index || 0) + linkMatch[0].length);
        continue;
      }

      // No more formatting found, add the rest
      parts.push(currentText);
      break;
    }

    return parts.length === 1 ? parts[0] : parts;
  };

  const renderTable = (tableLines: string[], key: number) => {
    const rows = tableLines.map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
    );
    
    // Skip separator row (usually second row with dashes)
    const headerRow = rows[0];
    const dataRows = rows.slice(2);

    return (
      <div key={key} className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse border border-neutral-700 rounded-lg overflow-hidden">
          <thead className="bg-neutral-800">
            <tr>
              {headerRow.map((header, i) => (
                <th key={i} className="border border-neutral-700 px-3 py-2 text-left font-semibold text-green-300">
                  {renderInlineFormatting(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-neutral-900/50' : 'bg-neutral-800/30'}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-neutral-700 px-3 py-2 text-gray-100">
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

  return (
    <div className="space-y-1">
      {renderContent(content)}
      
      {/* Resources Section */}
      {resources && resources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-700">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-semibold text-green-300">
              Further Resources
            </h3>
          </div>
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-100">{resource.title}</span>
                    {resource.type && (
                      <span className="text-xs px-2 py-0.5 bg-neutral-700 rounded text-gray-300">
                        {resource.type}
                      </span>
                    )}
                  </div>
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 mt-1"
                    >
                      View Resource
                      <ExternalLink className="w-3 h-3" />
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