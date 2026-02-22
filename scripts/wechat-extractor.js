#!/usr/bin/env node

/**
 * 微信文章提取器 - 统一的接口规范
 * 为未来的wechat-content-extractor skill预留接口
 *
 * 支持多种抓取策略:
 * - cookie: 使用手动提取的Cookie访问微信API
 * - playwright: 使用浏览器自动化绕过反爬
 * - proxy: 使用AnyProxy代理拦截
 * - manual: 手动复制粘贴
 *
 * 使用示例:
 *   node wechat-extractor.js --url=https://mp.weixin.qq.com/s/xxx --method=cookie
 *   node wechat-extractor.js --file=urls.txt --output=./data/
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/wechat-crawler.json');

class WeChatArticleExtractor {
  constructor(options = {}) {
    this.config = { ...config, ...options };
    this.strategy = options.strategy || config.crawler_strategy.strategy;
    this.logger = this.createLogger();
  }

  /**
   * 统一的接口：根据URL抓取文章
   * @param {string} url - 微信文章URL
   * @param {object} options - 额外选项
   * @returns {Promise<object>} 标准化的文章对象
   */
  async extractArticle(url, options = {}) {
    try {
      this.logger.info(`开始提取文章: ${url}`);
      this.logger.info(`使用策略: ${this.strategy}`);

      let articleData;

      switch (this.strategy) {
        case 'cookie':
          articleData = await this.extractByCookie(url, options);
          break;

        case 'playwright':
          articleData = await this.extractByPlaywright(url, options);
          break;

        case 'proxy':
          articleData = await this.extractByProxy(url, options);
          break;

        case 'manual':
          articleData = await this.extractByManual(url, options);
          break;

        default:
          throw new Error(`不支持的抓取策略: ${this.strategy}`);
      }

      // 标准化输出
      const standardizedArticle = this.standardizeOutput(articleData, url);

      this.logger.info(`文章提取成功: ${standardizedArticle.title}`);
      return standardizedArticle;

    } catch (error) {
      this.logger.error(`文章提取失败: ${error.message}`);

      // 尝试备用策略
      if (options.retryWithFallback !== false) {
        return await this.tryFallbackStrategies(url, error);
      }

      throw error;
    }
  }

  /**
   * 方案3: Cookie手动提取
   * 需要提前在微信公众号后台获取cookie和token
   */
  async extractByCookie(url, options = {}) {
    // TODO: 实现Cookie方案
    // 将在独立的wechat-content-extractor skill中完整实现
    this.logger.info('使用Cookie方案提取...');

    // 预留接口实现框架
    return {
      title: '[预留接口] 文章标题',
      author: '[预留接口] 作者',
      publish_date: '[预留接口] 发布时间',
      content_html: '[预留接口] HTML内容',
      content_text: '[预留接口] 纯文本内容',
      images: [],
      metadata: {
        strategy: 'cookie',
        extracted_at: new Date().toISOString(),
        note: '需要wechat-content-extractor skill完整实现'
      }
    };
  }

  /**
   * 方案2: Playwright浏览器自动化
   * 使用浏览器自动化绕过反爬
   */
  async extractByPlaywright(url, options = {}) {
    // TODO: 实现Playwright方案
    // 将在独立的wechat-content-extractor skill中完整实现
    this.logger.info('使用Playwright方案提取...');

    // 预留接口实现框架
    return {
      title: '[预留接口] Playwright抓取标题',
      author: '[预留接口] 作者',
      publish_date: '[预留接口] 发布时间',
      content_html: '[预留接口] HTML内容',
      content_text: '[预留接口] 纯文本内容',
      images: [],
      metadata: {
        strategy: 'playwright',
        extracted_at: new Date().toISOString(),
        note: '需要wechat-content-extractor skill完整实现'
      }
    };
  }

  /**
   * 方案1: AnyProxy代理拦截
   * 使用代理服务器拦截微信请求
   */
  async extractByProxy(url, options = {}) {
    // TODO: 实现Proxy方案
    // 将在独立的wechat-content-extractor skill中完整实现
    this.logger.info('使用Proxy方案提取...');

    // 预留接口实现框架
    return {
      title: '[预留接口] Proxy代理标题',
      author: '[预留接口] 作者',
      publish_date: '[预留接口] 发布时间',
      content_html: '[预留接口] HTML内容',
      content_text: '[预留接口] 纯文本内容',
      images: [],
      metadata: {
        strategy: 'proxy',
        extracted_at: new Date().toISOString(),
        note: '需要wechat-content-extractor skill完整实现'
      }
    };
  }

  /**
   * 方案4: 手动输入
   * 手动复制粘贴文章内容
   */
  async extractByManual(url, options = {}) {
    this.logger.info('使用手动方案，请输入文章内容...');

    // 创建临时文件供用户输入
    const tempFile = path.join(process.cwd(), 'temp_wechat_input.md');
    const template = `<!--
请在此文件中粘贴微信文章内容
URL: ${url}
时间: ${new Date().toLocaleString()}
-->

# 请粘贴文章标题在这里

**作者:** [作者名]
**发布时间:** [YYYY-MM-DD]

请在这里粘贴正文内容...
`;

    fs.writeFileSync(tempFile, template);

    console.log(`\n📄 已创建临时文件：${tempFile}`);
    console.log('请按照以下步骤操作：');
    console.log('1. 在手机或浏览器中打开文章：' + url);
    console.log('2. 复制标题、作者、正文内容');
    console.log('3. 编辑临时文件，粘贴内容并保存');
    console.log('4. 按回车键继续...\n');

    // 等待用户输入
    await this.waitForUserInput();

    const content = fs.readFileSync(tempFile, 'utf-8');
    fs.unlinkSync(tempFile);

    return this.parseManualContent(content, url);
  }

  /**
   * 标准化输出格式
   */
  standardizeOutput(rawData, url) {
    const now = new Date().toISOString();

    return {
      // 基础信息
      title: rawData.title || '无标题',
      author: rawData.author || '未知作者',
      publish_date: rawData.publish_date || now,
      original_url: url,

      // 内容
      content_html: rawData.content_html || '',
      content_text: rawData.content_text || '',

      // 媒体
      images: rawData.images || [],
      videos: rawData.videos || [],

      // 元数据
      metadata: {
        ...rawData.metadata,
        extracted_at: now,
        word_count: rawData.content_text ? rawData.content_text.length : 0,
        extractor_version: '1.0.0',
        standardized: true
      }
    };
  }

  /**
   * 解析手动输入的内容
   */
  parseManualContent(content, url) {
    // 简单的解析逻辑
    const lines = content.split('\n').filter(line => line.trim());

    return {
      title: this.extractField(lines, '标题', '无标题'),
      author: this.extractField(lines, '作者', '未知'),
      publish_date: this.extractField(lines, '发布时间', new Date().toISOString()),
      content_text: lines.slice(lines.findIndex(l => l.includes('正文内容'))).join('\n'),
      metadata: {
        strategy: 'manual',
        note: '用户手动输入'
      }
    };
  }

  /**
   * 尝试备用策略
   */
  async tryFallbackStrategies(url, originalError) {
    const fallbackStrategies = this.config.crawler_strategy.fallback_strategies;

    for (const strategy of fallbackStrategies) {
      if (strategy === this.strategy) continue;

      this.logger.warn(`主策略失败，尝试备用策略: ${strategy}`);

      try {
        const options = {
          strategy: strategy,
          retryWithFallback: false // 防止无限递归
        };

        const extractor = new WeChatArticleExtractor(options);
        const result = await extractor.extractArticle(url);

        return result;
      } catch (fallbackError) {
        this.logger.warn(`备用策略 ${strategy} 也失败了: ${fallbackError.message}`);
        continue;
      }
    }

    throw new Error(`所有策略均失败: ${originalError.message}`);
  }

  /**
   * 保存到文件
   */
  async saveToFile(article, outputDir = null) {
    const dir = outputDir || this.config.data_output.save_to.directory || './data/wechat_articles/';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${article.title}_${timestamp}.json`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, JSON.stringify(article, null, 2), 'utf-8');

    this.logger.info(`文章已保存到: ${filepath}`);
    return filepath;
  }

  /**
   * 创建日志记录器
   */
  createLogger() {
    const logFile = this.config.error_handling.error_log_file || './logs/wechat_crawler_errors.log';
    const logDir = path.dirname(logFile);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    return {
      info: (msg) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${msg}`);
      },
      warn: (msg) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`);
      },
      error: (msg) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
        fs.appendFileSync(logFile, `[ERROR] ${new Date().toISOString()} - ${msg}\n`, 'utf-8');
      }
    };
  }

  /**
   * 等待用户输入
   */
  waitForUserInput() {
    return new Promise((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
  }

  /**
   * 提取字段辅助方法
   */
  extractField(lines, fieldName, defaultValue) {
    const line = lines.find(l => l.includes(fieldName));
    return line ? line.split(':')[1]?.trim() || defaultValue : defaultValue;
  }
}

/**
 * 命令行接口
 */
function printUsage() {
  console.log(`
