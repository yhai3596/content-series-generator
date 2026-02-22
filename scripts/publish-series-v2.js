#!/usr/bin/env node

/**
 * Publish series to B4A with retry logic
 * Usage: node publish-series-v2.js <series-id> --platform=b4a [--article=N]
 */

const utils = require('./utils-v2');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node publish-series-v2.js <series-id> --platform=b4a [--article=N]');
    process.exit(1);
  }

  const seriesId = args[0];
  const platformMatch = args.find(arg => arg.startsWith('--platform='));
  const platform = platformMatch ? platformMatch.split('=')[1] : 'b4a';

  const articleMatch = args.find(arg => arg.startsWith('--article='));
  const singleArticle = articleMatch ? parseInt(articleMatch.split('=')[1]) : null;

  return { seriesId, platform, singleArticle };
}

async function publishToB4A(seriesId, articlePath, title) {
  const b4aScript = path.join(
    process.env.HOME || process.env.USERPROFILE,
    '.claude/skills/slash-b4a/scripts/rewrite.js'
  );

  const publishFn = () => {
    try {
      const result = execSync(
        `node "${b4aScript}" publish "${title}" --file="${articlePath}"`,
        { encoding: 'utf8', stdio: 'pipe', timeout: 30000 }
      );

      // Parse result to extract URL
      const match = result.match(/URL: (https:\/\/[^\s]+)/);
      if (!match) {
        throw new Error('No URL found in publish response');
      }
      return match[1];
    } catch (error) {
      throw new Error(`Publish failed: ${error.message}`);
    }
  };

  try {
    // Retry with exponential backoff
    const url = await utils.retryWithBackoff(publishFn, 3, 2000);
    return url;
  } catch (error) {
    utils.appendLog(seriesId, `Failed to publish "${title}": ${error.message}`);
    return null;
  }
}

async function main() {
  const { seriesId, platform, singleArticle } = parseArgs();

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

  const articlesToPublish = singleArticle
    ? outline.articles.filter(a => a.number === singleArticle)
    : outline.articles;

  if (articlesToPublish.length === 0) {
    console.error(`No articles to publish`);
    process.exit(1);
  }

  console.log(`Publishing ${articlesToPublish.length} article(s) to ${platform}...`);

  const publishedUrls = [];
  const failedArticles = [];

  // Publish each article
  for (const article of articlesToPublish) {
    // Find article file with descriptive name
    const seriesDir = utils.getSeriesDir(seriesId);
    const files = fs.readdirSync(seriesDir);
    const articleFile = files.find(f =>
      f.includes(article.title.substring(0, 20)) && f.endsWith('.md')
    );

    if (!articleFile) {
      console.log(`Skipping article ${article.number}: file not found`);
      failedArticles.push({
        number: article.number,
        title: article.title,
        reason: 'File not found'
      });
      continue;
    }

    const articlePath = path.join(seriesDir, articleFile);
    console.log(`Publishing article ${article.number}: ${article.title}`);

    if (platform === 'b4a') {
      const url = await publishToB4A(seriesId, articlePath, article.title);
      if (url) {
        publishedUrls.push({
          number: article.number,
          title: article.title,
          url,
          filename: articleFile
        });
        console.log(`✓ Published: ${url}`);
      } else {
        failedArticles.push({
          number: article.number,
          title: article.title,
          reason: 'Publish API failed after retries'
        });
        console.log(`✗ Failed to publish article ${article.number}`);
      }
    }
  }

  // Update metadata with published URLs
  if (!metadata.published_urls) {
    metadata.published_urls = [];
  }

  // Merge new URLs with existing ones
  for (const newUrl of publishedUrls) {
    const existingIndex = metadata.published_urls.findIndex(
      u => u.number === newUrl.number
    );
    if (existingIndex >= 0) {
      metadata.published_urls[existingIndex] = newUrl;
    } else {
      metadata.published_urls.push(newUrl);
    }
  }

  metadata.status = failedArticles.length === 0 ? 'published' : 'partially_published';
  metadata.published_at = new Date().toISOString();
  utils.saveJson(utils.getMetadataPath(seriesId), metadata);

  // Output result
  const result = {
    success: failedArticles.length === 0,
    series_id: seriesId,
    published_count: publishedUrls.length,
    failed_count: failedArticles.length,
    total_articles: articlesToPublish.length,
    urls: publishedUrls
  };

  if (failedArticles.length > 0) {
    result.failed_articles = failedArticles;
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
