#!/usr/bin/env node

/**
 * Generate series outline with news research and fallback
 * Usage: node generate-outline-v2.js "<topic>" --articles=10 --words=3500 --style=soul-scribe-c
 */

const utils = require('./utils-v2');

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node generate-outline-v2.js "<topic>" --articles=10 --words=3500 --style=soul-scribe-c');
    process.exit(1);
  }

  const topic = args[0];
  const articlesMatch = args.find(arg => arg.startsWith('--articles='));
  const wordsMatch = args.find(arg => arg.startsWith('--words='));
  const styleMatch = args.find(arg => arg.startsWith('--style='));

  const articlesCount = articlesMatch ? parseInt(articlesMatch.split('=')[1]) : 10;
  const wordsPerArticle = wordsMatch ? parseInt(wordsMatch.split('=')[1]) : 3500;
  const style = styleMatch ? styleMatch.split('=')[1] : 'soul-scribe-c';

  return { topic, articlesCount, wordsPerArticle, style };
}

function main() {
  const { topic, articlesCount, wordsPerArticle, style } = parseArgs();

  // Generate series ID
  const seriesId = utils.generateSeriesId();
  const seriesDir = utils.getSeriesDir(seriesId);

  // Create series directory
  utils.ensureDir(seriesDir);

  // Create metadata
  const metadata = {
    id: seriesId,
    topic,
    created_at: new Date().toISOString(),
    articles_count: articlesCount,
    words_per_article: wordsPerArticle,
    style,
    status: 'outline_pending',
    news_source: 'pending' // Will be updated to 'websearch' or 'fallback'
  };

  utils.saveJson(utils.getMetadataPath(seriesId), metadata);

  // Output result - Claude will handle the actual outline generation
  console.log(JSON.stringify({
    success: true,
    series_id: seriesId,
    topic,
    articles_count: articlesCount,
    words_per_article: wordsPerArticle,
    style,
    message: 'Series initialized. Claude will now generate outline with news research (fallback if unavailable).'
  }, null, 2));
}

main();
