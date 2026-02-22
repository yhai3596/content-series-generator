# Content Series Generator V2

Enhanced automated content series generation with intelligent outline creation, real-time news integration (with fallback), and robust error handling.

## What's New in V2

### 🎯 Core Improvements

1. **Intelligent Outline Generation**
   - AI-powered outline with keyword research
   - Audience analysis and targeting
   - Structured article planning

2. **News Integration with Fallback**
   - Attempts WebSearch for latest trends
   - Gracefully falls back to knowledge-based generation
   - No failures due to network issues

3. **Enhanced File Naming**
   - Descriptive filenames: `{title}_{timestamp}.md`
   - Better organization and searchability
   - Supports Chinese and English titles

4. **Robust Error Handling**
   - Automatic retry with exponential backoff
   - Detailed error logging
   - Resume from interruptions

5. **Progress Tracking**
   - Task-based progress management
   - Real-time status updates
   - Clear visibility into generation status

## Installation

This skill is installed at:
```
C:\Users\YH\.claude\skills\content-series-generator-v2\
```

## Quick Start

### Create a Series

Simply tell Claude:

```
"创建一个关于AI制造业的系列文章，10篇，每篇3500字"
```

or

```
"Create a manufacturing AI series, 10 articles, 3500 words each"
```

Claude will automatically:
1. ✅ Initialize series with unique ID
2. ✅ Attempt news research (fallback if unavailable)
3. ✅ Generate intelligent outline
4. ✅ Create task list for tracking
5. ✅ Generate articles serially
6. ✅ Save with descriptive filenames
7. ✅ Publish to B4A
8. ✅ Return all URLs

## Features

### Intelligent Outline Generation

- **Keyword Research**: Extracts relevant keywords for SEO
- **Audience Analysis**: Identifies target readers
- **Content Structure**: Logical article progression
- **News Integration**: Latest trends and data (with fallback)

### File Naming Convention

Articles saved as: `{title}_{YYYYMMDD}_{HHMMSS}.md`

**Examples:**
```
AI制造业转型指南_20260221_170315.md
智能工厂实施路径_20260221_170820.md
数字化转型案例分析_20260221_171205.md
```

**Benefits:**
- Descriptive and searchable
- Chronologically sortable
- Supports Chinese/English
- No special character issues

### News Integration Strategy

**Primary: WebSearch**
```javascript
try {
  const news = await WebSearch({
    query: `${topic} latest trends 2026`,
    limit: 5
  });
  // Use news in outline
} catch (error) {
  // Automatic fallback
}
```

**Fallback: Knowledge-Based**
- Uses Claude's training knowledge
- Focuses on timeless principles
- Still generates high-quality content
- Adds disclaimer about currency

### Error Handling

**Network Failures**
- WebSearch timeout → Automatic fallback
- B4A publish failure → Retry 3 times with backoff
- All errors logged to `errors.log`

**Generation Interruptions**
- Progress saved after each article
- Resume from last completed
- No data loss

**Validation**
- Word count check (±10% tolerance)
- File save verification
- Publish response confirmation

## Data Structure

### Directory Layout

```
E:\AICoding\article\
└── series-20260221-a1b2/
    ├── metadata.json              # Series metadata
    ├── outline.json               # Generated outline
    ├── errors.log                 # Error log (if any)
    ├── AI制造业转型指南_20260221_170315.md
    ├── 智能工厂实施路径_20260221_170820.md
    └── ...
```

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
  "news_source": "websearch",
  "published_urls": [
    {
      "number": 1,
      "title": "AI制造业转型指南",
      "url": "https://b4a.app/...",
      "filename": "AI制造业转型指南_20260221_170315.md"
    }
  ]
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
      "key_points": [
        "AI在制造业的应用现状",
        "转型的关键挑战",
        "成功案例分析"
      ],
      "target_words": 3500
    }
  ]
}
```

## Writing Styles

### soul-scribe-c (Default)
- Summary table at beginning
- Scene-based introduction
- Deep analysis with data
- Practical recommendations
- Conversational tone

### formal
- Professional business writing
- Data-driven arguments
- Executive summary
- Clear structure

### casual
- Conversational and friendly
- Personal anecdotes
- Accessible language
- Engaging tone

### technical
- Deep technical analysis
- Code examples
- Architecture diagrams
- Implementation details

## Usage Examples

### Basic Series Creation

```
User: "创建制造业AI系列，10篇，3500字"

