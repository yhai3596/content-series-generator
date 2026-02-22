---
name: content-series-generator-v2
description: Enhanced automated content series generation with intelligent outline creation, real-time news integration (with fallback), batch content generation, and one-click publishing. Use when users want to create article series, generate multiple related articles, or batch publish content. Triggers on "系列文章", "批量生成", "content series", or requests to create multiple articles on a topic.
---

# Content Series Generator V2

Enhanced version with intelligent outline generation, news research integration, and robust error handling.

## Required Parameters Checklist

When creating a series, users must provide ALL of the following parameters:

### ✅ Parameter Input Format

**Complete Example**:
```
创建系列文章：
✅ 系列名称：GEO入门到精通
✅ 目标读者：企业营销人员
✅ 写作风格：narrative-deep
✅ 文章数量：10篇
✅ 每篇字数：2500字
```

### Parameter Validation

If any parameter is missing, Claude will display a checklist:

```
参数完整度：2/5 ⚠️

✅ 主题：GEO（已识别）
✅ 目标读者：企业营销人员
⬜ 系列名称（例如：GEO入门到精通）
⬜ 写作风格（推荐：narrative-deep）
⬜ 文章数量（例如：10篇）
⬜ 每篇字数（例如：2500字）

请补充缺失的参数。
```

**Icons**:
- ✅ = Parameter provided
- ⬜ = Parameter missing
- ⚠️ = Incomplete
- ✓ = All complete

### Required Parameters

1. **系列名称 (series_name)** - Required
   - Example: "GEO入门到精通"
   - Used in article titles

2. **目标读者 (target_audience)** - Required
   - Example: "企业营销人员"、"创业者"、"内容运营"
   - Influences content depth and tone

3. **写作风格 (writing_style)** - Required
   - Options:
     - `narrative-deep` - 叙述深度型（人性化，推荐）
     - `concise-bullet` - 简洁列表型（AI风格）
     - `formal` - 正式商务型
     - `casual` - 轻松对话型
     - `technical` - 技术深度型

4. **文章数量 (article_count)** - Required
   - Example: 10篇
   - Range: 3-50 articles

5. **每篇字数 (words_per_article)** - Required
   - Example: 2500字
   - Range: 1000-5000 words

### Article Title Format

**Format**: `{系列名称}系列（{数字}）— {文章主题}`

**Examples**:
- GEO入门到精通系列（1）— 企业为什么要做GEO
- GEO入门到精通系列（2）— GEO与SEO的本质区别
- GEO入门到精通系列（3）— 如何制定GEO策略

**Rules**:
- Use Chinese parentheses （）for numbers
- Use em dash — (not hyphen -) as separator
- Series name appears in every title
- Each article has unique topic

## Core Improvements Over V1

1. **Intelligent Outline Generation**: AI-powered outline with keyword research and audience analysis
2. **News Integration with Fallback**: Attempts real-time news search, gracefully falls back to knowledge-based generation
3. **Enhanced File Naming**: Articles saved as `{title}_{timestamp}.md` for better organization
4. **Progress Tracking**: Real-time task-based progress management
5. **Error Recovery**: Automatic retry and resume capabilities
6. **Quality Review Integration**: Automatic content quality evaluation after generation with scoring and improvement suggestions

## Quick Start

### Create a Series

```
"创建一个关于AI制造业的系列文章，10篇，每篇3500字"
```

or

```
"Create a manufacturing AI series, 10 articles, 3500 words each"
```

Claude will:
1. Generate intelligent outline with keyword research
2. Attempt news research (with graceful fallback if unavailable)
3. Create task list for progress tracking
4. Generate articles serially with real-time updates
5. **Auto-review each article** (quality scoring and suggestions)
6. Save with descriptive filenames: `{title}_{timestamp}.md`
7. Publish to B4A platform
8. Return all article URLs

## Workflow

### Task Management Strategy (CRITICAL)

**MUST create comprehensive task list at start of series generation**. This ensures:
- ✅ No steps are skipped (especially quality review)
- ✅ Progress is visible to user in real-time
- ✅ Can resume if interrupted
- ✅ All articles go through mandatory quality evaluation

**Task Creation Rules**:
1. Use TaskCreate BEFORE starting each major phase
2. Use TaskUpdate to mark status changes (pending → in_progress → completed)
3. Create separate sub-tasks for each article generation + quality review pair
4. NEVER skip quality review tasks - they are REQUIRED

