// src/components/markdown.tsx
import React from 'react';

interface MarkdownProps {
  content: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  const parseMarkdown = (text: string) => {
    // Bold: **text** or *text*
    let html = text.replace(/\*\*(.*?)\*\*|\*(.*?)\*/g, '<strong>$1$2</strong>');

    // Links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
    
    // Unordered lists: * item
    html = html.replace(/^\s*\*[ \t]/gm, '<li>');
    
    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
      if (line.startsWith('<li>')) {
        if (!inList) {
          inList = true;
          return `<ul>${line}</li>`;
        }
        return `${line}</li>`;
      }
      if (inList) {
        inList = false;
        return `</ul>${line}`;
      }
      return line;
    });

    if(inList) {
        processedLines.push('</ul>');
    }
    
    html = processedLines.join('<br />').replace(/<\/li><br \/>/g, '</li>');
    html = html.replace(/<\/ul><br \/>/g, '</ul>');
    html = html.replace(/<ul><br \/>/g, '<ul>');

    return { __html: html };
  };

  return (
    <div
      className="prose prose-sm max-w-none text-sm text-card-foreground [&_strong]:font-semibold [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={parseMarkdown(content)}
    />
  );
};

export default Markdown;
