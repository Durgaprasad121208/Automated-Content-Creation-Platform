import { JSDOM } from 'jsdom';
import { encode } from 'html-entities';
import slugify from 'slugify';

export const preprocessContent = (content) => {
  // Remove extra whitespace and normalize line breaks
  let processedContent = content.trim()
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n');

  // Convert special characters to HTML entities
  processedContent = encode(processedContent);

  // Add paragraph tags for better readability
  processedContent = processedContent
    .split('\n\n')
    .map(para => `<p>${para}</p>`)
    .join('\n');

  return processedContent;
};

export const optimizeForSEO = (content, title, keywords = []) => {
  const dom = new JSDOM(content);
  const document = dom.window.document;

  // Create slug from title
  const slug = slugify(title, { lower: true, strict: true });

  // Extract first paragraph for meta description
  const firstParagraph = document.querySelector('p')?.textContent || '';
  const metaDescription = firstParagraph.length > 160 
    ? firstParagraph.substring(0, 157) + '...'
    : firstParagraph;

  // Add header tags for better structure
  const sections = document.querySelectorAll('p');
  let currentH2 = null;
  sections.forEach((section, index) => {
    const text = section.textContent;
    if (text.length > 100 && !currentH2) {
      const h2 = document.createElement('h2');
      h2.textContent = generateSubheading(text);
      section.parentNode.insertBefore(h2, section);
      currentH2 = h2;
    }
  });

  // Add keyword-rich alt text to images
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt) {
      img.alt = generateAltText(img.src, keywords, title);
    }
  });

  // Add internal links for keywords
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const paragraphs = document.querySelectorAll('p');
    let firstMatch = true;

    paragraphs.forEach(p => {
      if (firstMatch && regex.test(p.textContent)) {
        p.innerHTML = p.innerHTML.replace(regex, `<a href="/tag/${slugify(keyword, { lower: true })}">${keyword}</a>`);
        firstMatch = false;
      }
    });
  });

  // Generate schema markup
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": metaDescription,
    "keywords": keywords.join(", "),
    "datePublished": new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": "Blog Author"
    }
  };

  return {
    processedContent: dom.serialize(),
    metadata: {
      slug,
      metaDescription,
      schema: JSON.stringify(schema)
    }
  };
};

const generateSubheading = (text) => {
  // Extract key phrases for subheading
  const words = text.split(' ').slice(0, 5);
  return words.join(' ') + '...';
};

const generateAltText = (src, keywords, title) => {
  const fileName = src.split('/').pop().split('.')[0];
  const relevantKeywords = keywords.filter(k => 
    fileName.toLowerCase().includes(k.toLowerCase())
  );
  
  if (relevantKeywords.length > 0) {
    return `${title} - ${relevantKeywords.join(', ')}`;
  }
  return `${title} - ${fileName}`;
};
