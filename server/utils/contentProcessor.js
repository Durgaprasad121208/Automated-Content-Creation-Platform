/**
 * Content preprocessing utilities for Gemini-generated content
 */

import { encode } from 'html-entities';

const processHeadings = (text) => {
  // Process H1 (Title)
  text = text.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  
  // Process H2
  text = text.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  
  // Process H3
  text = text.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  
  return text;
};

const processLists = (text) => {
  let inOrderedList = false;
  let inUnorderedList = false;
  
  // Process ordered lists (1. 2. 3.)
  text = text.replace(/^(\d+\.\s+.+)$/gm, (match, item) => {
    if (!inOrderedList) {
      inOrderedList = true;
      return `<ol>\n<li>${item.replace(/^\d+\.\s+/, '')}</li>`;
    }
    return `<li>${item.replace(/^\d+\.\s+/, '')}</li>`;
  });
  
  // Close ordered lists
  text = text.replace(/(<li>.*<\/li>)\n(?!\d+\.\s+)/g, '$1\n</ol>\n');
  
  // Process unordered lists (- * •)
  text = text.replace(/^([-*•]\s+.+)$/gm, (match, item) => {
    if (!inUnorderedList) {
      inUnorderedList = true;
      return `<ul>\n<li>${item.replace(/^[-*•]\s+/, '')}</li>`;
    }
    return `<li>${item.replace(/^[-*•]\s+/, '')}</li>`;
  });
  
  // Close unordered lists
  text = text.replace(/(<li>.*<\/li>)\n(?![-*•]\s+)/g, '$1\n</ul>\n');
  
  return text;
};

const processBlockquotes = (text) => {
  // Process blockquotes
  text = text.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  return text;
};

const processParagraphs = (text) => {
  // Process paragraphs (non-empty lines that aren't headings, lists, or blockquotes)
  text = text.replace(/^(?!<[ho]|<block|<[ul])[^\n].+$/gm, '<p>$&</p>');
  return text;
};

const processEmphasis = (text) => {
  // Process bold text
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Process italic text
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  return text;
};

const processLinks = (text) => {
  // Process markdown links [text](url)
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  return text;
};

const processCodeBlocks = (text) => {
  // Process code blocks
  text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Process inline code
  text = text.replace(/`(.+?)`/g, '<code>$1</code>');
  
  return text;
};

const processHorizontalRules = (text) => {
  // Process horizontal rules (---, ***, ___)
  text = text.replace(/^([-*_]){3,}$/gm, '<hr>');
  return text;
};

/**
 * Preprocesses the raw content from Gemini AI
 * @param {string} content - Raw content to process
 * @returns {object} Processed content and metadata
 */
export const preprocessContent = (content) => {
  if (!content) return { processedContent: '', metadata: {} };

  let text = content.trim();
  const metadata = {
    wordCount: text.split(/\s+/).length,
    charCount: text.length,
    processedAt: new Date().toISOString()
  };

  // Format headings (lines in all caps followed by newline)
  text = text.replace(/^([A-Z][A-Z\s]+[A-Z])$/gm, '\n\x1b[1m$1\x1b[0m\n');

  // Format subheadings (Title Case lines followed by newline)
  text = text.replace(/^([A-Z][a-z]+(?: [A-Z][a-z]+)*):?$/gm, '\n\x1b[1m$1\x1b[0m\n');

  // Format bullet points
  text = text.replace(/^[-*•]\s+(.+)$/gm, '  • $1');

  // Format numbered lists (preserve original numbers)
  text = text.replace(/^\d+\.\s+(.+)$/gm, (match, item) => {
    const number = match.match(/^\d+/)[0];
    return `  ${number}. ${item}`;
  });

  // Format important phrases (text between asterisks)
  text = text.replace(/\*([^*]+)\*/g, '\x1b[1m$1\x1b[0m');

  // Format quotes
  text = text.replace(/^>\s+(.+)$/gm, '\n    "$1"\n');

  // Add proper paragraph spacing
  text = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');

  // Remove any duplicate blank lines
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n');

  return {
    processedContent: text,
    metadata
  };
};

