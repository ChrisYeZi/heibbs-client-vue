import DOMPurify from 'dompurify'; // 需安装：npm install dompurify @types/dompurify
import baseApi from '@/config/index'

// 定义表情映射类型（TypeScript 类型约束）
type EmojiMap = Record<string, string>;

// -------------------------- 公共工具函数（减少代码冗余） --------------------------
/**
 * 公共文本格式转换（标题、字体、加粗、水平线等）
 */
const convertTextFormat = (html: string): string => {
  return html
    // 1. 水平线 [hr]
    .replace(/\[hr\]/g, '<hr class="discuz-hr">') // 新增：处理水平线标签
    // 2. 标题 [h1]-[h6]（优化嵌套匹配，非贪婪模式）
    .replace(/\[h([1-6])\]([\s\S]*?)\[\/h\1\]/g, "<h$1>$2</h$1>")
    // 3. 字体大小 [size=X]
    .replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/g, '<span style="font-size: $1px;">$2</span>')
    // 4. 字体颜色 [color=色值]（兼容 # 开头和无 # 格式）
    .replace(/\[color=(\#?[a-zA-Z0-9]+)\]([\s\S]*?)\[\/color\]/g, '<span style="color: $1;">$2</span>')
    // 5. 字体 [font=字体名称]（兼容带空格的字体）
    .replace(/\[font=(.*?)\]([\s\S]*?)\[\/font\]/g, '<span style="font-family: $1;">$2</span>')
    // 6. 基础格式（加粗、斜体、下划线、删除线）
    .replace(/\[b\]([\s\S]*?)\[\/b\]/g, "<strong>$1</strong>")
    .replace(/\[i\]([\s\S]*?)\[\/i\]/g, "<em>$1</em>")
    .replace(/\[u\]([\s\S]*?)\[\/u\]/g, "<u>$1</u>")
    .replace(/\[s\]([\s\S]*?)\[\/s\]/g, "<del>$1</del>")
    // 7. 对齐（支持多层嵌套，非贪婪匹配避免多余闭合）
    .replace(/\[align=(left|center|right|justify)\]([\s\S]*?)\[\/align\]/g, '<div style="text-align: $1;">$2</div>')
    .replace(/\[center\]([\s\S]*?)\[\/center\]/g, '<div style="text-align: center;">$2</div>')
    // 8. 补充换行（解决 BBCode 原生换行问题）
    .replace(/\n/g, "<br>")
    .replace(/\r\n/g, "<br>");
};

/**
 * 公共链接/引用/代码转换
 */
const convertLinksAndQuotes = (html: string): string => {
  return html
    // 1. URL 链接（兼容带参数的链接）
    .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
    .replace(/\[url\]([\s\S]*?)\[\/url\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    // 2. 邮件链接
    .replace(/\[email=([^\]]+)\]([\s\S]*?)\[\/email\]/g, '<a href="mailto:$1">$2</a>')
    .replace(/\[email\]([\s\S]*?)\[\/email\]/g, '<a href="mailto:$1">$1</a>')
    // 3. 引用（支持嵌套）
    .replace(/\[quote=([^\]]*)\]([\s\S]*?)\[\/quote\]/g, '<div class="discuz-quote"><div class="quote-author">引用 $1 的发言：</div><div class="quote-content">$2</div></div>')
    .replace(/\[quote\]([\s\S]*?)\[\/quote\]/g, '<div class="discuz-quote"><div class="quote-content">$1</div></div>')
    // 4. 代码块（保留缩进）
    .replace(/\[code\]([\s\S]*?)\[\/code\]/g, '<pre class="discuz-code"><code>$1</code></pre>');
};

/**
 * 公共列表转换（无序列表/有序表）
 */
const convertLists = (html: string): string => {
  // 1. 无序列表 [list] + [*]
  html = html.replace(/\[list\]([\s\S]*?)\[\/list\]/g, (match, content) => {
    const items = content.replace(/(?<!\[list\]>)\[(\*)\]([\s\S]*?)(?=\[\*]|$)/g, "<li>$2</li>");
    return `<ul class="discuz-list">${items}</ul>`;
  });

  // 2. 有序列表 [list=1/a/A]
  html = html.replace(/\[list=([1aA])\]([\s\S]*?)\[\/list\]/g, (match, type, content) => {
    const listStyle = type === "1" ? "decimal" : type === "a" ? "lower-alpha" : "upper-alpha";
    const items = content.replace(/(?<!\[list\]>)\[(\*)\]([\s\S]*?)(?=\[\*]|$)/g, "<li>$2</li>");
    return `<ol class="discuz-list" style="list-style-type: ${listStyle}">${items}</ol>`;
  });

  return html;
};

/**
 * 公共特殊标签转换（表情、编辑标记、分页、隐藏内容）
 */
const convertSpecialTags = (html: string, emojiMap: EmojiMap): string => {
  return html
    // 1. 表情（支持自定义映射）
    .replace(/\[(\w+|[\u4e00-\u9fa5]+)\]/g, (match, emojiKey) => {
      return emojiMap[emojiKey]
        ? `<img src="/static/emojis/${emojiMap[emojiKey]}" alt="${emojiKey}" class="discuz-emoji" />`
        : match;
    })
    // 2. 编辑标记
    .replace(/\[i=s\]/g, '<span class="discuz-edited">(已编辑) ')
    .replace(/\[\/i=s\]/g, "</span>")
    // 3. 分页标记
    .replace(/\[page\]([\s\S]*?)\[\/page\]/g, '<div class="discuz-page-break">$1</div>')
    // 4. 隐藏内容
    .replace(/\[hide\]([\s\S]*?)\[\/hide\]/g, `
      <div class="discuz-hidden">
        <button class="show-hidden" onclick="this.nextElementSibling.style.display='block';this.style.display='none'">
          显示隐藏内容
        </button>
        <div class="hidden-content" style="display: none;">$1</div>
      </div>
    `);
};

/**
 * 表格转换（支持嵌套和属性解析）
 */
const convertTables = (html: string): string => {
  // 1. 带属性表格 [table=宽度,背景色]
  html = html.replace(/\[table=([^\]]*)\]([\s\S]*?)\[\/table\]/g, (match, tableAttrs, content) => {
    const [width, bgColor] = tableAttrs.split(',').map(attr => attr.trim());
    const style: string[] = [];
    if (width) style.push(`width: ${width}`);
    if (bgColor) style.push(`background-color: ${bgColor}`);

    const processedContent = convertTables(content); // 递归处理嵌套表格
    const processedRows = convertRows(processedContent);

    return `<table class="discuz-table" style="${style.join('; ')}">${processedRows}</table>`;
  });

  // 2. 无属性表格 [table]
  html = html.replace(/\[table\]([\s\S]*?)\[\/table\]/g, (match, content) => {
    const processedContent = convertTables(content);
    const processedRows = convertRows(processedContent);
    return `<table class="discuz-table">${processedRows}</table>`;
  });

  return html;
};

/**
 * 表格行转换 [tr]
 */
const convertRows = (html: string): string => {
  html = html.replace(/\[tr\]([\s\S]*?)\[\/tr\]/g, (match, content) => {
    const processedCells = convertCells(content);
    return `<tr class="discuz-tr">${processedCells}</tr>`;
  });
  return html;
};

/**
 * 表格单元格转换 [td]
 */
const convertCells = (html: string): string => {
  html = html.replace(/\[td\]([\s\S]*?)\[\/td\]/g, (match, content) => {
    return `<td class="discuz-td">${content}</td>`;
  });
  return html;
};

// -------------------------- 核心转换函数（对外暴露） --------------------------
/**
 * 完整内容转换（含所有标签：表格、媒体、附件、水平线等）
 */
export const parsedContent = (content: string): string => {
  if (!content.trim()) return "";

  // 1. 优先转换表格（支持嵌套）
  let html = convertTables(content);

  // 2. 基础文本格式（含水平线）
  html = convertTextFormat(html);

  // 3. 链接、引用、代码
  html = convertLinksAndQuotes(html);

  // 4. 列表
  html = convertLists(html);

  // 5. 媒体标签（图片、视频、音频、附件）
  html = html
    // 5.1 附件标签 [attach]（通常为图片附件，需替换为实际后端附件路径）
    .replace(/\[attach\](\d+)\[\/attach\]/g, (match, attachId) => {
      // 提示：请根据后端附件接口路径调整 src（示例路径为 /api/attachments/附件ID）
      return `<img src="/api/attachments/${attachId}" alt="附件${attachId}" class="discuz-attach" loading="lazy" />`;
    })
    // 5.2 图片标签 [img]
    .replace(/\[img=(\d+),(\d+)\]([\s\S]*?)\[\/img\]/g, (match, width, height, src) => {
      return `<img src="${src}" width="${width}" height="${height}" alt="图片" class="discuz-img" loading="lazy" />`;
    })
    .replace(/\[img\]([\s\S]*?)\[\/img\]/g, (match, src) => {
      return `<img src="${src}" alt="图片" class="discuz-img" width="100%" loading="lazy" />`;
    })
    // 5.3 B站视频 [bili]
    .replace(/\[bili\](\d+)\[\/bili\]/g, `
      <div class="discuz-video">
        <iframe 
          src="https://player.bilibili.com/player.html?aid=$1&high_quality=1" 
          scrolling="no" 
          border="0" 
          frameborder="no" 
          framespacing="0" 
          allowfullscreen="true"
          width="100%"
          height="400"
        ></iframe>
      </div>
    `)
    // 5.4 本地视频 [video]
    .replace(/\[video\]([\s\S]*?)\[\/video\]/g, '<video src="$1" controls class="discuz-video" width="100%"></video>')
    // 5.5 本地音频 [audio]
    .replace(/\[audio\]([\s\S]*?)\[\/audio\]/g, '<audio src="$1" controls class="discuz-audio"></audio>');

  // 6. 特殊标签（表情等）
  const emojiMap: EmojiMap = {
    smile: "smile.png",
    laugh: "laugh.png",
    cry: "cry.png",
    angry: "angry.png",
    惊讶: "surprise.png",
    疑问: "question.png",
    // 补充实际表情映射（根据项目中的表情文件调整）
  };
  html = convertSpecialTags(html, emojiMap);

  // 7. 安全过滤（允许必要标签和属性）
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'allowfullscreen', 'scrolling', 'frameborder', 'border', 'framespacing', 'src',
      'loading' // 允许 img 的 loading 属性
    ],
    ALLOW_UNKNOWN_PROTOCOLS: true
  });
};

