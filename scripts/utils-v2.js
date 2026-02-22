const fs = require('fs');
const path = require('path');

const DATA_DIR = 'E:/AICoding/article';

/**
 * Generate unique series ID
 */
function generateSeriesId() {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6);
  return `series-${date}-${random}`;
}

/**
 * Generate descriptive filename from title and timestamp
 * Format: {title}_{YYYYMMDD}_{HHMMSS}.md
 */
function generateDescriptiveFilename(title, timestamp = new Date()) {
  // Sanitize title: remove special chars, keep Chinese/English/numbers
  const sanitized = title
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50); // Limit length

  // Format timestamp
  const year = timestamp.getFullYear();
  const month = String(timestamp.getMonth() + 1).padStart(2, '0');
  const day = String(timestamp.getDate()).padStart(2, '0');
  const hour = String(timestamp.getHours()).padStart(2, '0');
  const minute = String(timestamp.getMinutes()).padStart(2, '0');
  const second = String(timestamp.getSeconds()).padStart(2, '0');

  const timeStr = `${year}${month}${day}_${hour}${minute}${second}`;

  return `${sanitized}_${timeStr}.md`;
}

/**
 * Attempt primary function, fallback on error
 */
async function attemptWithFallback(primaryFn, fallbackFn, context = '') {
  try {
    return await primaryFn();
  } catch (error) {
    console.error(`${context} failed, using fallback:`, error.message);
    return await fallbackFn();
  }
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Validate article content
 */
function validateArticle(content, targetWords, tolerance = 0.1) {
  const wordCount = content.length; // Approximate for Chinese
  const minWords = targetWords * (1 - tolerance);
  const maxWords = targetWords * (1 + tolerance);

  return {
    valid: wordCount >= minWords && wordCount <= maxWords,
    wordCount,
    targetWords,
    minWords,
    maxWords
  };
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Save JSON file
 */
function saveJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Load JSON file
 */
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Append to log file
 */
function appendLog(seriesId, message) {
  const logPath = path.join(getSeriesDir(seriesId), 'errors.log');
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logPath, logEntry, 'utf8');
}

/**
 * Get series directory path
 */
function getSeriesDir(seriesId) {
  return path.join(DATA_DIR, seriesId);
}

/**
 * Get series metadata path
 */
function getMetadataPath(seriesId) {
  return path.join(getSeriesDir(seriesId), 'metadata.json');
}

/**
 * Get series outline path
 */
function getOutlinePath(seriesId) {
  return path.join(getSeriesDir(seriesId), 'outline.json');
}

/**
 * Get article file path with descriptive name
 */
function getArticlePath(seriesId, articleTitle, timestamp) {
  const filename = generateDescriptiveFilename(articleTitle, timestamp);
  return path.join(getSeriesDir(seriesId), filename);
}

/**
 * Get article path by number (for backward compatibility)
 */
function getArticlePathByNumber(seriesId, articleNumber) {
  const num = String(articleNumber).padStart(2, '0');
  return path.join(getSeriesDir(seriesId), `${num}.md`);
}

/**
 * List all series
 */
function listAllSeries() {
  ensureDir(DATA_DIR);
  const dirs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  return dirs.map(seriesId => {
    const metadataPath = getMetadataPath(seriesId);
    const metadata = loadJson(metadataPath);
    return metadata || { id: seriesId, status: 'unknown' };
  });
}

/**
 * Get series status with detailed info
 */
function getSeriesStatus(seriesId) {
  const metadata = loadJson(getMetadataPath(seriesId));
  if (!metadata) {
    return { error: 'Series not found' };
  }

  const outline = loadJson(getOutlinePath(seriesId));
  const seriesDir = getSeriesDir(seriesId);

  // Count generated articles (both old and new naming)
  const generatedArticles = [];
  if (outline && outline.articles) {
    for (const article of outline.articles) {
      // Check for new descriptive filenames
      const files = fs.readdirSync(seriesDir);
      const articleFile = files.find(f =>
        f.startsWith(article.title.substring(0, 20)) && f.endsWith('.md')
      );

      if (articleFile) {
        generatedArticles.push({
          number: article.number,
          title: article.title,
          filename: articleFile
        });
      }
    }
  }

  return {
    ...metadata,
    outline: outline ? outline.articles.length : 0,
    generated: generatedArticles.length,
    generatedArticles
  };
}

module.exports = {
  generateSeriesId,
  generateDescriptiveFilename,
  attemptWithFallback,
  retryWithBackoff,
  validateArticle,
  ensureDir,
  saveJson,
  loadJson,
  appendLog,
  getSeriesDir,
  getMetadataPath,
  getOutlinePath,
  getArticlePath,
  getArticlePathByNumber,
  listAllSeries,
  getSeriesStatus,
  DATA_DIR
};
