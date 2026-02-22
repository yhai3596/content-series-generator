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

### Phase 1: Outline Generation

1. **Parse user request** - Extract topic, count, word count, style
2. **Research phase** (with fallback):
   - Attempt WebSearch for latest trends and news
   - If WebSearch fails: Use knowledge-based generation
   - Extract keywords and audience insights
3. **Generate outline** - Create structured article plan
4. **User review** - Present outline for approval/modification

### Phase 2: Content Generation

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
6. **Quality review** - Auto-evaluate with content-quality-reviewer skill (optional)
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

## Troubleshooting

### WebSearch Unavailable
**Symptom**: "WebSearch failed" in logs
**Solution**: Automatic fallback to knowledge-based generation
**Impact**: Content still high-quality, may lack latest news

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

## Best Practices

1. **Review outline before generation** - Saves time if adjustments needed
2. **Monitor first article** - Verify style and quality before batch generation
3. **Check file names** - Ensure titles are descriptive and unique
4. **Backup before publishing** - Series data in `E:\AICoding\article\`
5. **Test with small series first** - Try 3 articles before committing to 10+

## Version History

### V2 (Current)
- Intelligent outline with news research
- Graceful fallback for WebSearch failures
- Descriptive file naming: `{title}_{timestamp}.md`
- Enhanced error handling and retry logic
- Task-based progress tracking

### V1
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