/**
 * 首页内容转换（轻量版，不含视频/音频）
 */
export const parsedIndexContent = (content: string): string => {
  if (!content.trim()) return "";

  // 1. 转换表格
  let html = convertTables(content);

  // 2. 基础文本格式（含水平线）
  html = convertTextFormat(html);

  // 3. 链接、引用、代码
  html = convertLinksAndQuotes(html);

  // 4. 列表
  html = convertLists(html);

  // 5. 轻量媒体（仅图片和附件）
  html = html
    // 附件标签 [attach]
    // .replace(/\[attach\](\d+)\[\/attach\]/g, (match, attachId) => {
    //   return `<img src="${baseApi}/attachments/${attachId}" alt="附件${attachId}" class="discuz-attach" loading="lazy" />`;
    // })
    // // 图片标签 [img]
    // .replace(/\[img=(\d+),(\d+)\]([\s\S]*?)\[\/img\]/g, (match, width, height, src) => {
    //   return `<img src="${src}" width="${width}" height="${height}" alt="图片" class="discuz-img" loading="lazy" />`;
    // })
    // .replace(/\[img\]([\s\S]*?)\[\/img\]/g, (match, src) => {
    //   return `<img src="${src}" alt="图片" class="discuz-img" width="100%" loading="lazy" />`;
    // });

  // 6. 特殊标签（表情等）
  const emojiMap: EmojiMap = {
    smile: "smile.png",
    laugh: "laugh.png",
    cry: "cry.png",
    angry: "angry.png",
    惊讶: "surprise.png",
  };
  html = convertSpecialTags(html, emojiMap);

  // 7. 安全过滤
  return DOMPurify.sanitize(html);
};

// 对外暴露
export default { parsedContent, parsedIndexContent };