**Example Task Structure**:
```
Master Task: "Generate content series: {series_name}"
├─ Sub-task 1: "Generate article 1/5: {title}"
├─ Sub-task 2: "Quality review article 1/5" [REQUIRED]
├─ Sub-task 3: "Generate article 2/5: {title}"
├─ Sub-task 4: "Quality review article 2/5" [REQUIRED]
...
├─ Sub-task N: "Batch publish to B4A"
└─ Sub-task N+1: "Generate final report"
```

### Phase 1: Outline Generation

1. **Parse user request** - Extract topic, count, word count, style
2. **Initialize master task** - Create TaskCreate for entire series
3. **Research phase** (CRITICAL - MUST execute):
   - **Call WebSearch tool** with query: `{topic} 最新趋势 2026` (or `{topic} latest trends 2026` for English)
   - **Set timeout expectation**: 10 seconds max
   - **Handle response**:
     - If successful: Extract keywords, trends, recent news from results
     - If failed/empty:
       - Log error to `{series-id}/errors.log`
       - Set `news_source = "websearch"` in metadata.json
       - Continue with knowledge-based generation
       - Add disclaimer about information currency in outline
   - **Extract insights**: Regardless of success, analyze the topic and extract:
     - Target audience pain points
     - Industry keywords
     - Trending sub-topics
     - Common questions
4. **Generate outline** - Use Claude's knowledge + WebSearch results (if available) to create structured plan
5. **User review** - Present outline for approval/modification

**RESEARCH PHASE MUST-KNOW**:
- ⚠️ WebSearch is NOT a Node.js function - it's a Claude tool you CALL during workflow
- ⚠️ You must ACTIVELY invoke WebSearch tool with specific query
- ⚠️ Don't assume it happens automatically - you need to DO IT
- ⚠️ Document the attempt in metadata.json whether it succeeds or fails

### Phase 2: Content Generation

**CRITICAL**: At the start of Phase 2, create comprehensive task list:

```
📋 系列生成任务清单 (系列ID: {series-id})

Phase 1: 大纲生成 [已完成]
- [x] 参数验证
- [x] 大纲生成
- [x] 用户确认

Phase 2: 内容生成 [进行中]
- [ ] 创建文章任务列表 (每篇一个独立任务)
- [ ] 生成文章 1/{count}
- [ ] 质量评审 1/{count} ⭐ REQUIRED
- [ ] 生成文章 2/{count}
- [ ] 质量评审 2/{count} ⭐ REQUIRED
...

Phase 3: 发布阶段 [待开始]
- [ ] 批量发布到 B4A
- [ ] 收集发布链接
- [ ] 生成最终报告
```

1. **Create task list** - One task per article using TaskCreate
2. **Load writing style guide** - Read `references/writing-style-guide.md` before generating
3. **Serial generation with progress tracking**:
   ```
   ✅ [1/10] GEO入门到精通系列（1）— 企业为什么要做GEO (2,534字)
   ⏳ [2/10] GEO入门到精通系列（2）— GEO与SEO的本质区别 (生成中...)
   ⬜ [3/10] GEO入门到精通系列（3）— 如何制定GEO策略
   ⬜ [4/10] GEO入门到精通系列（4）— 内容优化的核心原则
   ...
   ```
4. **Update task status** - Use TaskUpdate to mark in_progress/completed
5. **Save locally** - Format: `E:\AICoding\article\{series-id}\{title}_{timestamp}.md`
6. **Quality review** - MUST evaluate with content-quality-reviewer skill (REQUIRED)
7. **Review decision** - If score < 85, show suggestions and ask: Accept/Revise/Regenerate
8. **Error handling** - Retry failed articles, log errors

**Progress Display**:
- Use TaskCreate for each article at start
- Use TaskUpdate to mark in_progress when starting generation
- Use TaskUpdate to mark completed when done
- Show real-time progress with icons: ✅ (done) ⏳ (in progress) ⬜ (pending)

**Critical**: Before generating each article, Claude must:
- Read `references/writing-style-guide.md` to understand style requirements
- Apply the selected writing style (narrative-deep, concise-bullet, etc.)
- Follow title format: `{系列名称}系列（{数字}）— {文章主题}`
- Ensure appropriate word count (±10% tolerance)

### Phase 3: Publishing

1. **Batch publish** - Use slash-b4a skill
2. **Collect URLs** - Track all published URLs
3. **Update metadata** - Save publication status
4. **Generate report** - Summary with all URLs

