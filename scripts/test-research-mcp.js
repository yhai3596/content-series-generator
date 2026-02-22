#!/usr/bin/env node

/**
 * Test research providers for content-series-generator-v2
 * Usage: node test-research-mcp.js "search query" [--provider=firecrawl|tavily|serpapi|all]
 */

const axios = require('axios');
const config = require('../config/research-providers.json');

async function testFirecrawl(query) {
  console.log('\n[1/5] Testing Firecrawl API...');
  try {
    const response = await axios.post('https://api.firecrawl.dev/v0/scrape', {
      url: 'https://www.anthropic.com/news',
      formats: ['markdown']
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.firecrawl.api_key}`
      },
      timeout: config.firecrawl.timeout
    });

    if (response.data && response.data.success) {
      const content = response.data.data.markdown;
      const hasSkills = content.toLowerCase().includes('skill') ||
                        content.toLowerCase().includes('claude code');

      console.log('✅ Firecrawl: SUCCESS');
      console.log(`   - Content length: ${content.length} characters`);
      console.log(`   - Contains "skills" related content: ${hasSkills ? 'Yes' : 'No'}`);
      console.log(`   - URL crawled: https://www.anthropic.com/news`);
      return { success: true, provider: 'firecrawl', results: 1 };
    } else {
      console.log('❌ Firecrawl: FAILED - No data returned');
      return { success: false, provider: 'firecrawl', error: 'No data' };
    }
  } catch (error) {
    console.log(`❌ Firecrawl: FAILED - ${error.message}`);
    return { success: false, provider: 'firecrawl', error: error.message };
  }
}

async function testTavily(query) {
  console.log('\n[2/5] Testing Tavily API...');
  try {
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: config.tavily.api_key,
      query: `Claude Skills latest trends 2025 ${query}`,
      search_depth: config.tavily.search_depth,
      max_results: config.tavily.max_results,
      include_answer: true,
      include_raw_content: true
    }, {
      timeout: config.tavily.timeout
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      const results = response.data.results;
      console.log('✅ Tavily: SUCCESS');
      console.log(`   - Results found: ${results.length}`);
      console.log(`   - Answer snippet: "${response.data.answer ? response.data.answer.substring(0, 150) + '...' : 'N/A'}"`);
      console.log(`   - Top 3 sources:`);
      results.slice(0, 3).forEach((result, i) => {
        console.log(`     ${i + 1}. ${result.title} (${result.url})`);
      });
      return { success: true, provider: 'tavily', results: results.length };
    } else {
      console.log('❌ Tavily: FAILED - No results');
      return { success: false, provider: 'tavily', error: 'No results' };
    }
  } catch (error) {
    console.log(`❌ Tavily: FAILED - ${error.message}`);
    return { success: false, provider: 'tavily', error: error.message };
  }
}

async function testSerpAPI(query) {
  console.log('\n[3/5] Testing SerpAPI...');
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: config.serpapi.api_key,
        engine: config.serpapi.engine,
        q: `Claude Skills latest trends 2025 ${query}`,
        location: config.serpapi.location,
        hl: 'zh-CN'
      },
      timeout: config.serpapi.timeout
    });

    if (response.data && response.data.organic_results && response.data.organic_results.length > 0) {
      const results = response.data.organic_results;
      console.log('✅ SerpAPI: SUCCESS');
      console.log(`   - Results found: ${results.length}`);
      console.log(`   - Search location: ${config.serpapi.location}`);
      console.log(`   - Top 3 results:`);
      results.slice(0, 3).forEach((result, i) => {
        console.log(`     ${i + 1}. ${result.title} (${result.link})`);
        console.log(`        Snippet: "${result.snippet ? result.snippet.substring(0, 100) + '...' : 'N/A'}"`);
      });
      return { success: true, provider: 'serpapi', results: results.length };
    } else {
      console.log('❌ SerpAPI: FAILED - No results');
      return { success: false, provider: 'serpapi', error: 'No results' };
    }
  } catch (error) {
    console.log(`❌ SerpAPI: FAILED - ${error.message}`);
    return { success: false, provider: 'serpapi', error: error.message };
  }
}