微信文章提取器 - 接口预留版本

用法:
  node wechat-extractor.js --url=<微信文章URL> [选项]
  node wechat-extractor.js --file=<URL列表文件> [选项]
  node wechat-extractor.js --manual [选项]

选项:
  --url=<URL>         单个微信文章URL
  --file=<文件路径>    包含多个URL的文件（每行一个）
  --manual            手动输入模式
  --method=<方法>     抓取方法: cookie | playwright | proxy | manual (默认: cookie)
  --output=<目录>     输出目录 (默认: ./data/wechat_articles/)
  --save              保存到文件
  --help              显示帮助信息

示例:
  node wechat-extractor.js --url=https://mp.weixin.qq.com/s/xxx --method=cookie --save
  node wechat-extractor.js --file=urls.txt --method=playwright
  node wechat-extractor.js --manual --output=./articles/
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    printUsage();
    process.exit(0);
  }

  // 解析参数
  const params = {};
  args.forEach(arg => {
    if (arg.startsWith('--url=')) params.url = arg.split('=')[1];
    else if (arg.startsWith('--file=')) params.file = arg.split('=')[1];
    else if (arg.startsWith('--method=')) params.method = arg.split('=')[1];
    else if (arg.startsWith('--output=')) params.output = arg.split('=')[1];
    else if (arg === '--manual') params.manual = true;
    else if (arg === '--save') params.save = true;
  });

  try {
    console.log('\n===== 微信文章提取器 =====\n');
    console.log('策略:', params.method || 'cookie');
    console.log('当前为接口预留版本，完整实现将在wechat-content-extractor skill中提供\n');

    const extractor = new WeChatArticleExtractor({ strategy: params.method });

    // 根据输入方式处理
    if (params.manual || (!params.url && !params.file)) {
      console.log('进入手动模式...\n');
      const article = await extractor.extractByManual('manual-input');

      if (params.save) {
        await extractor.saveToFile(article, params.output);
      }

      console.log('\n提取完成:');
      console.log(JSON.stringify(article, null, 2));

    } else if (params.url) {
      console.log(`提取单个URL: ${params.url}\n`);
      const article = await extractor.extractArticle(params.url);

      if (params.save) {
        await extractor.saveToFile(article, params.output);
      }

      console.log('\n提取完成:');
      console.log(JSON.stringify(article, null, 2));

    } else if (params.file) {
      console.log(`批量提取文件: ${params.file}\n`);
      const urls = fs.readFileSync(params.file, 'utf-8')
        .split('\n')
        .filter(line => line.trim() && line.startsWith('http'));

      console.log(`共 ${urls.length} 个URL\n`);

      const results = [];
      for (const [index, url] of urls.entries()) {
        console.log(`[${index + 1}/${urls.length}] 提取: ${url}`);

        try {
          const article = await extractor.extractArticle(url);
          results.push(article);

          if (params.save) {
            await extractor.saveToFile(article, params.output);
          }
        } catch (error) {
          console.error(`提取失败: ${error.message}`);
          results.push({ url, error: error.message });
        }

        // 遵守频率限制
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('\n批量提取完成!');
      console.log(`成功: ${results.filter(r => !r.error).length}`);
      console.log(`失败: ${results.filter(r => r.error).length}`);
    }

  } catch (error) {
    console.error('\n❌ 执行出错:', error.message);
    process.exit(1);
  }
}

// 导出类供其他模块使用
module.exports = { WeChatArticleExtractor };

// 如果是直接运行
if (require.main === module) {
  main();
}