## File Naming Convention

Articles are saved with descriptive names:
```
E:\AICoding\article\{series-id}/
├── metadata.json
├── outline.json
├── AI制造业转型指南_20260221_170315.md
├── 智能工厂实施路径_20260221_170820.md
└── ...
```

Format: `{article_title}_{YYYYMMDD}_{HHMMSS}.md`

## News Integration Strategy

### Primary: WebSearch
```javascript
// Attempt real-time news search
try {
  const news = await WebSearch({
    query: `${topic} latest trends 2026`,
    limit: 5
  });
  // Use news in outline generation
} catch (error) {
  // Fallback to knowledge-based generation
}
```

### Fallback: Knowledge-Based
- Use Claude's training data knowledge
- Focus on timeless principles and frameworks
- Add disclaimer about information currency
- Still generate high-quality, valuable content

## Error Handling

### Network Failures
- WebSearch timeout → Fallback to knowledge-based
- B4A publish failure → Retry with exponential backoff
- Log all failures to `{series-id}/errors.log`

### Generation Interruptions
- Save progress after each article
- Resume from last completed article
- Preserve all generated content

### Validation
- Check article word count (±10% tolerance)
- Verify file saved successfully
- Confirm B4A publish response

## Scripts

### generate-outline-v2.js
Enhanced outline generation with news research and fallback logic.

**Usage:**
```bash
node scripts/generate-outline-v2.js "<topic>" --articles=10 --words=3500 --style=soul-scribe-c
```

**Features:**
- Attempts WebSearch for current trends
- Graceful fallback to knowledge-based generation
- Keyword extraction and audience analysis
- Structured JSON output

### generate-content-v2.js
Serial content generation with progress tracking.

**Usage:**
```bash
node scripts/generate-content-v2.js <series-id> --article=1
```

**Features:**
- Generates single article from outline
- Saves with descriptive filename
- Updates progress metadata
- Error logging

### publish-series-v2.js
Batch publishing with retry logic.

**Usage:**
```bash
node scripts/publish-series-v2.js <series-id> --platform=b4a
```

**Features:**
- Batch publish all articles
- Retry failed publishes (3 attempts)
- Collect and return all URLs
- Update metadata with publish status

### utils-v2.js
Enhanced utility functions.

**New functions:**
- `generateDescriptiveFilename(title, timestamp)` - Create descriptive filenames
- `attemptWithFallback(primary, fallback)` - Try primary, fallback on error
- `retryWithBackoff(fn, maxRetries)` - Exponential backoff retry
- `validateArticle(content, targetWords)` - Validate article quality

## Data Structure

### metadata.json
```json
{
  "id": "series-20260221-a1b2",
  "topic": "AI制造业转型",
  "created_at": "2026-02-21T17:03:15+08:00",
  "articles_count": 10,
  "words_per_article": 3500,
  "style": "soul-scribe-c",
  "status": "published",
  "news_source": "websearch|fallback",
  "published_urls": [...]
}
```

### outline.json
```json
{
  "topic": "AI制造业转型",
  "keywords": ["智能制造", "数字化转型", "工业4.0"],
  "audience": "制造业管理者和决策者",
  "news_integrated": true,
  "articles": [
    {
      "number": 1,
      "title": "AI制造业转型指南",
      "subtitle": "从传统到智能的跨越",
      "key_points": [...],
      "target_words": 3500
    }
  ]
}
```

## Writing Styles

**IMPORTANT**: Before generating any article, read `references/writing-style-guide.md` to understand detailed writing requirements and avoid AI-generated patterns.

### Key Requirements for All Styles

**Anti-AI Patterns** (Must Avoid):
- ❌ Short sentence stacking (consecutive sentences <10 words)
- ❌ Bullet-point paragraphs (single sentence + bullets)
- ❌ Lack of transitions between sections
- ❌ Excessive code blocks for simple content

**Quality Standards**:
- ✅ Each paragraph: 3-8 sentences, 80+ words
- ✅ 60% narrative paragraphs, 40% structured content
- ✅ Varied sentence lengths (short/medium/long mix)
- ✅ Natural transitions and flow
- ✅ Context + Explanation + Example for each key point

### soul-scribe-c (Default)
- Summary table at beginning
- Scene-based introduction (100-150 words)
- Deep analysis with data (100-150 words per paragraph)
- Practical recommendations with examples
- Conversational yet professional tone
- **Read writing-style-guide.md for detailed requirements**