/**
 * Generate CSS styles for the blog content
 * @returns {string} CSS styles
 */
const generateStyles = () => {
  return `
    .blog-content {
      max-width: 800px;
      margin: 2rem auto;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #2d3748;
    }

    .blog-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a237e;
      margin: 2rem 0 1.5rem;
      line-height: 1.2;
    }

    .blog-heading {
      font-size: 2rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 2rem 0 1rem;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }

    .blog-subheading {
      font-size: 1.5rem;
      font-weight: 500;
      color: #4a5568;
      margin: 1.5rem 0 1rem;
    }

    .blog-paragraph {
      margin: 1.25rem 0;
      font-size: 1.1rem;
      color: #4a5568;
    }

    .blog-list, .blog-ordered-list {
      margin: 1.25rem 0;
      padding-left: 2rem;
    }

    .blog-list li, .blog-ordered-list li {
      margin: 0.5rem 0;
      padding-left: 0.5rem;
    }

    .blog-quote {
      border-left: 4px solid #1a237e;
      padding: 1rem 2rem;
      margin: 1.5rem 0;
      background-color: #f8fafc;
      font-style: italic;
      color: #4a5568;
    }

    strong {
      font-weight: 600;
      color: #2d3748;
    }

    em {
      font-style: italic;
      color: #4a5568;
    }
  `;
};

/**
 * Extract sections from content for navigation
 * @param {string} content - Content to analyze
 * @returns {Array} Array of section objects
 */
const extractSections = (content) => {
  const sections = [];
  const lines = content.split('\n');
  let currentSection = null;

  lines.forEach(line => {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2];
      const section = {
        level,
        title,
        id: title.toLowerCase().replace(/[^\w]+/g, '-')
      };
      sections.push(section);
    }
  });

  return sections;
};

/**
 * Calculates a basic readability score
 * @param {string} text - Text to analyze
 * @returns {number} Readability score (0-100)
 */
const calculateReadabilityScore = (text) => {
  // Average words per sentence
  const sentences = text.split(/[.!?]+/);
  const words = text.split(/\s+/);
  const avgWordsPerSentence = words.length / sentences.length;

  // Average word length
  const avgWordLength = words.join('').length / words.length;

  // Calculate score (simplified version of readability metrics)
  const score = 100 - (avgWordsPerSentence * 0.5 + avgWordLength * 2);
  
  return Math.max(0, Math.min(100, score)); // Ensure score is between 0 and 100
};

/**
 * Analyzes content for keyword density and relevance
 * @param {string} content - Content to analyze
 * @param {string[]} keywords - Target keywords
 * @returns {object} Keyword analysis results
 */
export const analyzeKeywords = (content, keywords = []) => {
  const wordCount = content.split(/\s+/).length;
  const analysis = {};

  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = content.match(regex) || [];
    const density = (matches.length / wordCount) * 100;

    analysis[keyword] = {
      count: matches.length,
      density: density.toFixed(2) + '%',
      distribution: calculateDistribution(content, keyword)
    };
  });

  return analysis;
};

/**
 * Calculates keyword distribution in the content
 * @param {string} content - Content to analyze
 * @param {string} keyword - Keyword to check distribution for
 * @returns {string} Distribution pattern (start/middle/end/well-distributed)
 */
const calculateDistribution = (content, keyword) => {
  const sections = content.split(/\n\n/);
  const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
  const totalSections = sections.length;
  const appearances = sections.map(section => (section.match(regex) || []).length);
  
  const firstThird = appearances.slice(0, Math.floor(totalSections / 3)).some(count => count > 0);
  const middleThird = appearances.slice(Math.floor(totalSections / 3), Math.floor(2 * totalSections / 3)).some(count => count > 0);
  const lastThird = appearances.slice(Math.floor(2 * totalSections / 3)).some(count => count > 0);

  if (firstThird && middleThird && lastThird) return 'well-distributed';
  if (firstThird) return 'start-heavy';
  if (lastThird) return 'end-heavy';
  return 'middle-heavy';
};

export default {
  preprocessContent
};