Claude:
1. Initializes series-20260221-a1b2
2. Attempts news research
3. Generates outline with 10 articles
4. Creates 10 tasks for tracking
5. Generates articles serially
6. Saves with descriptive names
7. Publishes to B4A
8. Returns all URLs
```

### Custom Style

```
User: "Create a tech trends series, 5 articles, 4000 words, technical style"

Claude:
- Uses technical writing style
- Includes code examples
- Deep technical analysis
- 4000 words per article
```

### Resume Interrupted Series

```
User: "Continue series-20260221-a1b2 from article 5"

Claude:
- Loads existing series
- Checks completed articles (1-4)
- Resumes from article 5
- Continues to completion
```

### Regenerate Single Article

```
User: "Regenerate article 3 in series-20260221-a1b2 with more data"

Claude:
- Loads article 3 outline
- Regenerates with emphasis on data
- Saves with new timestamp
- Optionally republishes
```

### Check Status

```
User: "Show status of series-20260221-a1b2"

Claude:
- Series: AI制造业转型
- Total: 10 articles
- Generated: 7 articles
- Published: 5 articles
- Status: in_progress
```

## Scripts

### generate-outline-v2.js

Initialize series and prepare for outline generation.

```bash
node scripts/generate-outline-v2.js "AI制造业" --articles=10 --words=3500 --style=soul-scribe-c
```

### generate-content-v2.js

Load article info for content generation.

```bash
node scripts/generate-content-v2.js series-20260221-a1b2 --article=1
```

### publish-series-v2.js

Publish articles with retry logic.

```bash
# Publish all articles
node scripts/publish-series-v2.js series-20260221-a1b2 --platform=b4a

# Publish single article
node scripts/publish-series-v2.js series-20260221-a1b2 --platform=b4a --article=3
```

### utils-v2.js

Enhanced utility functions:
- `generateDescriptiveFilename()` - Create descriptive filenames
- `attemptWithFallback()` - Try primary, fallback on error
- `retryWithBackoff()` - Exponential backoff retry
- `validateArticle()` - Validate article quality
- `appendLog()` - Error logging

## Troubleshooting

### WebSearch Unavailable

**Symptom**: "WebSearch failed" in logs

**Solution**: Automatic fallback to knowledge-based generation

**Impact**: Content still high-quality, may lack latest news

**Check**: `metadata.json` → `news_source: "fallback"`

### B4A Publishing Failed

**Symptom**: "Publish failed" for specific articles

**Solutions**:
1. Check B4A credentials in slash-b4a skill
2. Retry individual article:
   ```bash
   node scripts/publish-series-v2.js <series-id> --article=3
   ```
3. Check network connection
4. Review `errors.log` for details

### File Naming Issues

**Symptom**: Special characters in filename

**Solution**: Automatic sanitization in `generateDescriptiveFilename()`

**Allowed**: Chinese, English, numbers, hyphens, underscores

**Removed**: `< > : " / \ | ? *`

### Generation Interrupted

**Symptom**: Series incomplete

**Solution**: Resume with "Continue series-{id}"

**Recovery**: All completed articles preserved

**Check**: Task list for progress status

## Best Practices

1. **Review outline before generation**
   - Saves time if adjustments needed
   - Ensures content direction is correct

2. **Monitor first article**
   - Verify style and quality
   - Adjust before batch generation

3. **Check file names**
   - Ensure titles are descriptive
   - Verify no duplicate names

4. **Backup before publishing**
   - Series data in `E:\AICoding\article\`
   - Can republish if needed

5. **Test with small series first**
   - Try 3 articles before 10+
   - Verify workflow and quality

## Comparison: V1 vs V2

| Feature | V1 | V2 |
|---------|----|----|
| Outline Generation | Basic | Intelligent with research |
| News Integration | ❌ | ✅ With fallback |
| File Naming | `01.md` | `{title}_{timestamp}.md` |
| Error Handling | Basic | Robust with retry |
| Progress Tracking | Manual | Task-based |
| Resume Capability | Limited | Full support |
| Error Logging | ❌ | ✅ `errors.log` |
| Validation | ❌ | ✅ Word count check |

## Support

For issues:
1. Check `E:\AICoding\article\{series-id}\errors.log`
2. Review `metadata.json` for status
3. Verify task list for progress
4. Check B4A credentials if publishing fails

## Version

**V2.0.0** - Enhanced version with intelligent outline, news integration, and robust error handling

**Previous**: V1.0.0 - Basic series generation