### formal
- Professional business writing
- Data-driven arguments
- Executive summary
- Clear structure
- Longer paragraphs (150-200 words)

### casual
- Conversational and friendly
- Personal anecdotes
- Accessible language
- Engaging tone
- Shorter paragraphs (80-120 words)

### technical
- Deep technical analysis
- Code examples with narrative context
- Architecture diagrams
- Implementation details
- Still maintain narrative flow (not just code dumps)

## Advanced Usage

### Custom Style with News Research
```
"Create a tech trends series, 5 articles, 4000 words, technical style, include latest news"
```

### Resume Interrupted Series
```
"Continue generating series-20260221-a1b2 from article 5"
```

### Regenerate Single Article
```
"Regenerate article 3 in series-20260221-a1b2 with more technical depth"
```

### Check Series Status
```
"Show status of series-20260221-a1b2"
```

## Integration Points

### slash-b4a Skill
- Used for B4A platform publishing
- Handles authentication and API calls
- Returns published URLs

### WebSearch Tool
- Primary source for current trends
- Fallback gracefully if unavailable
- Timeout: 10 seconds

### TaskCreate/TaskUpdate
- Progress tracking
- User visibility into generation status
- Resume capability

## WeChat Content Integration

**Reserved interface for future wechat-content-extractor skill integration**

The content-series-generator-v2 has reserved a standardized interface for extracting and rewriting WeChat articles. Future wechat-content-extractor skill can plug into this seamlessly.

### How It Works

**Three integration points have been prepared:**

### 1. Configuration File (`config/wechat-crawler.json`)

A comprehensive configuration template is ready:

```javascript
{
  "crawler_strategy": {
    "strategy": "cookie",  // cookie | playwright | proxy | manual
    "fallback_strategies": ["manual", "playwright"]
  },
  "data_output": {
    "format": "standardized",
    "fields": ["title", "author", "publish_date", "content_html", "content_text"]
  }
}
```

**Supported Strategies**:
- **cookie**: Extract articles using WeChat API with manually obtained cookie
- **playwright**: Browser automation to bypass anti-crawling (simulates real user)
- **proxy**: Intercept WeChat requests via AnyProxy (batch extraction)
- **manual**: Manual copy-paste with interactive prompts

### 2. Extractor Interface (`scripts/wechat-extractor.js`)

Pre-built class with standardized interface:

```javascript
const { WeChatArticleExtractor } = require('./scripts/wechat-extractor');

const extractor = new WeChatArticleExtractor({ strategy: 'cookie' });

// Extract single article
const article = await extractor.extractArticle('https://mp.weixin.qq.com/s/xxx');

// Returns standardized format:
{
  title: "Article Title",
  author: "Author Name",
  publish_date: "2026-01-15",
  content_html: "<div>...</div>",
  content_text: "Clean text content...",
  metadata: {
    extracted_at: "2026-02-22T10:30:00Z",
    strategy: "cookie",
    word_count: 1542
  }
}
```

**Integration Flow**:
1. Future wechat-content-extractor skill implements actual extraction logic
2. Skill exports standardized `article` object
3. Content generator receives article and applies rewriting
4. Process through quality review
5. Publish to B4A

### 3. Integration Pattern (Future Implementation)

**Example workflow for extracting and rewriting WeChat articles:**

```javascript
// Step 1: Extract article (wechat-content-extractor skill)
const rawArticle = await wechatExtractor.extractArticle(wechatUrl);

// Step 2: Transform to series format
const seriesParams = {
  series_name: `${rawArticle.author}精选`,
  target_audience: "科技爱好者",
  writing_style: "narrative-deep",
  article_count: 5,  // Series continuation based on article
  words_per_article: 3000
};

// Step 3: Generate outline with expanded insights
const outline = await generateOutline(`${rawArticle.title}深度解析系列`, seriesParams);

// Step 4: Generate and publish series
await generateContentSeries(outline, seriesParams, rawArticle);
```

### Manual Integration (Current Workaround)

Before wechat-content-extractor skill is ready:

```bash
# Use manual mode to extract article
node scripts/wechat-extractor.js --manual --save

# Then use extracted content for series generation
node scripts/generate-outline-v2.js "${WECHAT_ARTICLE_TOPIC}" --articles=5
```

