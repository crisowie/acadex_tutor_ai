import React from "react";

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
  const lines = content.split("\n");

  return (
    <div className="space-y-3 leading-relaxed">
      {lines.map((line, i) => {
        // === H1 Gradient Heading (text ending with **) ===
        if (/^\*{2}(.*)\*{2}$/.test(line)) {
          return (
            <h1 key={i} className="text-2xl font-bold text-green-200">
              {line.replace(/^\*{2}|\*{2}$/g, "").trim()}
            </h1>
          );
        }

        // === H1 Gradient Heading (text ending with **) ===
        if (/^\s*#+\s*(.*)$/.test(line)) {
          return (
            <h1 key={i} className="text-2xl font-bold text-green-200">
              {line.replace(/^\s*#+\s*|\s*#+\s*$/g, "").trim()}
            </h1>
          );
        }


        // === H2 Sub-heading (starts with * ) ===
        if (/^\* (.*)/.test(line)) {
          return (
            <h2 key={i} className="text-base font-semibold text-neutral-100">
              {line.replace(/^\* /, "").trim()}
            </h2>
          );
        }

        // === Normal Paragraph ===
        if (line.trim() !== "") {
          return (
            <div key={i} className="flex">
              <p className="text-gray-100">
                {line.replace(/\*+/g, "").trim()}
              </p>
              <hr className="border-gray-500" />
            </div>
          );
        }

        return null;
      })}

      {/* 📚 Resources */}
      {resources && resources.length > 0 && (
        <div className="mt-4 border-t border-gray-700 pt-3">
          <h3 className="text-sm font-semibold text-green-300 mb-2">
            📚 Further Resources
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-200">
            {resources.map((res, i) => (
              <li key={i}>
                <span className="font-medium">{res.title}</span>
                {res.url && (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-400 underline"
                  >
                    (link)
                  </a>
                )}
                {res.type && (
                  <span className="ml-2 text-gray-400 italic">[{res.type}]</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
