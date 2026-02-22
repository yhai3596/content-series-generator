#!/usr/bin/env node

/**
 * Generate single article content
 * Usage: node generate-content-v2.js <series-id> --article=1
 */

const utils = require('./utils-v2');
const fs = require('fs');

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node generate-content-v2.js <series-id> --article=1');
    process.exit(1);
  }

  const seriesId = args[0];
  const articleMatch = args.find(arg => arg.startsWith('--article='));
  const articleNumber = articleMatch ? parseInt(articleMatch.split('=')[1]) : 1;

  return { seriesId, articleNumber };
}

function main() {
  const { seriesId, articleNumber } = parseArgs();

  // Load metadata
  const metadata = utils.loadJson(utils.getMetadataPath(seriesId));
  if (!metadata) {
    console.error(`Series not found: ${seriesId}`);
    process.exit(1);
  }

  // Load outline
  const outline = utils.loadJson(utils.getOutlinePath(seriesId));
  if (!outline || !outline.articles) {
    console.error(`Outline not found for series: ${seriesId}`);
    process.exit(1);
  }

  // Find article in outline
  const article = outline.articles.find(a => a.number === articleNumber);
  if (!article) {
    console.error(`Article ${articleNumber} not found in outline`);
    process.exit(1);
  }

  // Output article info for Claude to generate
  console.log(JSON.stringify({
    success: true,
    series_id: seriesId,
    article_number: articleNumber,
    article_title: article.title,
    article_subtitle: article.subtitle,
    key_points: article.key_points,
    target_words: article.target_words || metadata.words_per_article,
    style: metadata.style,
    message: 'Article info loaded. Claude will now generate the content.'
  }, null, 2));
}

main();