**Full workflow**:
```bash
# 1. Extract WeChat article (manual mode, creates temp file)
cd ~/.claude/skills/content-series-generator-v2
node scripts/wechat-extractor.js --manual

# 2. Copy extracted content
# File saved to: ./data/wechat_articles/{title}_{timestamp}.json

# 3. Generate series based on extracted topic
node scripts/generate-outline-v2.js "${topic}" --articles=5 --words=3000

# 4. Edit outline.json to incorporate WeChat article insights

# 5. Generate and publish series as usual
```

### Configuration Reference

**File**: `config/wechat-crawler.json`

**Key Settings**:
```json
{
  "cookie_method": {
    "enabled": true,
    "credentials": {
      "cookie": "obtained_from_browser",
      "token": "wechat_api_token",
      "biz": "official_account_id"
    }
  },
  "playwright_method": {
    "enabled": false,
    "browser_options": {
      "headless": false,
      "args": ["--disable-blink-features=AutomationControlled"]
    }
  },
  "proxy_method": {
    "enabled": false,
    "listen_port": 8001
  },
  "rate_limit": {
    "requests_per_minute": 10,
    "delay_between_requests": 2000
  }
}
```

### Next Steps for wechat-content-extractor Skill

To implement full integration:

1. **Create wechat-content-extractor skill directory**:
   ```
   ~/.claude/skills/wechat-content-extractor/
   ├── SKILL.md
   ├── scripts/
   │   └── wechat-crawler.js  (actual implementation)
   └── config/
       └── wechat-api-keys.json
   ```

2. **Implement Strategy Classes**:
   - `CookieStrategy` - Handle WeChat API with cookie
   - `PlaywrightStrategy` - Browser automation with anti-detection
   - `ProxyStrategy` - AnyProxy interception for batch extraction
   - `ManualStrategy` - Interactive prompts

3. **Update wechat-extractor.js**:
   - Replace "TODO" sections with actual implementation
   - Keep standardized output format
   - Maintain fallback chain

4. **Add integration hooks to content-series-generator-v2**:
   ```javascript
   // In generate-content-v2.js
   const { WeChatArticleExtractor } = require('../wechat-content-extractor');

   if (sourceArticle && sourceArticle.from_wechat) {
     const additionalInsights = await extractWeChatContent(sourceArticle.url);
     content = incorporateInsights(content, additionalInsights);
   }
   ```

5. **Test and validate**:
   - Extract 5-10 articles using each strategy
   - Verify content quality and completeness
   - Test integration with series generation
   - Validate B4A publishing

### Known Limitations

**Current Status** (2026-02-22):
- ✅ Configuration file ready
- ✅ Interface specification defined
- ✅ Basic framework implemented
- ❌ Actual extraction logic is "TODO"/stub
- ❌ No Cookie/Playwright/Proxy implementation
- ❌ Manual mode works (copy-paste)

**To fully enable**:
1. Develop wechat-content-extractor skill (external project)
2. Implement strategy classes (2-3 weeks development)
3. Add cookie rotation and error handling
4. Test anti-crawling bypass techniques
5. Create user documentation

### Troubleshooting WeChat Integration

**Problem**: Cannot extract WeChat articles
**Diagnosis**:
1. Check if wechat-content-extractor skill exists: `ls ~/.claude/skills/`
2. Verify config/wechat-crawler.json exists and is valid JSON
3. Check if selected strategy is enabled in config
4. For cookie method: Verify cookie and token are current (expire after 2-4 hours)

**Quick Fix** (Before skill is ready):
1. Use `--manual` mode: `node scripts/wechat-extractor.js --manual --save`
2. Or use wechat-content-creator skill to generate original content
3. Or use slash-b4a to rewrite with different URL sources

**Future Enhancement**:
- Add WeChat verification code handling
- Implement cookie auto-refresh
- Add queue system for batch extraction
- Integrate with content quality reviewer
- Support multi-account rotation

## Configuration

### Hybrid Research MCP Setup

To enable real-time news and trend research, configure the Hybrid Research MCP with your API keys.

**Step 1: Create Configuration File**

Create `~/.claude/skills/content-series-generator-v2/config/research-providers.json`:

```json
{
  "firecrawl": {
    "enabled": true,
    "api_key": "YOUR_FIRECRAWL_API_KEY_HERE",
    "timeout": 10000,
    "max_pages": 3
  },
  "brave_search": {
    "enabled": false,
    "api_key": "YOUR_BRAVE_API_KEY_HERE",
    "timeout": 8000
  },
  "serpapi": {
    "enabled": false,
    "api_key": "YOUR_SERPAPI_KEY_HERE",
    "timeout": 10000
  },
  "rss_feeds": {
    "enabled": true,
    "feeds": [
      "https://www.anthropic.com/news/rss",
      "https://github.com/topics/claude-ai.atom",
      "https://medium.com/feed/tag/artificial-intelligence"
    ]
  },
  "github": {
    "enabled": true,
    "token": "YOUR_GITHUB_TOKEN_HERE",
    "search_repos": true,
    "search_issues": true
  },
  "fallback_order": [
    "firecrawl",
    "rss_feeds",
    "github",
    "brave_search",
    "serpapi"
  ]
}
```

**Step 2: Update API Keys**

Replace `YOUR_*_API_KEY_HERE` with your actual API keys:

- **Firecrawl API Key**: Get from https://firecrawl.dev
  - Recommended: Most reliable for JavaScript-rendered pages
  - Enable JavaScript rendering for dynamic content

- **GitHub Token**: Get from https://github.com/settings/tokens
  - Only needs `public_repo` scope for search
  - No additional cost for search API (within limits)

- **Brave Search API** (Optional): Get from https://brave.com/search/api
  - Alternative if Firecrawl fails
  - Provides clean search results

- **SerpAPI** (Optional): Get from https://serpapi.com
  - Google search results
  - May incur costs

**Step 3: Test Configuration**

```bash
cd ~/.claude/skills/content-series-generator-v2
node scripts/test-research-mcp.js "Claude Skills latest trends"
```

Expected output:
```
✅ Testing research providers...
[1/5] Firecrawl: ✅ Success (3 results)
[2/5] RSS Feeds: ✅ Success (8 articles)
[3/5] GitHub: ✅ Success (12 repositories)
✅ Final source: hybrid-firecrawl
✅ Research completed with 23 total results
```

### How Hybrid Research Works

The hybrid research system follows this priority order:

1. **Firecrawl** (Highest priority)
   - Crawls: Anthropic official site, tech blogs, documentation
   - Extracts: Latest announcements, feature updates, case studies
   - Best for: Official and authoritative content

2. **RSS Feeds**
   - Aggregates: Anthropic blog, GitHub topics, Medium articles
   - Extracts: Recent articles, trending topics, community discussions
   - Best for: News and community content

3. **GitHub API**
   - Searches: Repositories with topic keywords, recent issues
   - Extracts: Popular projects, common problems, implementation examples
   - Best for: Technical implementations and real-world usage

4. **Brave Search / SerpAPI** (Optional)
   - Searches: Web for recent news and articles
   - Best for: Broad coverage when other sources fail

5. **Knowledge Fallback** (Always available)
   - Uses: Claude's training data and reasoning
   - Best for: Foundational concepts and timeless principles

### Environment Variables (Alternative Method)

Instead of config file, you can use environment variables:

```bash
# Add to ~/.claude/.env
export FIRECRAWL_API_KEY=your_key_here
export GITHUB_TOKEN=your_token_here
export BRAVE_API_KEY=your_key_here  # Optional
export SERPAPI_KEY=your_key_here     # Optional
```

### Troubleshooting Configuration

### Configuration File Not Found
**Symptom**: `Error: config/research-providers.json not found`
**Solution**: Create the config file following Step 1 above

### API Key Invalid
**Symptom**: `401 Unauthorized` errors
**Solution**:
1. Verify API key is correct
2. Check if API key has sufficient quota
3. Try regenerating the API key
4. Check provider dashboard for error logs

### All Research Providers Fail
**Symptom**: `finalSource: "fallback"` every time
**Diagnosis**:
1. Check internet connectivity
2. Verify all API keys are valid
3. Review `~/.claude/logs/research-mcp.log` for detailed errors
4. Test individual providers with: `node scripts/test-research-mcp.js --provider=firecrawl`

### Research Too Slow
**Symptom**: Research phase takes >30 seconds
**Solution**:
1. Reduce `timeout` values in config (e.g., 5000ms)
2. Set `enabled: false` for slower providers
3. Reduce `max_pages` for Firecrawl
4. Use `fallback_order` to prioritize faster providers

## Validation Checklist

**MUST verify before marking series complete**:

### Phase 1: Outline Generation
**CRITICAL**: Hybrid research MUST be executed
- [ ] All 5 parameters collected (series_name, target_audience, writing_style, article_count, words_per_article)
- [ ] **Hybrid research MCP was called** (not just mentioned)
- [ ] Configuration file exists: `config/research-providers.json`
- [ ] At least one API key is configured (Firecrawl recommended)
- [ ] Research results documented in outline (or fallback noted)
- [ ] `news_source` set in metadata.json (`"hybrid-firecrawl"`, `"hybrid-rss"`, `"hybrid-github"`, or `"fallback"`)
- [ ] Keywords and audience insights extracted from research results
- [ ] Outline generated and saved to outline.json
- [ ] User approved outline (or skipped with explicit consent)

**Research Verification**:
```
✅ Evidence of research execution:
   - Hybrid MCP invoked: Yes
   - Final source: hybrid-firecrawl | hybrid-rss | hybrid-github | fallback
   - Research timestamp: {timestamp}
   - Total results obtained: {count}
   - Log file: {series-id}/research.log
```

### Phase 2: Content Generation
- [ ] Master task created using TaskCreate
- [ ] Sub-task created for each article (1 task per article)
- [ ] All articles generated and saved with correct naming format
- [ ] **Quality review completed for EVERY article** (score + suggestions)
- [ ] All articles meet minimum score threshold (≥ 85) or user explicitly accepted lower scores
- [ ] Task status updated for each step (TaskUpdate used consistently)

### Phase 3: Publishing
- [ ] All articles published to B4A (or user explicitly skipped)
- [ ] All publish URLs collected and saved to metadata.json
- [ ] Final REPORT.md generated
- [ ] Task list marked complete

**If any item is missing, SERIES IS NOT COMPLETE** - go back and complete it.

## Troubleshooting

### Quality Review Skipped (CRITICAL ERROR)
**Symptom**: Articles published without quality scores
**Root Cause**: Step marked as "optional" in previous skill version
**Solution**:
1. Immediately stop and use content-quality-reviewer on all articles
2. Re-publish if scores are below threshold
3. Update skill.md to make quality review MANDATORY (already fixed in V2.1)

### Hybrid Research MCP Errors
**Symptom**: `Error: Cannot find research-mcp module` or `Error: No research providers available`
**Diagnosis**:
1. Check if `config/research-providers.json` exists
2. Verify at least one API key is configured
3. Check log file: `~/.claude/logs/research-mcp.log`

**Solution**:
1. Run test script to verify setup: `node scripts/test-research-mcp.js`
2. Follow Configuration section to set up API keys
3. Ensure all required npm packages are installed: `npm install` in skill directory

### All Research Providers Fail
**Symptom**: `news_source` always shows "fallback" in metadata.json
**Root Cause**: No research provider succeeded (all returned errors or empty results)
**Diagnosis Steps**:
1. Check `{series-id}/research.log` for detailed error messages
2. Verify API keys are valid and have quota remaining
3. Test individual providers:
   ```bash
   node scripts/test-research-mcp.js --provider=firecrawl
   node scripts/test-research-mcp.js --provider=github
   ```

**Solution**:
1. Update `config/research-providers.json` with valid API keys
2. Enable additional providers as backup (e.g., enable Brave Search if Firecrawl fails)
3. Check internet connectivity
4. Review provider dashboards for API usage and errors

**Prevention**:
- Set up at least 2 providers (e.g., Firecrawl + GitHub) for redundancy
- Monitor API quota and set up alerts
- Test configuration weekly with: `node scripts/test-research-mcp.js`

### Research Returns Outdated Results
**Symptom**: Research results are from 2024 or earlier, not current
**Root Cause**: Some sources cache results or are not updated frequently
**Solution**:
1. Prioritize Firecrawl (crawls live websites)
2. Disable RSS feeds that are not frequently updated
3. Adjust GitHub search to use `pushed:>2025-01-01` filter
4. Verify query includes current year: `"{topic} 2026"`

**Impact of Research Failures**:
- Content may lack latest trends and news
- Reduced relevance for time-sensitive topics
- Cannot provide cutting-edge insights to readers
- May require manual research supplementation

### B4A Publishing Failed
**Symptom**: "Publish failed" for specific articles
**Solution**:
1. Check B4A credentials in slash-b4a skill
2. Retry individual article: `node scripts/publish-series-v2.js <series-id> --article=3`
3. Check network connection

### File Naming Issues
**Symptom**: Special characters in filename
**Solution**: Automatic sanitization in `generateDescriptiveFilename()`
**Allowed**: Chinese, English, numbers, hyphens, underscores