async function testRSSFeeds(query) {
  console.log('\n[4/5] Testing RSS Feeds...');
  try {
    const Parser = require('rss-parser');
    const parser = new Parser({
      timeout: config.rss_feeds.timeout
    });

    let totalItems = 0;
    console.log(`   - Testing ${config.rss_feeds.feeds.length} RSS feeds...`);

    for (const feedUrl of config.rss_feeds.feeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        const relevantItems = feed.items.filter(item =>
          item.title && item.title.toLowerCase().includes(query.toLowerCase())
        );
        totalItems += relevantItems.length;
        console.log(`     • ${new URL(feedUrl).hostname}: ${relevantItems.length} relevant items`);
      } catch (error) {
        console.log(`     • ${new URL(feedUrl).hostname}: Skipped (error)`);
      }
    }

    console.log('✅ RSS Feeds: SUCCESS');
    console.log(`   - Total relevant items: ${totalItems}`);
    return { success: true, provider: 'rss_feeds', results: totalItems };
  } catch (error) {
    console.log(`❌ RSS Feeds: FAILED - ${error.message}`);
    return { success: false, provider: 'rss_feeds', error: error.message };
  }
}

async function testGitHub(query) {
  console.log('\n[5/5] Testing GitHub API...');

  if (!config.github.token || config.github.token.includes('placeholder')) {
    console.log('⚠️ GitHub: SKIPPED (token is placeholder)');
    return { success: false, provider: 'github', error: 'Token not configured' };
  }

  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: `${query} created:>2024-01-01`,
        sort: 'updated',
        order: 'desc',
        per_page: 5
      },
      headers: {
        'Authorization': `token ${config.github.token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      timeout: config.github.timeout
    });

    if (response.data && response.data.items && response.data.items.length > 0) {
      const repos = response.data.items;
      console.log('✅ GitHub: SUCCESS');
      console.log(`   - Repositories found: ${repos.length}`);
      console.log(`   - Top repositories:`);
      repos.forEach((repo, i) => {
        console.log(`     ${i + 1}. ${repo.full_name} (${repo.stargazers_count} ⭐)`);
        console.log(`        ${repo.description ? repo.description.substring(0, 100) + '...' : 'No description'}`);
      });
      return { success: true, provider: 'github', results: repos.length };
    } else {
      console.log('❌ GitHub: FAILED - No repositories found');
      return { success: false, provider: 'github', error: 'No results' };
    }
  } catch (error) {
    console.log(`❌ GitHub: FAILED - ${error.message}`);
    return { success: false, provider: 'github', error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const query = args[0] || "Claude Skills";
  const provider = args.find(arg => arg.startsWith('--provider='))?.split('=')[1] || 'all';

  console.log('='.repeat(70));
  console.log('Hybrid Research MCP Test');
  console.log(`Query: "${query}"`);
  console.log(`Testing: ${provider === 'all' ? 'All providers' : provider.toUpperCase()}`);
  console.log('='.repeat(70));

  const results = [];
  const startTime = Date.now();

  try {
    if (provider === 'all' || provider === 'firecrawl') {
      results.push(await testFirecrawl(query));
    }
    if (provider === 'all' || provider === 'tavily') {
      results.push(await testTavily(query));
    }
    if (provider === 'all' || provider === 'serpapi') {
      results.push(await testSerpAPI(query));
    }
    if (provider === 'all' || provider === 'rss') {
      results.push(await testRSSFeeds(query));
    }
    if (provider === 'all' || provider === 'github') {
      results.push(await testGitHub(query));
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total time: ${duration}s`);
  console.log(`Providers tested: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);

  const successfulResults = results.filter(r => r.success);
  const totalResults = successfulResults.reduce((sum, r) => sum + (r.results || 0), 0);
  console.log(`Total results found: ${totalResults}`);

  if (successfulResults.length > 0) {
    console.log('\n📊 Breakdown:');
    results.forEach(r => {
      const status = r.success ? '✅' : '❌';
      const resultCount = r.results || 0;
      const error = r.error ? ` - ${r.error}` : '';
      console.log(`   ${status} ${r.provider}: ${resultCount} results${error}`);
    });

    const bestProvider = successfulResults.reduce((best, current) => {
      return (current.results || 0) > (best.results || 0) ? current : best;
    });

    console.log(`\n🏆 Best provider: ${bestProvider.provider} (${bestProvider.results} results)`);
    console.log(`\n📝 Recommendation: Use "${bestProvider.provider}" as primary research source`);
  } else {
    console.log('\n⚠️  All providers failed. Fallback to knowledge-based generation only.');
  }

  console.log('='.repeat(70));
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