### Generation Interrupted
**Symptom**: Series incomplete
**Solution**: Resume with "Continue series-{id}"
**Recovery**: All completed articles preserved

### Task List Not Created (CRITICAL ERROR)
**Symptom**: No task tracking visible to user
**Root Cause**: Skipped TaskCreate at workflow start
**Solution**:
1. Create task list immediately
2. Retroactively document completed steps
3. Follow Task Management Strategy in future (see Workflow section)

## Best Practices

### Task Management (CRITICAL - DO NOT SKIP)

**MUST follow task creation workflow**:

1. **Create master task** at series start
   - Subject: `Generate content series: {series_name}`
   - Description: Include all parameters and timeline

2. **Create sub-tasks for each article**
   - Pattern: `Article {n}/{total}: {title}`
   - Always pair with quality review task

3. **Update status in real-time**
   - Use TaskUpdate immediately after each step
   - Never batch-update at the end

4. **Mandatory quality review**
   - Call content-quality-reviewer for EVERY article
   - No exceptions, even if "optional" in workflow

**Example Task Sequence**:
```
Task 1: Generate series outline
Task 2: User approve outline
Task 3: Generate article 1/5
Task 4: Quality review article 1/5 ⭐ CRITICAL
Task 5: Generate article 2/5
Task 6: Quality review article 2/5 ⭐ CRITICAL
...
Task N: Batch publish to B4A
```

### Content Quality

1. **Review outline before generation** - Saves time if adjustments needed
2. **Monitor first article** - Verify style and quality before batch generation
3. **Check file names** - Ensure titles are descriptive and unique
4. **Backup before publishing** - Series data in `E:\AICoding\article\`
5. **Test with small series first** - Try 3 articles before committing to 10+
6. **ALWAYS run content-quality-reviewer** - Never skip quality evaluation
7. **Address low scores** - If score < 85, revise before publishing

## Version History

### V2.3 (Current) - 2026-02-22
**MAJOR UPDATE: Hybrid Research MCP Integration**

**NEW FEATURES**:
- ✅ **Replaced WebSearch with Hybrid Research MCP** - Multi-source research with automatic fallback
- ✅ **Added Configuration section** - Complete setup guide for API keys
- ✅ **Integrated 4 research providers**:
  - Firecrawl (primary - for live website crawling)
  - RSS Aggregator (for tech blogs and news)
  - GitHub API (for repositories and issues)
  - Brave/SerpAPI (optional web search)
- ✅ **Automatic fallback chain** - If one provider fails, automatically tries next
- ✅ **Enhanced validation checklist** - Verify research execution and API configuration
- ✅ **Updated troubleshooting** - Provider-specific error diagnosis and solutions
- ✅ **Configuration file template** - `config/research-providers.json` with examples

**IMPORTANT NOTES**:
- ⚠️ **BREAKING CHANGE**: WebSearch tool replaced with Hybrid Research MCP
- ⚠️ Users MUST configure API keys before using research feature
- ⚠️ Firecrawl API key recommended for best results
- ⚠️ All research attempts are logged for debugging

### V2.2 - WebSearch Fix
**CRITICAL FIXES**:
- Fixed WebSearch never being called (only described, not invoked)
- Added explicit invocation instructions
- Added verification checklists
- Added troubleshooting guide for WebSearch issues

**Previous Issues**:
- WebSearch tool never actually invoked during Phase 1 research
- `news_source` always showed "fallback" instead of "websearch"

### V2.1 - Task Management Fix
**CRITICAL FIXES**:
- Made quality review MANDATORY (was optional)
- Added Task Management Strategy section
- Added standardized task list creation
- Enhanced validation checklists

**Previous Issues**:
- Quality review step marked as "(optional)" led to skipping
- No standardized task tracking mechanism

### V2.0 - Initial V2 Release
**Initial V2 Features**:
- Intelligent outline with news research
- Descriptive file naming: `{title}_{timestamp}.md`
- Enhanced error handling and retry logic
- Task-based progress tracking (not enforced)

**Known Issues** (fixed in later versions):
- WebSearch described but not explicitly invoked (V2.2)
- Quality review marked as optional (V2.1)
- Weak task management (V2.1)

### V1.0
- Basic outline generation
- Simple file naming: `01.md`, `02.md`
- No news integration
- Limited error handling

## Support

For issues:
1. Check `E:\AICoding\article\{series-id}\errors.log`
2. Review metadata.json for status
3. Verify task list for progress
4. Check B4A credentials if publishing fails
